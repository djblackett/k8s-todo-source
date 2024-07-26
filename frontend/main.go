package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

func main() {

	_, err := readTimestamp()
	if err != nil {
		writeTimestamp()
		getImage()
	}

	backend := os.Getenv("BACKEND")
	apiUrl := os.Getenv("API_URL")

	fmt.Println(backend)
	fmt.Println(apiUrl)

	dir, err := filepath.Abs(filepath.Dir(os.Args[0]))
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println(dir)

	go startTimestampWatcher()

	r := gin.Default()

	http.Handle("/metrics", promhttp.Handler())

	r.Static("/static", "./build/static")           // Serve static files from React's build directory
	r.StaticFile("/config.js", "./build/config.js") // Serve config.js separately
	r.StaticFile("/", "./build/index.html")

	r.GET("/todos", func(c *gin.Context) {
		resp, err := http.Get(backend + "/todos")

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch data from remote server"})
			return
		}
		defer resp.Body.Close()

		// Check if the request was successful
		if resp.StatusCode != http.StatusOK {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Remote server returned non-200 status"})
			return
		}

		// Decode the JSON response into the struct
		var data Todo
		if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode JSON response"})
			return
		}

		// Relay the response back to the browser
		c.JSON(http.StatusOK, data)

	})
	// Serve the image file directly when accessing /img.jpg
	r.StaticFile("/img.jpg", "./tmp/kube/img.jpg")

	r.GET("/img", func(c *gin.Context) {
		c.File("./tmp/kube/img.jpg")
	})

	r.GET("/healthz", func(c *gin.Context) {
		resp, err := http.Get("http://" + backend + "/frontend-check")
		if err != nil {
			log.Printf("Failed to connect to backend: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to connect to backend"})
			return
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			log.Printf("Backend returned non-200 status: %d", resp.StatusCode)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Backend is not healthy"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"success": "Successfully connected to backend"})

	})

	port := os.Getenv("PORT")
	if port == "" {
		port = ":8080"
	}

	fmt.Println("*****************************")
	fmt.Printf("Server started in port %s\n", port)
	fmt.Println("*****************************\n")

	r.Run(port)
}

func getImage() {
	resp, err := http.Get("https://picsum.photos/1200")
	if err != nil {
		log.Fatalln(err)
	}

	filename := "tmp/kube/img.jpg"

	file, err := os.OpenFile(filename, os.O_CREATE|os.O_RDWR, 0644)

	if err != nil {
		fmt.Println("Error opening file:", err)
		return
	}

	// Write the timestamp to the file
	if _, err := io.Copy(file, resp.Body); err != nil {
		fmt.Println("Error writing to file:", err)
	}

	fmt.Println("Image updated")
}

func readTimestamp() (string, error) {
	var filename = "tmp/kube/timestamp.txt"
	var timestamp string
	file, err := os.Open(filename)
	if err != nil {
		fmt.Println("Error opening file:", err)
	}
	defer file.Close()

	// Create a new scanner to read the file line by line
	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		timestamp = scanner.Text()
	}

	// Check for errors during scanning
	if err := scanner.Err(); err != nil {
		fmt.Println("Error reading file:", err)
	}

	return timestamp, nil
}

func writeTimestamp() {
	var filename = "tmp/kube/timestamp.txt"
	file, err := os.OpenFile(filename, os.O_CREATE|os.O_TRUNC|os.O_RDWR, 0644)
	if err != nil {
		fmt.Println("Error opening file:", err)
		return
	}

	timestamp := time.Now().Format(time.RFC3339)

	file.Truncate(0)
	file.Seek(0, 0)
	// Write the timestamp to the file
	if _, err := file.WriteString(timestamp + "\n"); err != nil {
		fmt.Println("Error writing to file:", err)
		return
	}
	fmt.Println("Timestamp written to file:", timestamp)
}

func checkTimestamp() bool {
	timestamp, err1 := readTimestamp()
	if err1 != nil {
		fmt.Println("error reading timestamp")
	}
	t, err2 := time.Parse(time.RFC3339, timestamp)
	if err2 != nil {
		fmt.Println("error parsing timestamp")
	}
	return time.Since(t) > time.Hour
}

func startTimestampWatcher() {
	fmt.Println("Starting timestamp observer")
	for true {
		if checkTimestamp() {
			writeTimestamp()
			getImage()
		}
		time.Sleep(1 * time.Hour)
	}
}

type Todo struct {
	Id        int    `json:"id"`
	Text      string `json:"text"`
	Completed bool   `json:"completed"`
}

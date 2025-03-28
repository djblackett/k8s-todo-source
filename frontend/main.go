package main

import (
	"encoding/json"
	"fmt"
	"time"

	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	ginprometheus "github.com/zsais/go-gin-prometheus"
)

type Config struct {
    Backend string
    APIURL  string
    Port    string
}

func loadConfig() (Config, error) {
    
	cfg := Config{
        Backend: os.Getenv("BACKEND"),
        APIURL:  os.Getenv("API_URL"),
        Port:    os.Getenv("PORT"),
    }

	if cfg.Backend == "" {
		return cfg, fmt.Errorf("BACKEND environment variable is required")
	}  

	if cfg.APIURL == "" {
		return cfg, fmt.Errorf("API_URL environment variable is required")
	}

	return cfg, nil
}

func main() {

	config, err := loadConfig()
	if err != nil {
		log.Fatal(err)
	}

	r := gin.Default()
	r.Use(gin.LoggerWithConfig(gin.LoggerConfig{
		SkipPaths: []string{"/healthz"},
	}))

	 // Add Prometheus metrics middleware
    p := ginprometheus.NewPrometheus("gin")
    p.Use(r)

	var httpClient = &http.Client{Timeout: time.Second * 10}


	todosHandler := func(c *gin.Context) {
		resp, err := httpClient.Get(config.Backend + "/todos")
		if err != nil {
			log.Printf("Failed to fetch todos: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch data from remote server"})
			return
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			log.Printf("Unexpected status code from backend: %d", resp.StatusCode)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Remote server returned non-200 status"})
			return
		}

		var data Todo
		if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
			log.Printf("Failed to decode JSON response: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode JSON response"})
			return
		}

		c.JSON(http.StatusOK, data)
	}

	healthzHandler := func(c *gin.Context) {
		resp, err := httpClient.Get("http://" + config.Backend + "/frontend-check")
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
	}

	deleteHandler :=  func(c *gin.Context) {
			id := c.Param("id")
			resp, err := http.NewRequest(http.MethodDelete, config.Backend + "/todos/" + id, nil)
			if err != nil {
				log.Printf("Failed to delete todo: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch data from remote server"})
				return
			}
			defer resp.Body.Close()
			c.JSON(http.StatusOK, gin.H{"success": "Successfully deleted todo"})
		}

	// API routes under /api
	api := r.Group("/api")
	{
		api.GET("/todos", todosHandler)
		api.GET("/healthz", healthzHandler)
		api.DELETE("/todos/:id", deleteHandler)
	}

	
	r.StaticFS("/assets", http.Dir("./build/assets"))
	r.StaticFS("/images", http.Dir("./build/images"))
	r.StaticFile("/config.js", "./build/config.js")
	r.StaticFile("/favicon.ico", "./build/favicon.ico")
	r.StaticFile("/logo192.png", "./build/logo192.png")
	r.StaticFile("/logo512.png", "./build/logo512.png")
	r.StaticFile("/manifest.json", "./build/manifest.json")
	r.StaticFile("/robots.txt", "./build/robots.txt")


	// Catch-all route for client-side routing
	r.NoRoute(func(c *gin.Context) {
		c.File("./build/index.html")
	})

	port := config.Port
	if port == "" {
		port = "8080"
	}

	fmt.Println("*****************************")
	fmt.Printf("Server started in port %s\n", port)
	fmt.Println("*****************************")

	r.Run(":" + port)
}

type Todo struct {
	Id        string    `json:"id"`
	Text      string `json:"text"`
	Completed bool   `json:"completed"`
}

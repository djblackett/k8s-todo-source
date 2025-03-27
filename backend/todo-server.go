package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
	"github.com/nats-io/nats.go"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)


var db *gorm.DB

func updateTodoOrder(c *gin.Context) {
	// You could bind to a slice of a lightweight struct if you only want id and order.
	var orders []struct {
		Id         string `json:"id"`
		OrderIndex int  `json:"order_index"`
	}
	if err := c.ShouldBindJSON(&orders); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	tx := db.Begin()
	for _, order := range orders {
		if err := tx.Model(&Todo{}).
			Where("id = ?", order.Id).
			Update("order_index", order.OrderIndex).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}
	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusOK)
}



func LoggerMiddleware() gin.HandlerFunc {
	logger := log.New(os.Stdout, "", log.LstdFlags)

	return func(c *gin.Context) {

		if c.Request.URL.Path == "/healthz" || c.Request.URL.Path == "/frontend-check" {
			c.Next()
			return
		}

		start := time.Now()
		c.Next()

		// Log errors if any
		if len(c.Errors) > 0 {
			for _, e := range c.Errors {
				logger.Printf("Error: %v", e.Err)
			}
		}

		duration := time.Since(start)
		logger.Printf("Request - Method: %s | Status: %d | Duration: %v", c.Request.Method, c.Writer.Status(), duration)
	}
}

func main() {

	var host = os.Getenv("HOST")
	var password = os.Getenv("PASSWORD") // switch to encrypted secret later
	postgresPort, err := strconv.Atoi(os.Getenv("POSTGRES_PORT"))
	if err != nil {
		panic("Invalid port number")
	}
	var dbname = os.Getenv("DB_NAME")
	var user = os.Getenv("USER")

	// Connect to a server
	var natsUrl = os.Getenv("NATS_URL")
	nc, _ := nats.Connect(natsUrl)

	psqlInfo := fmt.Sprintf("host=%s port=%d user=%s "+
		"password=%s dbname=%s sslmode=disable",
		host, postgresPort, user, password, dbname)

	fmt.Println(psqlInfo)

	db, err := gorm.Open(postgres.Open(psqlInfo), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}

	// Migrate the schema
	err = db.AutoMigrate(&Todo{})
	if err != nil {
		return
	}

	fmt.Println("Successfully connected!")

	r := gin.New()

	r.Use(gin.LoggerWithConfig(gin.LoggerConfig{
		SkipPaths: []string{"/healthz"},
	}))

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://localhost:8080", "http://localhost:8081"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	http.Handle("/metrics", promhttp.Handler())

	r.GET("/", func(c *gin.Context) {
		c.Status(http.StatusOK)
	})

	r.GET("/frontend-check", func(c *gin.Context) {
		c.Status(http.StatusOK)
	})

	r.GET("/todos", func(c *gin.Context) {
		var todos []Todo
		if err := db.Order("order_index ASC").Find(&todos).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.IndentedJSON(http.StatusOK, todos)
	})

	// Endpoint to update the order of todos
	r.PUT("/api/todos/order", updateTodoOrder)

	r.GET("/todos/:id", func(c *gin.Context) {
		var todo Todo
		if err := db.Where("id = ?", c.Param("id")).First(&todo).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Record not found!"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"data": todo})
	})

	r.POST("/todos", func(c *gin.Context) {
	var newTodo Todo

	// Bind the incoming JSON to newTodo
	if err := c.BindJSON(&newTodo); err != nil {
		c.Error(err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON"})
		return
	}

	// Check if the text length exceeds 140 characters
	if len(newTodo.Text) > 140 {
		err := fmt.Errorf("todo text exceeds 140 characters")
		c.Error(err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Calculate the new order_index by querying the current maximum
	var maxOrder int
	if err := db.Model(&Todo{}).
		Select("COALESCE(MAX(order_index), -1)").
		Row().Scan(&maxOrder); err != nil {
		// If there is an error, we default to -1 so the first todo gets order 0
		maxOrder = -1
	}
	newTodo.OrderIndex = maxOrder + 1

	// Create the new todo in the database
	if err := db.Create(&newTodo).Error; err != nil {
		c.Error(err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create todo"})
		return
	}

	// Log and publish the creation event
	fmt.Println(newTodo)
	nc.Publish("broadcaster", []byte("New todo created!"))

	c.IndentedJSON(http.StatusCreated, newTodo)
})


	r.PUT("/todos/:id", func(c *gin.Context) {
		// Get model if exist
		var todo Todo
		if err := db.Where("id = ?", c.Param("id")).First(&todo).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Record not found!"})
			return
		}

		var input UpdateTodoInput
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		fmt.Println("Original todo:", todo.Completed)
		fmt.Println("Input data:", input.Completed)
		// Update the todo item

		if err := db.Model(&todo).Update("completed", input.Completed).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		if err := db.Where("id = ?", c.Param("id")).First(&todo).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		// Simple Publisher
		nc.Publish("broadcaster", []byte("Todo successfully updated!"))

		c.JSON(http.StatusOK, gin.H{"data": todo})
	})

	r.DELETE("/todos/:id", func(c *gin.Context) {
		var todo Todo
		if err := db.Where("id = ?", c.Param("id")).First(&todo).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Record not found!"})
			return
		}

		if err := db.Delete(&todo).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		// Simple Publisher
		nc.Publish("broadcaster", []byte("Todo successfully deleted!"))

		c.JSON(http.StatusOK, gin.H{"data": true})
	})

	r.DELETE("/todos/completed", func(c *gin.Context) {
		if err := db.Where("completed = ?", true).Delete(&Todo{}).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"data": true})
	})


	r.GET("/healthz", func(c *gin.Context) {
		var tables []string
		err := db.Table("information_schema.tables").Select("table_name").Where("table_schema = ?", "public").Find(&tables).Error
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not connect to DB"})
		} else {
			c.Status(http.StatusOK)
		}
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8000"
	}

	r.Run("0.0.0.0:" + port)

}

type Todo struct {
	gorm.Model
	Id        string    `json:"id"`
	Text      string `json:"text"`
	Completed bool   `json:"completed"`
	OrderIndex int	`json:"orderIndex"`
}


type UpdateTodoInput struct {
	Id        string  `json:"title"`
	Completed bool `json:"completed"`
}

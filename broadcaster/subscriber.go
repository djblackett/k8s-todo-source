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
	"github.com/gtuk/discordwebhook"
	"github.com/nats-io/nats.go"
)

type Config struct {
	WEBHOOK_URL *string
	NATS_URL    string
	PORT        string
	ENVIRONMENT string
	DELAY 	string
	MAX_RETRIES int
}

func loadConfig() (Config, error) {
	cfg := Config{
		WEBHOOK_URL: nil,
		NATS_URL:    os.Getenv("NATS_URL"),
		PORT:        os.Getenv("PORT"),
		ENVIRONMENT: os.Getenv("ENVIRONMENT"),
		DELAY: os.Getenv("DELAY"),
		MAX_RETRIES: 5,
	}

	if cfg.NATS_URL == "" {
		return cfg, fmt.Errorf("NATS_URL environment variable is required")
	}

	if cfg.WEBHOOK_URL == nil && cfg.ENVIRONMENT == "production" {
		return cfg, fmt.Errorf("WEBHOOK_URL environment variable is required in production")
	
	}

	return cfg, nil
}
func main() {

	config, err := loadConfig()

	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}
	logger := log.New(os.Stdout, "[INFO] ", log.LstdFlags|log.Lshortfile)
	errorLogger := log.New(os.Stderr, "[ERROR] ", log.LstdFlags|log.Lshortfile)


	// Log application start
	logger.Println("Starting the application...")
	logger.Printf("Environment: %s", config.ENVIRONMENT)

	// Connect to nats server
	logger.Printf("NATS URL: %s", config.NATS_URL)

	var nc *nats.Conn
	maxRetries := config.MAX_RETRIES
	// Parse MAX_RETRIES from config, default to 5 if not set
	if maxRetries <= 0 {
		maxRetries = 5 // Default to 5 retries if MAX_RETRIES is not set or invalid
	}
	
	// Parse DELAY from config, default to 5 seconds if not set
	delay, err := strconv.Atoi(config.DELAY)
	if err != nil {
		delay = 5 // Default to 5 seconds if DELAY is not set or invalid
	}

	for i := 0; i < maxRetries; i++ {
		nc, err = nats.Connect(config.NATS_URL)
		if err == nil {
			break
		}
		errorLogger.Printf("Failed to connect to NATS (attempt %d/%d): %v", i+1, maxRetries, err)
		time.Sleep(time.Duration(delay) * time.Second)
	}

	if err != nil {
		errorLogger.Fatalf("Failed to connect to NATS after %d attempts: %v", maxRetries, err)
	}

	logger.Println("Connected to NATS successfully.")

	defer func() {
		if err := nc.Drain(); err != nil {
			errorLogger.Printf("Error during NATS connection drain: %v", err)
		}
		logger.Println("Shutting down application.")
	}()


	
	// Set up Gin router
	r := gin.New()
	r.Use(gin.LoggerWithConfig(gin.LoggerConfig{
		SkipPaths: []string{"/healthz"},
	}))
	r.Use(gin.Recovery())
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	

	// Simple Async Subscriber
	_, err = nc.QueueSubscribe("broadcaster", "broadcast-workers", func(m *nats.Msg) {
    logger.Printf("Received a message on 'broadcaster': %s", string(m.Data))
    content := string(m.Data)

    if config.ENVIRONMENT == "staging" {
        logger.Printf("Logging message in staging: %s", content)
    } else if config.ENVIRONMENT == "production" {
        logger.Println("Sending message to Discord webhook.")
		var username = "djblackett's bot"
		message := discordwebhook.Message{
		Username: &username,
		Content:  &content,
	}
        err := discordwebhook.SendMessage(*config.WEBHOOK_URL, message)
        if err != nil {
            errorLogger.Printf("Failed to send message to Discord: %v", err)
        }
    } else {
        errorLogger.Println("ENVIRONMENT not set or unknown.")
    }
})

if err != nil {
    errorLogger.Fatalf("Failed to subscribe to 'broadcaster': %v", err)
}

if err = nc.Flush(); err != nil {
    errorLogger.Fatalf("Failed to flush NATS connection: %v", err)
}

if err := nc.LastError(); err != nil {
    errorLogger.Fatalf("NATS error after flush: %v", err)
}

logger.Println("Subscription successfully established.")


	// required for GKE
	r.GET("/", func(c *gin.Context) {
		c.Status(http.StatusOK)
	})

	// For liveness and readiness probes
	r.GET("/healthz", func(c *gin.Context) {
		if nc != nil && nc.Status() == nats.CONNECTED {
			// logger.Println("Health check passed: NATS is connected.")
			c.Status(http.StatusOK)
		} else {
			errorLogger.Println("Health check failed: NATS is not connected.")
			c.JSON(http.StatusInternalServerError, gin.H{"error": "nats not connected"})
		}
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8500"
	}

	logger.Printf("Starting HTTP server on port %s", port)
	r.Run(":" + port)
}

package main

import (
	"log"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/gtuk/discordwebhook"
	"github.com/nats-io/nats.go"
)

func main() {
	logger := log.New(os.Stdout, "[INFO] ", log.LstdFlags|log.Lshortfile)
	errorLogger := log.New(os.Stderr, "[ERROR] ", log.LstdFlags|log.Lshortfile)

	var environment = os.Getenv("ENVIRONMENT")

	// Log application start
	logger.Println("Starting the application...")
	logger.Printf("Environment: %s", environment)

	// Connect to nats server
	var natsUrl = os.Getenv("NATS_URL")
	logger.Printf("NATS URL: %s", natsUrl)

	nc, err := nats.Connect(natsUrl)
	if err != nil {
		errorLogger.Fatalf("Failed to connect to NATS at %s: %v", natsUrl, err)
	}

	logger.Println("Connected to NATS successfully.")

	defer func() {
		if err := nc.Drain(); err != nil {
			errorLogger.Printf("Error during NATS connection drain: %v", err)
		}
		logger.Println("Shutting down application.")
	}()

	var content string
	var username = "djblackett's bot"

	var url = os.Getenv("WEBHOOK_URL")
	r := gin.New()

	message := discordwebhook.Message{
		Username: &username,
		Content:  &content,
	}

	// Simple Async Subscriber
	nc.QueueSubscribe("broadcaster", "broadcast-workers", func(m *nats.Msg) {
		logger.Printf("Received a message on 'broadcaster': %s", string(m.Data))
		content = string(m.Data)

		if environment == "staging" {
			logger.Printf("Logging message in staging: %s", content)
		} else if environment == "production" {
			logger.Println("Sending message to Discord webhook.")
			err := discordwebhook.SendMessage(url, message)
			if err != nil {
				errorLogger.Fatalf("Failed to send message to Discord: %v", err)
			}
		} else {
			errorLogger.Fatalln("ENVIRONMENT not set or unknown.")
		}
	})

	// required for GKE
	r.GET("/", func(c *gin.Context) {
		c.Status(http.StatusOK)
	})

	// For liveness and readiness probes
	r.GET("/healthz", func(c *gin.Context) {
		if nc != nil && nc.Status() == nats.CONNECTED {
			logger.Println("Health check passed: NATS is connected.")
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

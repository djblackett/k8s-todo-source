package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gtuk/discordwebhook"
	"github.com/nats-io/nats.go"
)

func main() {
	logger := log.New(os.Stdout, "", log.LstdFlags)
	var environment = os.Getenv("ENVIRONMENT")

	// Connect to nats server
	var natsUrl = os.Getenv("NATS_URL")
	nc, _ := nats.Connect(natsUrl)
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
		fmt.Printf("Received a message: %s\n", string(m.Data))
		content = string(m.Data)

		if environment == "staging" {
			logger.Println("Message: ", content, time.Now().String())
		} else if environment == "production" {
			err := discordwebhook.SendMessage(url, message)
			if err != nil {
				log.Fatal(err)
			}
		} else {
			log.Fatalln("ENVIRONMENT not set")
		}
	})

	// required for GKE
	r.GET("/", func(c *gin.Context) {
		c.Status(http.StatusOK)
	})

	// For liveness and readiness probes
	r.GET("/healthz", func(c *gin.Context) {
		if nc != nil && nc.Status() == nats.CONNECTED {
			c.Status(http.StatusOK)
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "nats not connected"})
		}
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8500"
	}

	r.Run(":" + port)
}

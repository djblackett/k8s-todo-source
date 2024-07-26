package main

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/gtuk/discordwebhook"
	"github.com/nats-io/nats.go"
	"log"
	"net/http"
	"os"
)

func main() {

	// Connect to a server
	var natsUrl = os.Getenv("NATS_URL")
	nc, _ := nats.Connect(natsUrl)
	var content string
	var username = "djblackett's bot"

	var url = os.Getenv("WEBHOOK_URL")
	r := gin.Default()

	message := discordwebhook.Message{
		Username: &username,
		Content:  &content,
	}

	// Simple Async Subscriber
	nc.QueueSubscribe("broadcaster", "broadcast-workers", func(m *nats.Msg) {
		fmt.Printf("Received a message: %s\n", string(m.Data))
		content = string(m.Data)

		err := discordwebhook.SendMessage(url, message)
		if err != nil {
			log.Fatal(err)
		}
	})

	// required for GKE
	r.GET("/", func(c *gin.Context) {
		c.Status(http.StatusOK)
	})

	// For liveness and readiness probes
	r.GET("/healthz", func(c *gin.Context) {
		fmt.Println("Checking health")

		if nc != nil && nc.Status() == nats.CONNECTED {
			c.Status(http.StatusOK)
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "nats not connected"})
		}
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = ":8500"
	}

	r.Run(port)
}

package main

import (
	"log"
	"os"
	"time"

	"github.com/gin-gonic/gin"
)

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

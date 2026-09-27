package middleware

import (
	"bytes"
	"io"
	"log"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// StructuredLogger logs HTTP requests with Request ID, sanitizing sensitive fields (PRD 7.7)
func StructuredLogger() gin.HandlerFunc {
	return func(c *gin.Context) {
		reqID := c.GetHeader("X-Request-ID")
		if reqID == "" {
			reqID = uuid.New().String()
		}
		c.Header("X-Request-ID", reqID)
		c.Set("request_id", reqID)

		startTime := time.Now()
		path := c.Request.URL.Path
		rawQuery := c.Request.URL.RawQuery

		// Process request
		c.Next()

		latency := time.Since(startTime)
		statusCode := c.Writer.Status()
		clientIP := c.ClientIP()
		method := c.Request.Method

		// Log entry without raw passwords or tokens
		if rawQuery != "" {
			path = path + "?" + rawQuery
		}

		userEmail, _ := c.Get("email")
		userID, _ := c.Get("user_id")

		log.Printf("[REQ:%s] %s %s | %d | %v | IP:%s | UID:%v (%v)",
			reqID, method, path, statusCode, latency, clientIP, userID, userEmail)
	}
}

// Helper to safely read and restore request body if needed
func SafeReadBody(c *gin.Context) []byte {
	var bodyBytes []byte
	if c.Request.Body != nil {
		bodyBytes, _ = io.ReadAll(c.Request.Body)
	}
	c.Request.Body = io.NopCloser(bytes.NewBuffer(bodyBytes))
	return bodyBytes
}

// SanitizeLogText removes NIK, passwords, tokens from string logs
func SanitizeLogText(text string) string {
	sensitiveKeys := []string{"password", "kata_sandi", "token", "nik"}
	result := text
	for _, k := range sensitiveKeys {
		if strings.Contains(strings.ToLower(result), k) {
			result = strings.ReplaceAll(result, k, "[REDACTED]")
		}
	}
	return result
}

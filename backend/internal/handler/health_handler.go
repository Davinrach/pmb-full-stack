package handler

import (
	"net/http"
	"time"

	"pmb-staici-backend/internal/database"

	"github.com/gin-gonic/gin"
)

type HealthHandler struct{}

func NewHealthHandler() *HealthHandler {
	return &HealthHandler{}
}

func (h *HealthHandler) Check(c *gin.Context) {
	dbStatus := "connected"
	sqlDB, err := database.DB.DB()
	if err != nil || sqlDB.Ping() != nil {
		dbStatus = "disconnected"
	}

	c.JSON(http.StatusOK, gin.H{
		"app":       "PMB STAI Cendekia Insani Situbondo API",
		"version":   "1.0.0",
		"status":    "healthy",
		"database":  dbStatus,
		"timestamp": time.Now().Format(time.RFC3339),
	})
}

package response

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type APIResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
	Error   *ErrorInfo  `json:"error,omitempty"`
}

type ErrorInfo struct {
	Code             string `json:"code"`
	Message          string `json:"message"`
	DeveloperMessage string `json:"developer_message,omitempty"`
}

type PaginationMeta struct {
	Total       int64 `json:"total"`
	Page        int   `json:"page"`
	PerPage     int   `json:"per_page"`
	TotalPages  int   `json:"total_pages"`
}

type PaginatedData struct {
	Items interface{}    `json:"items"`
	Meta  PaginationMeta `json:"meta"`
}

func Success(c *gin.Context, statusCode int, message string, data interface{}) {
	c.JSON(statusCode, APIResponse{
		Success: true,
		Message: message,
		Data:    data,
	})
}

func Error(c *gin.Context, statusCode int, code, userMsg, devMsg string) {
	c.JSON(statusCode, APIResponse{
		Success: false,
		Error: &ErrorInfo{
			Code:             code,
			Message:          userMsg,
			DeveloperMessage: devMsg,
		},
	})
}

func BadRequest(c *gin.Context, userMsg, devMsg string) {
	Error(c, http.StatusBadRequest, "BAD_REQUEST", userMsg, devMsg)
}

func Unauthorized(c *gin.Context, userMsg string) {
	Error(c, http.StatusUnauthorized, "UNAUTHORIZED", userMsg, "Autentikasi diperlukan")
}

func Forbidden(c *gin.Context, userMsg string) {
	Error(c, http.StatusForbidden, "FORBIDDEN", userMsg, "Akses ditolak")
}

func NotFound(c *gin.Context, userMsg string) {
	Error(c, http.StatusNotFound, "NOT_FOUND", userMsg, "Sumber daya tidak ditemukan")
}

func InternalServerError(c *gin.Context, devMsg string) {
	Error(c, http.StatusInternalServerError, "INTERNAL_SERVER_ERROR", "Terjadi kesalahan internal pada server. Silakan coba lagi nanti.", devMsg)
}

package api

import (
	"game-wallet-api/token"
	"net/http"

	"github.com/gin-gonic/gin"
)

func RequireRole(role string) gin.HandlerFunc {

	return func(c *gin.Context) {
		payload := c.MustGet(authorizationPayloadKey).(*token.Payload)
		if payload.Role != role {
			c.JSON(http.StatusForbidden, errorResponse(
				ErrPermissionDenied,
			))
			c.Abort()
			return
		}
		c.Next()
	}

}

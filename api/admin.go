package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func (server *Server) listAllWalletTransactions(ctx *gin.Context) {
	var req listTransactionsRequest

	if err := ctx.ShouldBindQuery(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	result, err := server.store.GetAllWalletTransactions(
		ctx,
		req.Page,
		req.Limit,
	)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, result)
}

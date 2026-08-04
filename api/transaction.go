package api

import (
	"fmt"
	"game-wallet-api/token"
	"net/http"

	"github.com/gin-gonic/gin"
)

type listTransactionsRequest struct {
	Page  int32 `form:"page" binding:"required,min=1"`
	Limit int32 `form:"limit" binding:"required,min=1,max=100"`
}

func (server Server) listWalletTransactions(ctx *gin.Context) {
	var req listTransactionsRequest

	if err := ctx.ShouldBindQuery(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	payload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)

	wallet, err := server.store.GetWalletByPlayerID(ctx, payload.PlayerID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}
	fmt.Println("PlayerID:", payload.PlayerID)
	result, err := server.store.GetWalletTransactions(
		ctx,
		wallet.ID,
		req.Page,
		req.Limit,
	)
	fmt.Println("WalletID:", wallet.ID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, result)
}

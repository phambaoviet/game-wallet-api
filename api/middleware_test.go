package api

import (
	"fmt"
	"game-wallet-api/token"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/require"
)

func addAuthorization(
	t *testing.T,
	request *http.Request,
	tokenMaker token.Maker,
	authorizationType string,
	player_id int64,
	email string,
	duration time.Duration,
) {
	token, err := tokenMaker.CreateToken(player_id, email, duration)
	require.NoError(t, err)
	authorizationHeader := fmt.Sprintf("%s %s", authorizationType, token)
	request.Header.Set(authorizationHeaderKey, authorizationHeader)
}
func TestMiddleware(t *testing.T) {
	testCase := []struct {
		name          string
		setupAuth     func(t *testing.T, request *http.Request, tokenMaker token.Maker)
		checkResponse func(t *testing.T, response *httptest.ResponseRecorder)
	}{
		{
			name: "success",
			setupAuth: func(t *testing.T, request *http.Request, tokenMaker token.Maker) {
				addAuthorization(t, request, tokenMaker, authorizationTypeBearer, 14, "player", time.Minute)
			},
			checkResponse: func(t *testing.T, response *httptest.ResponseRecorder) {
				require.Equal(t, http.StatusOK, response.Code)
			},
		},
		{
			name: "no authorization header",
			setupAuth: func(t *testing.T, request *http.Request, tokenMaker token.Maker) {
			},
			checkResponse: func(t *testing.T, response *httptest.ResponseRecorder) {
			},
		},
		{
			name: "unsupported authorization header",
			setupAuth: func(t *testing.T, request *http.Request, tokenMaker token.Maker) {
				addAuthorization(t, request, tokenMaker, "unsupported", 14, "player", time.Minute)
			},
			checkResponse: func(t *testing.T, response *httptest.ResponseRecorder) {
				require.Equal(t, http.StatusUnauthorized, response.Code)
			},
		},
		{
			name: "invalid authorization format",
			setupAuth: func(t *testing.T, request *http.Request, tokenMaker token.Maker) {
				addAuthorization(t, request, tokenMaker, "", 14, "player", time.Minute)
			},
			checkResponse: func(t *testing.T, response *httptest.ResponseRecorder) {
				require.Equal(t, http.StatusUnauthorized, response.Code)
			},
		},
		{
			name: "expired token",
			setupAuth: func(t *testing.T, request *http.Request, tokenMaker token.Maker) {
				addAuthorization(t, request, tokenMaker, authorizationTypeBearer, 14, "player", -time.Minute)
			},
			checkResponse: func(t *testing.T, response *httptest.ResponseRecorder) {
				require.Equal(t, http.StatusUnauthorized, response.Code)
			},
		},
	}
	for i := range testCase {
		tc := testCase[i]
		t.Run(tc.name, func(t *testing.T) {
			server := newTestServer(t, nil)
			authPath := "/auth"
			server.router.GET(authPath, authMiddleware(server.tokenMaker), func(c *gin.Context) {
				c.JSON(http.StatusOK, gin.H{})
			},
			)
			recorder := httptest.NewRecorder()
			request, err := http.NewRequest(http.MethodGet, authPath, nil)
			require.NoError(t, err)
			tc.setupAuth(t, request, server.tokenMaker)
			server.router.ServeHTTP(recorder, request)
			tc.checkResponse(t, recorder)
		})
	}
}

package api

import (
	"bytes"
	"encoding/json"
	"math/rand"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/require"
)

func randomString(n int) string {
	const alphabet = "abcdefghijklmnopqrstuvwxyz"
	var sb strings.Builder
	k := len(alphabet)
	for i := 0; i < n; i++ {
		c := alphabet[rand.Intn(k)]
		sb.WriteByte(c)
	}
	return sb.String()
}
func randomPlayerName() string {
	return randomString(10)
}
func randomEmail() string {
	return randomString(6) + "@example.com"
}
func TestCreatePlayerAPI(t *testing.T) {
	require.NotNil(t, testStore, "testStore chưa được khởi tạo!")
	server := newTestServer(t, testStore)
	require.NotNil(t, server.router, "server.router đang bị nil!")
	body := gin.H{
		"username": randomPlayerName(),
		"email":    randomEmail(),
		"password": "password_123",
	}

	data, err := json.Marshal(body)
	require.NoError(t, err)

	server = newTestServer(t, testStore)

	recorder := httptest.NewRecorder()

	request, err := http.NewRequest(http.MethodPost,
		"/players", bytes.NewReader(data))

	require.NoError(t, err)
	request.Header.Set("Content-Type", "application/json")
	server.router.ServeHTTP(recorder, request)
	t.Log("status: ", recorder.Code)
	t.Log("body: ", recorder.Body.String())

	require.Equal(t, http.StatusCreated, recorder.Code)
}

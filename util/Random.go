package util

import (
	"fmt"
	"math/rand"
)

func RandomInt(min, max int64) int64 {
	return min + rand.Int63n(max-min+1)
}
func RandomString(n int) string {
	const alphabet = "abcdefghijklmnopqrstuvwxyz"
	b := make([]byte, n)

	for i := range b {
		b[i] = alphabet[rand.Intn(len(alphabet))]
	}

	return string(b)
}
func RandomUsername() string {
	return RandomString(8)
}
func RandomEmail() string {
	return fmt.Sprintf("%s@email.com", RandomString(10))
}
func RandomPassword() string {
	return RandomString(16)
}

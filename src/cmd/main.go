package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"

	"github.com/joho/godotenv"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	youtube "google.golang.org/api/youtube/v3"
	ClientAPI "echozone/src/app/pkg/api"
)

const (
	envFilename = ".env"
	tokenFile = "token.json"
	redirectURL = "http://localhost:8080/oauth2callback"
)

func main() {
	args := os.Args

	if len(args) < 2 {
		fmt.Println("no args provided. try 'echozone-cmd.exe LoadPlaylistInfo'")	
		return
	}

	cmd := args[1]

	if cmd == "LoadPlaylistInfo" {
		client, ctx := setupClientAndContext()
		ClientAPI.LoadPlaylistInfo(client, ctx)
	}
}

func setupClientAndContext() (*http.Client, context.Context) {
	projectRoot, err := os.Getwd()
	if err != nil {
		log.Fatalf("Failed to get current working directory: %v", err)
	}

	// Traverse up until we find .env
	for {
		envPath := filepath.Join(projectRoot, envFilename)
		if _, err := os.Stat(envPath); err == nil {
			break
		}
		parent := filepath.Dir(projectRoot)
		if parent == projectRoot {
			log.Fatal(".env file not found in any parent directories")
		}
		projectRoot = parent
	}

	envPath := filepath.Join(projectRoot, envFilename)
	tokenPath := filepath.Join(projectRoot, tokenFile)

	err = godotenv.Load(envPath)
	if err != nil {
		log.Fatalf("Error loading .env file from %s: %v", envPath, err)
	}

	clientID := os.Getenv("CLIENT_ID")
	if clientID == "" {
		log.Fatal("CLIENT_ID is not set in .env")
	}

	clientSecret := os.Getenv("CLIENT_SECRET")
	if clientSecret == "" {
		log.Fatal("CLIENT_SECRET is not set in .env")
	}

	ctx := context.Background()
	config := getOAuthConfig(clientID, clientSecret)

	tok, err := tokenFromFile(tokenPath)
	if err != nil {
		tok = getTokenFromWeb(config)
		saveToken(tokenPath, tok)
	}

	client := config.Client(ctx, tok)
	return client, ctx
}

func getOAuthConfig(clientID string, clientSecret string) *oauth2.Config {
	return &oauth2.Config{
		ClientID:     clientID,
		ClientSecret: clientSecret,
		RedirectURL:  redirectURL,
		Scopes:       []string{youtube.YoutubeReadonlyScope},
		Endpoint:     google.Endpoint,
	}
}

func getTokenFromWeb(config *oauth2.Config) *oauth2.Token {
	authURL := config.AuthCodeURL("state-token", oauth2.AccessTypeOffline)
	fmt.Println("Opening browser to authenticate...")
	exec.Command("rundll32", "url.dll,FileProtocolHandler", authURL).Start()
	// exec.Command("open", authURL).Start() // macOS
	// exec.Command("xdg-open", authURL).Start() // Linux

	codeCh := make(chan string)
	http.HandleFunc("/oauth2callback", func(w http.ResponseWriter, r *http.Request) {
		code := r.URL.Query().Get("code")
		fmt.Fprint(w, "Login successful. You may close this window.")
		codeCh <- code
	})
	go http.ListenAndServe(":8080", nil)

	code := <-codeCh
	tok, err := config.Exchange(context.Background(), code)
	if err != nil {
		log.Fatalf("Unable to exchange code: %v", err)
	}
	return tok
}

func tokenFromFile(path string) (*oauth2.Token, error) {
	f, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer f.Close()
	var tok oauth2.Token
	err = json.NewDecoder(f).Decode(&tok)
	return &tok, err
}

func saveToken(path string, token *oauth2.Token) {
	f, err := os.Create(path)
	if err != nil {
		log.Fatalf("Unable to save token: %v", err)
	}
	defer f.Close()
	json.NewEncoder(f).Encode(token)
	fmt.Println("Saved token to", filepath.Base(path))
}

package main

import (
	"fmt"
	clientAPI "echozone/src/app/pkg/api"
)

func main() {
	var playlistUrl string

	fmt.Printf("Please provide a youtube playlist url: ")	
	fmt.Scanln(&playlistUrl)

	clientAPI.LoadPlaylistInfo(playlistUrl)
}

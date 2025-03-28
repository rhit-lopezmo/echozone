package core

import "fmt"

type Playlist struct {
	id string
	name string
	length int
}

func (playlist Playlist) String() string {
	return fmt.Sprintf("Type {Playlist}\nid: %s\nname: %s\nlength: %d",
											playlist.id,
											playlist.name,
											playlist.length)
}


func LoadPlaylist(url string) Playlist {
	// playlistID := parsePlaylistID(url)

	return Playlist{
		id: "01",
		name: "generic_playlist",
		length: 1,
	}
}

func parsePlaylistID(url string) string {
	id := url

	return id
}

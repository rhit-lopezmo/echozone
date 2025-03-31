package cmd

import (
	"os/exec"
	"strings"
)

func YTStreamLink(videoID string) (string, error) {
	cmd := exec.Command("bin/yt-dlp.exe", "-f", "bestaudio", "-g", "--cookies", "bin/cookies.txt", "https://www.youtube.com/watch?v="+videoID)
	out, err := cmd.Output()
	if err != nil {
		return "", err
	}
	return strings.TrimSpace(string(out)), nil
}

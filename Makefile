# Output directory
OUT_DIR := dist

# App names
CLI_NAME := echozone-cmd
GUI_NAME := echozone-gui

# Default target
build: build-windows-cli

# Build CLI for Linux
build-linux-cli:
	GOOS=linux GOARCH=amd64 go build -o $(OUT_DIR)/$(CLI_NAME) ./src/cmd

# Build CLI for Windows
build-windows-cli:
	GOOS=windows GOARCH=amd64 go build -o $(OUT_DIR)/$(CLI_NAME).exe ./src/cmd

# Build GUI for Linux
build-linux-gui:
	GOOS=linux GOARCH=amd64 go build -o $(OUT_DIR)/$(GUI_NAME) ./src/gui

# Build GUI for Windows
build-windows-gui:
	GOOS=windows GOARCH=amd64 go build -ldflags="-H=windowsgui" -o $(OUT_DIR)/$(GUI_NAME).exe ./src/gui
	
# Clean all builds
clean:
	rm -rf $(OUT_DIR)

# Create output directory if not exists
$(shell mkdir -p $(OUT_DIR))


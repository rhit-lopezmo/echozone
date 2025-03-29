# Output directory
OUT_DIR := dist

# App names
CLI_NAME := echozone-cmd

# Default target
build: build-windows

# Build GUI for Windows
build-windows:
	GOOS=windows GOARCH=amd64 go build -o $(OUT_DIR)/$(CLI_NAME).exe ./src/cmd

build-linux:
	GOOS=linux GOARCH=amd64 go build -o $(OUT_DIR)/$(CLI_NAME) ./src/cmd

# Clean all builds
clean:
	rm -rf $(OUT_DIR)

# Create output directory if not exists
$(shell mkdir -p $(OUT_DIR))


#!/bin/bash

# Script to clean up Docker-related files after migrating to direct Ubuntu deployment

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Cleaning up Docker-related files ===${NC}"

# List of Docker-related files to remove
DOCKER_FILES=(
  "Dockerfile"
  "docker-compose.yml"
  ".dockerignore"
  "deploy.sh"  # This is the Docker deployment script
)

# Remove the Docker-related files
for file in "${DOCKER_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo -e "${YELLOW}Removing ${file}...${NC}"
    rm "$file"
    echo -e "${GREEN}${file} removed.${NC}"
  else
    echo -e "${YELLOW}${file} not found, skipping.${NC}"
  fi
done

echo -e "${GREEN}Docker-related files have been cleaned up.${NC}"
echo -e "${YELLOW}Note: The DIGITAL_OCEAN_SETUP.md file was kept for reference, but it contains Docker-specific instructions.${NC}"
echo -e "${YELLOW}Please refer to UBUNTU_SETUP.md for the new direct deployment instructions.${NC}" 
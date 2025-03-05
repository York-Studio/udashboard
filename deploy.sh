#!/bin/bash

# Restaurant Dashboard Deployment Script
# This script helps deploy the restaurant dashboard to a Digital Ocean droplet

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Restaurant Dashboard Deployment ===${NC}"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Build the Docker image
echo -e "${YELLOW}Building Docker image...${NC}"
docker build -t restaurant-dashboard .

if [ $? -ne 0 ]; then
    echo -e "${RED}Docker build failed. Please check the errors above.${NC}"
    exit 1
fi

echo -e "${GREEN}Docker image built successfully!${NC}"

# Check if the container is already running
CONTAINER_ID=$(docker ps -q -f name=restaurant-dashboard)
if [ ! -z "$CONTAINER_ID" ]; then
    echo -e "${YELLOW}Stopping existing container...${NC}"
    docker stop restaurant-dashboard
    docker rm restaurant-dashboard
fi

# Check if environment variables are set
if [ -z "$NEXT_PUBLIC_AIRTABLE_PERSONAL_ACCESS_TOKEN" ] || [ -z "$NEXT_PUBLIC_AIRTABLE_BASE_ID" ]; then
    echo -e "${YELLOW}Airtable credentials not found in environment variables.${NC}"
    echo -e "${YELLOW}The application will use mock data instead.${NC}"
    echo -e "${YELLOW}To use real data, set the following environment variables:${NC}"
    echo -e "${GREEN}export NEXT_PUBLIC_AIRTABLE_PERSONAL_ACCESS_TOKEN=\"your_token_here\"${NC}"
    echo -e "${GREEN}export NEXT_PUBLIC_AIRTABLE_BASE_ID=\"your_base_id_here\"${NC}"
    echo -e "${GREEN}export NEXT_PUBLIC_RESTAURANT_TOTAL_SEATS=\"120\"${NC}"
    echo ""
fi

# Run the container
echo -e "${YELLOW}Starting container...${NC}"
docker run -d --name restaurant-dashboard -p 3000:3000 \
    -e NEXT_PUBLIC_AIRTABLE_PERSONAL_ACCESS_TOKEN="${NEXT_PUBLIC_AIRTABLE_PERSONAL_ACCESS_TOKEN}" \
    -e NEXT_PUBLIC_AIRTABLE_BASE_ID="${NEXT_PUBLIC_AIRTABLE_BASE_ID}" \
    -e NEXT_PUBLIC_RESTAURANT_TOTAL_SEATS="${NEXT_PUBLIC_RESTAURANT_TOTAL_SEATS:-120}" \
    restaurant-dashboard

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to start container. Please check the errors above.${NC}"
    exit 1
fi

# Get the server's public IP address
SERVER_IP=$(curl -s ifconfig.me)

echo -e "${GREEN}Container started successfully!${NC}"
echo -e "${GREEN}Restaurant Dashboard is now running at http://${SERVER_IP}:3000${NC}"

# Check if Nginx is installed
if command -v nginx &> /dev/null; then
    echo -e "${YELLOW}Nginx detected. For proper domain setup:${NC}"
    echo -e "1. Update nginx.conf with your domain name"
    echo -e "2. Copy to /etc/nginx/sites-available/: ${GREEN}sudo cp nginx.conf /etc/nginx/sites-available/restaurant-dashboard${NC}"
    echo -e "3. Enable the site: ${GREEN}sudo ln -sf /etc/nginx/sites-available/restaurant-dashboard /etc/nginx/sites-enabled/${NC}"
    echo -e "4. Test and reload: ${GREEN}sudo nginx -t && sudo systemctl reload nginx${NC}"
    echo -e "5. Set up SSL: ${GREEN}sudo certbot --nginx -d your-domain.com${NC}"
else
    echo -e "${YELLOW}Note: For production use, consider setting up Nginx as a reverse proxy.${NC}"
    echo -e "${YELLOW}See DIGITAL_OCEAN_SETUP.md for detailed instructions.${NC}"
fi

echo -e "${YELLOW}If Airtable credentials are not provided, the application will use mock data.${NC}"

# Instructions for setting up environment variables
echo -e "\n${YELLOW}=== Environment Variables ===${NC}"
echo -e "To set up Airtable integration, run the following commands before deployment:"
echo -e "${GREEN}export NEXT_PUBLIC_AIRTABLE_PERSONAL_ACCESS_TOKEN=\"your_token_here\"${NC}"
echo -e "${GREEN}export NEXT_PUBLIC_AIRTABLE_BASE_ID=\"your_base_id_here\"${NC}"
echo -e "${GREEN}export NEXT_PUBLIC_RESTAURANT_TOTAL_SEATS=\"120\"${NC}"

echo -e "\n${YELLOW}=== Deployment Complete ===${NC}"
echo -e "${YELLOW}For detailed setup instructions, see DIGITAL_OCEAN_SETUP.md${NC}" 
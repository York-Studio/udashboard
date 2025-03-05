#!/bin/bash
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Restaurant Dashboard Deployment Script${NC}"
echo "This script will help you deploy the Restaurant Dashboard to a Digital Ocean Droplet"
echo "--------------------------------------------------------------"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker is not installed. Installing Docker...${NC}"
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    echo -e "${GREEN}Docker installed successfully!${NC}"
    echo "Please log out and log back in for Docker permissions to take effect."
    echo "Then run this script again."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Docker Compose is not installed. Installing Docker Compose...${NC}"
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.3/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo -e "${GREEN}Docker Compose installed successfully!${NC}"
fi

# Check if Nginx is installed
if ! command -v nginx &> /dev/null; then
    echo -e "${RED}Nginx is not installed. Installing Nginx...${NC}"
    sudo apt-get update
    sudo apt-get install -y nginx
    echo -e "${GREEN}Nginx installed successfully!${NC}"
fi

# Check if Certbot is installed
if ! command -v certbot &> /dev/null; then
    echo -e "${RED}Certbot is not installed. Installing Certbot...${NC}"
    sudo apt-get update
    sudo apt-get install -y certbot python3-certbot-nginx
    echo -e "${GREEN}Certbot installed successfully!${NC}"
fi

# Prompt for subdomain
echo -e "${YELLOW}Enter your subdomain (e.g., dashboard.yourdomain.com):${NC}"
read SUBDOMAIN

# Update Nginx configuration
echo -e "${GREEN}Configuring Nginx for $SUBDOMAIN...${NC}"
sudo cp nginx.conf /etc/nginx/sites-available/$SUBDOMAIN
sudo sed -i "s/dashboard.yourdomain.com/$SUBDOMAIN/g" /etc/nginx/sites-available/$SUBDOMAIN
sudo ln -sf /etc/nginx/sites-available/$SUBDOMAIN /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Prompt for environment variables
echo -e "${YELLOW}Enter your Airtable API Key:${NC}"
read AIRTABLE_API_KEY

echo -e "${YELLOW}Enter your Airtable Base ID:${NC}"
read AIRTABLE_BASE_ID

# Create .env file
echo "Creating .env file..."
cat > .env << EOL
NEXT_PUBLIC_AIRTABLE_API_KEY=$AIRTABLE_API_KEY
NEXT_PUBLIC_AIRTABLE_BASE_ID=$AIRTABLE_BASE_ID
EOL

# Build and start the application
echo -e "${GREEN}Building and starting the application...${NC}"
docker-compose up -d --build

# Set up SSL with Let's Encrypt
echo -e "${YELLOW}Do you want to set up SSL with Let's Encrypt? (y/n)${NC}"
read SETUP_SSL

if [ "$SETUP_SSL" = "y" ]; then
    echo -e "${GREEN}Setting up SSL with Let's Encrypt...${NC}"
    sudo certbot --nginx -d $SUBDOMAIN
    echo -e "${GREEN}SSL setup complete!${NC}"
fi

echo -e "${GREEN}Deployment complete!${NC}"
echo "Your Restaurant Dashboard is now running at https://$SUBDOMAIN"
echo "--------------------------------------------------------------" 
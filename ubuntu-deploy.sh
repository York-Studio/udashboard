#!/bin/bash

# Restaurant Dashboard Ubuntu Deployment Script
# This script helps deploy the restaurant dashboard directly to an Ubuntu server

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Restaurant Dashboard Ubuntu Deployment ===${NC}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed. Installing Node.js 18.x...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}Failed to install Node.js. Please install it manually.${NC}"
        exit 1
    fi
    echo -e "${GREEN}Node.js installed successfully!${NC}"
fi

# Create temporary swap space to prevent memory issues during build
echo -e "${YELLOW}Setting up temporary swap space for the build process...${NC}"
SWAP_FILE="/swapfile"
if [ ! -f "$SWAP_FILE" ]; then
    echo -e "${YELLOW}Creating 2GB swap file...${NC}"
    sudo fallocate -l 2G $SWAP_FILE
    sudo chmod 600 $SWAP_FILE
    sudo mkswap $SWAP_FILE
    sudo swapon $SWAP_FILE
    echo -e "${GREEN}Swap file created and activated.${NC}"
else
    echo -e "${GREEN}Swap file already exists.${NC}"
    sudo swapon $SWAP_FILE
fi

# Check if swap is enabled
SWAP_ENABLED=$(sudo swapon --show)
if [ -z "$SWAP_ENABLED" ]; then
    echo -e "${RED}Warning: Failed to enable swap. The build might fail due to memory constraints.${NC}"
else
    echo -e "${GREEN}Swap is enabled. Available memory for build:${NC}"
    free -h
fi

# Create deployment directory
DEPLOY_DIR="/opt/restaurant-dashboard"
echo -e "${YELLOW}Setting up deployment directory at ${DEPLOY_DIR}...${NC}"
sudo mkdir -p $DEPLOY_DIR
sudo chown $(whoami):$(whoami) $DEPLOY_DIR

# Copy application files
echo -e "${YELLOW}Copying application files...${NC}"
rsync -av --exclude='node_modules' --exclude='.git' --exclude='.dockerignore' --exclude='Dockerfile' --exclude='docker-compose.yml' ./ $DEPLOY_DIR/

# Prompt for Airtable credentials
echo -e "\n${YELLOW}=== Airtable Configuration ===${NC}"
echo -e "This application uses Airtable for data storage."
echo -e "You can either provide your Airtable credentials now or configure them later."
echo -e "If you don't provide them now, the application will use mock data until configured."
echo -e "\n"

# Ask if the user wants to configure Airtable now
read -p "Do you want to configure Airtable credentials now? (y/n): " configure_airtable

# Initialize variables
AIRTABLE_TOKEN=""
AIRTABLE_BASE_ID=""
RESTAURANT_SEATS="120"

if [[ "$configure_airtable" =~ ^[Yy]$ ]]; then
    echo -e "\n${YELLOW}Please provide your Airtable credentials:${NC}"
    read -p "Enter your Airtable Personal Access Token: " AIRTABLE_TOKEN
    read -p "Enter your Airtable Base ID: " AIRTABLE_BASE_ID
    read -p "Enter your restaurant's total number of seats [default: 120]: " SEATS_INPUT
    
    # Use default value if no input provided
    RESTAURANT_SEATS=${SEATS_INPUT:-"120"}
    
    # Create a .env.local file with the provided credentials
    cat > $DEPLOY_DIR/.env.local << EOL
NEXT_PUBLIC_AIRTABLE_PERSONAL_ACCESS_TOKEN=${AIRTABLE_TOKEN}
NEXT_PUBLIC_AIRTABLE_BASE_ID=${AIRTABLE_BASE_ID}
NEXT_PUBLIC_RESTAURANT_TOTAL_SEATS=${RESTAURANT_SEATS}
EOL
    echo -e "${GREEN}Airtable credentials saved to .env.local${NC}"
else
    echo -e "${YELLOW}Skipping Airtable configuration. The application will use mock data.${NC}"
    echo -e "${YELLOW}You can configure Airtable later by editing the systemd service file or creating a .env.local file.${NC}"
fi

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
cd $DEPLOY_DIR
npm ci

# Install specific TypeScript dependencies to avoid compatibility issues
echo -e "${YELLOW}Installing TypeScript dependencies...${NC}"
npm install --save-dev typescript@4.9.5 @types/react@18.2.0 @types/node@18.15.0

# Create fix for React Icons TypeScript errors
echo -e "${YELLOW}Creating TypeScript fixes for React Icons...${NC}"
cat > $DEPLOY_DIR/react-icons.d.ts << EOL
import React from 'react';

declare module 'react-icons/fa' {
  export const FaChartPie: React.FC<React.SVGProps<SVGSVGElement>>;
  export const FaArrowUp: React.FC<React.SVGProps<SVGSVGElement>>;
  export const FaArrowDown: React.FC<React.SVGProps<SVGSVGElement>>;
  export const FaUsers: React.FC<React.SVGProps<SVGSVGElement>>;
  export const FaBoxes: React.FC<React.SVGProps<SVGSVGElement>>;
  export const FaChartLine: React.FC<React.SVGProps<SVGSVGElement>>;
  export const FaCalendarAlt: React.FC<React.SVGProps<SVGSVGElement>>;
  export const FaSync: React.FC<React.SVGProps<SVGSVGElement>>;
  export const FaUserPlus: React.FC<React.SVGProps<SVGSVGElement>>;
  export const FaTrash: React.FC<React.SVGProps<SVGSVGElement>>;
  export const FaEdit: React.FC<React.SVGProps<SVGSVGElement>>;
  export const FaCheck: React.FC<React.SVGProps<SVGSVGElement>>;
  export const FaTimes: React.FC<React.SVGProps<SVGSVGElement>>;
  export const FaExclamationTriangle: React.FC<React.SVGProps<SVGSVGElement>>;
  export const FaChevronLeft: React.FC<React.SVGProps<SVGSVGElement>>;
  export const FaChevronRight: React.FC<React.SVGProps<SVGSVGElement>>;
}
EOL

# Update next.config.js to remove deprecated options
echo -e "${YELLOW}Updating Next.js configuration...${NC}"
cat > $DEPLOY_DIR/next.config.js << EOL
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // SWC minification is handled automatically in newer Next.js versions
}

module.exports = nextConfig
EOL

# Build the application
echo -e "${YELLOW}Building the application...${NC}"
NODE_OPTIONS="--max-old-space-size=1024" npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}Build failed. Please check the errors above.${NC}"
    exit 1
fi

# Set permissions
sudo chown -R $(whoami):$(whoami) $DEPLOY_DIR

# Setup systemd service
echo -e "${YELLOW}Setting up systemd service...${NC}"

# Prompt for N8n webhook URL
echo -e "\n${YELLOW}=== N8n Chat Widget Configuration ===${NC}"
echo -e "This application can use N8n for the chat widget integration."
read -p "Do you want to configure N8n webhook URL? (y/n): " configure_n8n

# Initialize N8n variables
N8N_WEBHOOK_URL=""

if [[ "$configure_n8n" =~ ^[Yy]$ ]]; then
    echo -e "\n${YELLOW}Please provide your N8n webhook URL:${NC}"
    read -p "Enter your N8n webhook URL: " N8N_WEBHOOK_URL
    
    # Add to .env.local file
    if [ -f "$DEPLOY_DIR/.env.local" ]; then
        echo "NEXT_PUBLIC_N8N_WEBHOOK_URL=${N8N_WEBHOOK_URL}" >> $DEPLOY_DIR/.env.local
    else
        cat > $DEPLOY_DIR/.env.local << EOL
NEXT_PUBLIC_N8N_WEBHOOK_URL=${N8N_WEBHOOK_URL}
EOL
    fi
    
    echo -e "${GREEN}N8n webhook URL saved to .env.local${NC}"
else
    echo -e "${YELLOW}Skipping N8n configuration.${NC}"
fi

# Update the service file with provided credentials
cat > $DEPLOY_DIR/restaurant-dashboard.service << EOL
[Unit]
Description=Restaurant Dashboard Next.js Application
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/opt/restaurant-dashboard
ExecStart=/usr/bin/npm start
Restart=on-failure
Environment=NODE_ENV=production
Environment=PORT=3000
Environment=NEXT_PUBLIC_AIRTABLE_PERSONAL_ACCESS_TOKEN=${AIRTABLE_TOKEN}
Environment=NEXT_PUBLIC_AIRTABLE_BASE_ID=${AIRTABLE_BASE_ID}
Environment=NEXT_PUBLIC_RESTAURANT_TOTAL_SEATS=${RESTAURANT_SEATS}
Environment=NEXT_PUBLIC_N8N_WEBHOOK_URL=${N8N_WEBHOOK_URL}
# Add more environment variables as needed

[Install]
WantedBy=multi-user.target
EOL

sudo cp $DEPLOY_DIR/restaurant-dashboard.service /etc/systemd/system/
sudo systemctl daemon-reload

# Setup Nginx
if command -v nginx &> /dev/null; then
    echo -e "${YELLOW}Setting up Nginx...${NC}"
    sudo cp nginx.conf /etc/nginx/sites-available/restaurant-dashboard
    
    # Update server_name in nginx.conf if provided
    if [ ! -z "$1" ]; then
        sudo sed -i "s/demo-dashboard.yorkstudio.io/$1/g" /etc/nginx/sites-available/restaurant-dashboard
        echo -e "${GREEN}Updated Nginx configuration with domain: $1${NC}"
    else
        echo -e "${YELLOW}No domain provided. Using default domain in nginx.conf.${NC}"
        echo -e "${YELLOW}Update the domain by editing: ${GREEN}sudo nano /etc/nginx/sites-available/restaurant-dashboard${NC}"
    fi
    
    sudo ln -sf /etc/nginx/sites-available/restaurant-dashboard /etc/nginx/sites-enabled/
    sudo nginx -t
    
    if [ $? -eq 0 ]; then
        sudo systemctl reload nginx
        echo -e "${GREEN}Nginx configured successfully!${NC}"
        
        # Setup SSL
        echo -e "${YELLOW}Would you like to set up SSL with Let's Encrypt? (y/n)${NC}"
        read -r setup_ssl
        
        if [[ "$setup_ssl" =~ ^[Yy]$ ]]; then
            if ! command -v certbot &> /dev/null; then
                echo -e "${YELLOW}Installing Certbot...${NC}"
                sudo apt-get update
                sudo apt-get install -y certbot python3-certbot-nginx
            fi
            
            domain=${1:-"demo-dashboard.yorkstudio.io"}
            sudo certbot --nginx -d $domain
        fi
    else
        echo -e "${RED}Nginx configuration test failed. Please check your nginx.conf file.${NC}"
    fi
else
    echo -e "${YELLOW}Nginx not installed. Consider installing it for production use:${NC}"
    echo -e "${GREEN}sudo apt-get install -y nginx${NC}"
    echo -e "${YELLOW}Then run this script again to configure Nginx.${NC}"
fi

# Start the service
echo -e "${YELLOW}Starting the Restaurant Dashboard service...${NC}"
sudo systemctl enable restaurant-dashboard
sudo systemctl start restaurant-dashboard

# Get the server's public IP address
SERVER_IP=$(curl -s ifconfig.me)

echo -e "${GREEN}Deployment complete!${NC}"
echo -e "${GREEN}Restaurant Dashboard is now running at http://${SERVER_IP}:3000${NC}"

# Instructions for troubleshooting
echo -e "\n${YELLOW}=== Troubleshooting ===${NC}"
echo -e "To check the service status: ${GREEN}sudo systemctl status restaurant-dashboard${NC}"
echo -e "To view service logs: ${GREEN}sudo journalctl -u restaurant-dashboard -f${NC}"
echo -e "To restart the service: ${GREEN}sudo systemctl restart restaurant-dashboard${NC}"

# Show Airtable configuration status
echo -e "\n${YELLOW}=== Airtable Configuration Status ===${NC}"
if [[ "$configure_airtable" =~ ^[Yy]$ ]]; then
    echo -e "${GREEN}Airtable is configured with your credentials.${NC}"
    echo -e "To update these credentials later:"
    echo -e "1. Edit the service file: ${GREEN}sudo nano /etc/systemd/system/restaurant-dashboard.service${NC}"
    echo -e "2. Edit the .env.local file: ${GREEN}nano $DEPLOY_DIR/.env.local${NC}"
else
    echo -e "${YELLOW}Airtable is not configured. The application is using mock data.${NC}"
    echo -e "To configure Airtable:"
    echo -e "1. Edit the service file: ${GREEN}sudo nano /etc/systemd/system/restaurant-dashboard.service${NC}"
    echo -e "2. Create a .env.local file: ${GREEN}nano $DEPLOY_DIR/.env.local${NC}"
    echo -e "   with the following content:"
    echo -e "   ${GREEN}NEXT_PUBLIC_AIRTABLE_PERSONAL_ACCESS_TOKEN=your_token_here${NC}"
    echo -e "   ${GREEN}NEXT_PUBLIC_AIRTABLE_BASE_ID=your_base_id_here${NC}"
    echo -e "   ${GREEN}NEXT_PUBLIC_RESTAURANT_TOTAL_SEATS=120${NC}"
fi

# Show N8n chat widget configuration status
echo -e "\n${YELLOW}=== N8n Chat Widget Configuration Status ===${NC}"
if [[ "$configure_n8n" =~ ^[Yy]$ ]]; then
    echo -e "${GREEN}N8n Chat Widget is configured with your webhook URL.${NC}"
    echo -e "To update this URL later:"
    echo -e "1. Edit the service file: ${GREEN}sudo nano /etc/systemd/system/restaurant-dashboard.service${NC}"
    echo -e "2. Edit the .env.local file: ${GREEN}nano $DEPLOY_DIR/.env.local${NC}"
else
    echo -e "${YELLOW}N8n Chat Widget is not configured.${NC}"
    echo -e "To configure it later:"
    echo -e "1. Edit the service file: ${GREEN}sudo nano /etc/systemd/system/restaurant-dashboard.service${NC}"
    echo -e "2. Edit the .env.local file: ${GREEN}nano $DEPLOY_DIR/.env.local${NC}"
    echo -e "   Add the following line:"
    echo -e "   ${GREEN}NEXT_PUBLIC_N8N_WEBHOOK_URL=your_webhook_url_here${NC}"
fi

# Show fixes that were applied for TypeScript and build issues
echo -e "\n${YELLOW}=== TypeScript and Build Fixes ===${NC}"
echo -e "${GREEN}The following fixes were applied to ensure successful builds:${NC}"
echo -e "1. TypeScript dependencies were pinned to compatible versions"
echo -e "2. A TypeScript declaration file was created for React Icons"
echo -e "3. Temporary swap space was configured to prevent memory issues"
echo -e "4. Next.js configuration was updated to remove deprecated options"
echo -e "\nIf you encounter TypeScript errors when making changes, you might need to:"
echo -e "1. Add more icon types to: ${GREEN}$DEPLOY_DIR/react-icons.d.ts${NC}"
echo -e "2. Adjust memory settings: ${GREEN}export NODE_OPTIONS=\"--max-old-space-size=1024\"${NC}"

echo -e "\n${YELLOW}=== User Management ===${NC}"
echo -e "${GREEN}The application includes an admin user named Andy Lennox.${NC}"
echo -e "Username: Andy"
echo -e "Password: AndyL2025"
echo -e "Users can be managed from the Users Management page (admin access only)."

echo -e "\n${YELLOW}=== Deployment Complete ===${NC}" 
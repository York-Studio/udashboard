# Ubuntu Server Deployment Guide

This guide will walk you through deploying the Restaurant Dashboard directly on an Ubuntu server without Docker.

## 1. Prerequisites

- Ubuntu Server 20.04 LTS or newer
- SSH access to your server
- A domain name (optional, but recommended for production)
- Airtable personal access token (not the legacy API key)

## 2. Initial Server Setup

### 2.1 Update System Packages

```bash
sudo apt-get update
sudo apt-get upgrade -y
```

### 2.2 Install Required Dependencies

```bash
# Install Node.js (will be done by the script, but you can do it manually too)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Nginx for reverse proxy
sudo apt-get install -y nginx

# Install other utilities
sudo apt-get install -y git rsync
```

## 3. Deploy the Application

### 3.1 Clone the Repository

```bash
git clone https://your-repository-url.git
cd restaurant-dashboard
```

### 3.2 Run the Deployment Script

The deployment script will:
- Install Node.js if not already installed
- Set up the application in `/opt/restaurant-dashboard`
- **Interactively prompt for Airtable credentials**
- Configure Nginx as a reverse proxy
- Set up a systemd service for automatic startup
- Optionally configure SSL with Let's Encrypt

```bash
# Make the script executable
chmod +x ubuntu-deploy.sh

# Run the script (optionally with your domain name)
./ubuntu-deploy.sh your-domain.com
```

### 3.3 Airtable Configuration

During the deployment, you'll be prompted to configure Airtable:

```
=== Airtable Configuration ===
This application uses Airtable for data storage.
You can either provide your Airtable credentials now or configure them later.
If you don't provide them now, the application will use mock data until configured.

Do you want to configure Airtable credentials now? (y/n):
```

If you select "y", you'll be asked to provide:
- Your Airtable Personal Access Token
- Your Airtable Base ID
- Your restaurant's total number of seats (optional, defaults to 120)

> **Note**: This application uses Airtable's Personal Access Tokens for authentication, not the legacy API keys. See `AIRTABLE_AUTHENTICATION.md` for more details.

## 4. Verify the Deployment

After running the deployment script:

1. Check if the service is running:
   ```bash
   sudo systemctl status restaurant-dashboard
   ```

2. Access your application:
   - http://your-server-ip:3000 (direct access)
   - https://your-domain.com (if you configured a domain with SSL)

## 5. Managing the Application

### 5.1 Updating the Application

To update the application:

```bash
# Pull the latest changes
git pull

# Re-run the deployment script
./ubuntu-deploy.sh your-domain.com
```

### 5.2 Restarting the Service

```bash
sudo systemctl restart restaurant-dashboard
```

### 5.3 Viewing Logs

```bash
# View logs in real-time
sudo journalctl -u restaurant-dashboard -f

# View recent logs
sudo journalctl -u restaurant-dashboard -n 100
```

### 5.4 Modifying Environment Variables

Edit the systemd service file to update environment variables:

```bash
sudo nano /etc/systemd/system/restaurant-dashboard.service
```

After editing, reload the service:

```bash
sudo systemctl daemon-reload
sudo systemctl restart restaurant-dashboard
```

## 6. Troubleshooting

### 6.1 Application Not Starting

Check the logs for errors:

```bash
sudo journalctl -u restaurant-dashboard -n 50
```

### 6.2 Nginx Configuration Issues

Test the Nginx configuration:

```bash
sudo nginx -t
```

### 6.3 Port Conflicts

If port 3000 is already in use:

1. Edit the systemd service file to use a different port:
   ```bash
   sudo nano /etc/systemd/system/restaurant-dashboard.service
   ```

2. Update the `Environment=PORT=3000` line with a different port

3. Update the Nginx configuration to point to the new port:
   ```bash
   sudo nano /etc/nginx/sites-available/restaurant-dashboard
   ```

4. Reload the services:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl restart restaurant-dashboard
   sudo systemctl reload nginx
   ``` 
# Digital Ocean Deployment Guide

This guide provides step-by-step instructions for deploying the Restaurant Dashboard application to a Digital Ocean Droplet and configuring it to run on a subdomain of your website.

## 1. Create a Digital Ocean Droplet

1. Log in to your Digital Ocean account
2. Click on "Create" and select "Droplets"
3. Choose an image: Select the "Marketplace" tab and search for "Docker"
4. Select the "Docker" image (this comes with Docker pre-installed)
5. Choose a plan:
   - For a small to medium restaurant, the Basic plan with 2GB RAM / 1 CPU should be sufficient
   - For larger operations, consider 4GB RAM / 2 CPU
6. Choose a datacenter region closest to your primary users
7. Add your SSH key or create a password
8. Choose a hostname (e.g., restaurant-dashboard)
9. Click "Create Droplet"

## 2. Configure DNS for Your Subdomain

1. Log in to your domain registrar's website
2. Navigate to the DNS management section
3. Add a new A record:
   - Type: A
   - Name: dashboard (or your preferred subdomain)
   - Value: Your Digital Ocean Droplet's IP address
   - TTL: 3600 (or default)
4. Save the changes

Note: DNS changes can take up to 48 hours to propagate, but typically take 15-30 minutes.

## 3. Connect to Your Droplet

1. Open your terminal
2. Connect to your Droplet via SSH:
   ```
   ssh root@your-droplet-ip
   ```
   If you're using a password, enter it when prompted.

## 4. Deploy the Application

### Option 1: Using the Deployment Script (Recommended)

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/restaurant-dashboard.git
   cd restaurant-dashboard
   ```

2. Run the deployment script:
   ```
   chmod +x deploy.sh
   ./deploy.sh
   ```

3. Follow the prompts:
   - Enter your subdomain (e.g., dashboard.yourdomain.com)
   - Enter your Airtable API Key
   - Enter your Airtable Base ID
   - Choose whether to set up SSL (recommended)

### Option 2: Manual Deployment

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/restaurant-dashboard.git
   cd restaurant-dashboard
   ```

2. Create a `.env` file:
   ```
   cat > .env << EOL
   NEXT_PUBLIC_AIRTABLE_API_KEY=your_airtable_api_key
   NEXT_PUBLIC_AIRTABLE_BASE_ID=your_airtable_base_id
   EOL
   ```

3. Build and start the Docker container:
   ```
   docker-compose up -d --build
   ```

4. Install and configure Nginx:
   ```
   sudo apt-get update
   sudo apt-get install -y nginx
   sudo cp nginx.conf /etc/nginx/sites-available/your-subdomain.com
   sudo sed -i 's/dashboard.yourdomain.com/your-subdomain.com/g' /etc/nginx/sites-available/your-subdomain.com
   sudo ln -sf /etc/nginx/sites-available/your-subdomain.com /etc/nginx/sites-enabled/
   sudo nginx -t && sudo systemctl reload nginx
   ```

5. Set up SSL with Let's Encrypt:
   ```
   sudo apt-get install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d your-subdomain.com
   ```

## 5. Verify the Deployment

1. Open your browser and navigate to your subdomain (https://dashboard.yourdomain.com)
2. You should see the login page of the Restaurant Dashboard
3. Log in with your credentials

## 6. Maintenance and Updates

### Updating the Application

1. SSH into your Droplet
2. Navigate to the application directory:
   ```
   cd restaurant-dashboard
   ```
3. Pull the latest changes:
   ```
   git pull
   ```
4. Rebuild and restart the Docker container:
   ```
   docker-compose up -d --build
   ```

### Monitoring Logs

To view the application logs:
```
docker-compose logs -f
```

### Backing Up Your Data

Your data is stored in Airtable, which provides its own backup mechanisms. However, you may want to back up your configuration:

1. Back up your `.env` file:
   ```
   cp .env .env.backup
   ```

2. Back up your Nginx configuration:
   ```
   sudo cp /etc/nginx/sites-available/your-subdomain.com nginx.conf.backup
   ```

## 7. Troubleshooting

### Application Not Loading

1. Check if the Docker container is running:
   ```
   docker-compose ps
   ```

2. If it's not running, check the logs:
   ```
   docker-compose logs
   ```

3. Restart the container:
   ```
   docker-compose down
   docker-compose up -d
   ```

### SSL Certificate Issues

1. Check the Nginx configuration:
   ```
   sudo nginx -t
   ```

2. Renew the SSL certificate:
   ```
   sudo certbot renew
   ```

### DNS Issues

1. Verify your DNS settings at your domain registrar
2. Check if the subdomain resolves to your Droplet's IP:
   ```
   nslookup your-subdomain.com
   ```

## 8. Security Considerations

1. Set up a firewall:
   ```
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```

2. Set up automatic security updates:
   ```
   sudo apt-get install unattended-upgrades
   sudo dpkg-reconfigure -plow unattended-upgrades
   ```

3. Consider setting up fail2ban to protect against brute force attacks:
   ```
   sudo apt-get install fail2ban
   sudo systemctl enable fail2ban
   sudo systemctl start fail2ban
   ``` 
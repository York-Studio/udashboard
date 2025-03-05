# Digital Ocean Deployment Guide

This guide will walk you through the complete setup of your Restaurant Dashboard on Digital Ocean, including domain configuration, SSL setup, and Airtable integration.

## 1. Domain Configuration

### 1.1 Point Your Domain to Digital Ocean

First, you need to point your domain to your Digital Ocean droplet:

1. Log in to your domain registrar (e.g., GoDaddy, Namecheap, etc.)
2. Find the DNS management section
3. Add an A record:
   - **Host/Name**: Use `@` for the root domain or `dashboard` for a subdomain
   - **Value/Points to**: Your Digital Ocean droplet's IP address
   - **TTL**: 3600 (or default)

4. If you want to use `www` as well, add a CNAME record:
   - **Host/Name**: `www`
   - **Value/Points to**: Your root domain (e.g., `yourdomain.com`)
   - **TTL**: 3600 (or default)

> **Note**: DNS changes can take up to 48 hours to propagate, but typically take 15-30 minutes.

### 1.2 Configure Nginx

Now, let's set up Nginx to serve your application:

1. Update the nginx.conf file with your actual domain:

```bash
# Replace dashboard.yourdomain.com with your actual domain
sed -i 's/dashboard.yourdomain.com/your-actual-domain.com/g' nginx.conf
```

2. Copy the Nginx configuration to the proper location:

```bash
sudo cp nginx.conf /etc/nginx/sites-available/restaurant-dashboard
```

3. Create a symbolic link to enable the site:

```bash
sudo ln -sf /etc/nginx/sites-available/restaurant-dashboard /etc/nginx/sites-enabled/
```

4. Test the Nginx configuration:

```bash
sudo nginx -t
```

5. If the test is successful, reload Nginx:

```bash
sudo systemctl reload nginx
```

## 2. SSL Certificate Setup

Let's secure your site with a free SSL certificate from Let's Encrypt:

1. Install Certbot:

```bash
sudo apt-get update
sudo apt-get install -y certbot python3-certbot-nginx
```

2. Obtain and install the SSL certificate:

```bash
sudo certbot --nginx -d your-actual-domain.com
```

3. Follow the prompts from Certbot:
   - Enter your email address for renewal notifications
   - Agree to the terms of service
   - Choose whether to redirect HTTP traffic to HTTPS (recommended)

Certbot will automatically update your Nginx configuration to use SSL.

## 3. Airtable Integration

To connect your application to Airtable, you need to set up the required credentials:

### 3.1 Get Your Airtable Credentials

1. Log in to your [Airtable account](https://airtable.com/)
2. Go to your [account page](https://airtable.com/account)
3. Under the API section, you'll find your Personal Access Token (or create a new one)
4. To get your Base ID:
   - Open the Airtable base you want to use
   - Look at the URL: `https://airtable.com/[BASE_ID]/[TABLE_NAME]/[VIEW_NAME]`
   - The Base ID is the part after `airtable.com/` and before the next `/`

### 3.2 Update Environment Variables

There are two ways to provide these credentials to your application:

#### Option 1: Using Environment Variables (Recommended)

1. Stop the current container:

```bash
docker stop restaurant-dashboard
docker rm restaurant-dashboard
```

2. Set the environment variables:

```bash
export NEXT_PUBLIC_AIRTABLE_PERSONAL_ACCESS_TOKEN="your_token_here"
export NEXT_PUBLIC_AIRTABLE_BASE_ID="your_base_id_here"
export NEXT_PUBLIC_RESTAURANT_TOTAL_SEATS="120"
```

3. Run the deployment script again:

```bash
./deploy.sh
```

#### Option 2: Using a .env File

1. Create a .env file in your project directory:

```bash
cat > .env.local << EOL
NEXT_PUBLIC_AIRTABLE_PERSONAL_ACCESS_TOKEN=your_token_here
NEXT_PUBLIC_AIRTABLE_BASE_ID=your_base_id_here
NEXT_PUBLIC_RESTAURANT_TOTAL_SEATS=120
EOL
```

2. Rebuild and restart the container:

```bash
docker stop restaurant-dashboard
docker rm restaurant-dashboard
docker build -t restaurant-dashboard .
docker run -d --name restaurant-dashboard -p 3000:3000 --env-file .env.local restaurant-dashboard
```

## 4. Verify Your Setup

1. Visit your domain in a web browser (https://your-actual-domain.com)
2. Log in with one of the demo accounts:
   - Admin: Username: `admin`, Password: `admin123`
   - Manager: Username: `manager`, Password: `manager123`
   - Chef: Username: `chef`, Password: `chef123`
   - Waiter: Username: `waiter`, Password: `waiter123`

3. Verify that you can see real data from your Airtable base (if configured) or the mock data

## 5. Troubleshooting

### 5.1 Nginx Issues

If you encounter issues with Nginx:

```bash
# Check Nginx status
sudo systemctl status nginx

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log

# Check Nginx access logs
sudo tail -f /var/log/nginx/access.log
```

### 5.2 Docker Container Issues

If you encounter issues with the Docker container:

```bash
# Check container logs
docker logs restaurant-dashboard

# Check if the container is running
docker ps -a

# Restart the container
docker restart restaurant-dashboard
```

### 5.3 SSL Certificate Issues

If you encounter issues with SSL:

```bash
# Check certificate status
sudo certbot certificates

# Renew certificates manually
sudo certbot renew --dry-run
```

## 6. Maintenance

### 6.1 Updating the Application

To update the application after making changes:

1. Pull the latest changes:

```bash
git pull
```

2. Rebuild and restart the container:

```bash
./deploy.sh
```

### 6.2 SSL Certificate Renewal

Certbot automatically renews certificates before they expire. To manually trigger a renewal:

```bash
sudo certbot renew
```

### 6.3 Backup Your Configuration

It's a good practice to back up your configuration files:

```bash
# Create a backup directory
mkdir -p ~/backups/$(date +%Y-%m-%d)

# Backup Nginx configuration
sudo cp /etc/nginx/sites-available/restaurant-dashboard ~/backups/$(date +%Y-%m-%d)/

# Backup environment variables
env | grep NEXT_PUBLIC > ~/backups/$(date +%Y-%m-%d)/environment_variables.txt
```

## 7. Security Recommendations

1. **Firewall**: Ensure your firewall only allows necessary ports (80, 443, 22):

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

2. **SSH Security**: Consider using SSH keys instead of passwords and disabling root login.

3. **Regular Updates**: Keep your system updated:

```bash
sudo apt-get update
sudo apt-get upgrade
```

4. **Monitoring**: Consider setting up monitoring for your droplet using Digital Ocean's monitoring tools or a third-party service.

## 8. Next Steps

- Consider setting up automated backups for your Droplet
- Implement a CI/CD pipeline for automated deployments
- Set up monitoring and alerting for your application
- Customize the application further to meet your specific needs 
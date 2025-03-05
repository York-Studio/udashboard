# Restaurant Dashboard

A comprehensive dashboard for restaurant management, featuring staff scheduling, inventory management, financial tracking, and booking management.

## Features

- User authentication with role-based access control
- Staff scheduling and management
- Inventory tracking
- Financial reporting
- Booking management
- Dark mode support
- Responsive design

## Local Development

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env.local` file with the following variables:
   ```
   NEXT_PUBLIC_AIRTABLE_API_KEY=your_airtable_api_key
   NEXT_PUBLIC_AIRTABLE_BASE_ID=your_airtable_base_id
   ```
4. Run the development server:
   ```
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment to Digital Ocean

### Prerequisites

- A Digital Ocean account
- A domain name with DNS configured to point a subdomain to your Digital Ocean droplet

### Option 1: Manual Deployment

1. Create a new Digital Ocean Droplet with Docker pre-installed
2. SSH into your Droplet
3. Clone this repository:
   ```
   git clone https://github.com/yourusername/restaurant-dashboard.git
   cd restaurant-dashboard
   ```
4. Create a `.env` file with your environment variables:
   ```
   NEXT_PUBLIC_AIRTABLE_API_KEY=your_airtable_api_key
   NEXT_PUBLIC_AIRTABLE_BASE_ID=your_airtable_base_id
   ```
5. Build and run the Docker container:
   ```
   docker-compose up -d --build
   ```
6. Install and configure Nginx:
   ```
   sudo apt-get update
   sudo apt-get install -y nginx
   sudo cp nginx.conf /etc/nginx/sites-available/your-subdomain.com
   sudo sed -i 's/dashboard.yourdomain.com/your-subdomain.com/g' /etc/nginx/sites-available/your-subdomain.com
   sudo ln -sf /etc/nginx/sites-available/your-subdomain.com /etc/nginx/sites-enabled/
   sudo nginx -t && sudo systemctl reload nginx
   ```
7. Set up SSL with Let's Encrypt:
   ```
   sudo apt-get install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d your-subdomain.com
   ```

### Option 2: Using the Deployment Script

1. Create a new Digital Ocean Droplet with Docker pre-installed
2. SSH into your Droplet
3. Clone this repository:
   ```
   git clone https://github.com/yourusername/restaurant-dashboard.git
   cd restaurant-dashboard
   ```
4. Run the deployment script:
   ```
   ./deploy.sh
   ```
5. Follow the prompts to configure your deployment

## Updating the Application

To update the application after making changes:

1. SSH into your Droplet
2. Navigate to the application directory
3. Pull the latest changes:
   ```
   git pull
   ```
4. Rebuild and restart the Docker container:
   ```
   docker-compose up -d --build
   ```

## Environment Variables

- `NEXT_PUBLIC_AIRTABLE_API_KEY`: Your Airtable API key
- `NEXT_PUBLIC_AIRTABLE_BASE_ID`: Your Airtable Base ID

## License

[MIT](LICENSE) 
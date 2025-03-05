# Restaurant Dashboard

A modern dashboard for restaurant management, featuring booking capacity monitoring, financial overview, inventory management, staff scheduling, and user management.

## Features

- **Booking Management**: Track reservations and table availability
- **Financial Overview**: Monitor revenue and financial performance
- **Inventory Management**: Keep track of stock levels and reorder needs
- **Staff Scheduling**: Manage staff shifts and availability
- **User Management**: Admin-only access to manage system users

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Airtable (for data storage)
- Docker (for deployment)

## Local Development

### Prerequisites

- Node.js 18 or later
- npm or yarn

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/restaurant-dashboard.git
   cd restaurant-dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with your Airtable credentials:
   ```
   NEXT_PUBLIC_AIRTABLE_PERSONAL_ACCESS_TOKEN=your_token_here
   NEXT_PUBLIC_AIRTABLE_BASE_ID=your_base_id_here
   NEXT_PUBLIC_RESTAURANT_TOTAL_SEATS=120
   ```

   > **Note**: If you don't provide Airtable credentials, the application will use mock data.

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Using Docker (Recommended)

1. Make sure Docker is installed on your server.

2. Use the provided deployment script:
   ```bash
   ./deploy.sh
   ```

   This script will:
   - Build the Docker image
   - Stop any existing container
   - Start a new container with your environment variables

### Manual Deployment to Digital Ocean

1. Create a Digital Ocean Droplet (Basic plan with Docker pre-installed is recommended).

2. SSH into your Droplet:
   ```bash
   ssh root@your_droplet_ip
   ```

3. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/restaurant-dashboard.git
   cd restaurant-dashboard
   ```

4. Set up environment variables:
   ```bash
   export NEXT_PUBLIC_AIRTABLE_PERSONAL_ACCESS_TOKEN="your_token_here"
   export NEXT_PUBLIC_AIRTABLE_BASE_ID="your_base_id_here"
   export NEXT_PUBLIC_RESTAURANT_TOTAL_SEATS="120"
   ```

5. Run the deployment script:
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

6. (Optional) Set up Nginx as a reverse proxy:
   ```bash
   apt-get update
   apt-get install -y nginx
   ```

   Create an Nginx configuration file:
   ```bash
   nano /etc/nginx/sites-available/restaurant-dashboard
   ```

   Add the following configuration:
   ```
   server {
       listen 80;
       server_name your_domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   Enable the site and restart Nginx:
   ```bash
   ln -s /etc/nginx/sites-available/restaurant-dashboard /etc/nginx/sites-enabled/
   nginx -t
   systemctl restart nginx
   ```

7. (Optional) Set up SSL with Certbot:
   ```bash
   apt-get install -y certbot python3-certbot-nginx
   certbot --nginx -d your_domain.com
   ```

## Authentication

The application uses a simple authentication system with the following demo accounts:

- **Admin**: Username: `admin`, Password: `admin123`
- **Manager**: Username: `manager`, Password: `manager123`
- **Chef**: Username: `chef`, Password: `chef123`
- **Waiter**: Username: `waiter`, Password: `waiter123`

## License

MIT 
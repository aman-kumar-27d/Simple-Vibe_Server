# Deployment Guide

This document provides instructions for deploying the Portfolio Backend Server to a production environment.

## Prerequisites

Before deploying, ensure you have:

1. A server running Linux, preferably Ubuntu 20.04 or newer
2. Node.js 18.x or newer installed
3. PM2 or similar process manager installed globally (`npm install -g pm2`)
4. Nginx for reverse proxy (optional but recommended)
5. Domain name and SSL certificate (Let's Encrypt is recommended)

## Deployment Steps

### 1. Clone and Prepare the Repository

```bash
# Clone the repository
git clone https://github.com/aman-kumar-27d/Simple-Vibe_Server.git
cd Simple-Vibe_Server

# Install dependencies
npm install

# Build the application
npm run build
```

### 2. Environment Setup

```bash
# Copy the example environment file
cp .env.example .env

# Edit the environment file with production values
nano .env
```

**Important Environment Variables for Production:**

- Set `NODE_ENV=production`
- Set `PORT` to your desired port (usually 5000)
- Set `FRONTEND_URL` to your frontend domain
- Configure email settings with production credentials
- Set `JWT_SECRET` to a strong random string

### 3. Running with PM2

Create a PM2 ecosystem file:

```bash
# Create ecosystem.config.js
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: "portfolio-backend",
    script: "dist/server.js",
    instances: "max",
    exec_mode: "cluster",
    env: {
      NODE_ENV: "production"
    },
    env_production: {
      NODE_ENV: "production"
    },
    max_memory_restart: "300M",
    log_date_format: "YYYY-MM-DD HH:mm Z",
    merge_logs: true
  }]
};
EOF

# Start the application with PM2
pm2 start ecosystem.config.js

# Save the PM2 configuration to start on reboot
pm2 save
pm2 startup
```

### 4. Nginx Reverse Proxy Configuration

Install Nginx if not already installed:

```bash
sudo apt update
sudo apt install nginx
```

Create a Nginx configuration file:

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/portfolio-backend

# Add the following configuration (adjust domain name)
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site and restart Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/portfolio-backend /etc/nginx/sites-enabled/
sudo nginx -t  # Test the configuration
sudo systemctl restart nginx
```

### 5. SSL Configuration with Let's Encrypt

Install Certbot:

```bash
sudo apt install certbot python3-certbot-nginx
```

Obtain SSL certificate:

```bash
sudo certbot --nginx -d api.yourdomain.com
```

### 6. Firewall Configuration

```bash
# Allow HTTP, HTTPS, and SSH
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443

# Enable firewall
sudo ufw enable
```

### 7. Monitoring Setup

Setup basic monitoring with PM2:

```bash
# Install PM2 monitoring modules
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7

# View logs
pm2 logs portfolio-backend
```

For more advanced monitoring, consider:
- Datadog
- New Relic
- Prometheus + Grafana

### 8. Backup Strategy

Set up automatic backups for your environment files:

```bash
# Create a backup script
cat > backup.sh << EOF
#!/bin/bash
TIMESTAMP=\$(date +"%Y%m%d-%H%M%S")
BACKUP_DIR=~/backups
mkdir -p \$BACKUP_DIR
cp .env \$BACKUP_DIR/.env.\$TIMESTAMP
# Add any other important files you want to backup
# For example: cp -r assets \$BACKUP_DIR/assets.\$TIMESTAMP
# Keep only the last 10 backups
ls -t \$BACKUP_DIR/.env.* | tail -n +11 | xargs rm -f
EOF

# Make the script executable
chmod +x backup.sh

# Set up a cron job to run daily
(crontab -l 2>/dev/null; echo "0 0 * * * $(pwd)/backup.sh") | crontab -
```

### 9. Maintenance Mode

When updating the server in production, you can enable maintenance mode:

```bash
# Enable maintenance mode
export MAINTENANCE_MODE=true
export MAINTENANCE_DURATION="15 minutes"
pm2 restart portfolio-backend

# After update is complete, disable maintenance mode
export MAINTENANCE_MODE=false
pm2 restart portfolio-backend
```

### 10. Post-Deployment Verification

After deployment, verify that:

1. The server is running: `pm2 status`
2. The API is accessible: `curl https://api.yourdomain.com/api/health`
3. Email sending works
4. All endpoints return expected responses
5. Rate limiting is working properly

## Troubleshooting

### Common Issues and Solutions

1. **Server not starting:**
   - Check logs: `pm2 logs portfolio-backend`
   - Verify environment variables: `cat .env | grep -v PASSWORD`
   - Check for port conflicts: `sudo lsof -i :5000`

2. **Email sending issues:**
   - Verify email credentials in .env
   - Check if outgoing ports are open (587 or 465)
   - Test email manually with `telnet smtp.gmail.com 587`

3. **Performance issues:**
   - Check CPU and memory usage: `pm2 monit`
   - Consider increasing PM2 instance count for more traffic
   - Optimize database queries if applicable

4. **HTTPS certificate issues:**
   - Renew certificate: `sudo certbot renew`
   - Check certificate expiration: `sudo certbot certificates`

## Security Best Practices

1. **Regular Updates:**
   ```bash
   # Update dependencies regularly
   npm audit
   npm update
   ```

2. **Limit SSH Access:**
   - Use SSH keys instead of passwords
   - Consider changing the default SSH port

3. **Rate Limiting:**
   - The application has built-in rate limiting
   - Consider additional rate limiting at the Nginx level for high-traffic sites

4. **Regular Backups:**
   - Automate backups as described above
   - Test restoring from backups periodically

5. **Security Headers:**
   - The application uses Helmet.js for security headers
   - Verify headers using: [Security Headers](https://securityheaders.com)

## Performance Optimization

1. **Node.js Configuration:**
   ```bash
   # Optimize Node.js for production
   export NODE_OPTIONS="--max-old-space-size=2048"
   ```

2. **Nginx Caching:**
   Add to your Nginx configuration:
   ```
   proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=100m inactive=60m;
   
   server {
       # ... existing config ...
       
       location /api/download/ {
           proxy_pass http://localhost:5000;
           proxy_cache api_cache;
           proxy_cache_valid 200 1h;
           # ... other proxy settings ...
       }
   }
   ```

3. **Compression:**
   Enable Gzip in Nginx:
   ```
   gzip on;
   gzip_comp_level 5;
   gzip_min_length 256;
   gzip_proxied any;
   gzip_types application/javascript application/json text/css text/plain text/xml;
   ```

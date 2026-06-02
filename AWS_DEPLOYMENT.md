# AWS EC2 Production Deployment Guide

This guide details instructions for hosting and deploying **FrontDesk AI** on an AWS EC2 Instance running Ubuntu 22.04 LTS.

---

## 1. Setup EC2 Instance

1. Launch an EC2 Instance (t3.micro or t3.small) with **Ubuntu 22.04 LTS**.
2. Configure the Security Group to allow inbound traffic on:
   - **Port 22** (SSH)
   - **Port 80** (HTTP)
   - **Port 443** (HTTPS)
   - **Port 3000** (Optional - if accessing directly, but recommended to keep closed and reverse proxy via port 80/443).

---

## 2. Install Docker & Docker Compose

Connect to your instance via SSH and run:

```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Install Docker
sudo apt install docker.io -y
sudo systemctl enable --now docker

# Add current user to docker group
sudo usermod -aG docker $USER
# Log out and log back in to apply group changes!

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

---

## 3. Clone Repository & Setup Environment

1. Clone the project code to your server directory `/var/www/frontdesk-ai`.
2. Create a `.env` file in the root directory and configure environment parameters:

```env
PORT=3000
GEMINI_API_KEY=AIzaSy...
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=ojglM...
META_ACCESS_TOKEN=EAAB...
PHONE_NUMBER_ID=1168...
VERIFY_TOKEN=frontdesk_verify_token_secure_99
```

3. Create a data directory to store the persistent SQLite database (Docker will map this directory, making it fully permanent):
```bash
mkdir data
chmod 777 data
```


---

## 4. Run Docker Compose Container

Build and start the services in detached background mode:

```bash
docker-compose up --build -d
```

Confirm container status:
```bash
docker-compose ps
```

---

## 5. Configure Nginx Reverse Proxy & SSL

1. Install Nginx and Certbot:
```bash
sudo apt install nginx certbot python3-certbot-nginx -y
```

2. Create an Nginx site configuration file at `/etc/nginx/sites-available/frontdesk`:
```nginx
server {
    listen 80;
    server_name yourdomain.com; # Replace with your custom domain

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

3. Enable configuration and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/frontdesk /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

4. Obtain Let's Encrypt SSL certificate:
```bash
sudo certbot --nginx -d yourdomain.com
```
Certbot will automatically verify the domain, obtain the SSL key, and rewrite Nginx config to forward HTTP to HTTPS.

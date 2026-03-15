# VISHWAS Production Deployment Guide

## Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] SSL certificates prepared
- [ ] Database backups scheduled
- [ ] Monitoring setup
- [ ] Security review completed
- [ ] Performance testing done
- [ ] Disaster recovery plan ready

## Production Environment Setup

### 1. Infrastructure Requirements

**Recommended**:
- OS: Ubuntu 20.04 LTS or later
- RAM: 8GB minimum (16GB recommended)
- CPU: 4 cores minimum
- Storage: 50GB+ SSD
- Network: 100Mbps connection

### 2. Install Docker & Docker Compose

```bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

### 3. Production Environment Configuration

Create `.env.production`:

```bash
# MongoDB Configuration
MONGO_USERNAME=admin
MONGO_PASSWORD=<strong-random-password>
MONGO_DATABASE=vishwas

# Node.js Backend
NODE_ENV=production
PORT=5000
JWT_SECRET=<strong-random-secret>

# CORS Configuration
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Database
MONGODB_URI=mongodb://admin:<password>@mongodb:27017/vishwas?authSource=admin

# Face Service
FLASK_ENV=production
FLASK_DEBUG=0

# Logging
LOG_LEVEL=warn

# Session/Cache
REDIS_HOST=redis
REDIS_PORT=6379
SESSION_SECRET=<strong-random-secret>

# SSL Certificate Paths
SSL_CERT_PATH=/etc/nginx/ssl/cert.pem
SSL_KEY_PATH=/etc/nginx/ssl/key.pem
```

### 4. SSL Certificate Setup

```bash
# Create SSL directory
sudo mkdir -p /path/to/vishwas/ssl

# Generate self-signed certificate (temporary)
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /path/to/vishwas/ssl/key.pem \
  -out /path/to/vishwas/ssl/cert.pem

# For production, use Let's Encrypt
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com

# Copy certificates
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem /path/to/vishwas/ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem /path/to/vishwas/ssl/key.pem

# Set permissions
sudo chown $USER:$USER /path/to/vishwas/ssl/*
chmod 600 /path/to/vishwas/ssl/key.pem
```

### 5. Docker Compose for Production

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:6.0
    container_name: vishwas-mongodb-prod
    restart: always
    volumes:
      - mongodb_data_prod:/data/db
      - mongodb_config_prod:/data/configdb
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_USERNAME}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
      MONGO_INITDB_DATABASE: ${MONGO_DATABASE}
    networks:
      - vishwas-prod-network
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 1G

  redis:
    image: redis:7-alpine
    container_name: vishwas-redis-prod
    restart: always
    command: redis-server --requirepass ${REDIS_PASSWORD:-production-password}
    volumes:
      - redis_data_prod:/data
    networks:
      - vishwas-prod-network
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M

  face-service:
    build:
      context: ./face_service
      dockerfile: Dockerfile
    container_name: vishwas-face-service-prod
    restart: always
    environment:
      FLASK_ENV: production
      MONGODB_URI: ${MONGODB_URI}
    depends_on:
      - mongodb
    networks:
      - vishwas-prod-network
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: vishwas-backend-prod
    restart: always
    environment:
      NODE_ENV: production
      PORT: 5000
      MONGODB_URI: ${MONGODB_URI}
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      - mongodb
      - face-service
    networks:
      - vishwas-prod-network
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 1.5G

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        REACT_APP_API_URL: https://api.yourdomain.com
    container_name: vishwas-frontend-prod
    restart: always
    networks:
      - vishwas-prod-network
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M

  nginx:
    image: nginx:alpine
    container_name: vishwas-nginx-prod
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - frontend
      - backend
    networks:
      - vishwas-prod-network
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M

volumes:
  mongodb_data_prod:
  mongodb_config_prod:
  redis_data_prod:

networks:
  vishwas-prod-network:
    driver: bridge
```

## Deployment Steps

### 1. Deploy Services

```bash
# Navigate to project directory
cd /path/to/vishwas_nf

# Copy production environment file
cp .env.production .env

# Build images for production
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Verify services
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs -f
```

### 2. Initialize Database

```bash
# Create necessary collections and indexes
docker-compose -f docker-compose.prod.yml exec backend npm run initialize
```

### 3. Health Verification

```bash
# Check all services
docker-compose -f docker-compose.prod.yml exec backend curl http://localhost:5000/health
docker-compose -f docker-compose.prod.yml exec frontend curl http://localhost:3000/health
docker-compose -f docker-compose.prod.yml exec face-service curl http://localhost:5002/health
```

## Monitoring & Maintenance

### Real-Time Monitoring

```bash
# Docker stats
docker stats

# Service logs
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f backend
```

### Backup Strategy

```bash
# Create backup script (backup.sh)
#!/bin/bash
BACKUP_DIR="/backups/vishwas"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup MongoDB
docker-compose -f docker-compose.prod.yml exec mongodb mongodump \
  --out=/tmp/backup \
  --username admin \
  --password $MONGO_PASSWORD \
  --authenticationDatabase admin

# Compress backup
docker-compose -f docker-compose.prod.yml exec mongodb \
  tar czf /tmp/backup_$DATE.tar.gz -C /tmp backup

# Copy to host
docker cp vishwas-mongodb-prod:/tmp/backup_$DATE.tar.gz $BACKUP_DIR/

# Cleanup
docker-compose -f docker-compose.prod.yml exec mongodb rm -rf /tmp/backup*

echo "Backup completed: $BACKUP_DIR/backup_$DATE.tar.gz"

# Restore backup
docker-compose -f docker-compose.prod.yml exec mongodb \
  tar xzf /tmp/backup_$DATE.tar.gz -C /tmp

docker-compose -f docker-compose.prod.yml exec mongodb \
  mongorestore --database vishwas /tmp/backup/vishwas \
  --username admin --password $MONGO_PASSWORD --authenticationDatabase admin
```

### Schedule Backups (Cron)

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /path/to/backup.sh >> /var/log/vishwas_backup.log 2>&1

# Add weekly backup at 3 AM on Sunday
0 3 * * 0 /path/to/backup.sh >> /var/log/vishwas_backup.log 2>&1
```

### Log Rotation

Create `/etc/logrotate.d/vishwas`:

```
/var/log/vishwas*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 root root
    sharedscripts
    postrotate
        docker-compose -f /path/to/docker-compose.prod.yml restart backend
    endscript
}
```

## Updates & Upgrades

### Update Base Images

```bash
# Pull latest images
docker pull mongo:6.0
docker pull redis:7-alpine
docker pull node:18-alpine
docker pull python:3.11-slim
docker pull nginx:alpine

# Rebuild and redeploy
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
```

### Zero-Downtime Updates

```bash
# Using rolling updates with multiple instances
# Create separate compose files for canary deployment

# Stop and backup existing data
docker-compose -f docker-compose.prod.yml exec mongodb mongodump --out=/tmp/backup

# Update and restart one service at a time
docker-compose -f docker-compose.prod.yml up -d --no-deps --build backend
docker-compose -f docker-compose.prod.yml up -d --no-deps --build frontend
```

## Security Hardening

### Network Security

```bash
# Firewall configuration (UFW)
sudo ufw enable
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp  # Remove after SSL setup
```

### Container Security

```yaml
# Add to docker-compose.prod.yml
services:
  backend:
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp
      - /run
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE
```

### Data Security

```bash
# Enable encryption at rest for MongoDB volumes
# Add encryption credentials to docker-compose.prod.yml

# Use secrets management
docker secret create jwt_secret .env.production
docker secret create mongo_password mongo_password.txt
```

## Performance Optimization

### Database Indexing

```bash
docker-compose -f docker-compose.prod.yml exec mongodb mongosh

# Create indexes
db.users.createIndex({ citizenId: 1 })
db.users.createIndex({ email: 1 })
db.cases.createIndex({ caseNumber: 1 })
db.cases.createIndex({ status: 1 })
db.approvalWorkflows.createIndex({ status: 1 })
```

### Caching Strategy

```yaml
# Enable Redis caching in backend environment
REDIS_HOST: redis
REDIS_CACHE_TTL: 3600  # 1 hour
CACHE_STRATEGY: aggressive
```

### nginx Caching

Add to nginx.conf:

```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=cache:10m;
proxy_cache_valid 200 1d;
proxy_cache_valid 404 10m;
```

## Disaster Recovery

### Automated Backup

```bash
#!/bin/bash
# backup-to-s3.sh - Upload backups to AWS S3

BACKUP_DIR="/backups/vishwas"
S3_BUCKET="s3://vishwas-backups"

# Create backup
/path/to/backup.sh

# Upload to S3
aws s3 sync $BACKUP_DIR $S3_BUCKET --delete

# Keep only last 30 days
find $BACKUP_DIR -mtime +30 -delete
```

### Restore from Backup

```bash
# Download from S3
aws s3 cp s3://vishwas-backups/backup_YYYYMMDD_HHMMSS.tar.gz .

# Stop services
docker-compose -f docker-compose.prod.yml down

# Restore database
docker-compose -f docker-compose.prod.yml up -d mongodb
sleep 10
docker cp backup_YYYYMMDD_HHMMSS.tar.gz vishwas-mongodb-prod:/tmp/
docker-compose -f docker-compose.prod.yml exec mongodb \
  tar xzf /tmp/backup_YYYYMMDD_HHMMSS.tar.gz -C /tmp

# Restore to MongoDB
docker-compose -f docker-compose.prod.yml exec mongodb \
  mongorestore --database vishwas /tmp/backup/vishwas \
  --username admin --password $MONGO_PASSWORD --authenticationDatabase admin

# Start all services
docker-compose -f docker-compose.prod.yml up -d
```

## Troubleshooting Production Issues

### High Memory Usage

```bash
# Check container memory
docker stats vishwas-backend-prod

# Adjust memory limits in docker-compose.prod.yml
deploy:
  resources:
    limits:
      memory: 2G
```

### Database Performance

```bash
# Monitor MongoDB operations
docker-compose -f docker-compose.prod.yml exec mongodb mongosh
db.currentOp()
db.serverStatus()
```

### Out of Disk Space

```bash
# Check disk usage
df -h

# Clean up Docker
docker system prune -a

# Backup and remove old logs
tar czf logs_backup_$(date +%Y%m%d).tar.gz /var/log/vishwas*.log
rm /var/log/vishwas*.log
```

## Support & Documentation

- Check logs: `docker-compose -f docker-compose.prod.yml logs`
- Review configs: `docker-compose -f docker-compose.prod.yml config`
- Health checks: Review container health status
- Metrics: Use `docker stats` for performance monitoring

---

**Production Version**: 1.0  
**Last Updated**: March 2026  
**Maintainer**: DevOps Team

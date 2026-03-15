# Docker & Microservices Architecture for VISHWAS

## Overview

VISHWAS now includes a complete Docker-based microservices architecture for easy deployment, scaling, and management of all components. This document outlines the Docker setup and provides guidance for various deployment scenarios.

## Architecture Components

### Services

1. **Frontend (React)**
   - Container: `vishwas-frontend`
   - Port: `3000`
   - Technology: React + MUI
   - Auto-rebuild on code changes (dev mode)

2. **Backend (Node.js/Express)**
   - Container: `vishwas-backend`
   - Port: `5000`
   - Technology: Node.js + Express
   - MongoDB integration
   - Blockchain transaction recording

3. **Face Recognition Service (Python/Flask)**
   - Container: `vishwas-face-service`
   - Port: `5002`
   - Technology: Python + Flask + OpenCV
   - Facial recognition and identification

4. **MongoDB Database**
   - Container: `vishwas-mongodb`
   - Port: `27017`
   - Persistent data storage
   - Volume: `mongodb_data`

5. **Redis Cache**
   - Container: `vishwas-redis`
   - Port: `6379`
   - Session management
   - Caching layer

6. **Nginx Reverse Proxy**
   - Container: `vishwas-nginx`
   - Ports: `80`, `443`
   - Route management
   - SSL/TLS termination

### Development Tools (Dev Mode)

- **Mongo Express**: MongoDB Admin UI (port 8081)
- **Redis Commander**: Redis Admin UI (port 8082)

## Getting Started

### Prerequisites

```bash
# Check Docker installation
docker --version  # >= 20.10
docker-compose --version  # >= 2.0

# Minimum system requirements
# RAM: 4GB
# Disk: 10GB
# CPU: 2 cores
```

### Quick Start (5 minutes)

```bash
# 1. Navigate to project
cd /path/to/vishwas_nf

# 2. Make scripts executable
chmod +x docker-start.sh docker-manage.sh docker-health-check.sh

# 3. Generate environment file
cp .env.docker .env

# 4. Start all services
./docker-start.sh

# 5. Access application
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
# Face Service: http://localhost:5002
```

## Available Docker Compose Files

### docker-compose.yml (Production Default)

Production-ready configuration with:
- Optimized images
- Resource limits
- Health checks
- Restart policies
- All services

**Usage:**
```bash
docker-compose up -d
```

### docker-compose.dev.yml (Development)

Development configuration with:
- Hot-reload enabled
- Debug logging
- Admin UIs (Mongo Express, Redis Commander)
- Volume mounts for live changes

**Usage:**
```bash
docker-compose -f docker-compose.dev.yml up -d
```

### docker-compose.prod.yml (Advanced Production)

Enterprise production configuration:
- Resource constraints
- Security hardening
- Advanced monitoring
- Database replication ready

**Usage:**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Docker Management Scripts

### docker-start.sh
Quick automatic setup script:
```bash
./docker-start.sh
```
Performs: Check Docker → Build images → Start services → Verify health

### docker-manage.sh
Comprehensive management script with 15+ commands:

```bash
# Service management
./docker-manage.sh start          # Start all services
./docker-manage.sh stop           # Stop all services
./docker-manage.sh restart        # Restart services
./docker-manage.sh status         # View status
./docker-manage.sh health         # Health check

# Logging
./docker-manage.sh logs           # View all logs
./docker-manage.sh logs backend   # Specific service

# Administration
./docker-manage.sh backup         # Backup database
./docker-manage.sh shell backend  # Container shell
./docker-manage.sh clean          # Remove containers
./docker-manage.sh reset          # Complete reset

# Help
./docker-manage.sh help           # Show all commands
```

### docker-health-check.sh
Comprehensive health check:
```bash
./docker-health-check.sh
```
Checks: Prerequisites → Containers → Volumes → Networks → Services → Ports

## Environment Configuration

Create `.env` file from template:

```bash
cp .env.docker .env
```

Key variables:

```env
# Credentials
MONGO_USERNAME=admin
MONGO_PASSWORD=secure_password
JWT_SECRET=your-secret-key

# Service URLs
REACT_APP_API_URL=http://localhost:5000
REACT_APP_FACE_SERVICE_URL=http://localhost:5002

# Logging
LOG_LEVEL=info
NODE_ENV=production
FLASK_ENV=production
```

## Common Operations

### Start Fresh Install

```bash
# Remove all existing data
docker system prune -a -f

# Remove volumes
docker volume prune -f

# Rebuild and start
./docker-manage.sh build
./docker-manage.sh start
```

### View Logs

```bash
# All services
./docker-manage.sh logs

# Specific service with 100 lines
docker-compose logs -f --tail 100 backend

# With timestamps
docker-compose logs -f --timestamps
```

### Access Databases

```bash
# MongoDB
docker-compose exec mongodb mongosh

# MongoDB commands
db.users.find()
db.cases.find()
db.approvalWorkflows.find()

# Redis
docker-compose exec redis redis-cli

# Redis commands
KEYS *
INFO
```

### Backup & Restore

```bash
# Backup
./docker-manage.sh backup

# Manual backup
docker-compose exec mongodb mongodump --out=/tmp/backup
docker-compose exec mongodb tar czf /tmp/backup.tar.gz -C /tmp backup

# Restore
docker cp backup.tar.gz vishwas-mongodb:/tmp/
docker-compose exec mongodb mongorestore --archive=/tmp/backup.tar.gz
```

## Development Workflow

### Working with Frontend

```bash
# Use dev compose with hot reload
docker-compose -f docker-compose.dev.yml up -d frontend

# Edit files in frontend/src/
# Changes auto-reload in browser

# View Mongo Express admin
# http://localhost:8081
```

### Working with Backend

```bash
# Use dev compose with nodemon
docker-compose -f docker-compose.dev.yml up -d backend

# Edit files in backend/
# Service auto-restarts on save

# View logs
docker-compose logs -f backend
```

### Running Tests

```bash
# Backend tests
docker-compose exec backend npm test

# Frontend tests
docker-compose exec frontend npm test

# Run specific test
docker-compose exec backend npm test -- --testPathPattern="approval"
```

## Production Deployment

### Pre-Deployment

1. Update `.env.production` with production credentials
2. Configure SSL certificates in `ssl/` directory
3. Adjust `docker-compose.prod.yml` resource limits
4. Set up automated backups

### Deploy

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Verify health
./docker-health-check.sh

# Check logs
docker-compose -f docker-compose.prod.yml logs
```

### Monitoring

```bash
# Real-time stats
docker stats

# Service status
docker-compose ps

# Health check
./docker-manage.sh health

# Backup schedule (cron)
0 2 * * * cd /path/to/vishwas && ./docker-manage.sh backup
```

## Troubleshooting

### Services Won't Start

```bash
# Check Docker is running
sudo systemctl status docker

# View detailed logs
docker-compose logs

# Rebuild images
docker-compose build --no-cache

# Remove and recreate
docker-compose down -v
docker-compose up -d
```

### Port Conflicts

```bash
# Find process using port
lsof -ti:5000

# Kill process
kill -9 <PID>

# Or change port in docker-compose.yml
# Change "5000:5000" to "5001:5000"
```

### Memory Issues

```bash
# Check Docker memory
docker stats

# Increase Docker memory (Docker Desktop)
# Preferences > Resources > Memory > 8GB+

# Clean up
docker system prune -a
```

### Database Connection Issues

```bash
# Check MongoDB
docker-compose exec mongodb mongosh

# Test connection
docker-compose exec backend \
  node -e "require('mongoose').connect('mongodb://admin:password@mongodb:27017/vishwas')"

# View MongoDB logs
docker-compose logs mongodb
```

## Performance Tips

### Optimize Images

```bash
# Use production build
docker-compose build --progress=plain

# Check image sizes
docker images | grep vishwas

# Optimize by using minimal base images
# node:18-alpine instead of node:18
# python:3.11-slim instead of python:3.11
```

### Enable Caching

```env
# In docker-compose.yml
REDIS_CACHE_ENABLED=true
CACHE_TTL=3600
```

### Monitor Performance

```bash
# CPU/Memory usage
docker stats

# Log analysis
docker-compose logs | grep "ERROR\|WARN"

# Database queries
docker-compose exec mongodb \
  mongosh --eval "db.currentOp()"
```

## Security Best Practices

1. **Change Default Passwords**
   ```bash
   # Update .env with strong passwords
   MONGO_PASSWORD=<strong-random-password>
   JWT_SECRET=<strong-random-secret>
   ```

2. **Enable SSL/TLS**
   ```bash
   # Generate certificates
   openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
     -keyout ssl/key.pem -out ssl/cert.pem
   
   # Uncomment SSL in nginx.conf
   ```

3. **Limit Container Permissions**
   ```yaml
   security_opt:
     - no-new-privileges:true
   cap_drop:
     - ALL
   ```

4. **Use Secrets Management**
   ```bash
   docker secret create jwt_secret .env
   docker secret create mongo_password password.txt
   ```

## Scale Services

### Horizontal Scaling

```yaml
# docker-compose.yml
services:
  backend:
    deploy:
      replicas: 3  # 3 instances
```

### Vertical Scaling

```yaml
# Increase resources
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '4'
          memory: 2G
```

## Kubernetes Support (Optional)

Convert Docker Compose to Kubernetes:

```bash
# Install kompose
curl -L https://github.com/kubernetes/kompose/releases/latest/download/kompose-linux-amd64 -o kompose
chmod +x kompose

# Convert
./kompose convert -f docker-compose.prod.yml -o k8s/

# Deploy
kubectl apply -f k8s/
```

## Documentation Files

- `DOCKER_SETUP_GUIDE.md` - Complete Docker setup guide
- `DOCKER_PRODUCTION_GUIDE.md` - Production deployment guide
- `DOCKER_QUICK_REFERENCE.md` - Command reference
- `docker-compose.yml` - Production configuration
- `docker-compose.dev.yml` - Development configuration
- `docker-compose.prod.yml` - Advanced production configuration

## Support & Resources

- Docker Documentation: https://docs.docker.com
- Docker Compose: https://docs.docker.com/compose
- Best Practices: https://docs.docker.com/develop/dev-best-practices
- Troubleshooting: See DOCKER_SETUP_GUIDE.md

---

**Docker Version**: 1.0  
**Last Updated**: March 2026  
**Status**: Production Ready ✓

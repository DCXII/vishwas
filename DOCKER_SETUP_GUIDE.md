# VISHWAS Docker Setup Guide

## Overview

This guide explains how to run VISHWAS using Docker and Docker Compose. Docker containerization ensures consistency, easy deployment, and simplified management of all services.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Nginx Reverse Proxy                     │
│                   (Port 80, 443)                             │
└──────────────────────────┬──────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
   ┌────────┐         ┌────────┐       ┌──────────┐
   │Frontend│         │Backend │       │Face Svc  │
   │React   │         │Node.js │       │Python    │
   │:3000   │         │:5000   │       │:5002     │
   └────────┘         └────────┘       └──────────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
   ┌────────┐         ┌────────┐       ┌──────────┐
   │MongoDB │         │Redis   │       │Volumes   │
   │:27017  │         │:6379   │       │(Data)    │
   └────────┘         └────────┘       └──────────┘
```

## Prerequisites

- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 2.0 or higher
- **System Requirements**:
  - RAM: At least 4GB available
  - Disk Space: At least 10GB available
  - CPU: Dual-core minimum

### Install Docker

**On Linux:**
```bash
sudo apt-get update
sudo apt-get install docker.io docker-compose
sudo usermod -aG docker $USER
```

**On macOS:**
Download Docker Desktop from https://www.docker.com/products/docker-desktop

**On Windows:**
Download Docker Desktop from https://www.docker.com/products/docker-desktop

## Quick Start

### 1. Clone or Navigate to Project

```bash
cd /path/to/vishwas_nf
```

### 2. Make Scripts Executable

```bash
chmod +x docker-start.sh
chmod +x docker-manage.sh
```

### 3. Configure Environment

Copy the example environment file:

```bash
cp .env.docker .env
```

Edit `.env` to customize settings if needed:

```bash
nano .env
```

### 4. Start All Services

**Automatic Setup (Recommended):**
```bash
./docker-start.sh
```

**Manual Setup:**
```bash
docker-compose build
docker-compose up -d
```

### 5. Verify Services

```bash
./docker-manage.sh status
./docker-manage.sh health
```

## Service Management

### Using Management Script

```bash
# View service status
./docker-manage.sh status

# Check health of all services
./docker-manage.sh health

# View logs
./docker-manage.sh logs
./docker-manage.sh logs backend
./docker-manage.sh logs frontend

# Restart services
./docker-manage.sh restart

# Stop services
./docker-manage.sh stop

# Start services
./docker-manage.sh start

# Access container shell
./docker-manage.sh shell backend
./docker-manage.sh shell mongodb

# Backup database
./docker-manage.sh backup

# Clean up resources
./docker-manage.sh clean

# Reset everything
./docker-manage.sh reset
```

### Using Docker Compose Directly

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend

# Restart specific service
docker-compose restart backend

# Execute command in container
docker-compose exec backend npm test

# Remove everything including volumes
docker-compose down -v
```

## Access Services

After startup, services are available at:

| Service | URL | Port |
|---------|-----|------|
| Frontend | http://localhost:3000 | 3000 |
| Backend API | http://localhost:5000 | 5000 |
| Face Service | http://localhost:5002 | 5002 |
| MongoDB | localhost:27017 | 27017 |
| Redis | localhost:6379 | 6379 |
| Nginx (Proxy) | http://localhost:80 | 80 |

## Environment Variables

The `.env.docker` file contains all configuration:

```env
# MongoDB
MONGO_USERNAME=admin
MONGO_PASSWORD=secure_password_change_in_production

# Node.js Backend
NODE_ENV=production
JWT_SECRET=your-secret-key

# Database
MONGODB_URI=mongodb://admin:password@mongodb:27017/vishwas?authSource=admin

# Logging
LOG_LEVEL=info

# Face Service
FLASK_ENV=production
```

## Troubleshooting

### Services Won't Start

```bash
# Check Docker status
sudo systemctl status docker

# View detailed service logs
docker-compose logs

# Rebuild images
docker-compose build --no-cache
```

### Port Already in Use

```bash
# Change port in docker-compose.yml
# For example, change "5000:5000" to "5001:5000"

# Or kill process using the port (Linux/macOS)
lsof -ti:5000 | xargs kill -9
```

### Database Connection Issues

```bash
# Check MongoDB logs
./docker-manage.sh logs mongodb

# Verify MongoDB is running
docker-compose exec mongodb mongosh
```

### Out of Memory

```bash
# Clean up unused Docker resources
docker system prune -a

# Increase Docker memory in settings
# Docker Desktop > Preferences > Resources > Memory
```

### Services Keep Restarting

```bash
# Check health
./docker-manage.sh health

# View specific service logs
docker-compose logs -f <service_name>

# Rebuild and restart
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

## Database Operations

### Access MongoDB

```bash
# Using management script
./docker-manage.sh shell mongodb

# Using Docker directly
docker-compose exec mongodb mongosh

# MongoDB shell commands
> use vishwas
> db.users.find()
> db.cases.find()
```

### Backup Database

```bash
# Using management script
./docker-manage.sh backup

# Or manually
docker-compose exec mongodb mongodump --out=/tmp/backup --username admin --password password --authenticationDatabase admin
```

### Restore Database

```bash
# Copy backup to container
docker cp backup.tar.gz vishwas-mongodb:/tmp/

# Enter container and restore
docker-compose exec mongodb bash
tar xzf /tmp/backup.tar.gz -C /tmp
mongorestore --database vishwas /tmp/backup/vishwas --username admin --password password --authenticationDatabase admin
```

## Performance Optimization

### For Development

```yaml
# Keep in docker-compose.yml for slower machines
services:
  backend:
    environment:
      NODE_ENV: development
    build:
      context: ./backend
      cache_from:
        - backend:latest
```

### For Production

```bash
# Build with optimization flags
docker-compose build --progress=plain

# Run with resource limits
docker-compose up -d --compatibility

# Monitor resource usage
docker stats
```

## Scaling Services

### Increase Worker Processes

Edit `docker-compose.yml`:

```yaml
services:
  backend:
    environment:
      WORKER_THREADS: 4  # Increase from default
```

### Load Balancing

Multiple instances of a service:

```yaml
services:
  backend:
    deploy:
      replicas: 3  # Run 3 instances
      placement:
        max_replicas_per_node: 1
```

## Networking

All services communicate through the `vishwas-network` bridge network. Services can reach each other using their container names:

```
http://backend:5000        # From any container
http://face-service:5002   # From any container
mongodb://mongodb:27017    # From any container
```

## Security Considerations

### Before Going to Production

1. **Change Default Passwords:**
   - Edit `.env` with strong passwords
   - Update `MONGO_PASSWORD`, `JWT_SECRET`

2. **Enable SSL/TLS:**
   - Generate certificates
   - Uncomment SSL section in `nginx.conf`
   - Map port 443 in `docker-compose.yml`

3. **Security Updates:**
   - Regularly update base images:
     ```bash
     docker pull node:18-alpine
     docker pull python:3.11-slim
     docker pull mongo:6.0
     ```

4. **Network Security:**
   - Don't expose MongoDB/Redis directly
   - Use environment secrets management
   - Implement API rate limiting

## Monitoring

### View Logs in Real-Time

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend -n 50  # Last 50 lines

# With timestamps
docker-compose logs -f --timestamps
```

### Monitor Resource Usage

```bash
# Docker stats
docker stats

# Per-container
docker stats vishwas-backend
```

### Health Checks

```bash
./docker-manage.sh health
```

## Development Workflow

### Working on Backend

```bash
# Rebuild backend image
docker-compose build backend

# Restart backend service
docker-compose restart backend

# View changes in real-time
docker-compose logs -f backend
```

### Working on Frontend

```bash
# Rebuild frontend image
docker-compose build frontend

# Restart frontend service
docker-compose restart frontend

# Frontend hot reload is automatic
```

### Running Tests

```bash
# Backend tests
docker-compose exec backend npm test

# Frontend tests
docker-compose exec frontend npm test
```

## Cleanup

### Remove Stopped Containers

```bash
docker container prune
```

### Remove Unused Images

```bash
docker image prune
```

### Remove Unused Volumes

```bash
docker volume prune
```

### Complete Reset

```bash
./docker-manage.sh reset
# or
docker-compose down -v --remove-orphans
docker system prune -a -f
```

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| `port 3000 already in use` | Kill process: `lsof -ti:3000 \| xargs kill -9` |
| `Cannot connect to MongoDB` | Check `.env`, ensure MongoDB is running |
| `Face service not responding` | Check Python requirements installation |
| `Out of memory` | Increase Docker memory or reduce services |
| `Network error` | Ensure services are on same network in compose file |

## Next Steps

1. Access frontend at http://localhost:3000
2. Create user account or login
3. Start using VISHWAS features
4. Monitor logs: `./docker-manage.sh logs`
5. Check health: `./docker-manage.sh health`

## Support

For issues or questions:
- Check logs: `./docker-manage.sh logs`
- Review docker-compose.yml configuration
- Verify environment variables in .env
- Run health checks: `./docker-manage.sh health`

---

**Version**: 1.0  
**Last Updated**: March 2026

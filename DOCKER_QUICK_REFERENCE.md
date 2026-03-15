# VISHWAS Docker Quick Reference

## Quick Start

```bash
# 1. Make scripts executable
chmod +x docker-start.sh docker-manage.sh

# 2. Run startup script
./docker-start.sh

# 3. Access services
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
# Face Service: http://localhost:5002
```

## Development Setup

```bash
# Use development compose file with hot reload
docker-compose -f docker-compose.dev.yml up -d

# Admin UIs
# MongoDB: http://localhost:8081
# Redis: http://localhost:8082
```

## Common Commands

### Start/Stop Services

```bash
# Start all services
./docker-manage.sh start
# or
docker-compose up -d

# Stop all services
./docker-manage.sh stop
# or
docker-compose down

# Restart services
./docker-manage.sh restart
# or
docker-compose restart
```

### Logs & Status

```bash
# View all logs
./docker-manage.sh logs
# or
docker-compose logs -f

# View specific service logs
./docker-manage.sh logs backend
docker-compose logs -f backend

# Service status
./docker-manage.sh status
docker-compose ps

# Health check
./docker-manage.sh health
```

### Database Operations

```bash
# Access MongoDB shell
./docker-manage.sh shell mongodb
# or
docker-compose exec mongodb mongosh

# Access Redis CLI
./docker-manage.sh shell redis
# or
docker-compose exec redis redis-cli

# MongoDB commands
db.users.find()
db.cases.find()
db.approvalWorkflows.find()

# Redis commands
KEYS *
GET <key>
INFO
```

### View Container Shells

```bash
# Backend
./docker-manage.sh shell backend
docker-compose exec backend /bin/bash

# Frontend
./docker-manage.sh shell frontend
docker-compose exec frontend /bin/bash

# Face Service
./docker-manage.sh shell face
docker-compose exec face-service /bin/bash
```

### Rebuild Images

```bash
# Rebuild all images
docker-compose build

# Rebuild specific service
docker-compose build backend

# Rebuild without cache
docker-compose build --no-cache
```

### Database Backup/Restore

```bash
# Backup database
./docker-manage.sh backup

# Manual backup
docker-compose exec mongodb mongodump --out=/tmp/backup

# Restore backup
docker cp backup.tar.gz vishwas-mongodb:/tmp/
docker-compose exec mongodb mongorestore --archive=/tmp/backup.tar.gz
```

### Clean Up

```bash
# Stop and remove containers
./docker-manage.sh clean

# Stop, remove containers, and volumes
docker-compose down -v

# Remove all stopped containers
docker container prune

# Remove unused images
docker image prune

# Remove unused volumes
docker volume prune

# Complete reset
./docker-manage.sh reset
```

## Performance Monitoring

```bash
# Real-time resource usage
docker stats

# Specific container stats
docker stats vishwas-backend

# Container details
docker inspect vishwas-backend

# Network details
docker network inspect vishwas-network
```

## Debugging

```bash
# View container logs
docker logs vishwas-backend

# Stream container logs
docker logs -f vishwas-backend

# Logs with timestamps
docker logs -f --timestamps vishwas-backend

# Last 100 lines
docker logs --tail 100 -f vishwas-backend
```

## Service Port Mappings

| Service | Container Port | Host Port | URL |
|---------|---|---|---|
| Frontend | 3000 | 3000 | http://localhost:3000 |
| Backend | 5000 | 5000 | http://localhost:5000 |
| Face Service | 5002 | 5002 | http://localhost:5002 |
| MongoDB | 27017 | 27017 | localhost:27017 |
| Redis | 6379 | 6379 | localhost:6379 |
| Mongo Express | 8081 | 8081 | http://localhost:8081 |
| Redis Commander | 8081 | 8082 | http://localhost:8082 |

## Environment Variables

Create `.env` file:

```bash
# Credentials
MONGO_USERNAME=admin
MONGO_PASSWORD=password
JWT_SECRET=your-secret-key

# Service URLs
REACT_APP_API_URL=http://localhost:5000
REACT_APP_FACE_SERVICE_URL=http://localhost:5002

# Logging
LOG_LEVEL=info
```

## Useful Compose Commands

```bash
# Show service configuration
docker-compose config

# Validate compose file
docker-compose config --quiet

# Pull latest images
docker-compose pull

# Execute command in service
docker-compose exec backend npm test

# Create and start containers
docker-compose create

# Start containers
docker-compose start

# Stop containers
docker-compose stop

# Remove containers
docker-compose rm -f

# Build images
docker-compose build

# Push images to registry
docker-compose push
```

## Network Commands

```bash
# List networks
docker network ls

# Inspect network
docker network inspect vishwas-network

# Connect container to network
docker network connect vishwas-network container_name

# Disconnect container from network
docker network disconnect vishwas-network container_name
```

## Volume Commands

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect vishwas_mongodb_data

# Remove volume
docker volume rm vishwas_mongodb_data

# Backup volume
docker run --rm -v vishwas_mongodb_data:/data -v $(pwd):/backup \
  ubuntu tar czf /backup/volume_backup.tar.gz -C /data .

# Restore volume
docker run --rm -v vishwas_mongodb_data:/data -v $(pwd):/backup \
  ubuntu tar xzf /backup/volume_backup.tar.gz -C /data
```

## Docker Image Commands

```bash
# List images
docker images

# Remove image
docker rmi image_id

# Tag image
docker tag source_image:tag destination_image:tag

# Push to registry
docker push registry.example.com/image:tag

# Pull from registry
docker pull registry.example.com/image:tag
```

## Compose Override Configuration

Create `docker-compose.override.yml` for local development overrides:

```yaml
version: '3.8'

services:
  backend:
    environment:
      LOG_LEVEL: debug
      NODE_ENV: development
    ports:
      - "5000:5000"
      - "9229:9229"  # Node debugger

  frontend:
    environment:
      REACT_APP_DEBUG: true
```

## Multi-Stage Build Example

To optimize container sizes, use multi-stage builds in Dockerfile:

```dockerfile
# Build stage
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/build ./build
EXPOSE 3000
CMD ["npm", "start"]
```

## Docker Secrets (for production)

```bash
# Create secret
echo "secret-value" | docker secret create secret_name -

# Use in compose:
secrets:
  jwt_secret:
    external: true

# Reference in service
environment:
  JWT_SECRET_FILE: /run/secrets/jwt_secret
```

## Troubleshooting Quick Fixes

```bash
# Service won't start - check logs
docker-compose logs backend

# Port already in use - kill process
lsof -ti:5000 | xargs kill -9

# Network issues - inspect network
docker network inspect vishwas-network

# Out of memory - prune unused
docker system prune -a

# Volume permission issues - fix permissions
docker exec vishwas-backend chmod -R 755 /app/uploads

# Database connection - test connection
docker-compose exec backend curl mongodb://admin:password@mongodb:27017

# SSL certificate issues - check certificate
openssl x509 -in /path/to/cert.pem -text -noout
```

## Production Deployment Commands

```bash
# Use production compose file
docker-compose -f docker-compose.prod.yml up -d

# Check production logs
docker-compose -f docker-compose.prod.yml logs -f

# Backup production database
docker-compose -f docker-compose.prod.yml exec mongodb \
  mongodump --out=/tmp/backup

# Scale service (docker swarm)
docker service scale backend=3

# Update service (docker swarm)
docker service update --image new-image:tag backend
```

## References

- Docker Docs: https://docs.docker.com
- Docker Compose Docs: https://docs.docker.com/compose
- Docker Best Practices: https://docs.docker.com/develop/dev-best-practices
- Multi-container Apps: https://docs.docker.com/samples

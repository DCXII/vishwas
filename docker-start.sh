#!/bin/bash

# VISHWAS Docker Quick Start Script

echo "========================================"
echo "VISHWAS Docker Setup & Startup"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check Docker
echo "Checking Docker installation..."
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker is not installed${NC}"
    echo "Please install Docker from https://www.docker.com/products/docker-desktop"
    exit 1
fi
echo -e "${GREEN}✓ Docker found${NC}"

# Check Docker Compose
echo "Checking Docker Compose installation..."
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Docker Compose is not installed${NC}"
    echo "Please install Docker Compose from https://docs.docker.com/compose/install/"
    exit 1
fi
echo -e "${GREEN}✓ Docker Compose found${NC}"

# Check Docker daemon
echo "Checking Docker daemon..."
if ! docker info &> /dev/null; then
    echo -e "${RED}Docker daemon is not running${NC}"
    echo "Please start Docker"
    exit 1
fi
echo -e "${GREEN}✓ Docker daemon is running${NC}"

echo ""
echo "Building Docker images..."
echo "(This may take a few minutes on first run)"
echo ""

# Build images
docker-compose build

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to build Docker images${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✓ Images built successfully${NC}"
echo ""

echo "Starting VISHWAS services..."
echo "(This may take a minute for all services to be healthy)"
echo ""

# Start services
docker-compose up -d

if [ $? -ne 0 ]; then
    echo -e "${RED}Failed to start services${NC}"
    exit 1
fi

# Wait for services to start
echo "Waiting for services to be healthy..."
sleep 10

# Check services
echo ""
echo "Checking service health..."
echo ""

# Frontend
if curl -s http://localhost:3000/health > /dev/null; then
    echo -e "${GREEN}✓ Frontend${NC}"
else
    echo -e "${YELLOW}⚠ Frontend (starting up...)${NC}"
fi

# Backend
if curl -s http://localhost:5000/ > /dev/null; then
    echo -e "${GREEN}✓ Backend${NC}"
else
    echo -e "${YELLOW}⚠ Backend (starting up...)${NC}"
fi

# Face Service
if curl -s http://localhost:5002/health > /dev/null; then
    echo -e "${GREEN}✓ Face Service${NC}"
else
    echo -e "${YELLOW}⚠ Face Service (starting up...)${NC}"
fi

# MongoDB
if docker-compose exec -T mongodb mongosh --eval "db.adminCommand('ping')" &> /dev/null; then
    echo -e "${GREEN}✓ MongoDB${NC}"
else
    echo -e "${YELLOW}⚠ MongoDB (starting up...)${NC}"
fi

# Redis
if docker-compose exec -T redis redis-cli ping &> /dev/null; then
    echo -e "${GREEN}✓ Redis${NC}"
else
    echo -e "${YELLOW}⚠ Redis (starting up...)${NC}"
fi

echo ""
echo "========================================"
echo -e "${GREEN}VISHWAS is running!${NC}"
echo "========================================"
echo ""
echo "Access the application at:"
echo -e "${GREEN}Frontend: http://localhost:3000${NC}"
echo -e "${GREEN}Backend API: http://localhost:5000${NC}"
echo -e "${GREEN}Face Service: http://localhost:5002${NC}"
echo ""
echo "Database access:"
echo -e "${GREEN}MongoDB: localhost:27017${NC}"
echo -e "${GREEN}Redis: localhost:6379${NC}"
echo ""
echo "Useful commands:"
echo "  ./docker-manage.sh status         # View service status"
echo "  ./docker-manage.sh logs backend   # View backend logs"
echo "  ./docker-manage.sh health         # Check all services health"
echo "  ./docker-manage.sh stop           # Stop all services"
echo "  ./docker-manage.sh restart        # Restart all services"
echo ""
echo "View all commands:"
echo "  ./docker-manage.sh help"
echo ""

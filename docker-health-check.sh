#!/bin/bash

# VISHWAS Docker Health Check Script

echo "========================================"
echo "VISHWAS Docker Health Check"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

FAILED=0
WARNINGS=0

check_service() {
    local name=$1
    local url=$2
    local container=$3
    
    echo -n "Checking $name... "
    
    if curl -s "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ OK${NC}"
    else
        echo -e "${RED}✗ FAILED${NC}"
        echo "  → URL: $url"
        if [ -n "$container" ]; then
            docker logs --tail 20 "$container" | head -5
        fi
        FAILED=$((FAILED + 1))
    fi
}

check_container() {
    local container=$1
    
    echo -n "Checking container $container... "
    
    STATUS=$(docker inspect "$container" --format='{{.State.Status}}' 2>/dev/null)
    
    if [ "$STATUS" = "running" ]; then
        echo -e "${GREEN}✓ Running${NC}"
    elif [ "$STATUS" = "exited" ]; then
        echo -e "${RED}✗ Exited${NC}"
        FAILED=$((FAILED + 1))
    else
        echo -e "${YELLOW}⚠ $STATUS${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
}

check_volume() {
    local volume=$1
    
    echo -n "Checking volume $volume... "
    
    if docker volume inspect "$volume" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ OK${NC}"
    else
        echo -e "${RED}✗ Not found${NC}"
        FAILED=$((FAILED + 1))
    fi
}

check_network() {
    local network=$1
    
    echo -n "Checking network $network... "
    
    if docker network inspect "$network" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ OK${NC}"
    else
        echo -e "${RED}✗ Not found${NC}"
        FAILED=$((FAILED + 1))
    fi
}

check_port() {
    local port=$1
    local service=$2
    
    echo -n "Checking port $port ($service)... "
    
    if nc -z localhost $port 2>/dev/null || (echo > /dev/tcp/localhost/$port) 2>/dev/null; then
        echo -e "${GREEN}✓ OK${NC}"
    else
        echo -e "${YELLOW}⚠ Not responding${NC}"
        WARNINGS=$((WARNINGS + 1))
    fi
}

check_command() {
    local cmd=$1
    local name=$2
    
    echo -n "Checking $name... "
    
    if command -v $cmd &> /dev/null; then
        VERSION=$($cmd --version 2>&1 | head -1)
        echo -e "${GREEN}✓ OK${NC}"
        echo "  → $VERSION"
    else
        echo -e "${RED}✗ Not found${NC}"
        FAILED=$((FAILED + 1))
    fi
}

# Check prerequisites
echo -e "${BLUE}=== System Requirements ===${NC}"
check_command "docker" "Docker"
# Check Docker Compose (v2 plugin or v1 standalone)
echo -n "Checking Docker Compose... "
if docker compose version &> /dev/null; then
    DC="docker compose"
    VERSION=$(docker compose version 2>&1 | head -1)
    echo -e "${GREEN}✓ OK${NC}"
    echo "  → $VERSION"
elif command -v docker-compose &> /dev/null; then
    DC="docker-compose"
    VERSION=$(docker-compose --version 2>&1 | head -1)
    echo -e "${GREEN}✓ OK${NC}"
    echo "  → $VERSION"
else
    echo -e "${RED}✗ Not found${NC}"
    DC=""
    FAILED=$((FAILED + 1))
fi
echo ""

# Check Docker daemon
echo -n "Checking Docker daemon... "
if docker info > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Running${NC}"
else
    echo -e "${RED}✗ Not running${NC}"
    FAILED=$((FAILED + 1))
fi
echo ""

# Check containers
echo -e "${BLUE}=== Container Status ===${NC}"
check_container "vishwas-mongodb"
check_container "vishwas-redis"
check_container "vishwas-backend"
check_container "vishwas-frontend"
check_container "vishwas-face-service"
echo ""

# Check volumes
echo -e "${BLUE}=== Volume Status ===${NC}"
check_volume "vishwas_nf_mongodb_data"
check_volume "vishwas_nf_redis_data"
echo ""

# Check network
echo -e "${BLUE}=== Network Status ===${NC}"
check_network "vishwas_nf_vishwas-network"
echo ""

# Check services health
echo -e "${BLUE}=== Service Health ===${NC}"
check_service "Frontend" "http://localhost:3000" "vishwas-frontend"
check_service "Backend" "http://localhost:5000" "vishwas-backend"
check_service "Face Service" "http://localhost:5002" "vishwas-face-service"
echo ""

# Check ports
echo -e "${BLUE}=== Port Availability ===${NC}"
check_port "3000" "Frontend"
check_port "5000" "Backend"
check_port "5002" "Face Service"
check_port "27017" "MongoDB"
check_port "6379" "Redis"
echo ""

# Check database connectivity
echo -n "Checking MongoDB connectivity... "
if docker exec vishwas-mongodb mongosh --eval "db.adminCommand('ping')" &> /dev/null; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${YELLOW}⚠ Not responding${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

echo -n "Checking Redis connectivity... "
if docker exec vishwas-redis redis-cli ping &> /dev/null; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${YELLOW}⚠ Not responding${NC}"
    WARNINGS=$((WARNINGS + 1))
fi
echo ""

# Check disk space
echo -e "${BLUE}=== Disk Space ===${NC}"
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
echo "Disk usage: $DISK_USAGE%"
if [ "$DISK_USAGE" -gt 90 ]; then
    echo -e "${RED}✗ Warning: Disk nearly full${NC}"
    WARNINGS=$((WARNINGS + 1))
elif [ "$DISK_USAGE" -lt 90 ]; then
    echo -e "${GREEN}✓ OK${NC}"
fi
echo ""

# Check memory
echo -e "${BLUE}=== Memory Usage ===${NC}"
docker stats --no-stream --format "table {{.Container}}\t{{.MemUsage}}" | tail -6
echo ""

# Summary
echo "========================================"
if [ $FAILED -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}All checks passed!${NC}"
    EXIT_CODE=0
elif [ $FAILED -eq 0 ]; then
    echo -e "${YELLOW}$WARNINGS warning(s) found${NC}"
    EXIT_CODE=1
else
    echo -e "${RED}$FAILED error(s) and $WARNINGS warning(s) found${NC}"
    EXIT_CODE=2
fi
echo "========================================"

# Recommendations
if [ $FAILED -gt 0 ] || [ $WARNINGS -gt 0 ]; then
    echo ""
    echo -e "${BLUE}Recommendations:${NC}"
    if [ $FAILED -gt 0 ]; then
        echo "  1. Start services: ./docker-start.sh"
        echo "  2. Check logs: ./docker-manage.sh logs"
        echo "  3. Restart services: ./docker-manage.sh restart"
    fi
    if [ $WARNINGS -gt 0 ]; then
        echo "  1. Monitor resources: docker stats"
        echo "  2. Check disk space: df -h"
        echo "  3. View detailed logs: ./docker-manage.sh logs"
    fi
fi

exit $EXIT_CODE

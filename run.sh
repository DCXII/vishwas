#!/bin/bash

# VISHWAS Project Startup Script - v5 (Docker-based)
# Runs all services via Docker Compose: Backend, Frontend, Face Detection, MongoDB, Redis, Nginx

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# --- Functions ---
print_status() {
    echo -e "${BLUE}▶${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}


# --- Check Prerequisites ---
print_status "Checking prerequisites..."

if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Detect Docker Compose command (v2 plugin or v1 standalone)
if docker compose version &> /dev/null; then
    DC="docker compose"
elif command -v docker-compose &> /dev/null; then
    DC="docker-compose"
else
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

print_success "Docker and Docker Compose found"

# --- Check Docker Daemon ---
if ! docker ps &> /dev/null; then
    print_error "Docker daemon is not responding. Make sure Docker Desktop is running."
    exit 1
fi

# --- Kill Previous Containers ---
print_status "Stopping any existing VISHWAS containers..."
$DC down --remove-orphans 2>/dev/null || true

# --- Detect Docker Installation Type ---
DOCKER_VER=$(docker info 2>/dev/null | grep "Docker Root Dir")
if echo "$DOCKER_VER" | grep -q "snap"; then
    print_warning "⚠ Docker Snap Detected - Known DNS Issues with Docker Hub"
    print_warning ""
    print_warning "Docker Snap has persistent DNS issues that prevent pulling images."
    print_warning "VISHWAS requires the official Docker version to work properly."
    print_warning ""
    print_warning "QUICK FIX (2 commands):"
    print_warning ""
    print_warning "  1. sudo snap remove docker --purge"
    print_warning "  2. curl -fsSL https://get.docker.com | sudo sh"
    print_warning "  3. sudo usermod -aG docker \$USER && newgrp docker"
    print_warning ""
    print_warning "Then run: ./run.sh"
    print_warning ""
    print_warning "Full guide: cat DOCKER_SNAP_FIX.md"
    print_warning ""
    exit 1
fi

# --- Setup ---
print_status "Setting up VISHWAS system..."

# Make sure scripts are executable
chmod +x "$PROJECT_DIR/docker-start.sh" "$PROJECT_DIR/docker-manage.sh" "$PROJECT_DIR/docker-health-check.sh" 2>/dev/null || true

# Copy environment file if it doesn't exist
if [ ! -f "$PROJECT_DIR/.env" ]; then
    print_status "Creating .env file from template..."
    cp "$PROJECT_DIR/.env.docker" "$PROJECT_DIR/.env"
    print_success "Environment file created"
fi

# --- Pre-download Images (Workaround for DNS issues) ---
print_status "Preparing to start services..."
echo ""

cd "$PROJECT_DIR"

# Start services with docker-compose (uses pull_policy: if_not_present to avoid DNS issues)
print_status "Starting Docker services..."
if $DC up -d; then
    print_success "Docker services started successfully"
else
    print_error "Failed to start Docker services"
    print_error "This may be due to Docker DNS issues (common with snap docker)"
    print_error ""
    print_error "If you're using Docker snap, switch to official Docker:"
    print_error "  sudo snap remove docker --purge"
    print_error "  curl -fsSL https://get.docker.com -o get-docker.sh && sudo sh get-docker.sh"
    exit 1
fi

# --- Verification ---
print_status "Verifying services are running..."
sleep 5

# Check if all containers are running
EXPECTED_CONTAINERS=("vishwas-frontend" "vishwas-backend" "vishwas-face-service" "vishwas-mongodb" "vishwas-redis" "vishwas-nginx")
ALL_RUNNING=true

for container in "${EXPECTED_CONTAINERS[@]}"; do
    if docker ps | grep -q "$container"; then
        print_success "$container is running"
    else
        print_warning "$container is not running yet"
        ALL_RUNNING=false
    fi
done

# --- Wait for Services to be Ready ---
print_status "Waiting for services to become healthy..."
ATTEMPTS=0
MAX_ATTEMPTS=30

while [ $ATTEMPTS -lt $MAX_ATTEMPTS ]; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        print_success "Frontend is responsive"
        break
    fi
    ATTEMPTS=$((ATTEMPTS + 1))
    sleep 2
done

# --- Display Summary ---
echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}--- VISHWAS SYSTEM IS READY ---${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo -e "${BLUE}Application URLs:${NC}"
echo "  Frontend:      ${GREEN}http://localhost:3000${NC}"
echo "  Backend API:   ${GREEN}http://localhost:5000${NC}"
echo "  Face Service:  ${GREEN}http://localhost:5002${NC}"
echo ""
echo -e "${BLUE}Admin Interfaces:${NC}"
echo "  Mongo Express: ${GREEN}http://localhost:8081${NC} (dev mode)"
echo "  Redis Commander: ${GREEN}http://localhost:8082${NC} (dev mode)"
echo ""
echo -e "${BLUE}Docker Services:${NC}"
$DC ps
echo ""
echo -e "${BLUE}Useful Commands:${NC}"
echo "  View logs:           $DC logs -f"
echo "  View logs (backend): $DC logs -f backend"
echo "  Stop services:       $DC down"
echo "  Restart services:    $DC restart"
echo "  Full management:     ./docker-manage.sh help"
echo ""
echo -e "${GREEN}=========================================${NC}"
echo ""

# Optional: Show health check results
if command -v ./docker-health-check.sh &> /dev/null; then
    print_status "Running health check..."
    echo ""
    ./docker-health-check.sh
fi
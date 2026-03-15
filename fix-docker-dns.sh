#!/bin/bash

# VISHWAS Docker DNS Troubleshooting Script
# Fixes common Docker registry/DNS connectivity issues

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

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

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}Docker DNS Troubleshooting & Fix${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# --- 1. Check Docker Daemon Status ---
print_status "Step 1: Checking Docker daemon..."

if command -v systemctl &> /dev/null; then
    if systemctl is-active --quiet docker; then
        print_success "Docker daemon is running (systemd)"
    else
        print_warning "Docker daemon is not running. Attempting to start..."
        sudo systemctl start docker 2>/dev/null && print_success "Docker started" || print_warning "Could not start Docker via systemctl"
    fi
elif docker ps &> /dev/null; then
    print_success "Docker daemon is running"
else
    print_warning "Docker daemon might not be responding"
fi

echo ""

# --- 2. Test DNS Resolution ---
print_status "Step 2: Testing DNS resolution..."

if nslookup registry-1.docker.io 8.8.8.8 &> /dev/null; then
    print_success "DNS resolution works (external)"
else
    print_error "DNS resolution failed"
fi

if nslookup registry-1.docker.io &> /dev/null; then
    print_success "DNS resolution works (system)"
else
    print_warning "System DNS resolution failed"
fi

echo ""

# --- 3. Test Docker Registry Connectivity ---
print_status "Step 3: Testing Docker registry connectivity..."

if timeout 5 docker pull registry-1.docker.io/library/ubuntu:latest &> /dev/null; then
    print_success "Can reach Docker registry"
else
    print_warning "Cannot reach Docker registry - this might be the issue"
fi

echo ""

# --- 4. List Common Fixes ---
print_status "Step 4: Common fixes for Docker DNS issues..."
echo ""

echo "Option 1: Restart Docker daemon"
echo "  ${YELLOW}sudo systemctl restart docker${NC}"
echo ""

echo "Option 2: Configure Docker DNS (Linux)"
echo "  ${YELLOW}sudo mkdir -p /etc/docker${NC}"
echo "  ${YELLOW}sudo cat > /etc/docker/daemon.json << 'EOF'${NC}"
echo "  ${YELLOW}{${NC}"
echo "  ${YELLOW}  \"dns\": [\"8.8.8.8\", \"8.8.4.4\", \"1.1.1.1\"]${NC}"
echo "  ${YELLOW}}${NC}"
echo "  ${YELLOW}EOF${NC}"
echo "  ${YELLOW}sudo systemctl restart docker${NC}"
echo ""

echo "Option 3: Restart Docker Desktop (macOS/Windows)"
echo "  ${YELLOW}Click Docker Desktop icon → Restart${NC}"
echo ""

echo "Option 4: Check Network"
echo "  ${YELLOW}ping 8.8.8.8${NC}"
echo "  ${YELLOW}ping registry-1.docker.io${NC}"
echo ""

echo "Option 5: Use Docker Mirror (if primary registry is down)"
echo "  ${YELLOW}Edit docker-compose.yml and change image URIs${NC}"
echo "  ${YELLOW}From: mongo:6.0${NC}"
echo "  ${YELLOW}To:   docker.io/library/mongo:6.0${NC}"
echo ""

# --- 5. Verify Fix ---
print_status "Step 5: Verifying the fix..."
echo ""

if docker run --rm alpine wget -q -O- https://registry.hub.docker.com 2>/dev/null; then
    print_success "Docker registry connection is working!"
    echo ""
    print_success "You can now try running: ./run.sh"
else
    print_warning "Docker registry connection still not working"
    echo ""
    print_error "If the issue persists:"
    print_error "1. Check your internet connection"
    print_error "2. Check firewall/proxy settings"
    print_error "3. Restart your computer"
    print_error "4. Try using a different DNS server (1.1.1.1, 8.8.8.8)"
fi

echo ""
echo -e "${BLUE}============================================${NC}"

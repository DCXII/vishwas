#!/bin/bash

# VISHWAS Docker Management Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    print_success "Docker is installed"
}

# Check if Docker Compose is installed
check_docker_compose() {
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    print_success "Docker Compose is installed"
}

# Build images
build() {
    print_header "Building Docker Images"
    docker-compose build --no-cache
    print_success "All images built successfully"
}

# Start services
start() {
    print_header "Starting VISHWAS Services"
    docker-compose up -d
    print_success "Services started"
    echo ""
    print_header "Service Status"
    docker-compose ps
    echo ""
    print_warning "Waiting for services to be healthy..."
    sleep 5
    print_success "All services are running"
    echo ""
    echo -e "${BLUE}Access the application at:${NC}"
    echo -e "${GREEN}Frontend: http://localhost:3000${NC}"
    echo -e "${GREEN}Backend API: http://localhost:5000${NC}"
    echo -e "${GREEN}Face Service: http://localhost:5002${NC}"
    echo -e "${GREEN}MongoDB: localhost:27017${NC}"
    echo -e "${GREEN}Redis: localhost:6379${NC}"
}

# Stop services
stop() {
    print_header "Stopping VISHWAS Services"
    docker-compose down
    print_success "Services stopped"
}

# Restart services
restart() {
    print_header "Restarting VISHWAS Services"
    docker-compose restart
    print_success "Services restarted"
    echo ""
    print_header "Service Status"
    docker-compose ps
}

# View logs
logs() {
    print_header "VISHWAS Service Logs"
    if [ -z "$1" ]; then
        docker-compose logs -f
    else
        docker-compose logs -f "$1"
    fi
}

# View specific service logs
logs_service() {
    case "$1" in
        backend)
            docker-compose logs -f backend
            ;;
        frontend)
            docker-compose logs -f frontend
            ;;
        face)
            docker-compose logs -f face-service
            ;;
        mongodb)
            docker-compose logs -f mongodb
            ;;
        redis)
            docker-compose logs -f redis
            ;;
        nginx)
            docker-compose logs -f nginx
            ;;
        *)
            print_error "Unknown service: $1"
            echo "Available services: backend, frontend, face, mongodb, redis, nginx"
            ;;
    esac
}

# View service status
status() {
    print_header "VISHWAS Service Status"
    docker-compose ps
}

# Clean up
clean() {
    print_header "Cleaning up Docker Resources"
    print_warning "This will remove all containers and volumes"
    read -p "Are you sure? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose down -v
        print_success "Cleanup completed"
    else
        print_warning "Cleanup cancelled"
    fi
}

# Health check
health() {
    print_header "Health Check"
    echo ""
    
    echo -e "${BLUE}Frontend:${NC}"
    curl -s http://localhost:3000/health > /dev/null && print_success "Frontend is healthy" || print_error "Frontend is not responding"
    
    echo ""
    echo -e "${BLUE}Backend:${NC}"
    curl -s http://localhost:5000/ > /dev/null && print_success "Backend is healthy" || print_error "Backend is not responding"
    
    echo ""
    echo -e "${BLUE}Face Service:${NC}"
    curl -s http://localhost:5002/health > /dev/null && print_success "Face Service is healthy" || print_error "Face Service is not responding"
    
    echo ""
    echo -e "${BLUE}MongoDB:${NC}"
    docker-compose exec -T mongodb mongosh --eval "db.adminCommand('ping')" &> /dev/null && print_success "MongoDB is healthy" || print_error "MongoDB is not responding"
    
    echo ""
    echo -e "${BLUE}Redis:${NC}"
    docker-compose exec -T redis redis-cli ping &> /dev/null && print_success "Redis is healthy" || print_error "Redis is not responding"
}

# Backup database
backup() {
    print_header "Backing up MongoDB Database"
    BACKUP_DIR="./backups"
    mkdir -p "$BACKUP_DIR"
    BACKUP_FILE="$BACKUP_DIR/vishwas_backup_$(date +%Y%m%d_%H%M%S).tar.gz"
    
    docker-compose exec -T mongodb mongodump --out=/tmp/backup --username admin --password "${MONGO_PASSWORD:-password}" --authenticationDatabase admin
    docker-compose exec -T mongodb tar czf /tmp/backup.tar.gz -C /tmp backup
    docker cp vishwas-mongodb:/tmp/backup.tar.gz "$BACKUP_FILE"
    docker-compose exec -T mongodb rm -rf /tmp/backup /tmp/backup.tar.gz
    
    print_success "Database backed up to: $BACKUP_FILE"
}

# Shell access to service
shell() {
    if [ -z "$1" ]; then
        print_error "Service name required"
        echo "Usage: $0 shell <service>"
        echo "Available services: backend, frontend, face, mongodb, redis"
        exit 1
    fi
    
    print_header "Entering $1 container shell"
    docker-compose exec "$1" /bin/bash || docker-compose exec "$1" /bin/sh
}

# Reset everything
reset() {
    print_header "Resetting VISHWAS System"
    print_warning "This will remove all containers, volumes, and images"
    read -p "Are you sure? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker-compose down -v --remove-orphans
        docker system prune -f
        print_success "System reset completed"
    else
        print_warning "Reset cancelled"
    fi
}

# Display help
help() {
    echo "VISHWAS Docker Management Script"
    echo ""
    echo "Usage: $0 <command> [options]"
    echo ""
    echo "Commands:"
    echo "  check          Check Docker and Docker Compose installation"
    echo "  build          Build all Docker images"
    echo "  start          Start all services"
    echo "  stop           Stop all services"
    echo "  restart        Restart all services"
    echo "  status         View service status"
    echo "  logs [service] View service logs (optional: specify service)"
    echo "  health         Check health of all services"
    echo "  backup         Backup MongoDB database"
    echo "  shell <svc>    Enter container shell (backend, frontend, face, mongodb, redis)"
    echo "  clean          Remove all containers and volumes"
    echo "  reset          Reset everything (containers, volumes, images)"
    echo "  help           Display this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start                # Start all services"
    echo "  $0 logs backend         # View backend logs"
    echo "  $0 health               # Check health of all services"
    echo "  $0 shell mongodb        # Enter MongoDB container"
}

# Main script
main() {
    if [ $# -eq 0 ]; then
        help
        exit 0
    fi

    case "$1" in
        check)
            check_docker
            check_docker_compose
            ;;
        build)
            check_docker
            check_docker_compose
            build
            ;;
        start)
            check_docker
            check_docker_compose
            start
            ;;
        stop)
            check_docker
            check_docker_compose
            stop
            ;;
        restart)
            check_docker
            check_docker_compose
            restart
            ;;
        status)
            check_docker
            check_docker_compose
            status
            ;;
        logs)
            check_docker
            check_docker_compose
            logs_service "$2"
            ;;
        health)
            health
            ;;
        backup)
            check_docker
            check_docker_compose
            backup
            ;;
        shell)
            check_docker
            check_docker_compose
            shell "$2"
            ;;
        clean)
            check_docker
            check_docker_compose
            clean
            ;;
        reset)
            check_docker
            check_docker_compose
            reset
            ;;
        help|--help|-h)
            help
            ;;
        *)
            print_error "Unknown command: $1"
            help
            exit 1
            ;;
    esac
}

# Run main function
main "$@"

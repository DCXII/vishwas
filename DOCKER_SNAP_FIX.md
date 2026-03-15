# Docker Snap Issue - Permanent Solution

## Problem

You're running Docker from Snap, which has a **known, unfixable DNS issue** that prevents downloading images from Docker Hub.

```
Error: dial tcp: lookup registry-1.docker.io on [::1]:53: connection refused
```

This error is **not** fixable by configuration changes. Docker Snap has architectural limitations that cause DNS lookups to fail.

---

## Solution: Switch to Official Docker

### Step 1: Remove Docker Snap

```bash
sudo snap remove docker --purge
```

This completely removes the snap version and its data.

### Step 2: Install Official Docker

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

This installs the official Docker from Docker's repository. Much more reliable.

### Step 3: Setup Permissions  

```bash
# Add your user to docker group (so you don't need sudo every time)
sudo usermod -aG docker $USER

# Apply group membership without logging out  
newgrp docker

# Verify it works
docker ps
```

### Step 4: Start VISHWAS

```bash
cd ~/vishwas_nf
./run.sh
```

---

## Why Docker Snap Fails

Docker Snap uses confined sandboxing that:
- Has isolated network namespaces
- Cannot properly access system DNS configuration
- Forces DNS to use IPv6 localhost (::1:53) instead of real DNS servers
- This cannot be fixed with daemon.json or environment variables

**Solution**: Use the deb/rpm package from Docker's official repository instead.

---

## Verification

After switching to official Docker, verify:

```bash
# Should show: Docker.io (not snap)
which docker

# Should work without errors
docker run --rm hello-world

# VISHWAS should start smoothly
~/vishwas_nf/run.sh
```

---

## Quick Commands (Copy & Paste)

```bash
# Remove snap docker
sudo snap remove docker --purge

# Install official docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Setup permissions
sudo usermod -aG docker $USER
newgrp docker

# Start VISHWAS
cd ~/vishwas_nf
./run.sh
```

---

## After Installation Checklist

- [ ] Docker snap removed: `snap list | grep docker` (should be empty)
- [ ] Official Docker installed: `which docker` (should show /usr/bin/docker)
- [ ] User in docker group: `groups $USER` (should include docker)
- [ ] No sudo needed: `docker ps` (works without sudo)
- [ ] Registry accessible: `docker pull hello-world` (succeeds)
- [ ] VISHWAS starts: `./run.sh` (starts all services)
- [ ] Access app: Open http://localhost:3000 in browser

---

## Still Having Issues?

After switching to official Docker:

```bash
# Restart Docker daemon
sudo systemctl restart docker  

# Check Docker info
docker info

# Try pulling an image
docker pull alpine:latest

# Run VISHWAS startup
./run.sh
```

---

## Why This Happened

You likely installed Docker using `snap install docker`, which is convenient but has limitations. The official Docker package (installed via `get-docker.sh` or package managers) is the recommended install method.

---

## Resources

- Docker Official Docs: https://docs.docker.com/engine/install/
- Install Instructions: https://get.docker.com/
- Docker Post-install Guide: https://docs.docker.com/engine/install/linux-postinstall/

---

**TL;DR**: 
```bash
sudo snap remove docker --purge && \
curl -fsSL https://get.docker.com | sudo sh && \
sudo usermod -aG docker $USER
```

Then restart your terminal and run `./run.sh`.

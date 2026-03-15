# Docker DNS Configuration Issue - Fix Guide

## Problem
```
Error response from daemon: Get "https://registry-1.docker.io/v2/": 
dial tcp: lookup registry-1.docker.io on [::1]:53: 
read udp [::1]:55286->[::1]:53: read: connection refused
```

This error means Docker's internal DNS resolver is trying to use localhost (127.0.0.1 or [::1]) and failing. This typically happens when:
- Docker desktop's DNS service crashes
- DNS configuration is misconfigured
- Docker daemon is not properly initialized

---

## Solutions (Try in Order)

### Solution 1: Restart Docker Daemon (Quickest)

**Linux (Systemd):**
```bash
sudo systemctl restart docker
```

**macOS/Windows:** 
Click Docker Desktop icon in taskbar → Restart

Then try:
```bash
./run.sh
```

---

### Solution 2: Reset Docker Desktop Configuration

**macOS/Windows:**
1. Open Docker Desktop Settings
2. Go to **Troubleshoot** tab
3. Click **Clean / Purge data** or **Reset**
4. Wait for Docker to restart
5. Try: `./run.sh`

---

### Solution 3: Configure Docker Daemon DNS (Linux)

Create/edit `/etc/docker/daemon.json`:

```bash
sudo mkdir -p /etc/docker

sudo tee /etc/docker/daemon.json > /dev/null << 'EOF'
{
  "dns": ["8.8.8.8", "8.8.4.4", "1.1.1.1"],
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
EOF

sudo systemctl restart docker
```

Then try:
```bash
./run.sh
```

---

### Solution 4: Check System DNS

Test if your system DNS is working:

```bash
nslookup registry-1.docker.io 8.8.8.8
ping 8.8.8.8
```

If both fail, check:
- Internet connection
- Firewall/proxy settings
- Router/ISP DNS

---

### Solution 5: Use Alternative Registry

If Docker Hub is temporarily down, use mirror:

Edit `docker-compose.yml` and change image references:
```yaml
# FROM:
image: mongo:6.0

# TO:
image: docker.io/library/mongo:6.0
```

Or use a mirror:
```yaml
image: registry.aliyuncs.com/library/mongo:6.0
image: gcr.io/distroless/base  # Google registry
```

---

## Automated Fix Script

We've provided `fix-docker-dns.sh` with diagnostics:

```bash
chmod +x fix-docker-dns.sh
./fix-docker-dns.sh
```

This script will:
- Check Docker daemon status
- Test DNS resolution
- Test registry connectivity
- Suggest appropriate fixes

---

## Quick Diagnostic Checklist

```bash
# 1. Check Docker is running
docker ps

# 2. Check Docker info
docker info | grep -i dns

# 3. Test system DNS
nslookup google.com
nslookup registry-1.docker.io

# 4. Test Docker network
docker run --rm alpine ping -c 1 8.8.8.8
```

If step 4 fails, Docker cannot reach external networks.

---

## Advanced Debugging

### View Docker daemon logs

**Linux:**
```bash
sudo journalctl -u docker -n 50
```

**macOS:**
```bash
log stream --predicate 'process == "Docker"' --level debug
```

### Check Docker daemon configuration
```bash
docker info | grep -A 10 "Name Servers"
```

### Force DNS flush
```bash
docker run --rm alpine rc-service dnsmasq restart
```

---

## If Nothing Works

1. **Uninstall and reinstall Docker:**
   - macOS: `brew uninstall docker && brew install docker-desktop`
   - Linux: `sudo apt remove docker.io && sudo apt install docker.io`
   - Windows: Uninstall Docker Desktop and download fresh from docker.com

2. **Check firewall:**
   - Ensure port 53 (DNS) is not blocked
   - Ensure port 443 (for registry) is not blocked

3. **Network reset:**
   ```bash
   # Windows (run as admin)
   ipconfig /flushdns
   
   # macOS
   sudo dscacheutil -flushcache
   
   # Linux
   sudo systemctl restart systemd-resolved
   ```

4. **Contact:**
   - Check Docker status: https://www.docker.com/status
   - Check registry status: https://status.docker.com
   - Post issue: https://github.com/moby/moby/issues

---

## Prevention

After fixing, prevent recurrence:

1. **Keep Docker updated:** Check for latest version
2. **Monitor Docker health:**
   ```bash
   docker stats
   docker system df
   ```
3. **Periodic restart:** Restart Docker monthly
4. **Backup compose files:** Keep docker-compose.yml backed up

---

## Related Issues

This error can also occur with:
- Corporate proxies (configure via Docker Desktop settings)
- VPNs (disable temporarily to test)
- Unusual network configurations
- Docker Desktop/Engine version mismatches

---

**Next Step:** 
Try Solution 1 first (restart Docker), then try `./run.sh` again.

If you keep hitting this error, run: `./fix-docker-dns.sh` for detailed diagnostics.

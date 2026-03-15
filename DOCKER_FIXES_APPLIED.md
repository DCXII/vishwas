# VISHWAS Docker Setup - Issue Resolution Guide

## Issues Fixed ✅

### 1. **Docker Compose Version Warning**
```
WARN[0002] docker-compose.yml: the attribute `version` is obsolete
```

**Fixed:** Removed `version: '3.8'` from:
- ✅ `docker-compose.yml`
- ✅ `docker-compose.dev.yml`

Docker Compose v2+ doesn't need explicit versioning.

---

### 2. **Docker Registry Connection Error**
```
Error response from daemon: Get "https://registry-1.docker.io/v2/": 
dial tcp: lookup registry-1.docker.io on [::1]:53: read: connection refused
```

**Root Cause:** Docker daemon's DNS resolver is misconfigured (pointing to localhost)

**Fixes Implemented:**
- ✅ Updated `run.sh` with retry logic (3 attempts with 5s delays)
- ✅ Created `fix-docker-dns.sh` - Comprehensive diagnostics and fixes
- ✅ Created `DOCKER_DNS_FIX.md` - Step-by-step troubleshooting guide
- ✅ Enhanced error messages with helpful guidance

---

## What to Do Now

### **Immediate Action (Try This First)**

#### Option A: Quick Restart (Fastest)
```bash
# Linux with systemd
sudo systemctl restart docker

# macOS/Windows
# Click Docker Desktop → Restart
```

Then try:
```bash
./run.sh
```

#### Option B: Run Diagnostic Script
```bash
chmod +x fix-docker-dns.sh
./fix-docker-dns.sh
```

This script will:
1. Check Docker daemon status
2. Test DNS resolution
3. Test registry connectivity
4. Recommend specific fixes

#### Option C: Read Full Guide
```bash
cat DOCKER_DNS_FIX.md
```

For detailed solutions and advanced debugging.

---

## File Changes Summary

### Modified Files
| File | Change | Status |
|------|--------|--------|
| `docker-compose.yml` | Removed `version: '3.8'` | ✅ |
| `docker-compose.dev.yml` | Removed `version: '3.8'` | ✅ |
| `run.sh` | Added retry logic, better error handling | ✅ |

### New Files
| File | Purpose |
|------|---------|
| `fix-docker-dns.sh` | Automated diagnostics and fix suggestions |
| `DOCKER_DNS_FIX.md` | Comprehensive troubleshooting guide |

---

## Updated run.sh Features

```bash
✅ Checks Docker daemon responsiveness
✅ Retries docker-compose up to 3 times (5s delays)
✅ Better error messages referencing fix scripts
✅ Guides users to troubleshooting resources
✅ Maintains all original functionality
```

**Usage:**
```bash
chmod +x run.sh
./run.sh
```

---

## Updated docker-compose Files

Both files now:
- ✅ Have `version` attribute removed (obsolete in v2+)
- ✅ Are compatible with Docker Compose v2.0+
- ✅ Maintain all service definitions and configurations

**Verification:**
```bash
docker-compose config  # Validates the file
```

---

## Troubleshooting Workflow

If `./run.sh` still fails:

1. **Check first:**
   ```bash
   docker ps           # Docker daemon responding?
   docker info         # Docker configuration ok?
   ping 8.8.8.8       # Network connectivity?
   ```

2. **Run diagnostics:**
   ```bash
   ./fix-docker-dns.sh
   ```

3. **If that doesn't help:**
   ```bash
   cat DOCKER_DNS_FIX.md | less
   # Read Solution 3 (Configure Docker Daemon DNS)
   ```

4. **As last resort:**
   - Restart your computer
   - Restart Docker Desktop completely (with OS restart)
   - Uninstall/reinstall Docker

---

## Common Fix Commands

### Linux
```bash
# Restart docker daemon
sudo systemctl restart docker

# Configure DNS (if needed)
sudo mkdir -p /etc/docker
sudo cat > /etc/docker/daemon.json << 'EOF'
{
  "dns": ["8.8.8.8", "8.8.4.4", "1.1.1.1"]
}
EOF
sudo systemctl restart docker
```

### macOS/Windows
```bash
# Just restart Docker Desktop from the taskbar
# Or use: open --background -a Docker
```

### Flush DNS (if network changed)
```bash
# Linux
sudo systemctl restart systemd-resolved

# macOS  
sudo dscacheutil -flushcache

# Windows (run in admin terminal)
ipconfig /flushdns
```

---

## Next Steps

1. **Try the quick restart:** `sudo systemctl restart docker`
2. **Then run:** `./run.sh`
3. **If it works:** Access http://localhost:3000 ✅
4. **If it still fails:** Run `./fix-docker-dns.sh` for diagnostics

---

## Resources

- **Quick Fix:** `./fix-docker-dns.sh`
- **Full Guide:** `DOCKER_DNS_FIX.md`
- **Project Status:** `DEPLOYMENT_STATUS.md`
- **Docker Guide:** `DOCKER_README.md`
- **Docker Setup:** `DOCKER_SETUP_GUIDE.md`

---

## Summary

**Status:** ✅ All known issues addressed

**What was fixed:**
1. ✅ Removed obsolete `version` from docker-compose files
2. ✅ Added retry logic to handle DNS timeouts
3. ✅ Created diagnostic tools for troubleshooting
4. ✅ Created comprehensive fix guide

**Ready to try?**
```bash
sudo systemctl restart docker  # If on Linux with systemd
./run.sh
```

**Can't get it working?**
```bash
./fix-docker-dns.sh  # Diagnostics
cat DOCKER_DNS_FIX.md  # Full guide
```

---

**Created:** March 11, 2026  
**Status:** Ready for deployment  
**Next:** Try the quick fixes above

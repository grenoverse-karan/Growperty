# Backend Deployment Checklist

## 🚀 Pre-Deployment

### **1. Verify Dependencies**
```bash
cd apps/api
npm install
```

**Expected packages:**
- ✅ axios (HTTP client)
- ✅ express (web framework)
- ✅ cors (CORS middleware)
- ✅ helmet (security)
- ✅ morgan (logging)
- ✅ dotenv (environment variables)
- ✅ jsonwebtoken (JWT)
- ✅ bcrypt/bcryptjs (password hashing)

**NOT expected:**
- ❌ pocketbase (removed - using axios instead)

### **2. Verify Environment Variables**

**File:** `apps/api/.env`

```bash
# Required
PORT=3001
CORS_ORIGIN=*
NODE_ENV=production
POCKETBASE_URL=http://127.0.0.1:8090
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# WhatsApp (optional)
WHATSAPP_PHONE_NUMBER_ID=982348154970170
WHATSAPP_TOKEN=EAALr0ZBFF4OwBRMWPS8Azx5gkwZCLO2cSX7cjlnHE88epf46CFU4ZCIBUAwtkTnKRbeGgoreTfTXwD0WbJZCxfiZCXEfcdyyQZCDem5rVrJPI9KOFnjcxcZCoix0pNDOcvNw4RGZAeRIqrt52DAaZAIAyDqGXqQLoTVeCt8qJ0BxIiWGZBA7IG6Ub1j5d9koMO0gZDZD
```

**Checklist:**
- [ ] PORT is set to 3001
- [ ] CORS_ORIGIN is set correctly (use specific domain in production, not *)
- [ ] NODE_ENV is set to 'production'
- [ ] POCKETBASE_URL points to correct PocketBase instance
- [ ] JWT_SECRET is changed from default (use strong random string)
- [ ] WhatsApp credentials are valid (if using WhatsApp features)

### **3. Verify Code Quality**

```bash
# Run linter
npm run lint

# Expected: No errors
```

### **4. Test Server Startup**

```bash
# Start server
npm run dev

# Expected output:
# [INFO] 🚀 API Server running on http://localhost:3001
# [INFO] Server startup completed successfully { port: 3001, env: 'production', timestamp: '...' }

# Server should start in < 1 second
```

### **5. Test Health Endpoint**

```bash
# In another terminal
curl http://localhost:3001/health

# Expected response:
# {"status":"ok"}

# Response time should be < 100ms
```

### **6. Test Properties Endpoint**

```bash
# Verify PocketBase is running first
curl http://localhost:3001/properties

# Expected response:
# {"items":[],"page":1,"perPage":20,"totalItems":0,"totalPages":0}
```

### **7. Test Admin Login**

```bash
# Create admin user in PocketBase first
curl -X POST http://localhost:3001/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password123"}'

# Expected response:
# {"success":true,"token":"eyJhbGc...","admin":{"id":"...","email":"admin@example.com","name":"Admin"}}
```

---

## 🚀 Deployment Steps

### **Option 1: Docker Deployment**

**Create Dockerfile:**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY apps/api/package*.json ./
RUN npm ci --only=production

COPY apps/api/src ./src
COPY apps/api/.env .env

EXPOSE 3001

CMD ["npm", "start"]
```

**Build and run:**
```bash
docker build -t growperty-api .
docker run -p 3001:3001 --env-file apps/api/.env growperty-api
```

### **Option 2: PM2 Deployment**

**Install PM2:**
```bash
npm install -g pm2
```

**Create ecosystem.config.js:**
```javascript
module.exports = {
  apps: [{
    name: 'growperty-api',
    script: './apps/api/src/main.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
```

**Start with PM2:**
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### **Option 3: Systemd Service**

**Create /etc/systemd/system/growperty-api.service:**
```ini
[Unit]
Description=Growperty API Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/growperty/apps/api
Environment="NODE_ENV=production"
Environment="PORT=3001"
ExecStart=/usr/bin/node src/main.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**Enable and start:**
```bash
sudo systemctl daemon-reload
sudo systemctl enable growperty-api
sudo systemctl start growperty-api
sudo systemctl status growperty-api
```

---

## ✅ Post-Deployment Verification

### **1. Server Health Check**
```bash
curl https://your-domain.com/health

# Expected: {"status":"ok"}
```

### **2. Properties Endpoint**
```bash
curl https://your-domain.com/properties

# Expected: {"items":[...],"page":1,...}
```

### **3. Admin Login**
```bash
curl -X POST https://your-domain.com/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'

# Expected: {"success":true,"token":"...","admin":{...}}
```

### **4. Monitor Logs**
```bash
# PM2
pm2 logs growperty-api

# Systemd
sudo journalctl -u growperty-api -f

# Docker
docker logs -f container-id
```

### **5. Check Response Times**
```bash
# Health endpoint should respond in < 100ms
time curl https://your-domain.com/health

# Properties endpoint should respond in < 1 second
time curl https://your-domain.com/properties
```

---

## 🔒 Security Checklist

- [ ] JWT_SECRET is changed from default
- [ ] JWT_SECRET is at least 32 characters long
- [ ] CORS_ORIGIN is set to specific domain (not *)
- [ ] NODE_ENV is set to 'production'
- [ ] All environment variables are set
- [ ] No sensitive data in code (all in .env)
- [ ] HTTPS is enabled (use reverse proxy like nginx)
- [ ] Rate limiting is configured (if needed)
- [ ] CORS headers are correct
- [ ] Helmet security headers are enabled
- [ ] Morgan logging is configured
- [ ] Error messages don't expose sensitive info

---

## 📊 Performance Checklist

- [ ] Server starts in < 1 second
- [ ] Health endpoint responds in < 100ms
- [ ] Properties endpoint responds in < 1 second
- [ ] All requests have 5-second timeout
- [ ] No memory leaks (monitor with PM2)
- [ ] CPU usage is < 50%
- [ ] Memory usage is < 200MB
- [ ] Database queries are optimized
- [ ] No N+1 query problems

---

## 🚨 Monitoring & Alerts

### **Set Up Monitoring**

**PM2 Plus (Recommended):**
```bash
pm2 plus
```

**Custom Health Check:**
```bash
# Add to cron (every 5 minutes)
*/5 * * * * curl -f http://localhost:3001/health || systemctl restart growperty-api
```

**Alert on Errors:**
- Monitor logs for ERROR level messages
- Alert if server restarts unexpectedly
- Alert if response time > 5 seconds
- Alert if error rate > 1%

---

## 🔄 Rollback Plan

If deployment fails:

1. **Stop current version:**
   ```bash
   pm2 stop growperty-api
   # or
   sudo systemctl stop growperty-api
   ```

2. **Revert to previous version:**
   ```bash
   git checkout previous-commit
   npm install
   ```

3. **Start previous version:**
   ```bash
   pm2 start ecosystem.config.js
   # or
   sudo systemctl start growperty-api
   ```

4. **Verify health:**
   ```bash
   curl http://localhost:3001/health
   ```

---

## 📝 Deployment Log Template

```
Deployment Date: YYYY-MM-DD HH:MM:SS
Deployed By: [Name]
Version: [Git Commit Hash]
Environment: [production/staging]

Pre-Deployment Checks:
- [ ] Dependencies installed
- [ ] Environment variables verified
- [ ] Code quality check passed
- [ ] Server startup test passed
- [ ] Health endpoint test passed

Deployment Steps:
- [ ] Pulled latest code
- [ ] Installed dependencies
- [ ] Started server
- [ ] Verified health endpoint
- [ ] Verified properties endpoint
- [ ] Verified admin login

Post-Deployment Verification:
- [ ] Server responding
- [ ] Response times acceptable
- [ ] No errors in logs
- [ ] Database connectivity working
- [ ] WhatsApp integration working (if applicable)

Notes:
[Any issues or observations]
```

---

## 🆘 Troubleshooting

### **Server Won't Start**
```bash
# Check if port 3001 is in use
lsof -i :3001

# Kill process using port
kill -9 <PID>

# Check for syntax errors
node apps/api/src/main.js
```

### **Health Endpoint Returns 503/504**
```bash
# Verify PocketBase is running
curl http://localhost:8090/api/health

# Check POCKETBASE_URL in .env
cat apps/api/.env | grep POCKETBASE_URL

# Verify network connectivity
ping 127.0.0.1
```

### **High Memory Usage**
```bash
# Check for memory leaks
pm2 monit

# Restart server
pm2 restart growperty-api

# Check logs for errors
pm2 logs growperty-api
```

### **Slow Response Times**
```bash
# Check PocketBase performance
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:8090/api/health

# Check network latency
ping pocketbase-server

# Monitor server resources
pm2 monit
```

---

## ✨ Success Criteria

✅ Server starts in < 1 second
✅ Health endpoint responds in < 100ms
✅ All endpoints respond in < 5 seconds
✅ No errors in logs
✅ Database connectivity working
✅ Authentication working
✅ WhatsApp integration working (if applicable)
✅ CORS headers correct
✅ Security headers enabled
✅ Monitoring and alerts configured

**Deployment is successful when all criteria are met!** 🎉
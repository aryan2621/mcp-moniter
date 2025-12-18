# Deploying to Choreo (WSO2)

This guide explains how to deploy the MCP Metrics Server to Choreo using Docker.

## Prerequisites

1. **Choreo Account** - Sign up at [Choreo Console](https://console.choreo.dev/)
2. **GitHub Repository** - Your code must be in a GitHub repository
3. **Environment Variables** - MongoDB and Neon PostgreSQL credentials

## Step 1: Prepare Your Repository

### 1.1 Push Code to GitHub

```bash
cd /Users/rishabhverma/Desktop/mcp-moniter

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: MCP Metrics Server with Docker"

# Add remote (replace with your GitHub repo URL)
git remote add origin https://github.com/YOUR_USERNAME/mcp-moniter.git

# Push to GitHub
git push -u origin main
```

### 1.2 Verify .env is NOT Pushed

**CRITICAL:** Make sure `.env` is in `.gitignore` and NOT pushed to GitHub.

```bash
# Check what will be committed
git status

# If .env shows up, make sure .gitignore is correct
cat .gitignore | grep .env
```

## Step 2: Configure Choreo Deployment

Based on your screenshots, here's the configuration:

### 2.1 Basic Settings

| Field | Value |
|-------|-------|
| **Source** | GitHub |
| **Organization** | `YOUR_GITHUB_USERNAME` |
| **Repository** | `mcp-moniter` |
| **Branch** | `main` |
| **Buildpack** | Docker |

### 2.2 Docker Configuration

| Field | Value | Description |
|-------|-------|-------------|
| **Docker Context** | `web/server` | Path to the directory containing Dockerfile |
| **Dockerfile Path** | `web/server/Dockerfile` | Relative path to Dockerfile from repo root |

**Important:**
- Docker Context should be the directory where your Dockerfile is located
- Dockerfile Path is relative to the repository root

### 2.3 Port Configuration

Your server runs on port **8000** by default. Choreo will map this automatically.

## Step 3: Set Environment Variables in Choreo

After creating the component, configure these environment variables in Choreo:

### Required Variables

```bash
# Database URLs
MONGO_URL=mongodb+srv://your-username:password@cluster.mongodb.net/mcp_metrics
POSTGRES_URL=postgresql://user:password@host.neon.tech/database?sslmode=require

# Security
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters_long

# Server Configuration
PORT=8000
NODE_ENV=production
LOG_LEVEL=info

# Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=900000

# CORS (Update with your Choreo URL after deployment)
FRONTEND_URL=https://your-choreo-app-url.choreoapis.dev
```

### How to Add Environment Variables in Choreo:

1. Go to your component in Choreo Console
2. Navigate to **DevOps** → **Configurations**
3. Click **Environment Variables**
4. Add each variable with key and value
5. Mark sensitive variables (like JWT_SECRET, database URLs) as **Secret**

## Step 4: Deploy

### 4.1 Build & Deploy

1. In Choreo Console, go to your component
2. Click **Build**
3. Wait for the build to complete (Choreo will use your Dockerfile)
4. Once built, click **Deploy**
5. Select environment (Dev/Staging/Prod)
6. Deploy the component

### 4.2 Monitor Deployment

- Check **Build Logs** if build fails
- Check **Runtime Logs** after deployment
- Use **Health** endpoint to verify: `https://your-app.choreoapis.dev/health`

## Step 5: Testing

### Test Endpoints

```bash
# Health Check
curl https://your-app.choreoapis.dev/health

# Server Info
curl https://your-app.choreoapis.dev/

# Test Metrics Endpoint (with authentication)
curl -X POST https://your-app.choreoapis.dev/v1/metrics \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '[{"toolName": "test", "duration": 100}]'
```

## Choreo-Specific Dockerfile Considerations

Your current Dockerfile is already compatible with Choreo. It includes:

✅ **Multi-stage build** - Optimizes image size
✅ **Health check** - Choreo can monitor service health
✅ **Port exposure** - Port 8000 is properly exposed
✅ **Production mode** - NODE_ENV=production is set
✅ **Bun runtime** - Fast startup and execution

## Troubleshooting

### Build Fails

**Problem:** Docker build fails in Choreo

**Solutions:**
1. Check build logs in Choreo Console
2. Verify Dockerfile path is correct: `web/server/Dockerfile`
3. Verify Docker context is correct: `web/server`
4. Ensure all dependencies in `package.json` are accessible

### Application Won't Start

**Problem:** Build succeeds but application fails to start

**Solutions:**
1. Check runtime logs in Choreo
2. Verify all environment variables are set
3. Test database connections (MongoDB & PostgreSQL)
4. Ensure port 8000 is not hardcoded (use PORT env variable)

### Database Connection Issues

**Problem:** Can't connect to MongoDB or PostgreSQL

**Solutions:**
1. **MongoDB Atlas:**
   - Add Choreo's IP ranges to Atlas whitelist
   - Or use `0.0.0.0/0` (allow from anywhere) - less secure but works

2. **Neon PostgreSQL:**
   - Ensure connection pooler is enabled
   - Use the pooled connection string
   - Verify SSL mode is set: `sslmode=require`

3. **Connection String Format:**
   ```bash
   # MongoDB
   mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority

   # Neon
   postgresql://username:password@host.neon.tech/database?sslmode=require
   ```

### Health Check Failing

**Problem:** Choreo shows service as unhealthy

**Solutions:**
1. Check if `/health` endpoint responds:
   ```bash
   curl https://your-app.choreoapis.dev/health
   ```
2. Verify health check in Dockerfile is correct
3. Check if application is listening on correct port (8000)

### CORS Issues

**Problem:** Frontend can't connect due to CORS

**Solution:**
Update `FRONTEND_URL` environment variable in Choreo with your actual frontend URL.

## Security Best Practices

1. ✅ **Never commit .env files** - Use Choreo's environment variables
2. ✅ **Mark secrets as sensitive** - In Choreo environment configuration
3. ✅ **Use strong JWT secrets** - Minimum 32 characters
4. ✅ **Restrict database access** - IP whitelist in MongoDB/Neon
5. ✅ **Enable SSL** - Use HTTPS endpoints only
6. ✅ **Rate limiting** - Already configured in your server

## Monitoring & Logs

### View Logs
1. Choreo Console → Your Component → **Logs**
2. Filter by time range
3. Search for errors

### Metrics
- CPU usage
- Memory usage
- Request count
- Response times

### Alerts
Set up alerts in Choreo for:
- High error rates
- High response times
- Service down

## Scaling

Choreo automatically handles:
- **Horizontal scaling** - Multiple replicas
- **Load balancing** - Traffic distribution
- **Auto-scaling** - Based on traffic

To configure:
1. Go to **DevOps** → **Scaling**
2. Set min/max replicas
3. Configure CPU/Memory thresholds

## CI/CD

Choreo automatically deploys when you push to GitHub:

1. **Automatic Builds:** Push to main → Choreo builds automatically
2. **Manual Deploy:** Approve deployment to production
3. **Rollback:** Revert to previous version if needed

## Custom Domain (Optional)

1. Go to **DevOps** → **Domain Mapping**
2. Add your custom domain (e.g., `api.yourdomain.com`)
3. Configure DNS CNAME record
4. Choreo handles SSL certificate automatically

## Cost Considerations

Choreo pricing is based on:
- **Compute resources** (CPU/Memory)
- **Request count**
- **Data transfer**

Check [Choreo Pricing](https://wso2.com/choreo/pricing/) for details.

## Support

- **Choreo Documentation:** https://wso2.com/choreo/docs/
- **Choreo Discord:** Community support
- **GitHub Issues:** Report bugs in your repo

## Quick Reference

```yaml
# Choreo Configuration Summary
Source: GitHub
Repository: mcp-moniter
Branch: main
Buildpack: Docker
Docker Context: web/server
Dockerfile: web/server/Dockerfile
Port: 8000
Health Endpoint: /health
```

## Next Steps After Deployment

1. ✅ Update your MCP SDK clients with new Choreo URL
2. ✅ Test all endpoints
3. ✅ Set up monitoring alerts
4. ✅ Configure custom domain (optional)
5. ✅ Set up staging environment
6. ✅ Enable auto-scaling if needed

---

**Ready to deploy?** Follow the steps above and your MCP Metrics Server will be live on Choreo! 🚀

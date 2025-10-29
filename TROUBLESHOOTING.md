# Troubleshooting Guide for Vercel Serverless Functions

## Common Issues and Solutions

### 1. FUNCTION_INVOCATION_FAILED

**Symptom**: API returns 500 errors, no request logs visible

**Common Causes**:
- Module import path issues
- Missing environment variables
- Runtime errors during initialization
- Database connection timeouts

**Debugging Steps**:

1. Check Vercel logs:
   ```bash
   vercel logs [deployment-url]
   ```

2. Look for specific error messages:
   - `MODULE_NOT_FOUND` → Path issue
   - `Connection timeout` → Database/network issue
   - `Cannot find module` → Missing dependency
   - `Cannot read property 'x'` → Null check issue

3. Verify environment variables in Vercel dashboard:
   - Go to Project Settings → Environment Variables
   - Ensure all required vars are set for production
   - Check for typos: `DB_USERNAME` vs `DB_USER_NAME`

4. Test locally with Vercel CLI:
   ```bash
   npm install -g vercel
   vercel dev
   ```

### 2. Module Path Issues

**The Problem**: 
Your import paths need to be relative to the **compiled output**, not source.

**Before** (wrong):
```typescript
const { getApp } = require('../dist/src/main.vercel');
```

**After** (correct):
```typescript
const { getApp } = require('../src/main.vercel');
```

**Why**: The `api/index.js` file is already in the `dist/api/` directory, so going up one level (`../`) gets you to `dist/`, then into `src/` for the NestJS code.

### 3. Environment Variable Issues

**Symptom**: Services fail to initialize but app starts

**Best Practice**: Don't throw errors in constructors when env vars are missing:

```typescript
// ❌ BAD: Crashes app if env var missing
constructor() {
  if (!process.env.GOOGLE_CLIENT_ID) {
    throw new Error('Missing env var'); // Crashes entire app
  }
}

// ✅ GOOD: Graceful failure, lazy initialization
constructor() {
  if (!process.env.GOOGLE_CLIENT_ID) {
    console.warn('Google OAuth not configured');
    // Delay initialization to first use
  }
}
```

### 4. Database Connection Issues

**Serverless Considerations**:
- Connection pools must be small (`max: 2`)
- Connection timeouts should be short (`connectionTimeoutMillis: 5000`)
- Handle connection failures gracefully
- Use connection pooling libraries that support serverless

**Pattern**:
```typescript
async onModuleInit() {
  try {
    this.pool = new Pool({
      max: 2, // Critical for serverless
      connectionTimeoutMillis: 5000,
      // ... other config
    });
    await this.pool.query('SELECT NOW()');
  } catch (error) {
    if (process.env.VERCEL) {
      console.warn('Continuing without DB connection');
      // Don't throw in serverless
    } else {
      throw error; // Do throw in local dev
    }
  }
}
```

### 5. Testing Your Fix

**Before Deploying**:
```bash
# 1. Build the project
npm run build

# 2. Verify the path in compiled output
cat dist/api/index.js

# 3. Test locally
vercel dev

# 4. Check API endpoint
curl http://localhost:3000/api
```

**What to Look For**:
- `handler` function exports correctly
- `require('../src/main.vercel')` path exists
- No syntax errors in compiled code

### 6. Runtime Debugging

**Add Detailed Logging**:
```typescript
export default async function handler(req, res) {
  try {
    console.log('Handler invoked for:', req.url);
    const { getApp } = require('../src/main.vercel');
    console.log('getApp loaded successfully');
    
    const app = await getApp();
    console.log('NestJS app initialized');
    
    // ... rest of handler
  } catch (err) {
    console.error('Handler error:', {
      message: err.message,
      stack: err.stack,
      code: err.code
    });
    res.status(500).json({ error: err.message });
  }
}
```

### 7. Common Vercel-Specific Issues

**Cold Start Delays**:
- First request might take 2-5 seconds
- This is normal for serverless
- Consider warming endpoints if needed

**Memory Issues**:
- Default memory is 1GB
- Upgrade to 3GB if needed (Project Settings → Functions)
- Check logs for "out of memory" errors

**Timeout Issues**:
- Default timeout is 10 seconds (Hobby) or 60 seconds (Pro)
- Upgrading plan increases timeout limits

## Quick Checklist

Before deploying to Vercel:

- [ ] `npm run build` succeeds without errors
- [ ] All environment variables are set in Vercel dashboard
- [ ] `api/index.ts` uses correct relative paths (no `../dist/` prefix)
- [ ] Services handle missing configuration gracefully
- [ ] Database connection has timeout and limited pool size
- [ ] Error handling includes proper logging
- [ ] Test locally with `vercel dev`

## Getting Help

If you're still stuck:

1. Share the relevant Vercel log output
2. Show your `api/index.ts` content
3. Include your `vercel.json` configuration
4. Mention what environment variables you're using (without values)


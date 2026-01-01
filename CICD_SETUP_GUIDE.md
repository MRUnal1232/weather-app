# 🚀 CI/CD Setup Guide

This guide explains how to set up automatic deployment for your Weather App.

---

## 📁 What Files Were Created

| File | Purpose |
|------|---------|
| `.github/workflows/ci.yml` | **CI Pipeline** - Checks code quality on every push |
| `.github/workflows/deploy-backend.yml` | **CD Pipeline** - Deploys backend to Render |
| `vercel.json` | **Vercel Config** - Deploys frontend automatically |
| `render.yaml` | **Render Config** - Configures backend deployment |
| `backend/.eslintrc.json` | **ESLint Rules** - Code quality settings |

---

## 🎨 Step 1: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New Project"**
3. Select your `weather-app` repository
4. Vercel will auto-detect the `vercel.json` config
5. Click **Deploy**

✅ Your frontend will be live at `https://your-app.vercel.app`

---

## 🔧 Step 2: Deploy Backend to Render

1. Go to [render.com](https://render.com) and sign in with GitHub
2. Click **"New +"** → **"Web Service"**
3. Connect your `weather-app` repository
4. Configure:
   - **Name**: `weather-app-backend`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add Environment Variable:
   - **Key**: `OPENWEATHER_API_KEY`
   - **Value**: Your API key
6. Click **Create Web Service**

✅ Your backend will be live at `https://weather-app-backend.onrender.com`

---

## 🔗 Step 3: Connect Frontend to Backend

After deploying, update `frontend/script.js`:

```javascript
// Change this line:
const apiBaseUrl = "http://localhost:3000/api";

// To your Render URL:
const apiBaseUrl = "https://weather-app-backend.onrender.com/api";
```

---

## 🔄 How CI/CD Works (Simple Explanation)

```
You Push Code → GitHub Actions Runs → Checks Code Quality → Deploys Automatically
     ↓                  ↓                     ↓                      ↓
  git push       Runs ESLint           No errors?           App goes live!
```

### What Happens When You Push:
1. **CI Pipeline** runs ESLint to check your code
2. **Vercel** automatically deploys the frontend
3. **Render** automatically deploys the backend (if configured)

---

## 🔐 Optional: Auto-Deploy Backend

To auto-deploy backend on push:
1. In Render Dashboard, go to your service
2. Copy the **Deploy Hook URL**
3. In GitHub → Settings → Secrets → New Secret:
   - **Name**: `RENDER_DEPLOY_HOOK`
   - **Value**: The deploy hook URL
4. Now backend deploys automatically on push!

---

## ✅ You're Done!

Your CI/CD pipeline is set up. Every time you push code:
- ✅ Code is checked for errors (ESLint)
- ✅ Frontend deploys to Vercel
- ✅ Backend deploys to Render

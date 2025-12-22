# GitHub Upload Guide for SkyCast Weather Dashboard

## 📋 Prerequisites
- Git installed on your computer ✅ (Already done!)
- GitHub account (create one at https://github.com if you don't have)

## 🚀 Steps to Upload to GitHub

### Step 1: Create a New Repository on GitHub
1. Go to https://github.com
2. Click the **"+"** icon in the top right corner
3. Select **"New repository"**
4. Fill in the details:
   - **Repository name**: `Weather_App` (or your preferred name)
   - **Description**: "A modern weather dashboard with real-time forecasts"
   - **Visibility**: Choose Public or Private
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
5. Click **"Create repository"**

### Step 2: Connect Your Local Repository to GitHub

After creating the repository, GitHub will show you commands. Use these:

```bash
# Add the remote repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/Weather_App.git

# Rename the branch to main (if needed)
git branch -M main

# Push your code to GitHub
git push -u origin main
```

### Step 3: Run These Commands

Open your terminal in the Weather_App directory and run:

```bash
# 1. Add GitHub as remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/Weather_App.git

# 2. Rename branch to main
git branch -M main

# 3. Push to GitHub
git push -u origin main
```

### Step 4: Enable GitHub Pages (Optional - for live demo)

1. Go to your repository on GitHub
2. Click **"Settings"** tab
3. Scroll down to **"Pages"** in the left sidebar
4. Under **"Source"**, select **"main"** branch
5. Click **"Save"**
6. Your site will be live at: `https://YOUR_USERNAME.github.io/Weather_App/`

## 🔐 Important: Secure Your API Key

We have set up a backend to secure your API key. Here is how it works:

1. **API Key in .env**: Your key is stored in the `.env` file.
2. **Backend Proxy**: The frontend calls your local server (`http://localhost:3000`), which then calls OpenWeatherMap using the key from `.env`.
3. **Git Ignore**: The `.env` file is in `.gitignore`, so it will **never** be uploaded to GitHub.

### When pushing to GitHub:
- Your API key remains safe on your computer.
- Other people who clone your repo will need to create their own `.env` file with their own key.

### Future Updates
When you make changes to your code:

```bash
# 1. Check what changed
git status

# 2. Add all changes
git add .

# 3. Commit with a message
git commit -m "Description of your changes"

# 4. Push to GitHub
git push
```

## ✅ What's Already Done

- ✅ Git repository initialized
- ✅ All files added to Git
- ✅ Initial commit created
- ✅ README.md created
- ✅ .gitignore created
- ✅ LICENSE file created

## 🎯 Next Steps

1. Create repository on GitHub
2. Run the commands from Step 3
3. Refresh your GitHub repository page
4. Your code will be live on GitHub! 🎉

## 📞 Need Help?

If you encounter any issues:
- Check that Git is installed: `git --version`
- Make sure you're in the correct directory
- Verify your GitHub username is correct in the commands
- Check your internet connection

---

Good luck! 🚀

# Qinyu Blog Development Guide

## 🐛 Issues Identified and Fixed

### Issue 1: Homepage doesn't show all posts from Notion
**Root Cause:** Backend API was not properly processing all posts from Notion
**Fix Applied:**
- Enhanced error handling in `notionService.js`
- Added better logging to track post processing
- Improved fallback handling for missing properties

### Issue 2: Post page cannot load
**Root Causes:**
- Frontend was configured to use production Vercel URL instead of local backend
- Missing error handling for failed post fetches
**Fix Applied:**
- Updated frontend API configuration to auto-detect development vs production
- Enhanced error handling and loading states
- Added better debugging logs

### Issue 3: Images from Notion not showing
**Root Cause:** Notion-to-Markdown converter wasn't properly handling image blocks
**Fix Applied:**
- Added custom image transformer in `notionService.js`
- Enhanced markdown parsing in frontend with proper image rendering
- Improved HTML generation from markdown content

## 🚀 How to Run the Project

### Method 1: Using the Development Script (Recommended)
```bash
# Make the script executable
chmod +x start-dev.sh

# Run both backend and frontend
./start-dev.sh
```

### Method 2: Manual Setup
```bash
# Terminal 1 - Backend
cd blog-backend
npm start

# Terminal 2 - Frontend  
cd tech-blog
npm run dev
```

## 🔧 Environment Configuration

### Backend (.env in blog-backend/)
```env
NOTION_API_KEY=your_notion_api_key
NOTION_DATABASE_ID=your_database_id
PORT=5000
NODE_ENV=development
CACHE_TTL=3600
CLIENT_ORIGIN=https://www.qinyu.blog
```

### Frontend (Auto-configured)
- Development: Automatically uses `http://localhost:5000`
- Production: Uses environment variable or falls back to localhost

## 🧪 Testing and Debugging

### Test Notion API Connection
```bash
cd blog-backend
node debug-notion.js
```

### Test API Endpoints
```bash
node debug-api.js
```

### Manual API Testing
```bash
# Health check
curl http://localhost:5000/health

# Get all posts
curl http://localhost:5000/api/blog/posts

# Get categories
curl http://localhost:5000/api/blog/categories
```

## 📋 Notion Database Setup

Your Notion database should have these properties:
- **Title** (Title) - Post title
- **Published** (Checkbox) - Must be checked for posts to appear
- **Category** (Select) - Post category (expression, experiment, experience)
- **Date** (Date) - Publication date
- **Featured** (Checkbox) - Whether post is featured on homepage
- **Excerpt** (Rich Text) - Post excerpt/summary
- **Read Time** (Number) - Estimated reading time in minutes

## 🎯 Expected Results After Fixes

1. **Homepage:** All published posts from Notion will appear
2. **Post Pages:** Individual posts will load correctly with proper formatting
3. **Images:** Images from Notion will display properly in posts
4. **Categories:** Category filtering will work correctly
5. **Navigation:** All links between pages will function properly

## 🐛 Common Issues and Solutions

### Backend Issues
- **Posts not loading:** Check Notion API key and database ID
- **Server won't start:** Ensure port 5000 is available
- **CORS errors:** Check CLIENT_ORIGIN in .env

### Frontend Issues  
- **API connection failed:** Verify backend is running on port 5000
- **Posts not displaying:** Check browser console for API errors
- **Images not loading:** Verify Notion images are properly formatted

### Notion Issues
- **No posts found:** Ensure posts have "Published" checkbox checked
- **Missing data:** Verify all required properties exist in database
- **API errors:** Check Notion API key permissions

## 📈 Performance Optimizations Applied

1. **Caching:** Added 1-hour cache for Notion API calls
2. **Error Recovery:** Graceful fallbacks when individual posts fail
3. **Lazy Loading:** Posts load individually to prevent blocking
4. **Image Optimization:** Proper image sizing and loading

## 🔍 Monitoring and Logs

- Backend logs show detailed Notion API interactions
- Frontend console shows API configuration and errors
- Use browser DevTools Network tab to monitor API calls
- Check backend terminal for processing status

## 🚀 Deployment Notes

For production deployment:
1. Update frontend .env with production backend URL
2. Set proper CORS origins in backend
3. Use environment variables for sensitive data
4. Consider using a process manager like PM2 for backend

---

**Next Steps:** Run the development script and verify all issues are resolved! 
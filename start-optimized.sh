#!/bin/bash

echo "🚀 ======================================================"
echo "🚀 QINYU BLOG - PERFORMANCE OPTIMIZED STARTUP v2.0"
echo "🚀 ======================================================"

# Check if we're in the right directory
if [ ! -d "blog-backend" ] || [ ! -d "tech-blog" ]; then
    echo "❌ Error: Please run this script from the qinyu-blog root directory"
    exit 1
fi

# Function to check if port is in use
check_port() {
    local port=$1
    if netstat -tuln 2>/dev/null | grep ":$port " > /dev/null; then
        return 0
    else
        return 1
    fi
}

# Function to kill processes on specific ports
kill_port() {
    local port=$1
    echo "🧹 Cleaning up port $port..."
    
    # Find and kill processes using the port
    local pids=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$pids" ]; then
        echo "🔧 Killing processes on port $port: $pids"
        kill -9 $pids 2>/dev/null || true
        sleep 2
    fi
}

# Clean up existing processes
echo "🧹 Cleaning up existing processes..."
kill_port 5000
kill_port 5173

# Check backend dependencies
echo "🔧 Checking backend dependencies..."
cd blog-backend
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

# Check if compression is installed
if ! npm list compression &>/dev/null; then
    echo "📦 Installing compression middleware..."
    npm install compression
fi

echo "🔧 Backend setup complete"

# Check frontend dependencies
echo "🎨 Checking frontend dependencies..."
cd ../tech-blog
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Check for pnpm and install if needed
if ! command -v pnpm &> /dev/null; then
    echo "📦 pnpm not found, using npm instead..."
    NPM_CMD="npm"
else
    NPM_CMD="pnpm"
fi

echo "🎨 Frontend setup complete"

# Start backend
echo "🔧 Starting optimized backend server..."
cd ../blog-backend
npm start &
BACKEND_PID=$!

# Wait for backend to start
echo "⏳ Waiting for backend to initialize..."
sleep 5

# Test backend health
echo "🧪 Testing backend connection..."
for i in {1..10}; do
    if curl -s http://localhost:5000/health > /dev/null; then
        echo "✅ Backend is running and healthy"
        break
    else
        echo "⏳ Waiting for backend... ($i/10)"
        sleep 2
    fi
    
    if [ $i -eq 10 ]; then
        echo "❌ Backend failed to start properly"
        echo "🔍 Check backend logs above for errors"
    fi
done

# Start frontend
echo "🎨 Starting optimized frontend server..."
cd ../tech-blog
VITE_APP_BACKEND_URL=http://localhost:5000 $NPM_CMD run dev &
FRONTEND_PID=$!

# Wait for frontend to start
echo "⏳ Waiting for frontend to initialize..."
sleep 3

echo ""
echo "🎉 ======================================================"
echo "🎉 DEVELOPMENT SERVERS STARTED SUCCESSFULLY!"
echo "🎉 ======================================================"
echo "📝 Backend API: http://localhost:5000"
echo "🌐 Frontend App: http://localhost:5173"
echo ""
echo "⚡ PERFORMANCE FEATURES ENABLED:"
echo "   • Multi-tier backend caching (30min/1hr/2hr)"
echo "   • Gzip compression for faster data transfer"
echo "   • Metadata-first loading for instant homepage"
echo "   • Background content loading"
echo "   • Lazy image loading"
echo "   • Skeleton loaders for better UX"
echo "   • Request timing monitoring"
echo ""
echo "📊 API ENDPOINTS:"
echo "   • GET /api/blog/posts/metadata - Fast homepage loading"
echo "   • GET /api/blog/posts - Full posts with content"
echo "   • GET /api/blog/posts/:id - Individual post"
echo "   • GET /api/blog/categories - Categories"
echo "   • GET /api/blog/cache/stats - Cache statistics"
echo "   • POST /api/blog/cache/clear - Clear caches"
echo ""
echo "🔍 PERFORMANCE MONITORING:"
echo "   • Check browser console for loading times"
echo "   • Backend logs show request durations"
echo "   • Cache hit/miss statistics available"
echo ""
echo "🛑 Press Ctrl+C to stop all servers"
echo "======================================================"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping development servers..."
    
    # Kill background processes
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    
    # Kill any remaining processes on the ports
    kill_port 5000
    kill_port 5173
    
    echo "✅ All servers stopped"
    echo "🙏 Thank you for using Qinyu Blog!"
    exit 0
}

# Trap Ctrl+C
trap cleanup INT TERM

# Wait for processes
wait 
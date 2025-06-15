#!/bin/bash

echo "🚀 Starting Qinyu Blog Development Environment"

# Kill any existing processes on ports 5000 and 5173
echo "🧹 Cleaning up existing processes..."
pkill -f "node.*5000" || true
pkill -f "vite.*5173" || true

# Wait a moment for processes to close
sleep 2

# Start backend
echo "🔧 Starting backend server..."
cd blog-backend
VITE_APP_BACKEND_URL=http://localhost:5000 npm start &
BACKEND_PID=$!

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 5

# Test backend
echo "🧪 Testing backend connection..."
curl -s http://localhost:5000/health && echo "✅ Backend is running" || echo "❌ Backend failed to start"

# Start frontend
echo "🎨 Starting frontend server..."
cd ../tech-blog
VITE_APP_BACKEND_URL=http://localhost:5000 npm run dev &
FRONTEND_PID=$!

echo "🎉 Development servers started!"
echo "📝 Backend: http://localhost:5000"
echo "🌐 Frontend: http://localhost:5173"
echo ""
echo "📊 API Endpoints:"
echo "  • GET /api/blog/posts - All posts"
echo "  • GET /api/blog/posts/:id - Single post"
echo "  • GET /api/blog/categories - Categories"
echo ""
echo "Press Ctrl+C to stop all servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping development servers..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    pkill -f "node.*5000" || true
    pkill -f "vite.*5173" || true
    echo "✅ All servers stopped"
    exit 0
}

# Trap Ctrl+C
trap cleanup INT

# Wait for both processes
wait 
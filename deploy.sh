#!/bin/bash

# Portfolio Frontend Deployment Script
# للاستخدام على السيرفر

set -e

# قراءة البورت من .env.production أو استخدام القيمة الافتراضية
PORT=${PORT:-3010}
if [ -f .env.production ]; then
    source .env.production
fi

echo "🔍 Checking for conflicts..."
echo ""

# فحص التضارب قبل النشر
if [ -f check-conflicts.sh ]; then
    chmod +x check-conflicts.sh
    if ! ./check-conflicts.sh; then
        echo ""
        echo "❌ يرجى حل المشاكل أعلاه قبل المتابعة"
        echo ""
        read -p "هل تريد المتابعة رغم ذلك؟ (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "تم إلغاء النشر"
            exit 1
        fi
    fi
    echo ""
fi

echo "🚀 Starting deployment on port $PORT..."

# Pull latest changes (if using git)
if [ -d .git ]; then
    echo "📥 Pulling latest changes..."
    git pull origin master
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Build and start containers
echo "🔨 Building Docker image..."
docker-compose build --no-cache

echo "▶️  Starting containers on port $PORT..."
PORT=$PORT docker-compose up -d

# Clean up old images
echo "🧹 Cleaning up old images..."
docker image prune -f

echo "✅ Deployment completed successfully!"
echo "🌐 Application is running on http://217.76.53.136:$PORT"
echo ""
echo "📊 Available ports: 3000, 3010, 3011, 4000"
echo "💡 To change port, edit PORT in .env.production"

# Show logs
echo ""
echo "📋 Showing logs (Ctrl+C to exit)..."
docker-compose logs -f

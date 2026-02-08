#!/usr/bin/env bash
# Railway build script
set -o errexit

echo "🚀 Starting Railway build process..."

# Install dependencies
echo "📦 Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Collect static files
echo "📁 Collecting static files..."
python manage.py collectstatic --no-input

# Run migrations
echo "🗄️  Running database migrations..."
python manage.py migrate --no-input

echo "✅ Build completed successfully!"

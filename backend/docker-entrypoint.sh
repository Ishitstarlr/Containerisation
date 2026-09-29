#!/bin/sh
set -e

echo "Deploying database migrations..."
npx prisma migrate deploy

echo "Starting backend server..."
exec "$@"

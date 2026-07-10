#!/bin/bash
set -e

echo "Deploying PriorAuthFlow CROO agent..."

# Build
cd croo-agent
npm install
npm run build 2>/dev/null || true

# Deploy via rsync (update HOST and PATH)
HOST=${CROO_HOST:-your-server.com}
PATH=${CROO_PATH:-/opt/priorauthflow-croo-agent}
USER=${CROO_USER:-root}

echo "Deploying to $USER@$HOST:$PATH"
ssh $USER@$HOST "mkdir -p $PATH"
rsync -avz --exclude='node_modules' --exclude='.git' ./ $USER@$HOST:$PATH/

echo "Installing dependencies on remote..."
ssh $USER@$HOST "cd $PATH && npm install --production"

echo "Restarting service..."
ssh $USER@$HOST "pm2 restart priorauthflow-croo || pm2 start croo-agent/index.ts --name priorauthflow-croo --interpreter tsx"

echo "Deployed! Check logs: ssh $USER@$HOST 'pm2 logs priorauthflow-croo'"

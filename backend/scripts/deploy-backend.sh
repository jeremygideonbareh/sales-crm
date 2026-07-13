#!/usr/bin/env bash
set -euo pipefail

# Backend deploy script for PythonAnywhere
# Usage: bash backend/scripts/deploy-backend.sh
#
# Requires PA_API_TOKEN env var or ~/.pa_token file

PA_USER="jeremy2562321"
PA_DOMAIN="${PA_USER}.pythonanywhere.com"
PROJECT_DIR="/home/${PA_USER}/sales-crm"

# Get token from env var or file
PA_API_TOKEN="${PA_API_TOKEN:-}"
if [[ -z "$PA_API_TOKEN" && -f "$HOME/.pa_token" ]]; then
  PA_API_TOKEN="$(cat "$HOME/.pa_token")"
fi

if [[ -z "$PA_API_TOKEN" ]]; then
  echo "ERROR: PA_API_TOKEN not set. Create it at:"
  echo "  https://www.pythonanywhere.com/account/#api_token"
  echo "Then: export PA_API_TOKEN='your-token-here'"
  exit 1
fi

echo "=== Deploying Backend to PythonAnywhere ==="

# Step 1: Pull latest code
echo "[1/4] Pulling latest code..."
cd "$PROJECT_DIR"
git pull origin main

# Step 2: Install dependencies
echo "[2/4] Installing dependencies..."
cd backend
pip install -r requirements.txt --quiet

# Step 3: Reload web app via API
echo "[3/4] Reloading web app..."
RELOAD_URL="https://www.pythonanywhere.com/api/v0/user/${PA_USER}/webapps/${PA_DOMAIN}/reload/"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$RELOAD_URL" \
  -H "Authorization: Token ${PA_API_TOKEN}")

if [[ "$HTTP_CODE" != "200" ]]; then
  echo "ERROR: Reload failed (HTTP $HTTP_CODE)"
  exit 1
fi
echo "  Web app reloaded successfully"

# Step 4: Verify health
echo "[4/4] Verifying health endpoint..."
sleep 2
HEALTH_URL="https://${PA_DOMAIN}/api/health"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL")

if [[ "$HTTP_CODE" == "200" ]]; then
  echo "  Health check: OK"
else
  echo "WARNING: Health check returned HTTP $HTTP_CODE"
fi

echo ""
echo "=== Deploy complete ==="
echo "  Frontend: https://sales-crm.pages.dev"
echo "  Backend:  https://${PA_DOMAIN}"
echo "  API Docs: https://${PA_DOMAIN}/docs"

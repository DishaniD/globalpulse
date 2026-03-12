#!/bin/bash
# GlobalPulse — One-click deploy script
# Double-click this file or run: bash deploy.sh "your commit message"

cd "$(dirname "$0")"

MESSAGE=${1:-"Update GlobalPulse"}

echo "🚀 Deploying GlobalPulse..."
echo "📁 Directory: $(pwd)"
echo "💬 Message: $MESSAGE"
echo ""

# Git push
git add .
git commit -m "$MESSAGE"
git push

echo ""
echo "✅ Pushed to GitHub! Vercel is now deploying..."
echo "🌐 Check: https://globalpulse-two.vercel.app"
echo ""
echo "⏳ Waiting 30 seconds for Vercel to deploy..."
sleep 30

# Trigger sync
echo "🔄 Syncing news to database..."
curl -s "https://globalpulse-two.vercel.app/api/sync" | python3 -m json.tool 2>/dev/null || echo "Sync triggered"

echo ""
echo "💥 Syncing conflict news from RSS feeds..."
curl -s "https://globalpulse-two.vercel.app/api/sync-conflicts" | python3 -m json.tool 2>/dev/null || echo "Conflict sync triggered"

echo ""
echo "🎉 All done! Your site is live at https://globalpulse-two.vercel.app"
read -p "Press Enter to close..."

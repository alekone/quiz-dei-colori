#!/usr/bin/env bash
set -euo pipefail

REMOTE_USER="u945451001"
REMOTE_HOST="92.113.28.128"
REMOTE_PORT="65002"
SSH_KEY="/Users/alessandromininno/.ssh/quiz-colori"
REMOTE_DIR="domains/test.mininno.com/public_html/quiz-colori"

export NEXT_PUBLIC_BASE_PATH="/quiz-colori"
export NEXT_PUBLIC_ASSET_PREFIX="/quiz-colori/"

echo "Building static export..."
npm run build

if [ ! -d "out" ]; then
  echo "Build output folder 'out' not found."
  exit 1
fi

echo "Creating remote directory..."
ssh -i "${SSH_KEY}" -p "${REMOTE_PORT}" "${REMOTE_USER}@${REMOTE_HOST}" "mkdir -p ${REMOTE_DIR}"

echo "Deploying to ${REMOTE_HOST}:${REMOTE_DIR}"
rsync -avz --delete -e "ssh -i ${SSH_KEY} -p ${REMOTE_PORT}" "out/" "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/"

echo "Deploy complete."

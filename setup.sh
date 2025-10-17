#!/usr/bin/env bash
set -euo pipefail

PROJECT_NAME="photometric_stereo_app"

echo "Starting rebuild for project: $PROJECT_NAME"

SERVICES=$(docker compose -p "$PROJECT_NAME" ps --services 2>/dev/null || true)

if [[ -n "$SERVICES" ]]; then
    echo "Removing all service containers (and their anonymous volumes)..."
    echo "$SERVICES" | xargs -r docker compose -p "$PROJECT_NAME" rm -sfv || true
else
    echo "No running services found"
fi

VOLUMES=$(docker volume ls -q | grep "^${PROJECT_NAME}_" | grep -v "_mongo_data$" || true)

if [[ -n "$VOLUMES" ]]; then
    echo "Removing named volumes (except those matching _mongo_data)..."
    echo "$VOLUMES" | xargs -r docker volume rm || true
else
    echo "No existing volumes found"
fi

echo "Rebuilding and starting containers..."
docker compose -p "$PROJECT_NAME" build --no-cache
docker compose -p "$PROJECT_NAME" up -d

echo "Rebuild complete! Project: $PROJECT_NAME"

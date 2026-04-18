#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_DIR="$PROJECT_ROOT/server"
COMPOSE_FILE="$SERVER_DIR/docker-compose.yml"

if [[ ! -f "$COMPOSE_FILE" ]]; then
  echo "Error: compose file not found at $COMPOSE_FILE"
  exit 1
fi

if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
  COMPOSE_CMD=(docker compose)
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE_CMD=(docker-compose)
else
  echo "Error: Docker Compose is not installed. Install Docker Desktop or docker-compose plugin."
  exit 1
fi

ensure_env() {
  local env_file="$SERVER_DIR/.env"
  local env_example="$SERVER_DIR/.env.example"

  if [[ ! -f "$env_file" ]]; then
    cp "$env_example" "$env_file"
    echo "Created $env_file from .env.example"
  fi

  # Ensure MongoDB hostname resolves inside Docker network.
  if grep -q '^MONGODB_URI=' "$env_file"; then
    sed -i 's|^MONGODB_URI=.*|MONGODB_URI=mongodb://mongodb:27017/allcollegeevents|' "$env_file"
  else
    echo 'MONGODB_URI=mongodb://mongodb:27017/allcollegeevents' >> "$env_file"
  fi

  if grep -q '^FRONTEND_URL=' "$env_file"; then
    sed -i 's|^FRONTEND_URL=.*|FRONTEND_URL=http://localhost:8080|' "$env_file"
  else
    echo 'FRONTEND_URL=http://localhost:8080' >> "$env_file"
  fi

  if grep -q '^CORS_ORIGIN=' "$env_file"; then
    sed -i 's|^CORS_ORIGIN=.*|CORS_ORIGIN=http://localhost:8080|' "$env_file"
  else
    echo 'CORS_ORIGIN=http://localhost:8080' >> "$env_file"
  fi
}

run_compose() {
  (cd "$SERVER_DIR" && "${COMPOSE_CMD[@]}" -f "$COMPOSE_FILE" "$@")
}

case "${1:-help}" in
  start)
    ensure_env
    run_compose up -d --build
    echo ""
    echo "Application started:"
    echo "Frontend: http://localhost:8080"
    echo "Backend:  http://localhost:5000/health"
    ;;
  stop)
    run_compose down
    ;;
  restart)
    ensure_env
    run_compose down
    run_compose up -d --build
    ;;
  build)
    ensure_env
    run_compose build
    ;;
  logs)
    run_compose logs -f --tail=150
    ;;
  status)
    run_compose ps
    ;;
  clean)
    run_compose down -v --remove-orphans
    ;;
  *)
    cat <<'EOF'
Usage: ./quickstart.sh <command>

Commands:
  start    Build and start all services in background
  stop     Stop all services
  restart  Rebuild and restart all services
  build    Build all service images
  logs     Follow logs
  status   Show container status
  clean    Stop services and remove volumes
EOF
    ;;
esac

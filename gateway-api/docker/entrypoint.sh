#!/bin/sh
set -e

if [ -n "$DATABASE_URL" ]; then
  echo "Running Prisma migrate deploy..."
  npx prisma migrate deploy || echo "WARN: migrate deploy failed, continuing..."
fi

exec "$@"
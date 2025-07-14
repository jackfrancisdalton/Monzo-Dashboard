#!/bin/sh
set -e
echo "Rendering nginx.conf from template with env vars..."
envsubst '${NGINX_PORT} ${FRONTEND_DOCKER_URL} ${API_DOCKER_URL} ${MOCK_MONZO_DOCKER_URL}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf
exec nginx -g 'daemon off;'
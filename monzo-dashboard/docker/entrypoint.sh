#!/bin/sh
envsubst '$FRONTEND_HOST $FRONTEND_PORT $API_HOST $API_PORT $MOCK_MONZO_HOST $MOCK_MONZO_PORT' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf
exec nginx -g 'daemon off;'
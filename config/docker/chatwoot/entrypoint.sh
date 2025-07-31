#!/bin/sh

set -e

# Run database migrations
bundle exec rails db:chatwoot_prepare

# Start the chatwoot server
exec bundle exec rails s -p ${PORT:-3000}
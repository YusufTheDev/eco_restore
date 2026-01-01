#!/bin/bash
set -e

# Run migrations
echo "Running migrations..."
php bin/console doctrine:migrations:migrate --no-interaction --allow-no-migration

# Execute the main container command (Apache)
echo "Starting Apache..."
exec apache2-foreground

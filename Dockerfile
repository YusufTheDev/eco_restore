# Use the official PHP image with Apache
FROM php:8.3-apache

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libpq-dev \
    libicu-dev \
    libzip-dev \
    acl \
    && docker-php-ext-install \
    pdo \
    pdo_pgsql \
    intl \
    opcache \
    zip \
    && a2enmod rewrite \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Configure Apache DocumentRoot to point to /public
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf | true

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy composer files first for caching
COPY composer.json composer.lock symfony.lock ./

# Install dependencies (no scripts yet to avoid failures due to missing files)
RUN composer install --no-dev --no-scripts --no-autoloader

# Copy the rest of the application
COPY . .

# Finish composer installation (dump autoload and run scripts)
RUN composer dump-autoload --optimize --no-dev --classmap-authoritative \
    && composer run-script post-install-cmd

# Compile assets
RUN php bin/console asset-map:compile

# Adjust permissions
RUN setfacl -R -m u:www-data:rwX -m u:"$(whoami)":rwX var \
    && setfacl -dR -m u:www-data:rwX -m u:"$(whoami)":rwX var

# Expose port 80
EXPOSE 80

# Start Apache
CMD ["apache2-foreground"]

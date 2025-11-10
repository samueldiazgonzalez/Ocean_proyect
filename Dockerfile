FROM php:8.1-apache

# Instalamos extensiones comunes (ajusta si necesitas otras)
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    zip \
    unzip \
 && docker-php-ext-configure gd --with-freetype --with-jpeg \
 && docker-php-ext-install gd mysqli pdo pdo_mysql \
 && rm -rf /var/lib/apt/lists/*

# Habilitar mod_rewrite (si lo necesitas)
RUN a2enmod rewrite

# Copiamos el código al directorio público de Apache
COPY --chown=www-data:www-data . /var/www/html/
WORKDIR /var/www/html

# Exponer el puerto 80
EXPOSE 80

# Comando por defecto
CMD ["apache2-foreground"]

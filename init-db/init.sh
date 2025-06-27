#!/bin/bash
set -e

# Este script se ejecuta automáticamente cuando se inicializa la base de datos
echo "Inicializando base de datos Academic Events..."

# La base de datos ya se crea automáticamente por las variables de entorno
# Las migraciones se ejecutan desde el contenedor del backend

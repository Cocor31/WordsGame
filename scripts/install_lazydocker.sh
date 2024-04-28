#!/bin/bash

echo "#################################"
echo "###                           ###"
echo "###    Install LazyDocker     ###"
echo "###                           ###"
echo "#################################"

# Récupérer la dernière version de Lazydocker depuis GitHub
LAZYDOCKER_VERSION=$(curl -s "https://api.github.com/repos/jesseduffield/lazydocker/releases/latest" | grep -Po '"tag_name": "v\K[0-9.]+')

# Télécharger l'archive Lazydocker
curl -Lo lazydocker.tar.gz "https://github.com/jesseduffield/lazydocker/releases/latest/download/lazydocker_${LAZYDOCKER_VERSION}_Linux_x86_64.tar.gz"

# Créer un répertoire temporaire et extraire l'archive
mkdir -p lazydocker-temp
tar xf lazydocker.tar.gz -C lazydocker-temp

# Déplacer l'exécutable Lazydocker vers /usr/local/bin pour le rendre accessible globalement
sudo mv lazydocker-temp/lazydocker /usr/local/bin

# Afficher la version de Lazydocker installée
lazydocker --version

# Nettoyer les fichiers temporaires
rm -rf lazydocker.tar.gz lazydocker-temp

#! /bin/sh

# Set application directory
cwd=$(pwd)

# echo "Image game-api creation"
cd $cwd/api
bash build.sh

# echo "Image game-manager creation"
cd $cwd/gamemanager
bash build.sh

# echo "Build front"
cd $cwd/front
bash build.sh



# echo "Image game-api creation"
# docker build -t game-api -f api/Dockerfile .
# echo "Image game-api create"

# echo "Image game-manager creation"
# docker build -t game-manager -f gamemanager/Dockerfile .
# echo "Image game-manager create"

# # echo "Image game-front creation"
# # docker build -t animes -f animes/Dockerfile .
# # echo "Image anime create"

# echo "Lancement des Conteneurs"
# docker-compose up -d 
# echo "Conteneurs lancés"
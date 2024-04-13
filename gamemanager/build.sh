echo "Image game-manager creation..."
docker build -t game-manager .
echo "Image game-manager created !"
echo "Push Image game-manager to DockerHub..."
docker tag game-manager cocor31/game-manager:main
docker push cocor31/game-manager:main
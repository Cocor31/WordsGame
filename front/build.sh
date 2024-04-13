echo "Image game-front creation..."
docker build -t game-front .
echo "Image game-front created !"
echo "Push Image game-front to DockerHub..."
docker tag game-front cocor31/game-front:main
docker push cocor31/game-front:main
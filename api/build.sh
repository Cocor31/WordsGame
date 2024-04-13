echo "Image game-api creation..."
docker build -t game-api .
echo "Image game-api created !"
echo "Push Image game-api to DockerHub..."
docker tag game-api cocor31/game-api:main
docker push cocor31/game-api:main
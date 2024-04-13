# Étape 1 : Build de l'application Vite.js
FROM node:latest AS build-stage

WORKDIR /app

# Copier les fichiers de package.json et package-lock.json pour installer les dépendances
COPY ./package.json ./package-lock.json ./

RUN npm install

# Copier le reste des fichiers de l'application
COPY . .

# Construire l'application
RUN npm run build

# Étape 2 : Utilisation de l'image Nginx
FROM nginx:stable-alpine as production-stage

# Copier le contenu construit de l'application Vite.js dans le répertoire d'Nginx
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copier le fichier de configuration Nginx personnalisé
COPY nginx/nginx.conf /etc/nginx/nginx.conf

# Exposer le port 8080
EXPOSE 80

# CMD par défaut de l'image Nginx
CMD ["nginx", "-g", "daemon off;"]
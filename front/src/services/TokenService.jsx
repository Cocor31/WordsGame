import { jwtDecode } from "jwt-decode";
import axios from 'axios';


const TOKEN_KEY = 'jwt_token';
const USER_INFO = 'user_public_data';

const tokenService = {
    // Enregistrer le token dans le stockage local
    setToken: (token) => {
        localStorage.setItem(TOKEN_KEY, token);
    },

    // Enregistrer le token dans le stockage local
    setUserData: (data) => {
        localStorage.setItem(USER_INFO, JSON.stringify(data));
    },

    patchUserPublicData: (new_data) => {
        const data = tokenService.getUserPublicData()
        if (new_data.pseudo) {
            data.pseudo = new_data.pseudo
        }
        if (new_data.photo) {
            data.photo = new_data.photo
        }
        localStorage.setItem(USER_INFO, JSON.stringify(data));
    },

    // Récupérer le token du stockage local
    getToken: () => {
        return localStorage.getItem(TOKEN_KEY);
    },

    // Récupérer les rôles de l'utilisateur
    getUserRoles: () => {
        const token = tokenService.getToken()
        const decoded = jwtDecode(token);
        return decoded.payload.roles || []
    },

    // Récupérer l'ID' de l'utilisateur
    getUserId: () => {
        const token = tokenService.getToken()
        const decoded = jwtDecode(token);
        return decoded.payload.userId || undefined
    },

    // Récupérer l'ID' de l'utilisateur
    getUserName: () => {
        const token = tokenService.getToken()
        const decoded = jwtDecode(token);
        return decoded.payload.userName || undefined
    },

    // Récupérer l'ID' de l'utilisateur
    getUserPublicData: () => {
        return JSON.parse(localStorage.getItem(USER_INFO));
    },

    // Vérifier si le token est expiré. Validité 1h
    isTokenExpired: () => {
        const token = tokenService.getToken();
        if (!token) return true;
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        return decoded.exp < currentTime;
    },

    // Vérifier si le token est expiré. Validité 3h
    isTokenExpiredSoft: () => {
        const token = tokenService.getToken();
        if (!token) return true;
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 3000;
        return decoded.exp < currentTime;
    },

    // Déconnecter l'utilisateur
    logout: () => {
        localStorage.removeItem(TOKEN_KEY);
        // Réinitialiser les headers par défaut d'axios
        delete axios.defaults.headers.common['Authorization'];
    },

    isAuthentified: () => {
        // On regarde la validité token sur 3h pour ne pas géner l'utilisateur
        return !tokenService.isTokenExpiredSoft()
    }
};

// Axios Interceptor pour ajouter le token
axios.interceptors.request.use(
    (config) => {
        const token = tokenService.getToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default tokenService;
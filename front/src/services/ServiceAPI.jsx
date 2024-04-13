import axios from 'axios';
import tokenService from './TokenService';


const VITE_SERVER_URL = import.meta.env.VITE_SERVER_URL || "localhost"
const VITE_API_PREFIX = import.meta.env.VITE_API_PREFIX || ":5000"

// axios.defaults.baseURL = 'http://localhost:5000';
axios.defaults.baseURL = 'http://' + VITE_SERVER_URL + VITE_API_PREFIX;

const login = async (formData) => {
    try {
        const response = await axios.post('/login', formData);
        const token = response.data.access_token;
        const user_public_data = response.data.user_public_data

        if (token) {
            tokenService.setToken(token)
        }

        if (user_public_data) {
            tokenService.setUserData(user_public_data)
        }
        return token;
    } catch (error) {
        let error_message
        if (error.response.status === 404) {
            error_message = "Votre email est inconnu ou érroné !"
        } else if (error.response.status === 401) {
            error_message = "Votre mot de passe est incorrect. Veuillez le vérifier."
        } else {
            error_message = "Erreur lors de la connexion"
        }
        throw new Error(error_message);
    }
};

const signup = async (formData) => {
    try {
        await axios.post('/signin', formData);

        // Auto Login
        const token = login(formData)

        return token

    } catch (error) {
        let error_message

        if (error.response.status === 409) {
            error_message = "Cet email est déjà associé à un utilisateur !"
        } else {
            error_message = "Erreur lors de l'inscription"
        }
        throw new Error(error_message);
    }
};

const patchUser = async (formData) => {
    try {
        const userId = tokenService.getUserId()
        await axios.patch('/users/' + userId, formData);
    } catch (error) {
        let error_message = "Erreur lors de la modification des infos utilisateur"
        throw new Error(error_message);
    }
};

const getUserMe = async () => {
    try {
        const response = await axios.get('/users/me');
        const user = response.data.data;

        return user

    } catch (error) {
        let error_message = "Erreur lors de la récupération des infos utilisateur"
        throw new Error(error_message);
    }
};


export default {
    login, signup, getUserMe, patchUser
};


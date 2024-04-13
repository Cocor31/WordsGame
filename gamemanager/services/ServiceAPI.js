const axios = require('axios');

const API_URL = process.env.API_URL || "localhost"
const API_PORT = process.env.API_PORT || "5000"

axios.defaults.baseURL = 'http://' + API_URL + ':' + API_PORT;

const RequestWordHit = async (word) => {
    try {
        const response = await axios.post('/words/hit', { name: word });
        // console.log(response.data);
        console.log("response API : ", response.data)
        return response.data.data
    } catch (error) {
        console.log(error)
        let error_message
        if (error.response.status === 403) {
            error_message = "Le message ne doit contenir qu'un seul mot"
        } else if (error.response.status === 400) {
            error_message = "Mot non trouvé"
        } else {
            error_message = "Erreur lors de la connexion à l'API"
        }
        throw new Error(error_message);
    }
}



module.exports = {
    RequestWordHit,
};

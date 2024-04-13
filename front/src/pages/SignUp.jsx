import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ServiceAPI from '../services/ServiceAPI';
import ServiceImage from '../services/ServiceImage';
import tokenService from '../services/TokenService';



const SignUp = () => {
    const navigate = useNavigate()

    // State pour stocker les valeurs des champs du formulaire
    const [formData, setFormData] = useState({
        pseudo: '',
        email: '',
        password: ''
    });

    // State pour gérer les erreurs de login
    const [error, setError] = useState("")

    // Fonction pour gérer les changements dans les champs du formulaire
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    // Fonction pour gérer le changement de l'image
    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        const encodedfile = await ServiceImage.loadFile(file)
        // console.log(encodedfile)
        if (encodedfile) {
            setFormData({
                ...formData,
                photo: encodedfile
            });
        }
    }

    // Fonction pour gérer la soumission du formulaire
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            console.log(formData)
            const token = await ServiceAPI.signup(formData); // Utilisez la fonction signup du service

            //Init erreur Login si besoin
            setError("")

            // Ici, on pourrait se logger automatiquement et envoyer sur home
            console.log('Token JWT obtenu:', token);
            console.log('isAuthentified:', tokenService.isAuthentified());
            if (tokenService.isAuthentified()) {
                navigate("/")
            }

        } catch (error) {
            setError(error.message)
        }
    };

    return (
        <div className="login__container">
            <form className="login__container__form" onSubmit={handleSubmit}>
                <h2 className="login__header">Sign in to Open Chat</h2>
                <input
                    type="text"
                    id="pseudo"
                    name="pseudo"
                    placeholder="Pseudo"
                    value={formData.pseudo}
                    className="login__input"
                    onChange={handleChange}
                />
                <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    className="login__input"
                    onChange={handleChange}
                />
                <input
                    id="password"
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    className="login__input"
                    onChange={handleChange}
                    minLength={6}
                />
                <div className="login__input_photo_container">
                    <p>Photo (Optionnel)</p>
                    <input
                        type="file"
                        id="photo"
                        name="photo"
                        accept="image/*"
                        onChange={handleImageChange}

                    />

                    {formData.photo && (
                        <div className="login__image__div">
                            <img
                                src={formData.photo}
                                alt="Preview"
                                className="login__container__form__preview"
                            />
                        </div>
                    )}
                </div>

                <button className="login__btn" type="submit">SignUp</button>
            </form>
            <div className="login__container__error">
                <p>{error}</p>
            </div>
            <div className="login__container__links">
                <Link to="/login">Retour</Link>
            </div>
        </div>
    );
}

export default SignUp;
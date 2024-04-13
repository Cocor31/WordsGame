import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ServiceAPI from '../services/ServiceAPI';
import tokenService from '../services/TokenService';

const Login = () => {
    const navigate = useNavigate()
    // State pour stocker les valeurs des champs du formulaire
    const [formData, setFormData] = useState({
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

    // Fonction pour gérer la soumission du formulaire
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = await ServiceAPI.login(formData);

            //Init erreur Login si besoin
            setError("")

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
                <h2 className="login__header">Login to Words Game</h2>
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
                <button className="login__btn">LOGIN</button>
            </form>
            <div className="login__container__error">
                <p>{error}</p>
            </div>
            <div className="login__container__links">
                <div>Or</div>
                <Link to="/signup">Sign In</Link>
            </div>
        </div>
    );
};

export default Login;
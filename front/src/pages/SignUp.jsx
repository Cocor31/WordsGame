import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ServiceAPI from '../services/ServiceAPI';
import tokenService from '../services/TokenService';
import PhotoContainer from '../components/PhotoContainer';

const SignUp = () => {
    const navigate = useNavigate()
    const [error, setError] = useState("")
    const [formData, setFormData] = useState({
        pseudo: '',
        email: '',
        password: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            console.log(formData)
            const token = await ServiceAPI.signup(formData);

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

                <p>Photo (Optionnel)</p>
                <PhotoContainer formData={formData} setFormData={setFormData} />


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
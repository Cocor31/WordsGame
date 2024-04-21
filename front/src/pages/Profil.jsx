import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ServiceAPI from '../services/ServiceAPI';
import tokenService from '../services/TokenService';
import PhotoContainer from '../components/PhotoContainer';

const Profil = () => {
    const navigate = useNavigate();

    // State pour stocker les valeurs des champs du formulaire
    const [formData, setFormData] = useState({
        pseudo: '',
        email: '',
        password: '',
        photo: null,
    });

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userData = await ServiceAPI.getUserMe();
                setFormData({
                    pseudo: userData.pseudo,
                    email: userData.email,
                    password: '',
                    photo: userData.photo
                });
            } catch (error) {
                console.error(error);
            }
        };

        fetchUserData();
    }, []);

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

        // Supprimer le champ "password" de formData si il est égal à ""
        if (formData.password === '') {
            delete formData.password;
        }

        try {
            // Envoi des données au service "ServiceAPI.patchUser"
            await ServiceAPI.patchUser(formData);

            // Update User Public Data
            tokenService.patchUserPublicData(formData)

            // Retour automatique vers home
            navigate("/")
        } catch (error) {
            console.error(error);
        }
    };


    return (
        <div className="login__container">
            <form className="login__container__form" onSubmit={handleSubmit}>
                <h2 className="login__header">Your Profil</h2>
                <PhotoContainer formData={formData} setFormData={setFormData} />
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
                    placeholder="New Password"
                    value={formData.password}
                    className="login__input"
                    onChange={handleChange}
                    minLength={6}
                />
                <button className="login__btn" type="submit">Update</button>
            </form>
            <div className="login__container__links">
                <Link to="/">Cancel</Link>
            </div>
        </div>
    );
};

export default Profil;
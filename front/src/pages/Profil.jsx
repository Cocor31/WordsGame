import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ServiceAPI from '../services/ServiceAPI';
import ServiceImage from '../services/ServiceImage';
import { DEFAULT_PHOTO } from '../../constantes/constantes';
import tokenService from '../services/TokenService';

const Profil = () => {
    const navigate = useNavigate()

    // State pour stocker les valeurs des champs du formulaire
    const [formData, setFormData] = useState({
        pseudo: '',
        email: '',
        password: '',
        photo: '',
    });

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userData = await ServiceAPI.getUserMe();
                setFormData({
                    pseudo: userData.pseudo,
                    email: userData.email,
                    password: '',
                    photo: userData.photo ? userData.photo : DEFAULT_PHOTO
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

    // Fonction pour gérer le changement de l'image
    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        const encodedfile = await ServiceImage.loadFile(file)

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

        // Supprimer le champ "password" de formData si il est égal à ""
        if (formData.password === '') {
            delete formData.password;
        }

        // Supprimer le champ "photo" de formData si il est égal à ""
        if (formData.photo === '') {
            delete formData.photo;
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
                <div className="login__input_photo_container">
                    <p>Photo</p>
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

                <button className="login__btn" type="submit">Update</button>

            </form>
            {/* <div className="login__container__error">
                <p>{error}</p>
            </div> */}
            <div className="login__container__links">
                <Link to="/">Cancel</Link>
            </div>
        </div>
    );
};

export default Profil;
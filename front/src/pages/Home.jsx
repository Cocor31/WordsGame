import React, { useEffect, useState } from 'react';
import tokenService from '../services/TokenService';
import { useNavigate } from 'react-router-dom';
import ServiceSocket from '../services/ServiceSocket';
import { DEFAULT_PHOTO } from '../../constantes/constantes';

const Home = ({ setSocket }) => {

    const navigate = useNavigate()

    // State pour stocker les valeurs des champs du formulaire
    const [userInfo, setUserInfo] = useState({
        pseudo: null,
        photo: null,
    });

    useEffect(() => {
        const fetchUserData = async () => {
            const userData = tokenService.getUserPublicData()

            setUserInfo({
                pseudo: userData.pseudo,
                photo: userData.photo ? userData.photo : DEFAULT_PHOTO
            });
        }
        fetchUserData();

    }, []);

    const handleLogout = () => {
        tokenService.logout()
        navigate("/login")
    }

    const handlePlay = () => {

        const socket = ServiceSocket.connectSocket()

        // setSocket(socket)
        setSocket(socket)

        ServiceSocket.addUser(socket)

        navigate("/chat")
    }

    const handleProfil = () => {
        navigate("/profil")
    }


    return (
        <div className="home">
            <div className="home__header">
                <div className='home__header__icone'>
                    <img
                        src={userInfo.photo}
                        alt="Preview"
                        className="login__container__form__preview"
                    />
                </div>
                <div className='home__header__buttons'>
                    <button className='home__menu__btn' onClick={handleProfil}>Edit Profil</button>
                    <button className='home__menu__btn' onClick={handleLogout}>Logout</button>

                </div>
            </div>

            <h1>Welcome home Test Dev</h1>
            <button className='login__btn' onClick={handlePlay}>Play</button>


        </div>
    );
};

export default Home;
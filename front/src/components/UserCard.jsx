import React, { useEffect, useState } from 'react';
import { DEFAULT_PHOTO } from '../../constantes/constantes';

const UserCard = ({ socketID, username, users, photo }) => {
    const [progress, setProgress] = useState(0);
    const [initScore, setinitScore] = useState(0)

    const getColor = () => {
        if (progress < 40) {
            return "#ff0000"
        } else if (progress < 70) {
            return "#ffa500"
        } else {
            return "#2ecc71"
        }
    }

    useEffect(() => {
        const user = users.filter((user) => user.socketID === socketID)[0];
        setinitScore(user.score)
    }, [initScore]);

    useEffect(() => {
        const user = users.filter((user) => user.socketID === socketID)[0];
        setProgress(Math.round(user.score / initScore * 100))
    }, [users, socketID, username, initScore]);

    return (
        <div className="chat__usercard">
            <div className="chat__usercard__image">
                <img
                    src={photo ? photo : DEFAULT_PHOTO}
                    alt="Preview"
                />
            </div>
            <div className="chat__usercard__userdata">
                <p >{username}</p>
                <div className="chat__healthbar">
                    <div className="progress-bar">
                        <div className='progress-bar-fill' style={{ width: `${progress}%`, backgroundColor: getColor() }}></div>
                    </div>
                    <div className='progress-label'>{progress}%</div>

                </div>
            </div>
        </div>

    );
};

export default UserCard;
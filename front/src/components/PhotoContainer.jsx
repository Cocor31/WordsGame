import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import ServiceImage from '../services/ServiceImage';
import { DEFAULT_PHOTO } from '../../constantes/constantes';

const PhotoContainer = ({ formData, setFormData }) => {
    const [showEditIcon, setShowEditIcon] = useState(false);

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        const encodedFile = await ServiceImage.loadFile(file);

        if (encodedFile) {
            setFormData({
                ...formData,
                photo: encodedFile,
            });
        }
    };

    const handleDeletePhoto = () => {
        setFormData({
            ...formData,
            photo: null,
        });
        document.getElementById('photo').value = null;
    };

    return (
        <div
            className="login__photo_container"
            onMouseEnter={() => setShowEditIcon(true)}
            onMouseLeave={() => setShowEditIcon(false)}
        >
            <img src={formData.photo ? formData.photo : DEFAULT_PHOTO} alt="Profile" className="login__input_photo" />
            {showEditIcon && formData.photo && (
                <div className="login__input_photo_delete_icon" onClick={handleDeletePhoto}>
                    <FontAwesomeIcon icon={faTrashAlt} />
                </div>
            )}
            {showEditIcon && (
                <label htmlFor="photo" className="login__input_photo_edit_icon">
                    <FontAwesomeIcon icon={faPencilAlt} />
                </label>
            )}
            <input
                type="file"
                id="photo"
                name="photo"
                accept="image/*"
                onChange={handleImageChange}
                className="login__input_photo_input"
            />
        </div>
    );
};

export default PhotoContainer;
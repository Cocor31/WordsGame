import React, { useState } from 'react';
import ServiceSocket from '../services/ServiceSocket';

const ChatFooter = ({ socket, footerBloqued }) => {
    const [message, setMessage] = useState('');

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (message.length > 0) {
            ServiceSocket.sendMessage(socket, message)
            setMessage('')
        }
        ServiceSocket.resetTyping(socket)
    };

    const handleTyping = (e) => {
        setMessage(e.target.value)
        if (e.target.value.length > 0) {
            ServiceSocket.isTyping(socket)
        } else {
            ServiceSocket.resetTyping(socket)
        }

    };

    return (
        <div className={`chat__footer ${footerBloqued ? 'disabled' : ''}`}>
            <form className="form" onSubmit={handleSendMessage}>
                <input
                    type="text"
                    placeholder="Write message"
                    className="message"
                    value={message}
                    onChange={handleTyping}
                // onKeyDown={handleTyping}
                />
                <button className="sendBtn">SEND</button>
            </form>
        </div>
    );
};

export default ChatFooter;
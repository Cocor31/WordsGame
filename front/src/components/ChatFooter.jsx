import React, { useState } from 'react';
import ServiceSocket from '../services/ServiceSocket';

const ChatFooter = ({ socket }) => {
    const [message, setMessage] = useState('');

    const handleSendMessage = (e) => {
        e.preventDefault();

        ServiceSocket.sendMessage(socket, message)
        setMessage('');
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
        <div className="chat__footer">
            <form className="form" onSubmit={handleSendMessage}>
                <input
                    type="text"
                    placeholder="Write message"
                    className="message"
                    value={message}
                    onChange={handleTyping}//{(e) => setMessage(e.target.value)}
                // onKeyDown={handleTyping}
                />
                <button className="sendBtn">SEND</button>
            </form>
        </div>
    );
};

export default ChatFooter;
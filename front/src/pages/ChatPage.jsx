import React, { useEffect, useRef, useState } from 'react';
import ChatBar from '../components/ChatBar';
import ChatBody from '../components/ChatBody';
import ChatFooter from '../components/ChatFooter';
import tokenService from '../services/TokenService';


// const ChatPage = ({ socket }) => {
const ChatPage = ({ socket }) => {
    const [messages, setMessages] = useState([]);
    const lastMessageRef = useRef(null);
    const [typingStatus, setTypingStatus] = useState('');

    useEffect(() => {
        socket.on('messageResponse', (data) => setMessages([...messages, data]));
        console.log(messages)
    }, [socket, messages]);

    useEffect(() => {
        // 👇️ scroll to bottom every time messages change
        lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        socket.on('typingResponse', (data) => setTypingStatus(data));
    }, [socket]);

    return (
        <div className="chat">
            <ChatBar socket={socket} />
            <div className="chat__main">
                <ChatBody socket={socket} messages={messages} typingStatus={typingStatus} lastMessageRef={lastMessageRef} />
                <ChatFooter socket={socket} />
            </div>
        </div>
    );
};

export default ChatPage;
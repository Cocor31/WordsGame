import React, { useEffect, useRef, useState } from 'react';
import ChatBar from '../components/ChatBar';
import ChatBody from '../components/ChatBody';
import ChatFooter from '../components/ChatFooter';
import tokenService from '../services/TokenService';
import ServiceSocket from '../services/ServiceSocket';
import { useNavigate } from 'react-router-dom';
import ChatPopUp from '../components/ChatPopUp';


const ChatPage = ({ socket }) => {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const lastMessageRef = useRef(null);
    const [typingStatus, setTypingStatus] = useState('');
    const [users, setUsers] = useState([]);
    const [activeUserId, setActiveUserId] = useState();
    const [footerBloqued, setFooterBloqued] = useState(false)
    const [gameFinished, setGameFinished] = useState(false)
    const [winner, setWinner] = useState({})
    // Used for keeping users cards after gameFinished
    const gameFinishedRef = useRef(gameFinished);
    gameFinishedRef.current = gameFinished;

    useEffect(() => {
        setActiveUserId(tokenService.getUserId());
    }, [activeUserId]);

    useEffect(() => {
        const activeUser = users.find((user) => user.userId === activeUserId);
        if ((activeUser && activeUser.score === 0) || users.length < 2) {
            setFooterBloqued(true);
        } else {
            setFooterBloqued(false);
        }
    }, [users, activeUserId]);

    useEffect(() => {
        // 👇️ scroll to bottom every time messages change
        lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        socket.on('typingResponse', (data) => setTypingStatus(data));
        socket.on('messageResponse', (data) => setMessages(data));
        socket.on('newUserResponse', (data) => {
            if (!gameFinishedRef.current) {
                setUsers(data)
            }
        });
        socket.on('updateUsersScores', (data) => setUsers(data));
        socket.on('gameFinished', (winner) => {
            setFooterBloqued(true);
            setWinner(winner);
            setGameFinished(true);
        });
    }, [socket]);

    const handleLeaveChat = () => {
        ServiceSocket.deleteUser(socket);
        navigate('/');
        window.location.reload();
    };

    return (
        <div className="chat">
            {gameFinished && (
                <ChatPopUp winner={winner} activeUserId={activeUserId} handleLeaveChat={handleLeaveChat} />
            )}

            <ChatBar users={users} />
            <div className="chat__main">
                <ChatBody messages={messages} typingStatus={typingStatus} lastMessageRef={lastMessageRef} onLeaveChat={handleLeaveChat} activeUserId={activeUserId} />
                <ChatFooter socket={socket} footerBloqued={footerBloqued} />
            </div>
        </div>
    );
};

export default ChatPage;
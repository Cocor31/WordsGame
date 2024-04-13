import React, { useEffect, useState } from 'react';
import UserCard from './UserCard';

const ChatBar = ({ socket }) => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        socket.on('newUserResponse', (data) => setUsers(data));
        socket.on('updateUsersScores', (data) => setUsers(data));
    }, [socket, users]);

    return (
        <div className="chat__sidebar">
            <h1>Words Game</h1>

            <div>
                <h4 className="chat__header">ACTIVE USERS</h4>
                <ul className="chat__users">
                    {users.map((user) => (
                        <UserCard key={user.userId} socketID={user.socketID} username={user.userName} users={users} photo={user.userPhoto} />
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default ChatBar;
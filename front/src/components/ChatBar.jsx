import React from 'react';
import UserCard from './UserCard';

const ChatBar = ({ users }) => {

    return (
        <div className="chat__sidebar">
            <h1>Words Game</h1>

            <div>
                <h4 className="chat__header">ACTIVE USERS</h4>
                <ul className="chat__users">
                    {users.map((user) => (
                        <UserCard key={user.userId} userName={user.userName} userScore={user.score} photo={user.userPhoto} initScore={user.initScore} />
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default ChatBar;
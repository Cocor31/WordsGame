import React from 'react';

const ChatPopUp = ({ winner, activeUserId, handleLeaveChat }) => {
    return (
        <div className="chat__popup__overlay">
            <div className="chat__popup__winner">
                <p>{winner.userId === activeUserId ? 'You Win !' : `${winner.userName} is the winner !`}</p>
                <button className="sendBtn" onClick={handleLeaveChat}>OK</button> {/* Bouton OK pour quitter le chat */}
            </div>
        </div>
    );
};

export default ChatPopUp;
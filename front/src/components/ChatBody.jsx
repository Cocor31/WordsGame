import React from 'react';

const ChatBody = ({ messages, typingStatus, lastMessageRef, onLeaveChat, activeUserId }) => {

    return (
        <>
            <header className="chat__mainHeader">
                <p>Hit your opponents with words</p>
                <button className="leaveChat__btn" onClick={onLeaveChat}>
                    LEAVE GAME
                </button>
            </header>

            <div className="message__container">
                {messages.map((message) =>
                    message.userId === activeUserId ? (
                        <div className="message__chats" key={message.id}>
                            <p className="sender__name">You</p>
                            <div className="message__sender">
                                <p>{message.text}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="message__chats" key={message.id}>
                            <p>{message.name}</p>
                            <div className="message__recipient">
                                <p>{message.text}</p>
                            </div>
                        </div>
                    )
                )}

                <div className="message__status">
                    <p>{typingStatus}</p>
                </div>
                <div ref={lastMessageRef} />
            </div>
        </>
    );
};

export default ChatBody;
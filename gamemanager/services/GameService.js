const ServiceAPI = require("./ServiceAPI");

const USERS_INIT_SCORE = parseInt(process.env.USERS_INIT_SCORE) || 100


// const getWordHit = (Word) => {
//     // To replace by fetch API
//     let hit
//     switch (Word) {
//         case "con":
//             hit = 10
//             break;
//         case "salope":
//             hit = 30
//             break;
//         case "pute":
//             hit = 40
//             break;
//         default:
//             hit = 0
//             break;
//     }

//     return hit;

// }

const getWordHit = async (Word) => {
    try {
        return await ServiceAPI.RequestWordHit(Word)
    }
    catch (error) {
        console.log('>>>>> Mot inconnu: "' + Word + '"')
        return 0
    }


}

const hitOpponentsUsers = (users, UserIdSender, hitWord) => {
    console.log("UserIdSender", UserIdSender)
    console.log("HitWord", hitWord)

    users.forEach(user => {
        if (user.userId !== UserIdSender) {
            user.score = user.score - hitWord
            if (user.score < 0) {
                user.score = 0
            }
        }
    });
    console.log("users scores :", logUsersScore(users));
    return users

}

const checkIfGameFinished = (users) => {
    let countNonZeroScoreUsers = 0;
    let winner = null;

    // Parcourir les utilisateurs pour compter ceux qui ont un score différent de zéro
    users.forEach(user => {
        if (user.score !== 0) {
            countNonZeroScoreUsers++;
            winner = user; // Enregistrer le gagnant potentiel
        }
    });

    // Si un seul joueur a un score différent de zéro, la partie est terminée
    const isGameFinished = countNonZeroScoreUsers === 1 && users.length > 1;

    return { isGameFinished, winner };
}

const saveGameResult = (users, winner) => {

    users.map(async (user) => {
        const win = user.userId === winner.userId;
        // console.log("userId:", user.userId, "score:", user.score, "win:", win)
        try {
            await ServiceAPI.RequestUpdateUserScore(user.userId, user.score, win)
        } catch (error) {
            console.log(`>>>>> Error update score in API for UserID: ${user.userId}`)

        }
    })
}

const addUserToGroup = (users, data, socketIdUser) => {

    const existingUser = users.find(user => user.userId === data.userId);

    if (existingUser) {
        console.log("User already exists in the group. User ID:", data.userId);
        return users;
    }

    users.push(
        {
            ...data,
            socketID: socketIdUser,
            score: USERS_INIT_SCORE,
            initScore: USERS_INIT_SCORE
        }
    );
    console.log('user list', logUsers(users));
    return users
}

const deleteUserFromGroup = (users, userId) => {
    console.log('User id to delete', userId);
    users = users.filter((user) => user.userId !== userId);
    console.log('user list', logUsers(users));
    return users
}

const deleteUserFromGroupWithsocket = (users, socketIdUser) => {
    console.log('User socketId to delete', socketIdUser);
    users = users.filter((user) => user.socketID !== socketIdUser);
    console.log('user list', logUsers(users));
    return users
}

const logUsers = (users) => {
    const users_info = users.map(user => {
        return {
            userId: user.userId,
            userName: user.userName
        };
    });

    return users_info;
}

const logUsersScore = (users) => {
    const users_info = users.map(user => {
        return {
            userId: user.userId,
            userName: user.userName,
            score: user.score,
        };
    });

    return users_info;
}

const GameService = {}
GameService.getWordHit = getWordHit
GameService.hitOpponentsUsers = hitOpponentsUsers
GameService.addUserToGroup = addUserToGroup
GameService.deleteUserFromGroup = deleteUserFromGroup
GameService.deleteUserFromGroupWithsocket = deleteUserFromGroupWithsocket
GameService.logUsers = logUsers
GameService.logUsersScore = logUsersScore
GameService.checkIfGameFinished = checkIfGameFinished
GameService.saveGameResult = saveGameResult

module.exports = GameService
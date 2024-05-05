/*************************/
/*** Import used modules */
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const DB = require("../db.config")
const User = DB.User

/**********************************/
/*** Unit route for Auth resource */

exports.login = async (req, res) => {
    const { email, password } = req.body
    // Check data from request
    if (!email || !password) {
        return res.status(400).json({ message: 'Bad credentials' })
    }

    try {
        // Get user
        let user = await User.findOne({ where: { email: email } })
        // Test si résultat
        if (user === null) {
            return res.status(404).json({ message: `This user does not exist !` })
        }
        // Password check  
        let test = await bcrypt.compare(password, user.password)
        if (!test) {
            return res.status(401).json({ message: 'Wrong credentials' })
        }

        // JWT generation
        const token = jwt.sign({
            payload: { userId: user.id, userName: user.pseudo, roles: JSON.parse(user.roles).roles }
        }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_DURING })

        // User public data
        const userPublicData = {
            id: user.id,
            pseudo: user.pseudo,
            photo: user.photo,
        };

        return res.json({ access_token: token, user_public_data: userPublicData })
    } catch (err) {
        console.log(err)
    }
}


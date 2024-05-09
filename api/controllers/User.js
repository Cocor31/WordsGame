/***********************************/
/*** Import des module nécessaires */
const bcrypt = require('bcrypt')
const DB = require('../db.config')
const User = DB.User
const Role = DB.Role
const ROLES_LIST = JSON.parse(process.env.ROLES_LIST)


/**********************************/
/*** Routage de la ressource User */

exports.getAllUsers = (req, res) => {
    User.findAll()
        .then(users => res.json({ data: users }))
        .catch(err => res.status(500).json({ message: 'Database Error', error: err }))
}

exports.getUser = async (req, res) => {
    let pid = parseInt(req.params.id)

    try {
        // Récupération de l'utilisateur et vérification
        let user = await User.findOne({ where: { id: pid } })
        if (user === null) {
            return res.status(404).json({ message: 'This user does not exist !' })
        }

        return res.json({ data: user })
    } catch (err) {
        return res.status(500).json({ message: 'Database Error', error: err })
    }
}

exports.getMe = async (req, res) => {
    const userId = req.userID

    try {
        // Récupération de l'utilisateur et vérification
        let user = await User.findOne({ where: { id: userId } })
        if (user === null) {
            return res.status(404).json({ message: 'This user does not exist !' })
        }

        const userPublicData = {
            id: user.id,
            email: user.email,
            pseudo: user.pseudo,
            photo: user.photo,
        };

        return res.json({ data: userPublicData })
    } catch (err) {
        return res.status(500).json({ message: 'Database Error', error: err })
    }
}

exports.addUser = async (req, res) => {
    const { pseudo, email, password, roles } = req.body

    // Validation des données reçues
    if (!pseudo || !email || !password) {
        return res.status(400).json({ message: 'Missing Data' })
    }

    // Créer une nouvelle transaction
    const transaction = await DB.sequelize.transaction();

    try {
        // Vérification si l'utilisateur existe déjà
        const existingUser = await User.findOne({ where: { email: email }, raw: true })
        if (existingUser !== null) {
            await transaction.rollback();
            return res.status(409).json({ message: `This email is already associated with a user !` })
        }

        // Hashage du mot de passe utilisateur
        let hash = await bcrypt.hash(password, parseInt(process.env.BCRYPT_SALT_ROUND))
        req.body.password = hash

        // Création utilisateur
        const newUser = await User.create(req.body, { transaction });

        // Recupère ou créer le role User
        let [role, created] = await Role.findOrCreate({
            where: { name: ROLES_LIST.user },
            transaction,
        });

        // Ajout du role à l'utilisateur
        await newUser.addRole(role, { transaction });

        // Valider la transaction
        await transaction.commit();

        return res.status(201).json({ message: 'User Created', data: newUser })

    } catch (err) {
        await transaction.rollback(); // Annuler la transaction en cas d'erreur

        if (err.name == 'SequelizeDatabaseError') {
            res.status(500).json({ message: 'Database Error', error: err })
        }
        res.status(500).json({ message: 'Hash Process Error', error: err })
    }
}

exports.updateUser = async (req, res) => {
    let pid = parseInt(req.params.id)
    const { pseudo, email, password, photo } = req.body

    try {
        // Recherche de l'utilisateur et vérification
        let user = await User.findOne({ where: { id: pid }, raw: true })
        if (user === null) {
            return res.status(404).json({ message: 'This user does not exist !' })
        }

        // récupération des données
        let userp = {}
        if (pseudo) { userp.pseudo = pseudo }
        if (email) { userp.email = email }
        if (password) {
            // Password Hash
            let hash = await bcrypt.hash(password, parseInt("process.env.BCRYPT_SALT_ROUND"))
            userp.password = hash
        }

        if (photo !== undefined) {
            userp.photo = photo;
        }

        // Mise à jour de l'utilisateur
        await User.update(userp, { where: { id: pid } })
        return res.json({ message: 'User Updated', data: { ...user, ...userp } })
    } catch (err) {
        return res.status(500).json({ message: 'Database Error', error: err })
    }
}

exports.deleteUser = async (req, res) => {
    try {
        let pid = parseInt(req.params.id)

        // Suppression
        let count = await User.destroy({ where: { id: pid } })
        // Test si résultat
        if (count === 0) {
            return res.status(404).json({ message: `This user does not exist !` })
        }
        // Message confirmation Deletion
        return res.status(200).json({ message: `User (id: ${pid} ) Successfully Deleted. ${count} row(s) deleted` })

    } catch (err) {
        return res.status(500).json({ message: `Database Error`, error: err })
    }
}


exports.getUserRoles = async (req, res) => {
    try {
        let pid = parseInt(req.params.id)

        // Récupération de l'utilisateur et vérification
        let user = await User.findOne({ where: { id: pid }, include: Role })
        if (user === null) {
            return res.status(404).json({ message: 'This user does not exist !' })
        }

        //Recupération des roles
        return res.json({
            "data": {
                "UserId": user.id,
                "roles": user.Roles.map((role) => role.name)
            }

        })
    } catch (err) {
        return res.status(500).json({ message: 'Database Error', error: err })
    }
}

exports.addUserRole = async (req, res) => {
    try {
        let pid = parseInt(req.params.id);
        let roleId = parseInt(req.params.role);

        // Récupération de l'utilisateur et vérification
        let user = await User.findOne({ where: { id: pid } });
        if (user === null) {
            return res.status(404).json({ message: 'This user does not exist !' });
        }

        // Récupération du rôle et vérification
        let role = await Role.findOne({ where: { id: roleId } });
        if (role === null) {
            return res.status(404).json({ message: 'This role does not exist !' });
        }

        // Vérification si le rôle est déjà associé à l'utilisateur
        let userRoles = await user.getRoles();
        let roleIds = userRoles.map((userRole) => userRole.id);
        if (roleIds.includes(role.id)) {
            return res.status(400).json({ message: 'This role is already associated with the user !' });
        }

        // Ajout du rôle à l'utilisateur
        await user.addRole(role);

        return res.json({ message: 'User role Updated', data: { role: role.name } });
    } catch (err) {
        return res.status(500).json({ message: 'Database Error', error: err });
    }
};

exports.deleteUserRole = async (req, res) => {
    try {
        let pid = parseInt(req.params.id);
        let roleId = parseInt(req.params.role);

        // Récupération de l'utilisateur et vérification
        let user = await User.findOne({ where: { id: pid } });
        if (user === null) {
            return res.status(404).json({ message: 'This user does not exist !' });
        }

        // Récupération du rôle et vérification
        let role = await Role.findOne({ where: { id: roleId } });
        if (role === null) {
            return res.status(404).json({ message: 'This role does not exist !' });
        }

        // Vérification si le rôle est déjà associé à l'utilisateur
        let userRoles = await user.getRoles();
        let roleIds = userRoles.map((userRole) => userRole.id);
        if (!roleIds.includes(role.id)) {
            return res.status(400).json({ message: 'This role is not associated with the user !' });
        }

        // Suppression du rôle de l'utilisateur
        await user.removeRole(role);

        return res.json({ message: 'User role Deleted', data: { role: role.name } });
    } catch (err) {
        return res.status(500).json({ message: 'Database Error', error: err });
    }
};
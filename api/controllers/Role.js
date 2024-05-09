// RoleController.js

const DB = require('../db.config');
const Role = DB.Role;

exports.getAllRoles = (req, res) => {
    Role.findAll()
        .then((roles) => res.json({ data: roles }))
        .catch((err) => res.status(500).json({ message: 'Database Error', error: err }));
};

exports.getRole = async (req, res) => {
    try {
        let rid = parseInt(req.params.id);

        let role = await Role.findOne({ where: { id: rid } });
        if (role === null) {
            return res.status(404).json({ message: 'This role does not exist !' });
        }

        return res.json({ data: role });
    } catch (err) {
        return res.status(500).json({ message: 'Database Error', error: err });
    }
};

exports.addRole = async (req, res) => {
    const { name } = req.body;

    // Validation des données reçues
    if (!name) {
        return res.status(400).json({ message: 'Missing Data' });
    }

    try {
        // Vérification si le rôle existe déjà
        const role = await Role.findOne({ where: { name: name }, raw: true });
        if (role !== null) {
            return res.status(409).json({ message: `This role is already associated with a user !` });
        }

        // Création du rôle
        const newRole = await Role.create(req.body);

        return res.status(201).json({ message: 'Role Created', data: newRole });
    } catch (err) {
        if (err.name == 'SequelizeDatabaseError') {
            res.status(500).json({ message: 'Database Error', error: err });
        }
        res.status(500).json({ message: 'Hash Process Error', error: err });
    }
};

exports.updateRole = async (req, res) => {
    try {
        let rid = parseInt(req.params.id);
        const { name } = req.body;

        // Recherche du rôle et vérification
        let role = await Role.findOne({ where: { id: rid }, raw: true });
        if (role === null) {
            return res.status(404).json({ message: 'This role does not exist !' });
        }

        // Mise à jour du rôle
        await Role.update({ name: name }, { where: { id: rid } });

        return res.json({ message: 'Role Updated', data: { ...role, name } });
    } catch (err) {
        return res.status(500).json({ message: 'Database Error', error: err });
    }
};

exports.deleteRole = async (req, res) => {
    try {
        let rid = parseInt(req.params.id);

        // Suppression
        let count = await Role.destroy({ where: { id: rid } });
        // Test si résultat
        if (count === 0) {
            return res.status(404).json({ message: `This role does not exist !` });
        }
        // Message confirmation Deletion
        return res.status(200).json({ message: `Role (id: ${rid} ) Successfully Deleted. ${count} row(s) deleted` });
    } catch (err) {
        return res.status(500).json({ message: `Database Error`, error: err });
    }
};

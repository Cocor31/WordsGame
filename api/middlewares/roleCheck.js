const roleCheck = (...authRoles) => {

    // Convertir les éléments de authRoles en chaînes de caractères
    const authRolesStrings = authRoles.map(role => role.toString());

    return (req, res, next) => {

        if (!req?.roles) {
            return res.sendStatus(403)
        }
        // console.log("roles user:", req.roles)
        // console.log("roles requis:", authRolesStrings)
        const userRolesChecks = req.roles.map(role => authRolesStrings.includes(role.toString()))
        // console.log("userRolesChecks :", userRolesChecks)
        const isAutorized = userRolesChecks.find(val => val === true)

        if (!isAutorized) {
            // S'il y a une autorisation owner on regarde si le user est le propriétaire de la donnée
            if (authRoles.includes("owner")) {
                const pid = parseInt(req.params.id)
                const userId = req.userID
                if (userId != pid) {
                    return res.sendStatus(403)
                }
            } else {
                return res.sendStatus(403)
            }
        }

        next()
    }
}
module.exports = roleCheck
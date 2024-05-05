/***********************************/
/*** Import des module nécessaires */
const express = require('express')
const userCtrl = require('../controllers/User')
const roleCheck = require("../middlewares/roleCheck")
const jwtCheck = require("../middlewares/jwtCheck")

const ROLES_LIST = JSON.parse(process.env.ROLES_LIST)

/***************************************/
/*** Récupération du routeur d'express */
let router = express.Router()

/*********************************************/
/*** Middleware pour logger dates de requete */


/**********************************/
/*** Routage de la ressource User */
// router.get('/', jwtCheck, roleCheck(ROLES_LIST.modo, ROLES_LIST.admin), userCtrl.getAllUsers)   
router.get('/', userCtrl.getAllUsers)

router.get('/:id([0-9]+)', jwtCheck, roleCheck(ROLES_LIST.modo, ROLES_LIST.admin, "owner"), userCtrl.getUser)

router.get('/me', jwtCheck, userCtrl.getMe)

router.put('', jwtCheck, roleCheck(ROLES_LIST.modo, ROLES_LIST.admin), userCtrl.addUser)
// router.put('', userCtrl.addUser)

router.patch('/:id([0-9]+)', jwtCheck, roleCheck(ROLES_LIST.modo, ROLES_LIST.admin, "owner"), userCtrl.updateUser)
router.delete('/:id([0-9]+)', jwtCheck, roleCheck(ROLES_LIST.admin), userCtrl.deleteUser)

router.get('/:id([0-9]+)/roles', jwtCheck, roleCheck(ROLES_LIST.modo, ROLES_LIST.admin), userCtrl.getUserRoles)
router.put('/:id([0-9]+)/roles/:role', jwtCheck, roleCheck(ROLES_LIST.admin), userCtrl.addUserRole)
router.delete('/:id([0-9]+)/roles/:role', jwtCheck, roleCheck(ROLES_LIST.admin), userCtrl.deleteUserRole)
module.exports = router
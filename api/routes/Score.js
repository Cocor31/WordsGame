/***********************************/
/*** Import des module nécessaires */
const express = require('express')
const scoreCtrl = require('../controllers/Score')
const roleCheck = require("../middlewares/roleCheck")
const jwtCheck = require("../middlewares/jwtCheck")

const ROLES_LIST = JSON.parse(process.env.ROLES_LIST)

/***************************************/
/*** Récupération du routeur d'express */
let router = express.Router()

/*********************************************/
/*** Middleware pour logger dates de requete */


/**********************************/
/*** Routage de la ressource Score */


router.patch('/:user_id([0-9]+)', scoreCtrl.updateScore) //jwtCheck, roleCheck(ROLES_LIST.modo, ROLES_LIST.admin, "owner")

module.exports = router
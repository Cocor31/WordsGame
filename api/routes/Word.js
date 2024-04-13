/***********************************/
/*** Import des module nécessaires */
const express = require('express')
const wordCtrl = require('../controllers/Word')
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
router.get('/', jwtCheck, wordCtrl.getAllWords)
router.get('/:id([0-9]+)', jwtCheck, wordCtrl.getWord) // roleCheck(ROLES_LIST.user, ROLES_LIST.modo, ROLES_LIST.admin),
router.put('/', jwtCheck, wordCtrl.addWord) // roleCheck(ROLES_LIST.modo, ROLES_LIST.admin)
router.patch('/:id([0-9]+)', jwtCheck, wordCtrl.updateWord) // roleCheck(ROLES_LIST.modo, ROLES_LIST.admin),
router.delete('/:id([0-9]+)', jwtCheck, wordCtrl.deleteWord) // roleCheck(ROLES_LIST.admin)

router.post('/hit', wordCtrl.getWordHit)
module.exports = router
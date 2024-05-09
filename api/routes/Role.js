/***********************************/
/*** Import des module nécessaires */
const express = require('express');
const roleCtrl = require('../controllers/Role');
const jwtCheck = require('../middlewares/jwtCheck');
const roleCheck = require('../middlewares/roleCheck');

const ROLES_LIST = JSON.parse(process.env.ROLES_LIST);

/***************************************/
/*** Récupération du routeur d'express */
let router = express.Router();

/*********************************************/
/*** Middleware pour logger dates de requete */


/**********************************/
/*** Routage de la ressource Role */

router.get('/', jwtCheck, roleCheck(ROLES_LIST.modo, ROLES_LIST.admin), roleCtrl.getAllRoles);
router.get('/:id([0-9]+)', jwtCheck, roleCheck(ROLES_LIST.modo, ROLES_LIST.admin), roleCtrl.getRole);
router.post('/', jwtCheck, roleCheck(ROLES_LIST.modo, ROLES_LIST.admin), roleCtrl.addRole);
router.patch('/:id([0-9]+)', jwtCheck, roleCheck(ROLES_LIST.modo, ROLES_LIST.admin), roleCtrl.updateRole);
router.delete('/:id([0-9]+)', jwtCheck, roleCheck(ROLES_LIST.modo, ROLES_LIST.admin), roleCtrl.deleteRole);

module.exports = router;
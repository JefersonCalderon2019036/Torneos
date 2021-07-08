'use strict'

var express = require('express');
var ligaController = require('../controllers/liga.controller')
var mdAuth = require('../middlewares/authenticated');
var connectMultiparty = require('connect-multiparty');
const upload = connectMultiparty({uploadDir: './uploads/user'})

var api = express.Router();

api.post('/createLiga/:idU', [mdAuth.ensureAuth], ligaController.createLiga)
api.get('/getTeams/:idL', [mdAuth.ensureAuth],ligaController.getTeams)
api.get('/getLiga/:idUser', [mdAuth.ensureAuth], ligaController.getLiga)
api.get('/getlIGAiD/:idUser', [mdAuth.ensureAuth], ligaController.getlIGAiD)
api.get('/getLigasAdmin/', [mdAuth.ensureAuth, mdAuth.ensureAuthAdmin], ligaController.getLigasAdmin)
api.put('/:idU/updateLiga/:idL', mdAuth.ensureAuth, ligaController.updateLiga)
api.put('/:idU/deleteLiga/:idL', mdAuth.ensureAuth, ligaController.deleteLiga)
api.put('/updateLigaAdmin/:idL', mdAuth.ensureAuth, ligaController.updateLigaAdmin)
api.delete('/deleteLigaAdmin/:idL', mdAuth.ensureAuth, ligaController.deleteLigaAdmin)
module.exports = api;
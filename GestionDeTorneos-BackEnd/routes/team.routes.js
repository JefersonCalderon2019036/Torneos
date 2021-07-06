'use strict'

var express = require('express');
var teamController = require('../controllers/team.controller');
var mdAuth = require('../middlewares/authenticated');
var connectMultiparty = require('connect-multiparty');
const upload = connectMultiparty({uploadDir: './uploads/team'})

var api = express.Router();

api.post('/:idL/saveTeam/:idU', [mdAuth.ensureAuth], teamController.createTeam);
api.put('/:idU/updateTeam/:idL/:idT', [mdAuth.ensureAuth], teamController.updateTeam)
api.put('/:idU/deleteTeam/:idL/:idT', [mdAuth.ensureAuth], teamController.deleteTeam)

module.exports = api;
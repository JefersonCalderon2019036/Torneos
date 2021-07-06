'use strict'

var express = require('express');
var marcadorController = require('../controllers/marcador.controller');
var mdAuth = require('../middlewares/authenticated');

var api = express.Router();

api.put('/setMarcador/:e1/:e2/:liga', marcadorController.setMarcador);

module.exports = api;
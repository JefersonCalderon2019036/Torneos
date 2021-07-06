'use strict'

var mongoose = require('mongoose')
var Schema = mongoose.Schema

var teamSchema = Schema({
    name:String,
    logo:String,
    country: String,
    golesFavor:Number,
    golesContra:Number,
    golesDiferencia:Number,
    partidos:Number,
    puntos:Number,
})

module.exports = mongoose.model('team', teamSchema);
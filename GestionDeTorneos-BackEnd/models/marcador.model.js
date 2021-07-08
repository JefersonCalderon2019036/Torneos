'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var marcadorSchema = Schema({
    jornada: Number,
    nameEquipo1: String,
    nameEquipo2: String,
    goles1: Number,
    goles2: Number,
    equipo1: [{type: Schema.ObjectId, ref:'team'}],
    equipo2: [{type: Schema.ObjectId, ref:'team'}],
    liga: [{type: Schema.ObjectId, ref:'liga'}]
})

module.exports = mongoose.model('marcador', marcadorSchema);
'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var marcadorSchema = Schema({
    jornada: Number,
    //equipo1: String,
    //equipo2: String,
    goles1: Number,
    goles2: Number,
    equipo1: [{type: Schema.ObjectId, ref:'team'}],
    equipo2: [{type: Schema.ObjectId, ref:'team'}]
})

module.exports = mongoose.model('marcador', marcadorSchema);
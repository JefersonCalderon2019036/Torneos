'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ligaSchema = Schema({
    name: String,
    descripcion:String,
    image:String,
    teamCount:Number,
    teams: [{type: Schema.ObjectId, ref:'team'}],
});

module.exports = mongoose.model('liga', ligaSchema)
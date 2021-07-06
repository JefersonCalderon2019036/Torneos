'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = Schema({
    name: String,
    lastname: String,
    username: String,
    password: String,
    email: String,
    image:String,
    role: String,
    ligas: [{type: Schema.ObjectId, ref: 'liga'}]
});

module.exports =  mongoose.model('user', userSchema);
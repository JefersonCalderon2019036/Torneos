'use strict'

var jwt = require('jwt-simple');
var moment = require('moment');
var secretKey = 'grupo1';

exports.ensureAuth = (req, res, next)=>{
    if(!req.headers.authorization){
        return res.status(403).send({message: 'La petición no lleva cabecera de autenticación'})
    }else{
        var token = req.headers.authorization.replace(/['"']+/g, '');
        try{
            var payload = jwt.decode(token, secretKey);
            if(payload.exp <= moment().unix()){
                return res.status(401).send({message: 'Token ha expirado'})
            }
        }catch(err){
            return res.status(404).send({message: 'Token inválido'})
        }

        req.user = payload;
        next();
    }
}

exports.ensureAuthAdmin = (req, res, next)=>{
    var payload = req.user;
        
    if(payload.role != 'ROLE_ADMIN'){
        return res.status(404).send({message: 'No tienes permiso para ingresar a esta ruta'})
    }else{
       return next(); 
    }
}

exports.ensureAuthCaptain = (req, res, next)=>{
    var payload = req.user;
        
    if(payload.role != 'ROLE_CAPTAIN'){
        return res.status(404).send({message: 'No tienes permiso para ingresar a esta ruta'})
    }else{
       return next(); 
    }
}
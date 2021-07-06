'use strict'

var Liga = require('../models/liga.model')
var Team = require('../models/team.model')
var User = require('../models/user.model')
var fs = require('fs');
var path = require('path');
const { exec } = require('child_process');

function createLiga(req, res) {
    var liga = new Liga();
    var params = req.body;
    var userId = req.params.idU

    if (userId != req.user.sub) {
        return res.send({ message: 'No tienes permiso para agregar una liga' })
    } else {
        User.findById(userId, (err, userFind) => {
            if (err) {
                return res.status(500).send({ message: 'Error general' })
            } else if (userFind) {
                if (params.name && params.descripcion) {
                    Liga.findOne({ name: params.name }, (err, ligaFind) => {
                        if (err) {
                            res.status(500).send({ message: "Error general" })
                        } else if (ligaFind) {
                            res.send({ message: "Nombre de liga ya en uso" })
                        } else {
                            liga.name = params.name;
                            liga.descripcion = params.descripcion;
                            liga.teamCount = 0;
                            liga.image = params.image;
                            liga.save((err, ligaSaved) => {
                                if (err) {
                                    res.status(500).send({ message: 'Error general' })
                                } else if (ligaSaved) {
                                    User.findByIdAndUpdate(userId, { $push: { ligas: ligaSaved._id } }, { new: true }, (err, ligaPush) => {
                                        if (err) {
                                            return res.status(500).send({ message: 'Error general' })
                                        } else if (ligaPush) {
                                            return res.send({ message: 'Liga agregada con éxito!', ligaPush })
                                        } else {
                                            return res.send({ message: 'No se agregó la liga' })
                                        }
                                    })
                                } else {
                                    res.send({ message: 'No se guado el equipo' });
                                }
                            })
                        }
                    })
                } else {
                    res.send({ message: "Ingresa todos los datos obligatorios" })
                }
            } else {

            }
        })
    }
}

function updateLiga(req, res) {
    let userId = req.params.idU;
    let ligaId = req.params.idL
    let update = req.body;

    if (userId != req.user.sub) {
        return res.send({ message: 'No tienes permiso para realizar esta acción' })
    } else {
        User.findById(userId, (err, userFind) => {
            if (err) {
                return res.status(500).send({ message: 'Error general' })
            } else if (userFind) {
                if (update.name) {
                    Liga.findOne({ name: update.name }, (err, ligaFinded) => {
                        if (err) {
                            return res.status(500).send({ message: 'Error general' })
                        } else if (ligaFinded) {
                            return res.send({ message: 'Nombre de liga ya en uso' })
                        } else {
                            Liga.findById(ligaId, (err, ligaFind) => {
                                if (err) {
                                    res.status(500).send({ message: 'Error general' })
                                } else if (ligaFind) {
                                    User.findOne({ _id: userId, ligas: ligaId }, (err, userFind) => {
                                        if (err) {
                                            return res.status(500).send({ message: 'Error general' })
                                        } else if (userFind) {
                                            Liga.findByIdAndUpdate(ligaId, update, { new: true }, (err, ligaUpdated) => {
                                                if (err) {
                                                    return res.status(500).send({ message: 'Error general' })
                                                } else if (ligaUpdated) {
                                                    return res.send({ message: 'Liga actualizada: ', ligaUpdated })
                                                } else {
                                                    return res.send({ message: 'Liga no actualizada' })
                                                }
                                            })
                                        } else {
                                            return res.status(404).send({ message: 'Usuario no encontrado' })
                                        }
                                    })
                                } else {
                                    return res.status(404).send({ message: 'No se econtró la liga' })
                                }
                            })
                        }
                    })
                } else {
                    return res.send({ message: 'Ingresa todos los datos obligatorios' })
                }
            } else {
                return res.status(404).send({ message: 'Usuario no encontrado' })
            }
        })
    }
}

function deleteLiga(req, res) {
    let userId = req.params.idU;
    let ligaId = req.params.idL;

    if (userId != req.user.sub) {
        return res.status(500).send({ message: 'No tienes permiso para realizar esta accion' })
    } else {
        User.findByIdAndUpdate({ _id: userId, ligas: ligaId },
            { $pull: { ligas: ligaId } }, { new: true }, (err, ligaPull) => {
                if (err) {
                    return res.status(500).send({ message: 'Error general' })
                } else if (ligaPull) {
                    Liga.findOneAndRemove(ligaId, (err, ligaRemoved) => {
                        if (err) {
                            return res.status(500).send({ message: 'Error general' })
                        } else if (ligaRemoved) {
                            return res.send({ message: 'Liga eliminada', ligaPull })
                        } else {
                            return res.send({ message: 'No se eliminó la liga' })
                        }
                    })
                } else {
                    return res.status(500).send({ message: 'No se pudo eliminar la liga' })
                }
            }).populate('ligas')
    }
}


/*function addTeams(req, res){
    var ligaId = req.params.id
    var params = req.body
    let team = params._id

    Team.findById(team, (err, teamFind)=>{
        if(err){
            res.status(500).send({message: 'Error general'})
        }else if(teamFind){
            Liga.findById(ligaId, (err, ligaFind)=>{
                if(err){
                    res.status(500).send({message: 'Error general'})
                }else if(ligaFind){
                    if(ligaFind.teamCount > 10){
                        res.send({message: 'No se pueden tener más de 10 equipos en una liga'})
                    }else{
                        var liga = ligaFind.teamCount ++;
                        let team = teamFind
                        
                        Liga.findByIdAndUpdate({_id: ligaId}, {$push:{teams: team._id}, liga}, {new: true}, (err, teamSaved)=>{
                            if(err){
                                res.status(500).send({message: 'Error general al guardar el team'})
                            }else if(teamSaved){
                                Liga.findByIdAndUpdate(ligaId, {$inc:{teamCount: +1}}, {new:true}, (err, aumento)=>{
                                    if(err){
                                        res.send({message: 'Error al incrementar'})
                                    }else if(aumento){
                                        res.send({message: 'Team agregado', aumento})
                                    }else{
                                        res.send({message:'No se incremento'})
                                    }
                                })
                            }else{
                                res.send({message: 'no se guardó el team'})
                            }
                        })
                    }
                }else{
                    res.status(404).send({message: 'Liga no encontrada'})
                }
            })
        }else{
            res.status(404).send({message: 'Team no encontrado'})
        }
    })
}*/

function getTeams(req, res) {
    var ligaId = req.params.idL;

    Liga.findById(ligaId).populate({
        path: 'teams',
        populate: {
            path: 'liga',
        }
    }).exec((err, teams) => {
        if (err) {
            res.status(500).send({ message: 'Error al buscar Equipos' })
        } else if (teams) {
            res.status(200).send({ message: 'Equipos de la Liga', teams })
        } else {
            return res.status(404).send({ message: 'No hay registros de equipos' })
        }
    })
}

module.exports = {
    createLiga,
    getTeams,
    updateLiga,
    deleteLiga,
}
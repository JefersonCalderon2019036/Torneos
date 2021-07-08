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
                            liga.name = params.name;
                            liga.descripcion = params.descripcion;
                            liga.teamCount = 0;
                            liga.image = 'https://www.soyfutbol.com/__export/1618078302464/sites/debate/img/2021/04/10/la_liga_espaxa_tabla_posiciones_clasificacixn_general_fc_barcelona_real_madrid_atletico_madrid_crop1618078261996.jpg_1902800913.jpg';
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
                    res.send({ message: 'No se guado el equipo' });
                }
            })
        }
    })
}

function updateLiga(req, res) {
    let userId = req.params.idU;
    let ligaId = req.params.idL
    let update = req.body;

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

function getlIGAiD(req, res) {
    var idUser = req.params.idUser
    Liga.findOne({$or: [{_id: idUser}]}).exec((err, LigaGest)=>{
        if(err) return res.status(500).send({mensaje: 'Error en la peticion de busqueda'})
        if(!LigaGest) return res.status(404).send({message: 'No se encontra ninguna liga'})
        return res.status(200).send(LigaGest)
    })
}

function getLiga(req, res) {
    var idUser = req.params.idUser
    User.findOne({ $or: [{ _id: idUser }] }).exec((err, userGetId) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion busqueda del usuario' })
        if (!userGetId) return res.status(404).send({ mensaje: 'Error al obtener los datos del usuario' })
        Liga.find({}).exec((err, ligaFind) => {
            if (err) return res.status(500).send({ message: 'Error en la petición de busqueda' })
            if (!ligaFind) return res.status(404).send({ mensaje: 'No se a podido obtener las ligas' })
            return res.status(200).send(ligaFind)
        })

    })
}

function getLigasAdmin(req, res) {
    Liga.find({}).exec((err, users) => {
        if (err) {
            res.status(500).send({ message: 'Error general al buscar usuarios' });
        } else if (users) {
            res.status(200).send(users);
        } else {
            res.send({ message: 'No existe ningun usuario' })
        }
    })
}

function updateLigaAdmin(req, res) {
    var ligaId = req.params.idL
    var params = req.body

    if (req.user.role != "ROLE_ADMIN") {
        return res.status(500).send({ mensaje: 'No eres administrador no puedes editar esta liga' })
    }

    Liga.findByIdAndUpdate(ligaId, params, { new: true }, (err, updateLiga) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
        if (!updateLiga) return res.status(404).send({ mensaje: 'No se puede atualizar liga' })

        return res.status(200).send(updateLiga)
    })

}

function deleteLigaAdmin(req, res) {
    var ligaId = req.params.idL

    if (req.user.role != "ROLE_ADMIN") {
        return res.status(500).send({ mensaje: 'No eres administrador no puedes editar esta liga' })
    }

    Liga.findByIdAndDelete(ligaId, (err, ligaDelete) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' })
        if (!ligaDelete) return res.status(200).send({ mensaje: 'No se ha podido eliminar la liga' })

        return res.status(200).send({ mensaje: 'Se elemino de forma correcta la liga con id:' + ligaId })
    })


}

module.exports = {
    createLiga,
    getTeams,
    updateLiga,
    deleteLiga,
    getLiga,
    getLigasAdmin,
    deleteLigaAdmin,
    updateLigaAdmin,
    getlIGAiD
}
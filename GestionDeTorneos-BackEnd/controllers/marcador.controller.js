'use strict'

var Team = require('../models/team.model');
var Marcador = require('../models/marcador.model');
var Liga = require('../models/liga.model');
var jwt = require('../services/jwt');

function setMarcador(req, res) {
    var marcador = new Marcador();
    var params = req.body;
    var nombreEquipo1 = req.body.nameEquipo1;
    var nombreEquipo2 = req.body.nameEquipo2;
    var LigaTeam = req.params.liga;
    Team.find({name: nombreEquipo1}, (err, teamFind) => {
        console.log(teamFind)
        if (err) {
            res.status(500).send({ message: 'Error' })
        } else if (teamFind) {
            Team.find({name: nombreEquipo2}, (err, teamFind2) => {
                if (err) {
                    res.status(500).send({ message: 'Error' })
                } else if (teamFind2) {
                    if (params.jornada && params.goles1 && params.goles2) {
                        if (params.goles1 < 0 || params.goles2 < 0 || params.jornada <= 0 || params.jornada > 9) {
                            res.status(500).send({ message: 'Ingrese datos mayores o iguales a 0' })
                        } else {
                            Liga.findById(LigaTeam, (err, ligaFind) => {
                                if (err) {
                                    return res.status(500).send({ message: 'Error general' })
                                } else if (ligaFind) {
                                    var jornadaLimite = ligaFind.teamCount - 1;
                                    if (jornadaLimite < params.jornada) {
                                        res.status(500).send({ message: 'La cantidad de jornadas debe de ser menor a la cantidad de equipos.' })
                                    } else {
                                        console.log(jornadaLimite);
                                        console.log(params.jornada);
                                        marcador.jornada = params.jornada;
                                        marcador.nameEquipo1 = nombreEquipo1;
                                        marcador.nameEquipo2 = nombreEquipo2;
                                        marcador.goles1 = params.goles1;
                                        marcador.goles2 = params.goles2;
                                        marcador.equipo1 = teamFind;
                                        marcador.equipo2 = teamFind2;
                                        marcador.liga = LigaTeam;

                                        var diferencia1 = marcador.goles1 - marcador.goles2;
                                        var diferencia2 = marcador.goles2 - marcador.goles1;
                                        var puntos1;
                                        var puntos2;

                                        if (marcador.goles1 > marcador.goles2) {
                                            puntos1 = 3;
                                            puntos2 = 0;
                                        } else if (marcador.goles1 < marcador.goles2) {
                                            puntos2 = 3;
                                            puntos1 = 0;
                                        } else {
                                            puntos1 = 1;
                                            puntos2 = 1;
                                        }

                                        marcador.save((err, marcadorSaved) => {
                                            if (err) {
                                                res.status(500).send({ message: 'Error general' })
                                            } else if (marcadorSaved) {
                                                Team.findByIdAndUpdate(teamFind, { $inc: { golesFavor: marcador.goles1 } }, { new: true }, (err, aumento) => {
                                                })

                                                Team.findByIdAndUpdate(teamFind, { $inc: { golesContra: marcador.goles2 } }, { new: true }, (err, aumento) => {
                                                })

                                                Team.findByIdAndUpdate(teamFind2, { $inc: { golesFavor: marcador.goles2 } }, { new: true }, (err, aumento) => {
                                                })

                                                Team.findByIdAndUpdate(teamFind2, { $inc: { golesContra: marcador.goles1 } }, { new: true }, (err, aumento) => {
                                                })

                                                Team.findByIdAndUpdate(teamFind, { $inc: { partidos: 1 } }, { new: true }, (err, aumento) => {
                                                })

                                                Team.findByIdAndUpdate(teamFind2, { $inc: { partidos: 1 } }, { new: true }, (err, aumento) => {
                                                })

                                                Team.findByIdAndUpdate(teamFind, { $inc: { golesDiferencia: diferencia1 } }, { new: true }, (err, aumento) => {
                                                })

                                                Team.findByIdAndUpdate(teamFind2, { $inc: { golesDiferencia: diferencia2 } }, { new: true }, (err, aumento) => {
                                                })

                                                Team.findByIdAndUpdate(teamFind, { $inc: { puntos: puntos1 } }, { new: true }, (err, aumento) => {
                                                })

                                                Team.findByIdAndUpdate(teamFind2, { $inc: { puntos: puntos2 } }, { new: true }, (err, aumento) => {
                                                })

                                                res.send({ message: 'Marcador añadido', marcadorSaved })

                                            } else {
                                                res.status(500).send({ message: 'No se guardo el marcador' })
                                            }
                                        })
                                    }
                                } else {
                                    res.status(500).send({ message: 'No se encontro la liga' })
                                }
                            })

                        }
                    } else {
                        res.send({ message: 'Ingrese datos completos' })
                    }
                } else {
                    res.status(500).send({ message: 'No existe el equipo en la liga D:' })
                }
            })
        } else {
            res.status(500).send({ message: 'No se encuentra el equipo D:' })
        }
    })
}

function getMarcadores(req, res) {
    Marcador.find({}).exec((err, users) => {
        if (err) {
            res.status(500).send({ message: 'Error general al buscar marcadores' });
        } else if (users) {
           res.status(200).send(users);
        } else {
            res.send({ message: 'No existe ningun marcador' })
        }
    })
}

function getMarcadoresLiga(req, res) {
    var idLiga = req.params.idL;
    Marcador.find({liga: idLiga}).exec((err, users) => {
        if (err) {
            res.status(500).send({ message: 'Error general al buscar marcadores' });
        } else if (users) {
           res.status(200).send(users);
        } else {
            res.send({ message: 'No existe ningun marcador' })
        }
    })
}

module.exports = {
    setMarcador,
    getMarcadores,
    getMarcadoresLiga
}
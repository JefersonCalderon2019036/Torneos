'use strict'

var User = require('../models/user.model');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('../services/jwt');
var fs = require('fs');
var path = require('path');
const { update, findByIdAndUpdate } = require('../models/user.model');


function createInit(req, res) {
    let user = new User();
    User.findOne({ username: 'admin' }, (err, found) => {
        if (err) {
            console.log('Error al crear al usuario', err)
        } else if (found) {
            console.log('Usuario administrador ya creado')
        } else {
            user.password = '123456';
            user.role = 'ROLE_ADMIN';
            user.image = 'https://th.bing.com/th/id/OIP.G2F2-_qZDHU44SuyZYASowHaEn?pid=ImgDet&rs=1';


            bcrypt.hash(user.password, null, null, (err, passwordHash) => {
                if (err) {
                    console.log('Error al encriptar la contraseña', err)
                } else if (passwordHash) {
                    user.username = 'admin';
                    user.password = passwordHash;
                    user.save((err, userSaved) => {
                        if (err) {
                            console.log('Error al crear el usuario', err)
                        } else if (userSaved) {
                            console.log('Usuario creado', userSaved)
                        } else {
                            console.log('Usuario no creado')
                        }
                    })
                } else {
                    console.log('No se creo el usuario')
                }
            })
        }
    })
}

function login(req, res) {
    var params = req.body;

    if (params.username && params.password) {
        User.findOne({ username: params.username.toLowerCase() }, (err, userFind) => {
            if (err) {
                return res.status(500).send({ message: 'Error general' });
            } else if (userFind) {
                bcrypt.compare(params.password, userFind.password, (err, checkPassword) => {
                    if (err) {
                        return res.status(500).send({ message: 'Error general en la verificación de la contraseña' });
                    } else if (checkPassword) {
                        delete userFind.password
                            return res.send({ token: jwt.createToken(userFind), user: userFind });
                    } else {
                        return res.status(401).send({ message: 'Contrasea incorrecta' });
                    }
                })
            } else {
                return res.send({ message: 'Username incorrecto' });
            }
        })
    } else {
        return res.status(401).send({ message: 'Por favor ingresa los datos obligatorios' });
    }
}


function register(req, res) {
    var user = new User();
    var params = req.body;

    if (params.name && params.username && params.email && params.password) {
        User.findOne({ username: params.username }, (err, userFind) => {
            if (err) {
                return res.status(500).send({ message: 'Error general en el servidor' });
            } else if (userFind) {
                return res.send({ message: 'Usuario ya existente' });
            } else {
                bcrypt.hash(params.password, null, null, (err, passwordHash) => {
                    if (err) {
                        return res.status(500).send({ message: 'Error general en la encriptación' });
                    } else if (passwordHash) {
                        user.password = passwordHash;
                        user.name = params.name;
                        user.lastname = params.lastname;
                        user.username = params.username.toLowerCase();
                        user.email = params.email.toLowerCase();
                        user.role = 'ROLE_USER';
                        user.image = 'https://th.bing.com/th/id/OIP.G2F2-_qZDHU44SuyZYASowHaEn?pid=ImgDet&rs=1';


                        user.save((err, userSaved) => {
                            if (err) {
                                return res.status(500).send({ message: 'Error general al guardar' });
                            } else if (userSaved) {
                                return res.send({ message: 'Usuario guardado', userSaved });
                            } else {
                                return res.status(500).send({ message: 'No se guardó el usuario' });
                            }
                        })
                    } else {
                        return res.status(401).send({ message: 'Contraseña no encriptada' });
                    }
                })
            }
        })
    } else {
        return res.send({ message: 'Favor de ingresar todos los campos' });
    }
}

function saveUser(req, res) {
    var userId = req.params.idU;
    var user = new User();
    var params = req.body;

    if (userId != req.user.sub) {
        res.status(403).send({ message: 'No tienes permisos para acceder a esta ruta' })
    } else {
        if (params.name && params.username && params.email && params.password && params.role) {
            User.findOne({ username: params.username }, (err, userFind) => {
                if (err) {
                    return res.status(500).send({ message: 'Error general en el servidor' });
                } else if (userFind) {
                    return res.send({ message: 'Usuario ya existente' });
                } else {
                    bcrypt.hash(params.password, null, null, (err, passwordHash) => {
                        if (err) {
                            return res.status(500).send({ message: 'Error general en la encriptación' });
                        } else if (passwordHash) {
                            user.password = passwordHash;
                            user.name = params.name;
                            user.lastname = params.lastname;
                            user.username = params.username.toLowerCase();
                            user.email = params.email.toLowerCase();
                            user.role = params.role;

                            user.save((err, userSaved) => {
                                if (err) {
                                    return res.status(500).send({ message: 'Error general al guardar' });
                                } else if (userSaved) {
                                    return res.send({ message: 'Usuario guardado', userSaved });
                                } else {
                                    return res.status(500).send({ message: 'No se guardó el usuario' });
                                }
                            })
                        } else {
                            return res.status(401).send({ message: 'Contraseña no encriptada' });
                        }
                    })
                }
            })
        } else {
            return res.send({ message: 'Favor de ingresar todos los campos' });
        }
    }
}

function updateUser(req, res) {
    let userId = req.params.idU;
    let data = req.body;

    if (userId != req.user.sub) {
        res.status(403).send({ message: 'No tienes permisos para actualizar otro usuario' });
    } else {
        if (data.password || data.role) {
            res.status(403).send({ message: 'No es posible actualizar contraseña o role del usuario' });
        } else {
            if (data.username) {
                User.findOne({ username: data.username.toLowerCase() }, (err, userFind) => {
                    if (err) {
                        res.status(500).send({ message: 'Error general' })
                        console.log(err)
                    } else if (userFind) {
                        if (userFind._id == req.user.sub) {
                            User.findByIdAndUpdate(userId, data, { new: true }, (err, userUpdated) => {
                                if (err) {
                                    res.status(500).send({ message: 'Error general al actualizar' });
                                    console.log(err);
                                } else if (userUpdated) {
                                    res.send({ message: 'Usuario actualizado', userUpdated });
                                } else {
                                    res.send({ message: 'No se actualizo el usuario' });
                                }
                            })
                        } else {
                            res.send({ message: "Nombre de usuario ya en uso" })
                        }
                    } else {
                        User.findByIdAndUpdate(userId, data, { new: true }, (err, userUpdated) => {
                            if (err) {
                                res.status(500).send({ message: 'Error general al actualizar' });
                                console.log(err);
                            } else if (userUpdated) {
                                res.send({ message: 'Usuario actualizado', userUpdated });
                            } else {
                                res.send({ message: 'No se actualizo el usuario' });
                            }
                        })
                    }
                })
            } else {
                User.findByIdAndUpdate(userId, data, { new: true }, (err, userUpdated) => {
                    if (err) {
                        res.status(500).send({ message: 'Error general al actualizar' });
                        console.log(err);
                    } else if (userUpdated) {
                        res.send({ message: 'Usuario actualizado', userUpdated });
                    } else {
                        res.send({ message: 'No se actualizo el usuario' });
                    }
                })
            }
        }
    }
}

function deleteUser(req, res) {
    let userId = req.params.idU;

    User.findByIdAndRemove(userId, (err, userRemoved) => {
        if (err) {
            res.status(500).send({ message: 'Error general al eliminar el usuario' });
            console.log(err);
        } if (userRemoved) {
            res.send({ message: 'Usuario eliminado', userRemoved })
        } else {
            res.send({ message: 'Usuario no eliminado' });
        }
    })
}

function getUsers(req, res) {
    User.find({}).exec((err, users) => {
        if (err) {
            res.status(500).send({ message: 'Error general al buscar usuarios' });
        } else if (users) {
           res.status(200).send(users);
        } else {
            res.send({ message: 'No existe ningun usuario' })
        }
    })
}

function deleteUserAdmin (req, res){
    var idUser = req.params.idU

    if(req.user.role != "ROLE_ADMIN"){
        return res.status(404).send({mensaje: 'No eres administrador, no puedes editar este usuario'})
    }

    User.findByIdAndDelete(idUser, (err, userDelete) =>{
        if(err) return res.status(500).send({mensaje: 'Error en la peticion'})
        if(!userDelete) return res.status(200).send({mensaje: 'No se ha podido eliminar usuario'})

        return res.status(200).send({mensaje: 'Se elemino de forma correcta el usuario con id:' + idUser})
    })
}

function updateUserAdmin (req, res){
    var idUser = req.params.idU
    var params = req.body
    delete params.password
    if(req.user.role != "ROLE_ADMIN"){
        return res.status(404).send({mensaje: 'No eres administrador, no puedes editar este usuario'})
    }
    User.findByIdAndUpdate(idUser, params, {new: true}, (err, userUpdate)=>{
        if(err) return res.status(500).send({mensaje: 'Error en la peticion'})
        if(!userUpdate) return res.status(404).send({mensaje: 'No se ha podido actualizar el usuario'})

        return res.status(200).send(userUpdate)
    })
}

function getUserId (req, res){
    var idUser = req.params.idU

    User.findOne({$or: [{_id: idUser}]}).exec((err, userGetId)=>{
        if(err) return res.status(500).send({mensaje: 'Error en la peticion'})
        if(!userGetId) return res.status(404).send({mensaje: 'Error al obtener los datos del usuario'})
        return res.status(200).send(userGetId)
    })
}

module.exports = {
    createInit,
    register,
    login,
    saveUser,
    updateUser,
    deleteUser,
    getUsers,
    deleteUserAdmin,
    updateUserAdmin,
    getUserId
}

'use strict'

var express = require('express');
var bodyParser = require('body-parser');
var userRoutes = require('./routes/user.routes');
var teamRoutes = require('./routes/team.routes')
var ligaRoutes = require('./routes/liga.routes')
var marcadorRoutes = require('./routes/marcador.routes');
var cors = require('cors');

var app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors());

/*app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
	res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
	res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
	next();
});*/

app.use('/api', userRoutes);
app.use('/api', teamRoutes);
app.use('/api', ligaRoutes);
app.use('/api', marcadorRoutes)


module.exports = app;
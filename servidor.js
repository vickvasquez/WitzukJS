var express = require('express'),
	app 	= express(),
	session = require('express-session'),
	http 	= require ('http'),
	server  = http.createServer(app);
	logger  = require('morgan')

var mensajes = require('./controllers/chatController');
	mensajes(server);	

	app.use( logger('dev') );
	app.use( session({
		secret: 'myllavesecreta',
		resave: true,
		saveUninitialized: true
	})) ;

	app.get('/',function (req,res){
		res.write('Servidor corriendo con express');
		res.end();
	});

	server.listen(3000, function() {
		console.log('Servidor corriendo en el puerto');
	});

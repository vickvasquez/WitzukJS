var express = require('express'),
	passport = require('passport'),
	cookieParser = require('cookie-parser'),
	bodyParser = require('body-parser'),
	methodOverride = require('method-override'),
	session = require('express-session'),
	favicon = require('serve-favicon'),
	logger = require('morgan'),
	errorHandler = require('errorhandler'),
	http = require('http'),
	app = express(),
	path = require('path'),
	// helmet = require('helmet'),
	sessionStore = new session.MemoryStore(),
	server = http.createServer(app);

var conf = require('./app/config/config'),
	mensajes = require('./app/config/io');
//Se invoca el modelo de usuarios
require('./app/models/usuarios');
//Se invoca el file para la autenticacion de facebook
require('./app/connections/facebook')(passport, conf);

app.set('port', process.env.PORT || conf.port);
app.set('views', path.join(__dirname, 'public/views'));
app.set('view engine', 'jade');
app.use(logger('dev'));

app.use(logger('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(methodOverride());


app.use(session({
	secret: conf.session.secret,
	resave: true,
	saveUninitialized: true,
	store: sessionStore,
	cookie: {
		httpOnly: true,
		secure: false,
		maxAge: null
	}
}));

app.use(express.static(path.join(__dirname, 'public')));

app.use(passport.initialize());
app.use(passport.session());

// Si estoy en local, le indicamos que maneje los errores
// y nos muestre un log más detallado
if ('development' == app.get('dev')) {
	app.use(errorHandler());
}
//Invocamos las rutas de la appliacacion
require('./app/routes/home')(app, passport);

//invocamos la funcion del socket
//Ponemos a escuchar nuestro server en el puerto 3000
//var sessionStore = new (require('connect-mongo')(session))({ db: conf.db });
mensajes(server, conf, sessionStore);

server.listen(conf.port, function() {
	console.log('Servidor Corriendo');
});

function loginPost() {
	passport.authenticate('local-login', {
		successRedirect: '/',
		failureRedirect: '/error'
	});
}
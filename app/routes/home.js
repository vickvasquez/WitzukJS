var routes = require('./router');

module.exports = function(app, passport) {

	app.get('/', function(req, res) {
		res.end('Servidor Corriendo');
	});

	app.get('/auth/facebook', passport.authenticate('facebook', {
		display: 'page',
		scope: ['email'],
		profileFields: ['photos', 'birthday'],
	}), function(req, res) {
		console.log(req);
	});

	app.get('/auth/facebook/callback', passport.authenticate('facebook', {
		failureRedirect: '/login'
	}), function(req, res) {
		//res.contentType('application/json');
		req.session.usuario = req.user.name;
		res.send('callback(' + JSON.stringify(req.session.passport.user) + ')');
		//res.redirect('/');
	});

	app.get('/logout', function(req, res) {
		req.session.destroy();
		console.log('Se ha cerrado la sesion');
		//res.status(200).json({mensaje:'Se ha cerrado la sesion'});
	});

	app.get('/admin', routes.index);

	app.get('/datos', function(req, res) {
		res.set('Content-Type', 'application/json');
		res.header('Charset', 'utf-8')
		console.log(req.session.usuario);
		debugger;
		res.jsonp({
			mensaje: "Sesion iniciada correctamente",
			usuario: 'usuario:' + req.session.passport.user
		});
	});

}
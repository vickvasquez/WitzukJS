var socket = require('socket.io'),
	parseCookie = require('../../cookies'),
	cookie = require('cookie');

module.exports = function(app, conf, sessionStore) {
	/*
	 * Socket.io configuracion
	 */
	var io = socket.listen(app);
	io.set('authorization', function(socket, accept) {
		debugger;
		if (socket.headers.cookie) {
			socket.cookie = cookie.parse(socket.headers.cookie);

			if (socket.cookie[conf.session.key]) {
				socket.sessionID = parseCookie.parseSignedCookie(socket.cookie[conf.session.key], conf.session.secret);

				sessionStore.get(socket.sessionID, function(err, session) {
					debugger;
					if (err) return accept(err, false)

					socket.session = session;
					accept(null, true);
				});
			} else
				return accept(null, true);
		} else
			return accept(null, true);
	});
	/* configuracion del socket , envios al cliente*/
	io.configure('production', function() {
		io.set('log level', 0);
		io.enable('browser client minification'); // Enviar al cliente minificado
		io.enable('browser client etag'); // aplica lógica de almacenamiento en caché basado en el número de versión
		io.enable('browser client gzip'); // gzip Archivo

		io.set('transports', ['websocket', 'flashsocket', 'htmlfile', 'xhr-polling', 'jsonp-polling']);
	});

	io.configure('development', function() {
		io.set('transports', ['websocket']);
	});


	require('../controllers/chatController')(io);
}
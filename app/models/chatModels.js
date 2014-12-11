var MongoClient = require('mongodb').MongoClient,
	Server = require('mongodb').Server;

var mongoclient = new MongoClient(new Server('localhost', 27017, {
		'native_parse': true
	})),
	db = mongoclient.db('chat-sistema');


var message_room = function(usuario, msj, sala, callback) {
	var f = new this.fecha();
	var hora = f.hora();
	var fecha = f.actual();
	db.collection('mensajes').insert({
			emisor: usuario,
			mensaje: msj,
			sala: sala,
			hora: hora,
			fecha: fecha
		},
		function(err, res) {
			callback(err, res);
		}
	);
};

var save_message_user = function(emisor, receptor, msj, callback) {
	var f = new this.fecha();
	db.collection('mensajes').insert({
			emisor: emisor,
			receptor: receptor,
			mensaje: msj,
			hora: f.hora(),
			fecha: f.actual()
		},
		function(err, res) {
			callback(err, res);
		}
	);
};
//Este es la funcion que se encarga de guardarlo
var save_users = function(usuario, sala, callback) {
	db.collection('usuariios').update({
			usuario: usuario
		}, {
			$set: {
				estado: 'conectado',
				sala: sala
			}
		}, {
			upsert: true
		},
		function(err, res) {
			callback(err, res);
		}
	);
};

var change_room = function(usuario, sala, callback) {
	db.collection('usuariios').update({
			usuario: usuario
		}, {
			$set: {
				sala: sala
			}
		},
		function(err, res) {
			callback(err, res);
		});
};
var disconected = function(usuario, callback) {
	db.collection('usuariios').update({
		usuario: usuario
	}, {
		$set: {
			estado: 'desconectado'
		}
	}, function(err, res) {
		callback(err, res);
	});
}
var get_message = function(sala, fecha) {
	//$natural devuelve los elementos en función de su orden de almacenamiento dentro de las extensiones nivel de colección. 
	return {
		mensajes: db.collection('mensajes').find({
			sala: sala,
			fecha: fecha
		}).sort({
			$natural: 1
		})
	};
};

var get_messages = function(receptor, emisor, fecha) {
	return {
		mensajes: db.collection('mensajes').find({
			$or: [{
				emisor: emisor,
				receptor: receptor
			}, {
				emisor: receptor,
				receptor: emisor
			}]
		})
			.sort({
				$natural: 1
			})
	}
};

var get_users_connected = function(sala) {
	return {
		conectados: db.collection('usuariios').find({
			sala: sala,
			estado: 'conectado'
		})
	};
};



var fecha = function() {
	this.fecha = new Date(),
	this.hora = function() {
		var hora = this.fecha.getHours() + ":" + this.fecha.getMinutes() + ':' + this.fecha.getSeconds();
		return hora;
	}

	this.actual = function() {
		var actual = this.fecha.getDate() + "/" + (this.fecha.getMonth() + 1) + "/" + this.fecha.getFullYear();
		return actual;
	}
};

mongoclient.open(function(err, mongoclient) {
	if (err) throw err
	console.log('conectado a mongodB desde el nuevo servidor');
});

module.exports.usuario = save_users;
module.exports.mensajes = get_message;
module.exports.msjsala = message_room;
module.exports.msjuser = save_message_user;
module.exports.getmsg = get_messages;
module.exports.online = get_users_connected;
module.exports.fecha = fecha;
module.exports.sala_new = change_room;
module.exports.disconect = disconected;
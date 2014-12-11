
var socket = require('socket.io');

var sala     = [],
	salass   = new Array();
	usuarios = {},
	mensajes = '',
	fecha    = '',
	hora     = '',
	hoy		 = '',
	onlines  = '';
var Salas = require('../models/salas');
var DB = require('../models/chatModels');

var chatControllers = function(app) {

	var io = socket.listen(app);
	
	Salas( function(err,res) {
		
		if (err) {
			throw err
		};
		//console.log(res);
		for (var i = 0 ; i < res.length; i++) {	

			var salas  = res[i].td_domicilio;
				salita = salas.split(' ');
				if(salita.length > 2) {
					var salas = salita[0]+' '+salita[1];
				}
				salass[i] = new Array(salas,res[i].td_id);
				sala.push(salass[i][0]);
		};
		sala.push('General','0');
	});

	io.sockets.on('connection', function (socket) {

		socket.on('usuario', function (data) {

			fecha = new DB.fecha();
			hoy   = fecha.actual();
			
			var usuario = data.usuario,
				tienda  = data.td;

				if(usuario === null || usuario === undefined || usuario === "") {
					console.log('Error: el usuario non puede ser: '+ usuario);
					return;
				} else {

				    var salita 		  = obtenerSala(tienda) || sala[0];
					socket.usuarios   = usuario;
					socket.sala       = salita;
					usuarios[usuario] = { 'usuario':usuario,'id':socket.id }

					socket.join(salita);
					rooms_contacts = salasss();

					//Aqui guardo el usuario a la base de datos 
					DB.usuario( socket.usuarios, socket.sala, function (err,res) {
						if(err)
							throw err
						
						socket.broadcast.emit("nuevo")
						socket.emit("actualizaSala",rooms_contacts,salita);		
						// socket.broadcast.emit('actualizaSala',rooms_contacts);
						// socket.broadcast.to(salita).emit('actualizaSala',rooms_contacts)	
						//messages_contacts(hoy);
					});	

				}
		});

		
		socket.on('msg', function (msj,receptor) {

			fecha = new DB.fecha();
			hora  = fecha.hora();
			debugger;
			if( receptor === '' || receptor === null || receptor === undefined) {
				DB.msjsala(socket.usuarios,msj,socket.sala, function (err,res) {
					if(err)
						throw err
					socket.emit('sms',socket.usuarios,msj,hora);
					socket.broadcast.to(socket.sala).emit("envmsj", socket.usuarios,msj,hora,socket.sala);
				});
			}
			else
			{
				socket.emit('sms',socket.usuarios,msj,hora);
				sendMessage(receptor,msj,hora,socket.usuarios);
			}

		});

		socket.on('cambiaSala', function (nuevasala) {

			fecha = new DB.fecha();
			hoy   = fecha.actual();
			

			socket.leave(socket.sala);
			socket.join(nuevasala);

			DB.sala_new( socket.usuarios, nuevasala,function (err,res) {
				if(err)
					throw err

				socket.emit("notifica","","Te has conectado a la sala "+ nuevasala);
				socket.broadcast.to(socket.sala).emit("notifica","", socket.usuarios + " Abandono la sala");
				socket.broadcast.emit('desconectado',socket.usuarios);
				socket.sala = nuevasala;
				rooms_contacts = salasss();
				socket.broadcast.to(nuevasala).emit("notifica","",socket.usuarios + " Ingreso a la sala");
				socket.emit('actualizaSala',rooms_contacts,nuevasala)
				socket.broadcast.emit("nuevo");
				messages_contacts(hoy);
			});
		});
		socket.on('general',function(data) {
			fecha = new DB.fecha();
			hora   = fecha.hora();
			DB.sala_new( socket.usuarios, 'general' , function(err,res) {
				socket.emit('sms',socket.usuarios,msj,hora);
				socket.broadcast.emit('envmsj',socket.usuarios,data.msj);

			})
		});

		socket.on('disconnect', function () {
			DB.disconect(socket.usuarios, function(err,res) {
				if(err)
					throw err
				delete usuarios[socket.usuarios];
				socket.broadcast.emit("notifica","", socket.usuarios + " Se ha desconectado");
				socket.broadcast.emit('desconectado',socket.usuarios);
				socket.leave(socket.sala);
				socket.broadcast.emit("nuevo");
			});
		});

		socket.on('escribe' ,function (emisor) {
			if(emisor === '' || emisor === null || emisor === undefined){
				socket.broadcast.to(socket.sala).emit('escribiendo',socket.usuarios);
			}else {				
				var clientes = io.sockets.clients(socket.sala);
				for(cliente in clientes){
					if(clientes.hasOwnProperty(cliente)){
						if(clientes[cliente].usuarios === emisor){
							io.sockets.socket(usuarios[emisor].id).emit('escribiendo',socket.usuarios);						
						}
					}
				}
			}
		});

		socket.on('actualizacontactos',function() {
			
			rooms_contacts = salasss()
			socket.emit("actualizaSala",rooms_contacts,socket.sala); 
		});

		socket.on('reqMessages' , function (receptor) {
			fecha = new DB.fecha();
			fecha = fecha.actual();
			mensajes = DB.getmsg(receptor,socket.usuarios,fecha);

			sendMessages(mensajes);
		});

		var obtenerSala = function(idT) {
			var sala = '';
			for(var i = 0; i<salass.length; i++) {
				if(salass[i][1] === parseInt(idT,10)) {
					sala = salass[i][0];
				}
			}
			return sala
		};

		var sendMessage = function (receptor,msj,hora) {
			// var onlines = io.sockets.clients(socket.sala);
			// for(cliente in onlines) {
			// 	if(onlines.hasOwnProperty(cliente)) {
			// 		if(receptor === onlines[cliente].usuarios) {
						DB.msjuser( socket.usuarios, receptor,msj , function (err,res) {
							if(err)
								throw err
						})
						io.sockets.socket(usuarios[receptor].id).emit('resp',socket.usuarios,msj,hora);
			// 		}
			// 	}
			// }
		};

		var messages_contacts = function (hoy) {
			mensajes = DB.mensajes( socket.sala, hoy );
			sendMessages(mensajes);	

			/*onlines = DB.online(socket.sala);
			displayContacts( onlines );*/
		}

		var sendMessages = function ( mensajes) {
			mensajes.mensajes.toArray( function (err,res) {
				if(res!=null) {
					for(var i=0;i<res.length;i++) {
						socket.emit('sms',res[i].emisor,res[i].mensaje,res[i].hora);
					}
				}		
			});
		};

		var salasss = function () {
			var roomscontacts = new Array();
			for(var i =0; i<sala.length; i++) {

				var clientes = io.sockets.clients(sala[i]);
				var rooms = new Array();

				for(cliente in clientes) {
					if(clientes.hasOwnProperty(cliente)) {
						if(clientes[cliente].usuarios !== socket.usuarios)						
							rooms.push(clientes[cliente].usuarios)
					}
				}
				roomscontacts.push({'sala':sala[i],'contactos':rooms});
			}

			return roomscontacts
		};

		var displayContacts = function ( online ) {
			online.conectados.toArray( function (err,res) {
				for(var i=0;i<res.length;i++) { 
					if(res[i].usuario != socket.usuarios) {
						socket.to(socket.sala).emit('usuarios',res[i].usuario);
					}									
				}
			});
		};

// Fin iio
	});
}

module.exports = chatControllers;
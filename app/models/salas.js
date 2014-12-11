var mysql = require('mysql');

var cnn = mysql.createConnection({
	host	 : 'localhost',
	user	 : 'root',
	database : 'e14122_ChatSK',
	password : 'vick1990'
});

var conectar = function () {
	cnn.connect(function(err) {
	  if (err) {
	    console.error('error connecting: ' + err.stack);
	    return;
	  }
	});
}

var get_rooms = function( callback ) {
	conectar();
	cnn.query('SELECT td_id, td_domicilio FROM tiendas',function(err,res) {
		callback(err,res)
	})
	cnn.end();
	// var tiendas = [{
	// 				td_domicilio:'Moctezuma 115',
	// 				td_id:1
	// 			},
	// 			{
	// 				td_domicilio:'Hidalgo 24',
	// 				td_id:2
	// 			},
	// 			{
	// 				td_domicilio:'Crazy Look',
	// 				td_id:3
	// 			}
	// ]
	// callback(tiendas);
}

module.exports=get_rooms;

var mysql = require('mysql');

var dbconfig = {
	host	 : 'localhost',
	user	 : 'root',
	database : '36615d_Solutronika',
	password : 'vick1990'
};


var runQuery = function (sql,datos,callback) {

	var connection = mysql.createConnection(dbconfig);

	connection.connect(function(err) {
		if(err){
			throw err;
			console.error('Error al realizar la conexion:'+ err.stack);
		}
	});

	connection.query(sql,datos,function(err, res) {
		if(err) {
			throw err;
			console.error('Error al realizar la consulta' + err.stack);
		}
		if(callback) {
			callback(err,res);
		}
	}
	);

	connection.end();
}

var DB = function(config) {
	config = config || {}
}

DB.prototype.getDataBase = function(sql,data,callback ) {
	runQuery(sql,data,function(err,res){
		if (err) {
		 	throw err;
		 	console.error('Error al realizar la consulta' + err.stack);
		}
		callback(res);
	});
}

module.exports = DB;

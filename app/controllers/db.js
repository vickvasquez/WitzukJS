var DB = require('../models/db_conexion');

var db = new DB();

var get_dataBase = function(url,callback) {	
	var sql = 'SELECT base_datos FROM Empresas WHERE url = ?';
	db.getDataBase(sql,url,function(res) {
		var db = res[0].base_datos;
		global.url = url;
		get_rooms(db,function(res){
			callback(res);
		});
	})
	
};

var get_rooms = function( dbx, callback ) {

	var sql = 'SELECT td_id, td_domicilio FROM '+dbx+'.tiendas';
	db.getDataBase(sql,'',function(res) {
		callback(res);
	});

}

module.exports.basedatos = get_dataBase;
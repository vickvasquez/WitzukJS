exports.index = function(req, res) {
	res.render('admin',{
		title: 'Ejemplo de Passport JS',
    	user: req.user
	});
}
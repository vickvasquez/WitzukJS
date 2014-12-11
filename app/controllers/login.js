var login = function(app) {
	var isLogged = function(req,res,next) {
		if(!req.session.passport.user)
			redirect('index')
		next();
	}
}
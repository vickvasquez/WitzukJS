var coockie = require('cookie-signature');

exports.parseSignedCookies = function(obj, secret) {
	var ret = {};
	Object.keys(obj).forEach(function(key) {
		var val = obj[key];
		if (0 == val.indexOf('s:')) {
			val = coockie.unsign(val.slice(2), secret);
			if (val) {
				ret[key] = val;
				delete obj[key];
			}
		}
	});
	return ret;
};
exports.parseSignedCookie = function(str, secret) {
	return 0 == str.indexOf('s:') ? coockie.unsign(str.slice(2), secret) : str;
};
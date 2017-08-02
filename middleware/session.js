

function loggedIn(req, res, next) {
    if(req.session && req.session.userId) {
        return res.redirect('/profile');
    }
    return next();
}

function loginRequired(req, res, next) {
    if(req.session && req.session.userId) {
        return next();
    }
    return res.redirect('/');
}

function jsonLoginRequired(req, res, next){
	if(req.session && req.session.userId) {
        return next();
    }
    res.status(403);
    return res.json({error: 'unauthorized'});
}

module.exports.loggedIn = loggedIn;
module.exports.loginRequired = loginRequired;
module.exports.jsonLoginRequired = jsonLoginRequired;
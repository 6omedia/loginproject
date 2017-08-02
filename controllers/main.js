const express = require('express');
const mainRoutes = express.Router();
const mongoose = require('mongoose');
const User = require('../models/user');
const mid = require('../middleware/session');

mainRoutes.get('/', mid.loggedIn, function(req, res){

	res.render('home', {
		error: ''
	});

});

mainRoutes.post('/', function(req, res){

	var error = '';

	if(req.body.email && req.body.password){

		User.authenticate(req.body.email, req.body.password, function(err, user){

			if(err || !user){

				res.status(err.status);
				return res.render('home', {
					error: error
				});

			}

			// user exists

			req.session.userId = user._id;
			res.loggedInUser = user._id;

			return res.redirect('/profile');

		});

	}else{

		error = 'Both email and password required';
		res.status(400);
		return res.render('home', {
			error: error
		});

	}

});

mainRoutes.get('/logout', function(req, res){

	if (req.session) {
		// delete session object
		req.session.destroy(function(err) {
			if(err) {
				return next(err);
			} else {
				return res.redirect('/');
			}
		});
	}

});

mainRoutes.get('/profile', mid.loginRequired, function(req, res){

    User.findById(req.session.userId, function(err, user){

        if(err){
            return next(err);
        }

        return res.render('profile', {
            name: user.name
        });

    });

});

mainRoutes.get('/register', mid.loggedIn, function(req, res){

    res.render('register', {
        error: ''
    });

});

mainRoutes.post('/register', function(req, res){

	var userObj = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        confirm_password: req.body.confirm_password
    };

    User.registerUser(userObj, function(err, user){

        var error = '';

        if(err){
            res.status(400);
            return res.render('register', {
                error: err
            });
        }

        // login and start session
        req.session.userId = user._id;
        return res.redirect('/profile');

    });

});

mainRoutes.put('/profile', mid.jsonLoginRequired, function(req, res){

	let data = {};
	data.success = '0';

	var userObj = {
        name: req.body.name,
        email: req.body.email,
        meta: {
			age: req.body.meta.age,
			website: req.body.meta.website
        }  
    };

	User.update(req.body.userId, userObj, function(err, numberAffected){

		if(err){
			data.error = err;
			return res.json(data);
		}

		if(numberAffected == 0){
			data.error = 'Failed to update';
			return res.json(data);
		}

		User.findById(req.body.userId, function(err, updatedUser){

			data.success = '1';
			data.updatedUser = updatedUser;
			return res.json(data);

		});

	});

});

module.exports = mainRoutes;


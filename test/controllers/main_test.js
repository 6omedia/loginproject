process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
let User = require('../../models/user');

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../../app');
let should = chai.should();
let expect = chai.expect();

chai.use(chaiHttp);

var agent = chai.request.agent(server);

function logBillyIn(callback){

    agent
        .post('/')
        .send({ email: 'bill@billy.com', password: '123', test: true})
        .end(function (err, res) {

            console.log(res.session);
            var loggedInUser = res.loggedInUser;
            res.should.have.a.cookie;
            callback(agent, loggedInUser);
            
        });

}

describe('main routes', () => {

    // before these tests, delete all users, and create one user

    before(function(done){
        User.remove({}, function(err){
            User.registerUser({
                name: 'Bill',
                email: 'bill@billy.com',
                password: '123',
                confirm_password: '123',
                admin: false,
                meta: {
                  age: 22,
                  website: 'www.billy.com'
                }
            }, function(err, user){

                if(!err){

                    User.registerUser({
                        name: 'Franky',
                        email: 'frank@franky.com',
                        password: 'abc',
                        confirm_password: 'abc',
                        admin: false,
                        meta: {
                          age: 22,
                          website: 'www.franky.com'
                        }
                    }, function(err, user){

                        if(!err){
                            done();
                        }
                    
                    });

                }
            
            });

        });
    });

    describe('/GET home', () => {

        it('user logged in so it should redirect to profile page', (done) => {

            logBillyIn(function(agent){

                agent.get('/')
                    .end(function (err, res) {
                        res.should.redirect;
                        done();
                    });

            });

        });

        it('it should render the home page with info about bastion and a login/regester box', (done) => {
            
            chai.request(server)
                .get('/')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.should.not.redirect;
                    done();
                });  
            
        });

    });

    describe('/POST home', () => {

        // correct login

        var email = 'bill@billy.com';
        var password = '123';
        var wrongEmail = 'bill@ly.com';
        var wrongPassword = '1432';

        it('should find the user and identify the correct password, then redirect to /profile', (done) => {
            chai.request(server)
            .post('/').send({email: email, password: password})
            .end((err, res) => {
                // res.body.should.not.have.property('error');
                res.should.redirect;
                done();
            });
        });

        // incorrect email

        it('should not login user as email is incorrect', (done) => {
            chai.request(server)
            .post('/').send({email: wrongEmail, password: password})
            .end((err, res) => {
                res.should.have.status(401);
                res.should.not.redirect;
                done();
            });
        });

        // incorrect password

        it('should not login user as password is incorrect', (done) => {
            chai.request(server)
            .post('/').send({email: email, password: wrongPassword})
            .end((err, res) => {
                res.should.have.status(401);
                res.should.not.redirect;
                done();
            });
        });

        it('should return error', (done) => {
            chai.request(server)
            .post('/').send('dsvdsvvdsvsd')
            .end((err, res) => {
                res.should.have.status(400);
                done();
            });
        });

    });

    describe('/GET profile', () => {

        // if logged in

        it('it should render the profile page, with correct user from session', (done) => {

            logBillyIn(function(agent){

                agent.get('/profile')
                    .end(function (err, res) {
                        res.should.have.status(200);
                        res.should.not.redirect;
                        done();
                    });

            });

        });

        // if not logged in

        it('it should redirect to the home page', (done) => {
            chai.request(server)
            .get('/profile')
            .end((err, res) => {
                res.should.not.have.cookie;
                res.should.redirect;
                done();
            });
        });

    });

    describe('/GET register', () => {

        // if logged in
        it('should redirect to profile page', (done) => {

            logBillyIn(function(agent){

                agent.get('/register')
                    .end(function (err, res) {
                        res.should.redirect;
                        done();
                    });

            });

        });

        it('should render register page', (done) => {
            chai.request(server)
            .get('/register')
            .end((err, res) => {
                res.should.have.status(200);
                res.should.not.redirect;
                done();
            });
        });

    });

    describe('/POST register', () => {

        it('should add a user to the database', (done) => {
            chai.request(server)
            .post('/register')
            .send({
                name: 'John',
                email: 'jon@jonny.com',
                password: '123',
                confirm_password: '123'
            })
            .end((err, res) => {
                res.should.redirect;
                done();
            });
        });

        it('should respond with an error of email address already exists', (done) => {
            chai.request(server)
            .post('/register')
            .send({
                name: 'John',
                email: 'bill@billy.com',
                password: '123',
                confirm_password: '123'
            })
            .end((err, res) => {
                res.should.have.status(400);
                res.should.not.redirect;
                done();
            });
        });

        it('should respond with an error that name is required', (done) => {
            chai.request(server)
            .post('/register')
            .send({
                name: '',
                email: 'vfds@vfdcv.com',
                password: '123',
                confirm_password: '123'
            })
            .end((err, res) => {
                res.should.have.status(400);
                done();
            });
        });

        it('should respond with an error that email is required', (done) => {
            chai.request(server)
            .post('/register')
            .send({
                name: 'John',
                email: '',
                password: '123',
                confirm_password: '123'
            })
            .end((err, res) => {
                res.should.have.status(400);
                done();
            });
        });

        it('should respond with an error that password is required', (done) => {
            chai.request(server)
            .post('/register')
            .send({
                name: 'John',
                email: 'dfcdsfds@vfdvfd.com',
                password: '',
                confirm_password: 'abc'
            })
            .end((err, res) => {
                res.should.have.status(400);
                done();
            });
        });

        it('should respond with an error that password confirm password doesnot match password', (done) => {
            chai.request(server)
            .post('/register')
            .send({
                name: 'John',
                email: 'dfcdsfds@vfdvfd.com',
                password: '123',
                confirm_password: 'abc'
            })
            .end((err, res) => {
                res.should.have.status(400);
                done();
            });
        });

    });

    describe('/PUT profile', () => {

        it('should update users name', (done) => {

            logBillyIn(function(agent){

                User.findOne({'email': 'bill@billy.com'}, function(err, jon){

                    var updatedUser = {
                        userId: jon._id,
                        name: 'james',
                        email: 'bill@billy.com',
                        meta: {
                            age: 24,
                            website: 'www.billy.com'
                        } 
                    }

                    agent
                    .put('/profile')
                    .send(updatedUser)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.should.not.have.property('error');
                        res.body.success.should.equal('1');
                        res.body.updatedUser.name.should.equal('james');
                        res.body.updatedUser.updated_at.should.not.equal('');
                        res.body.updatedUser.updated_at.should.not.equal(res.body.updatedUser.created_at);
                        done();
                    });

                });

            });

        });

        it('should return error of user not found', (done) => {

            var updatedUser = {
                name: 'james'
            }

            chai.request(server)
            .put('/profile/nonsence')
            .send(updatedUser)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.error.should.equal('User not found');
                done();
            });

        });

        it('should return error of unauthorised', (done) => {

            var updatedUser = {
                name: 'james'
            }

            logBillyOut(function(){

                chai.request(server)
                .put('/profile/nonsence')
                .send(updatedUser)
                .end((err, res) => {
                    res.should.have.status(403);
                    res.body.error.should.equal('unauthorized');
                    done();
                });

            });

        });

    });

    describe('/DELETE profile/:id', () => {

        it('should delete frank@franky.com user', (done) => {

            User.findOne({'email': 'frank@franky.com'}, function(err, jon){

                chai.request(server)
                .delete('/profile/' + jon._id)
                .end((err, res) => {
                    res.body.should.not.have.property('error');
                    res.body.have.status(200);
                    done();
                });

            });

        });

        it('should return error user does not exist', (done) => {

            chai.request(server)
            .delete('/profile/nonsence')
            .end((err, res) => {
                res.body.error.should.equal('User not found');
                res.body.have.status(400);
                done();
            });

        });

    });

});
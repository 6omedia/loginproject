// test/app_spec.js

var chai = require('chai');
var chaiHttp = require('chai-http');
var app = require('../../app');

var expect = chai.expect;

chai.use(chaiHttp);

describe('Profile Controllers', function() {

    describe('/profile', function(done) {

        it('responds with status 200', function(done) {

            var user = {
                
            };

            chai.request(app)
                .post('/profile')
                .send(user)
                .end(function(err, res) {
                    expect(res).to.have.status(200);
                    done();
                });
      
        });

        it('should redirect to home login route /login ', function(done){

            chai.request(app)
                .post('/profile')
                .end(function(err, res) {
                    expect(res).to.have.status(200);
                    done();
                });

        });
    
    });

});

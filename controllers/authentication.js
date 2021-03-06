/**
 * Created by jj on 3/28/16.
 */

const jwt = require('jwt-simple');
const config = require('../config');
const UserModelClass = require('../models/user');


// generate token for a user based on the user id and time of creation
function tokenForUser(user) {
    const timestamp = new Date().getTime();

    // sub = "subject", iat = "issue at time
    return jwt.encode(
        {
            sub: user.id,
            iat: timestamp
        }
        , config.secret);
}

exports.signup = function(req, res, next) {

    console.log(req.body);

    // extract email out of the req object
    const email = req.body.email;
    const password = req.body.password;

    if (!email || !password)
    {
        return res.status(422).send({ error: 'You must provide email and password.' });
    }

    console.log(email, password);

    UserModelClass.findOne({ email: email }, function(err, existingUser){

        // see if a user with the given email exists
        if (err) { return next(err); }

        // if a user with email already exists, return an error
        if (existingUser) {
            return res.status(422).send({ error: 'Email is in already use.'});
        }

        // if a user with email does NOT exist, create and save user record, then respond to request indicating the user was created
        const newUser = new UserModelClass({email: email, password: password});
        newUser.save(function(err) {
            if (err) { return next(err); }

            // respond to the request
            res.json({ token: tokenForUser(newUser) });
        });
    });
};


// already checked username + password, give them a token
exports.signin = function(req, res, next) {

    console.log(req.body);
    console.log(req.user);
    console.log(req);

    res.send({ token: tokenForUser(req.user) });
};
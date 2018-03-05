const Utils = require('../config/Utils');
const User = require('../models/user');
const ConstantClass = require("../config/constants");
const Constants = ConstantClass.constants;
const Figures = ConstantClass.figures;
let templateText = ConstantClass.templateText;
let loginTemplate = ConstantClass.loginTemplate;

const register = (req, res) => {
    const username = req.body.username,
        password = req.body.password,
        passwordConf = req.body.passwordConf,
        email = req.body.email,
        phone = req.body.phone;

    let err;

    if (password.length < Figures.MIN_PASSWORD_LENGTH || passwordConf.length < Figures.MIN_PASSWORD_LENGTH) {
        err = new Error(Constants.MIN_PASSWORD_LENGTH);
        err.status = 400;
        templateText.error_message = err.message;
        return res.redirect('/')
    }

    if (!username && !password && !email && !phone) {
        err = new Error(Constants.EMPTY_PARAMS);
        err.status = 400;
        templateText.error_message = err.message;
        return res.redirect('/')
    }

    if (password !== passwordConf) {
        err = new Error(Constants.PASSWORDS_DONT_MATCH);
        err.status = 400;
        templateText.error_message = err.message;
        return res.redirect('/')
    }
    if (!username || !Utils.check.username(username)) {
        err = new Error(Constants.INVALID_USERNAME);
        err.status = 400;
        templateText.error_message = err.message;
        return res.redirect('/')
    }
    if (!password) {
        err = new Error(Constants.PASSWORD_CANNOT_BE_EMPTY);
        err.status = 400;
        templateText.error_message = err.message;
        return res.redirect('/');
    }
    if (!username || !Utils.check.email(email)) {
        err = new Error(Constants.INVALID_EMAIL);
        err.status = 400;
        templateText.error_message = err.message;
        return res.redirect('/')
    }
    if (!phone || !Utils.check.phone(phone)) {
        err = new Error(Constants.INVALID_PHONE);
        err.status = 400;
        templateText.error_message = err.message;
        return res.redirect('/')
    }
    const params = {
        username: username,
        password: password,
        email: email,
        phone: phone
    };


    Utils.userExists(params).then((err, resp) => {
        if (err) {
            templateText.error_message = JSON.stringify(err);
            return res.redirect('/')
        }

        if (resp) {
            err = new Error(Constants.ALREADY_REGISTERED_USER);
            err.status = 400;
            templateText.error_message = err.message;
            return res.redirect('/')
        }
        const newUser = new User(params);

        newUser.save((err, user) => {
            if (err) {
                templateText.error_message = Constants.ERROR_OCCURRED;
                return res.redirect('/');
            }
            if (user) {
                req.session.userId = user._id;
            }
            res.redirect(`/user/${user.username}`);
        });

    }).catch(() => {
        res.status(400);
        templateText.error_message = JSON.stringify(Constants.ERROR_OCCURRED);
        return res.redirect('/')
    });
};

const login = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    let err;

    if (!email && !password) {
        err = new Error(Constants.EMPTY_PARAMS);
        err.status = 400;
        loginTemplate.error_message = err.message;
        return res.redirect('/login')
    }

    if (!Utils.check.email(email)) {
        err = new Error(Constants.INVALID_EMAIL);
        err.status = 400;
        loginTemplate.error_message = err.message;
        return res.redirect('/login');
    }

    User.authenticate(email, password, (err, user) => {
        if (err) {
            loginTemplate.error_message = err.message;
            return res.redirect('/login');
        }

        if (user) {
            req.session.userId = user._id;
            return res.redirect(`/user/${user.username}`);
        }
    })
};


module.exports = {
    register,
    login
};
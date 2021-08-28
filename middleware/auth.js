const jwt = require('jsonwebtoken');
const config = require('config');
const { response } = require('express');

module.exports = function (req, res, next) {
  //get the token from header
  const token = req.header('x-auth-token');

  //chech if token exists
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization not found' });
  }

  // verify the token
  try {
    const decoded = jwt.verify(token, config.get('jwtSecret'));

    req.user = decoded.user;
    next();
  } catch (err) {
    response.status(401).json({ msg: 'token is not valid' });
  }
};

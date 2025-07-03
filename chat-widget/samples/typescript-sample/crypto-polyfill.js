const crypto = require('crypto-browserify');
const { v4: uuidv4 } = require('uuid');

// Add the randomUUID function that crypto-browserify doesn't have
crypto.randomUUID = () => uuidv4();

module.exports = crypto;
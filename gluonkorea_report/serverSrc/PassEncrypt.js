let crypto = require('crypto'),
    algorithm = 'aes-256-ctr',
    password = 'dcFdE2ea';

class PassEncrypt {
    static encrypt( text ) {
        let cipher = crypto.createCipher(algorithm,password);
        let crypted = cipher.update(text,'utf8','hex');
        crypted += cipher.final('hex');
        return crypted;
    }
    static decrypt( text ) {
        let decipher = crypto.createDecipher(algorithm,password);
        let dec = decipher.update(text,'hex','utf8');
        dec += decipher.final('utf8');
        return dec;
    }
}

module.exports = PassEncrypt;
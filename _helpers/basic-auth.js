module.exports = basicAuth;

async function basicAuth(req, res, next) {

    // check for basic auth header
    if (req.headers.authorization && req.headers.authorization.indexOf('Basic ') >= -1) {
        const base64Credentials = req.headers.authorization.split(' ')[1];
        const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
        const [username, password] = credentials.split(':');
        next();
    }

    next();
}
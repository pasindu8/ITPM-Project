require('dotenv').config();
const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        res.status(401);
        throw new Error('No token provided');
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401);
        throw new Error('Invalid token');
    }
};

module.exports = protect;
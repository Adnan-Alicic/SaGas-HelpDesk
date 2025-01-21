const jwt = require('jsonwebtoken');

module.exports = {
    ensureAuthenticated: function (req, res, next) {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        jwt.verify(token, 'tajna', (err, user) => {
            if (err) {
                return res.status(403).json({ message: 'Token nije validan' });
            }
            req.user = user; // Postavljamo korisnika u request
            next();
        });
    },

    ensureRole: function (requiredRole) {
        return function (req, res, next) {
            if (!req.user || !req.user.role) {
                return res.status(403).json({ message: 'Nemate prava pristupa - korisnik nije definisan ili nema rolu' });
            }

            if (req.user.role === requiredRole) {
                return next();
            } else {
                return res.status(403).json({ message: 'Nemate prava pristupa za ovu rolu' });
            }
        };
    },
    ensureAdmin: function(req, res, next) {
        console.log('User role in ensureAdmin:', req.user.role);
        if (req.user && req.user.role === 'Admin') {
            return next();
        } else {
            res.status(403).json({ message: 'Nemate prava pristupa' });
        }
    },
    ensureSectorManager: function(req, res, next) {
        if (req.user && req.user.role === 'Sector Manager') {
            return next();
        } else {
            res.status(403).json({ message: 'Nemate prava pristupa' });
        }
    },
    ensureWorker: function(req, res, next) {
        if (req.user && req.user.role === 'Worker') {
            return next();
        } else {
            res.status(403).json({ message: 'Nemate prava pristupa' });
        }
    }
};
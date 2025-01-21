const express = require('express');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../models');
const ldapConfig = require('../config/ldapConfig'); // Pretpostavka da koristiš LDAP konfiguraciju
const router = express.Router();

const { login, logout } = require('../controllers/authController');

// Rute
router.post('/login', login);
router.post('/logout', logout);

// Ruta za lokalnu prijavu
router.post('/login', (req, res, next) => {
    console.log('Primljen zahtjev za lokalnu prijavu:', req.body);

    passport.authenticate('local', async (err, user, info) => {
        if (err) {
            console.error('Greška u Passport autentifikaciji:', err);
            return next(err);
        }
        if (!user) {
            console.warn('Korisnik nije pronađen ili su uneti neispravni podaci.');
            return res.status(400).json({ message: 'Neispravan email ili lozinka' });
        }

        req.logIn(user, async (err) => {
            if (err) {
                console.error('Greška prilikom prijavljivanja korisnika:', err);
                return next(err);
            }

            console.log('Prijavljen korisnik:', user);

            const token = jwt.sign({ id: user.id, role: user.role }, 'tajna', { expiresIn: '1h' });
            console.log('Generisan token:', token);

            try {
                const userWithSector = await db.User.findOne({
                    where: { id: user.id },
                    attributes: ['id', 'firstname', 'lastname', 'email', 'role', 'sector']
                });

                if (!userWithSector) {
                    console.error('Korisnik nije pronađen u bazi nakon prijave.');
                    return res.status(500).json({ message: 'Greška prilikom dohvaćanja korisničkih podataka' });
                }

                return res.json({
                    message: 'Prijava uspješna',
                    token,
                    user: {
                        id: userWithSector.id,
                        firstname: userWithSector.firstname,
                        lastname: userWithSector.lastname,
                        email: userWithSector.email,
                        role: userWithSector.role,
                        sector: userWithSector.sector
                    },
                    redirect: user.role === 'Admin'
                        ? '/admin-dashboard'
                        : user.role === 'Sector Manager'
                            ? '/dashboard'
                            : user.role === 'User'
                                ? '/worker-dashboard'
                                : '/'
                });
            } catch (dbError) {
                console.error('Greška prilikom pristupa bazi:', dbError);
                return res.status(500).json({ message: 'Greška na serveru' });
            }
        });
    })(req, res, next);
});


// Ruta za prijavu putem Active Directory (AD)
router.post('/ad-login', (req, res) => {
    const { username, password } = req.body;

    console.log('Primljen zahtjev za AD login:', username);
    if (!username || !password) {
        return res.status(400).json({ message: 'Korisničko ime ili lozinka nisu poslani' });
    }
    const client = ldapConfig.createLdapClient();

    const searchOptions = {
        filter: `(sAMAccountName=${username})`, // Pretraga po sAMAccountName atributu
        scope: 'sub',
        attributes: ['dn'], // Dohvati samo Distinguished Name (DN)
    };
    console.log('LDAP pretraga sa bazom:', ldapConfig.userSearchBase);
    console.log('LDAP filter:', `(sAMAccountName=${username})`);


    client.search(ldapConfig.userSearchBase, searchOptions, (err, resSearch) => {
        if (err) {
            console.error('Greška tokom pretrage korisnika:', err);
            return res.status(500).json({ message: 'Greška tokom pretrage korisnika' });
        }

        let userDN = null;

        resSearch.on('searchEntry', (entry) => {
            userDN = entry.object.dn; // Pohrani DN korisnika
            console.log('Pronađen DN za korisnika:', userDN);
        });

        resSearch.on('error', (err) => {
            console.error('Greška tokom obrade rezultata pretrage:', err);
        });

        resSearch.on('end', (result) => {
            if (!userDN) {
                console.error('Korisnik nije pronađen');
                return res.status(401).json({ message: 'Neispravni korisnički podaci' });
            }

            // Bind korisnika sa pronađenim DN
            client.bind(userDN, password, (err) => {
                if (err) {
                    console.error('Greška prilikom bind-a korisnika:', err);
                    return res.status(401).json({ message: 'Pogrešna lozinka' });
                }

                console.log('Korisnik uspješno autentifikovan:', username);
                res.json({ message: 'Prijava uspješna', redirect: '/dashboard' });

                client.unbind(); // Zatvori vezu
            });
        });
    });
});



module.exports = router;

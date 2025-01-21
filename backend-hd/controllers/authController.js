const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../models');
const { client, baseDN } = require('../config/ldapConfig'); // Uvoz LDAP konfiguracije
const { logActivity, logLogin, logLogout } = require('../services/logService');


exports.login = (req, res, next) => {
    passport.authenticate('local', async (err, user, info) => {
        if (err) return next(err);
        if (!user) return res.status(400).json({ message: 'Neispravan email ili lozinka' });

        req.logIn(user, async (err) => {
            if (err) return next(err);

            try {
                // Logovanje prijave
                await logLogin(user.id, 'login', 'Korisnik se uspešno prijavio');

                const token = jwt.sign({ id: user.id, role: user.role }, 'tajna', { expiresIn: '1h' });
                console.log('Generisan token:', token);

                const userWithSector = await db.User.findOne({
                    where: { id: user.id },
                    attributes: ['id', 'firstname', 'lastname', 'email', 'role', 'sector'], // Dodaj sektor
                });

                return res.json({
                    message: 'Prijava uspješna',
                    token,
                    user: {
                        id: userWithSector.id,
                        firstname: userWithSector.firstname,
                        lastname: userWithSector.lastname,
                        email: userWithSector.email,
                        role: userWithSector.role,
                        sector: userWithSector.sector,
                    },
                    redirect: user.role === 'Admin'
                        ? '/admin-dashboard'
                        : user.role === 'Sector Manager'
                        ? '/dashboard'
                        : user.role === 'User'
                        ? '/worker-dashboard'
                        : '/',
                });
            } catch (error) {
                console.error('Greška prilikom logovanja prijave:', error);
                return res.status(500).json({ message: 'Greška na serveru prilikom logovanja prijave.' });
            }
        });
    })(req, res, next);
};


// Funkcija za prijavu putem AD-a
exports.adLogin = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Nedostaju podaci za prijavu.' });
    }

    const userDN = `CN=${username},${baseDN}`;

    client.bind(userDN, password, async (err) => {
        if (err) {
            console.error('Greška prilikom povezivanja sa AD:', err.message);
            return res.status(401).json({ message: 'Prijava nije uspela. Proverite korisničko ime i lozinku.' });
        }

        console.log(`Korisnik ${username} uspešno autentifikovan preko AD.`);

        try {
            // Provjerava da li korisnik postoji u lokalnoj bazi
            let user = await db.User.findOne({ where: { email: username } });

            if (!user) {
                // Ako korisnik ne postoji, kreira ga sa podrazumevanim vrednostima
                user = await db.User.create({
                    email: username,
                    firstname: 'Ime',
                    lastname: 'Prezime',
                    role: 'User',
                    sector: 'Nedefinisano'
                });
            }

            res.json({ message: 'Prijava uspješna!', user });
        } catch (dbError) {
            console.error('Greška prilikom pristupa bazi:', dbError.message);
            res.status(500).json({ message: 'Greška na serveru.' });
        }
    });
};

exports.logout = async (req, res) => {
    try {
        const userId = req.user.id; // Pretpostavlja se da user ID dolazi iz req objekta
        await logLogout(userId); // Poziv funkcije za logovanje odjave
        req.logout(); // Passport metoda za odjavu
        res.json({ message: 'Korisnik je uspešno odjavljen.' });
    } catch (error) {
        console.error('Greška prilikom odjave:', error);
        res.status(500).json({ message: 'Greška na serveru prilikom odjave.' });
    }
};




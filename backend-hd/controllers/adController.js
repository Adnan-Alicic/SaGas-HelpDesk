const { client, baseDN } = require('../config/ldapConfig'); // Uvoz LDAP konfiguracije
const db = require('../models'); // Uvoz modela baze podataka

exports.adLogin = async (req, res) => {
    const { username, password } = req.body;

    // Validacija ulaznih podataka
    if (!username || !password) {
        return res.status(400).json({ message: 'Nedostaju podaci za prijavu.' });
    }

    // Konstrukcija DN korisnika
    const userDN = `${username}@sarajevogas.ba`; // Prilagodite prema vašoj AD strukturi

    client.bind(userDN, password, async (err) => {
        if (err) {
            console.error('Greška prilikom povezivanja sa AD:', err.message);
            return res.status(401).json({ message: 'Prijava nije uspela. Proverite korisničko ime i lozinku.' });
        }

        console.log(`Korisnik ${username} uspešno autentifikovan preko AD.`);

        try {
            // Proveri da li korisnik postoji u lokalnoj bazi
            let user = await db.Users.findOne({ where: { email: username } });

            if (!user) {
                // Ako korisnik ne postoji, kreiraj ga sa podrazumevanim podacima
                user = await db.Users.create({
                    email: username,
                    firstname: 'Ime', // Prilagodite prema potrebi
                    lastname: 'Prezime',
                    role: 'User', // Podrazumevana rola
                    sector: 'Nedefinisano',
                });

                console.log(`Kreiran novi korisnik u bazi: ${username}`);
            } else {
                console.log(`Korisnik ${username} već postoji u bazi.`);
            }

            // Vraćamo podatke korisnika
            res.json({
                message: 'Prijava uspešna!',
                user: {
                    id: user.id,
                    email: user.email,
                    firstname: user.firstname,
                    lastname: user.lastname,
                    role: user.role,
                    sector: user.sector,
                },
            });
        } catch (dbError) {
            console.error('Greška prilikom pristupa bazi:', dbError.message);
            res.status(500).json({ message: 'Greška na serveru.' });
        }
    });

    // Logovanje grešaka na klijentu
    client.on('error', (error) => {
        console.error('LDAP greška:', error.message);
    });
};

const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../models');
const { User } = require('../models');
const { ensureAuthenticated, ensureRole } = require('../middleware/authMiddleware');
const reportController = require('../controllers/reportController');
const logService = require('../services/logService'); 
const router = express.Router();
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

// Endpoint za unos više korisnika
router.post('/bulk-insert', ensureAuthenticated, ensureRole('Admin'), async (req, res) => {
    try {
        const users = req.body.users;

        if (!users || !Array.isArray(users)) {
            return res.status(400).json({ message: 'Invalid data format' });
        }

        // Dodajte korisnike u bazu
        await User.bulkCreate(users);
        res.status(200).json({ message: 'Users inserted successfully!' });
    } catch (error) {
        console.error('Error inserting users:', error);
        res.status(500).json({ message: 'Error inserting users' });
    }
});

// Ruta za preuzimanje logova u PDF formatu
router.get('/logs/download', async (req, res) => {
    try {
        const logs = await logService.getLogs();

        // Kreiranje PDF dokumenta
        const doc = new PDFDocument();
        const fileName = 'logs.pdf';

        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Type', 'application/pdf');

        doc.pipe(res);

        doc.fontSize(16).text('Logovi aktivnosti', { align: 'center' });
        doc.moveDown();

        logs.forEach(log => {
            const { firstname, lastname } = log.user || { firstname: 'Nepoznato', lastname: '' };
            doc
                .fontSize(12)
                .text(
                    `Radnik: ${firstname} ${lastname}, Akcija: ${log.action}, Opis: ${log.description}, Datum: ${log.timestamp}`
                )
                .moveDown();
        });

        doc.end();
    } catch (error) {
        console.error('Greška prilikom generisanja PDF-a:', error);
        res.status(500).json({ message: 'Greška na serveru' });
    }
});

// Ruta za preuzimanje logova aktivnosti
router.get('/logs', async (req, res) => {
    try {
        const logs = await logService.getLogs(); // Koristi logService umesto logController
        res.json(logs);
    } catch (error) {
        console.error('Error in /logs route:', error);
        res.status(500).json({ message: 'Error fetching logs' });
    }
});


// Ruta za generisanje izveštaja
router.get('/reports', ensureAuthenticated, ensureRole('Admin'), reportController.generateReport);

// Ruta za kreiranje novog korisnika
router.post('/create-user', ensureAuthenticated, ensureRole('Admin'), async (req, res) => {
    const { firstname, lastname, email, password, role, sector, pozicija } = req.body;

    try {
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);

        await User.create({
            firstname,
            lastname,
            email,
            password: hashedPassword,
            role,
            sector: sector || null, // Može biti null ako nije prosleđeno
            pozicija,
            salt,
        });

        res.status(201).json({ message: 'Korisnik kreiran uspešno.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Greška prilikom kreiranja korisnika.' });
    }
});

// Ruta za dobijanje svih korisnika
router.get('/users', ensureAuthenticated, ensureRole('Admin'), async (req, res) => {
    try {
        const users = await User.findAll();
        res.json({ users });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Greška prilikom preuzimanja korisnika.' });
    }
});

// PUT ruta za promenu podataka postojećeg korisnika
router.put('/users/:id', ensureAuthenticated, ensureRole('Admin'), async (req, res) => {
    const { id } = req.params;
    const { firstname, lastname, email, role, pozicija } = req.body;

    try {
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: 'Korisnik nije pronađen.' });
        }

        // Ažuriranje podataka korisnika
        user.firstname = firstname;
        user.lastname = lastname;
        user.email = email;
        user.role = role;
        user.pozicija = pozicija;
        await user.save();

        res.json({ message: 'Podaci korisnika su uspešno ažurirani.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Greška prilikom ažuriranja korisnika.' });
    }
});

// DELETE ruta za brisanje korisnika
router.delete('/delete-user/:id', ensureAuthenticated, ensureRole('Admin'), async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: 'Korisnik nije pronađen.' });
        }

        await user.destroy();
        res.status(204).send();
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Greška prilikom brisanja korisnika.' });
    }
});

module.exports = router;


/*router.put('/users/:id', ensureAuthenticated, ensureAdmin, async(req, res) => {
    const { id } = req.params; // Uzmite ID korisnika iz parametara
    const { firstname, lastname, email } = req.body; // Uzmite nove podatke iz tela zahteva

    try {
        const user = await db.User.findByPk(id); // Pronađite korisnika po ID
        if (!user) {
            return res.status(404).json({ message: 'Korisnik nije pronađen.' });
        }

        user.firstname = firstname; // Ažurirajte ime
        user.lastname = lastname; // Ažurirajte prezime
        user.email = email; // Ažurirajte email
        user.role = role; // Ažurirajte rolu
        await user.save(); // Sačuvajte promene

        res.json({ message: 'Podaci korisnika su uspešno ažurirani.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Greška prilikom ažuriranja korisnika.' });
    }
});*/
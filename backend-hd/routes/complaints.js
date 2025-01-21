const express = require('express');
const router = express.Router();
const { PrijavaSmetnji } = require('../models'); // Pretpostavka da je model za prijave smetnji PrijavaSmetnji
const sendEmail = require('../services/emailService');
// PUT ruta za validaciju prijave
router.put('/validate/:taskId', async (req, res) => {
    const { taskId } = req.params;
    const { validation, comment } = req.body;

    try {
        const task = await db.Taskovi.findByPk(taskId);

        if (!task) {
            return res.status(404).json({ message: 'Task nije pronađen' });
        }

        task.validation = validation;
        task.validationComment = comment || ''; // Čuvamo komentar samo ako postoji
        await task.save();

        return res.json({ message: 'Validacija uspješno spremljena.' });
    } catch (error) {
        console.error('Greška prilikom validacije taska:', error);
        return res.status(500).json({ message: 'Greška prilikom validacije.' });
    }
});


// PUT ruta za poništavanje prijave sa komentarom
router.put('/cancel/:id', async (req, res) => {
    const { id } = req.params;
    const { comment } = req.body;

    try {
        // Pronađi prijavu po ID-u
        const complaint = await PrijavaSmetnji.findByPk(id);

        if (!complaint) {
            return res.status(404).json({ message: 'Prijava smetnji nije pronađena.' });
        }

        // Ažuriraj prijavu sa komentarom poništavanja
        complaint.status = 'Poništeno'; // Oznaka statusa
        complaint.comment = comment; // Spremi komentar poništavanja
        await complaint.save();

        return res.json({ message: 'Prijava smetnji uspješno poništena sa komentarom.' });
    } catch (error) {
        console.error('Greška prilikom poništavanja prijave:', error);
        return res.status(500).json({ message: 'Greška na serveru prilikom poništavanja.' });
    }
});

module.exports = router;

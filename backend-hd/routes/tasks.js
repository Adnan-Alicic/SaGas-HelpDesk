const express = require('express');
const router = express.Router();
const db = require('../models');
const jwt = require('jsonwebtoken');
const sendEmail = require('../services/emailService'); // Servis za slanje emailova

// Ruta za dohvaćanje svih taskova
router.get('/all-tasks', async (req, res) => {
    try {
        const tasks = await db.Taskovi.findAll({
            include: [{
                model: db.User,
                as: 'User',
                attributes: ['firstname', 'lastname'], // Prikaži samo ove atribute korisnika
            },
            {
                model: db.PrijavaSmetnji,  // Uključujemo tabelu PrijavaSmetnji
                as: 'PrijavaSmetnji',
                attributes: ['validacija', 'comment'] // Ovo su kolone koje nas zanimaju
            }
        ]
        });

        res.json(tasks);
    } catch (error) {
        console.error('Greška prilikom dohvata taskova:', error);
        res.status(500).json({ message: 'Greška na serveru' });
    }
});

// Ruta za ovjeru taska od strane šefa sektora
router.put('/verify-task/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Pronađi task po ID-u
        const task = await db.Taskovi.findByPk(id);
        if (!task) {
            return res.status(404).json({ message: 'Task nije pronađen' });
        }
        

        // Verifikuj task
        task.verifikacija = true;
        await task.save();

        // Ako task ima povezanu prijavu smetnji, ažuriraj njen status
        if (task.prijavaSmetnjiId) {
            const complaint = await db.PrijavaSmetnji.findByPk(task.prijavaSmetnjiId);
            if (complaint) {
                complaint.status = 'Ovjereno'; // Ažuriraj status na "Ovjereno"
                await complaint.save();

                // Pošalji email osobi koja je prijavila smetnju
                const subject = `Vaša prijava je ovjerena`;
                const validationLink = `http://192.168.35.62:3001/validacija/${task.id}`;  // Dinamički generisani link za validaciju
                const text = `Poštovani, vaša prijava pod nazivom "${complaint.opis}" je sada ovjerena. 
                Vašu prijavu trebate validirati na linku: ${validationLink} 
                Hvala Vam!`;
                await sendEmail(complaint.email, subject, text);
            }
        }

        return res.json({ message: 'Task je uspješno ovjeren i status prijave je ažuriran.' });
    } catch (error) {
        console.error('Greška prilikom verifikacije taska:', error.message);
        return res.status(500).json({ message: 'Greška na serveru.' });
    }
});



router.put('/validate/:taskId', async (req, res) => {
    const { taskId } = req.params;
    const { validation, comment } = req.body;

    try {
        const task = await db.Taskovi.findByPk(taskId);

        if (!task) {
            return res.status(404).json({ message: 'Task nije pronađen' });
        }

        // Pronađi prijavu smetnji povezanu s taskom
        const complaint = await db.PrijavaSmetnji.findByPk(task.prijavaSmetnjiId);

        if (!complaint) {
            return res.status(404).json({ message: 'Prijava smetnji nije pronađena' });
        }

        // Ažuriraj validaciju i komentar u tabeli PrijavaSmetnji
        complaint.validacija = validation === 'Odobreno';  // Ako je validacija odobrena, postavi true
        complaint.comment = comment || '';  // Postavi komentar ako postoji

        await complaint.save();  // Spasi promjene u bazi


        return res.json({ message: 'Validacija uspješno spremljena.' });
    } catch (error) {
        console.error('Greška prilikom validacije taska:', error);
        return res.status(500).json({ message: 'Greška prilikom validacije.' });
    }
});


// Ruta za završavanje taska od strane radnika
router.put('/complete-task/:id', async (req, res) => {
    try {
        const taskId = req.params.id;
        const task = await db.Taskovi.findByPk(taskId);

        if (!task) {
            return res.status(404).json({ message: 'Task nije pronađen' });
        }

        // Ažuriraj status na "Završeno"
        task.status = 'Završeno';
        await task.save();

        // Pronađi radnika koji je završio task
        const user = await db.User.findByPk(task.userId);
        if (!user) {
            return res.status(404).json({ message: 'Radnik nije pronađen' });
        }

        // Pronađi šefa sektora kojem treba poslati email
        const sectorManager = await db.User.findOne({
            where: { sector: task.sector, role: 'Sector Manager' }
        });

        if (sectorManager) {
            const subject = `Task je završen: ${task.sifra_taska}`;
            const text = `Radnik ${user.firstname} ${user.lastname} je završio task: "${task.naziv_taska}". Molimo da ga ovjerite.`;

            await sendEmail(sectorManager.email, subject, text);
        }

        res.json({ message: 'Task je uspješno završen i email je poslan šefu sektora!' });
    } catch (error) {
        console.error('Greška prilikom završavanja taska:', error);
        res.status(500).json({ message: 'Greška na serveru' });
    }
});

// Ruta za kreiranje novog taska
router.post('/create-task', async (req, res) => {
    try {
        const { prijavaSmetnjiId, sifra_taska, naziv_taska, tekst_taska, prioritet, userId } = req.body;

        const newTask = await db.Taskovi.create({
            prijavaSmetnjiId,
            sifra_taska,
            naziv_taska,
            tekst_taska,
            prioritet,
            status: 'U toku',
            userId
        });

        if (prijavaSmetnjiId) {
            await db.PrijavaSmetnji.update({ hasTask: true }, { where: { id: prijavaSmetnjiId } });
        }

        // Pošalji email radniku
        const radnik = await db.User.findByPk(userId);
        if (radnik) {
            const subject = `Novi task: ${sifra_taska}`;
            const text = `Dobili ste novi task: "${naziv_taska}" sa šifrom: ${sifra_taska}. Molimo da obratite pažnju.`;
            await sendEmail(radnik.email, subject, text);
        }

        res.json(newTask);
    } catch (error) {
        console.error('Greška prilikom kreiranja taska:', error);
        res.status(500).json({ message: 'Greška na serveru' });
    }
});

// PUT ruta za dodavanje ili ažuriranje komentara za task
router.put('/add-comment/:taskId', async (req, res) => {
    console.log(req.body);
    const { taskId } = req.params;
    const { comment } = req.body;

    try {
        // Prikazi log kako bi bio siguran da primaš ID taska i komentar
        console.log(`Primljen taskId: ${taskId}, Primljen komentar: ${comment}`);

        const task = await db.Taskovi.findByPk(taskId); // Provjerite da model "Taskovi" postoji u vašoj bazi

        if (!task) {
            return res.status(404).json({ message: 'Task nije pronađen.' });
        }

        // Ažuriraj task s novim komentarom
        task.comment = comment;
        await task.save();

        console.log('Komentar uspješno ažuriran:', task.comment);

        return res.json({ message: 'Komentar uspješno ažuriran.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Greška prilikom ažuriranja komentara.' });
    }
});

// Ruta za dohvaćanje taskova specifičnih za određenog korisnika
router.get('/worker-tasks', async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Pristup odbijen. Nema tokena.' });

    try {
        const decoded = jwt.verify(token, 'tajna');
        const userId = decoded.id;

        console.log('Dohvaćen userId:', userId);

        const tasks = await db.Taskovi.findAll({
            where: { userId }
        });

        if (!tasks || tasks.length === 0) {
            return res.status(404).json({ message: 'Nema taskova za prikaz.' });
        }

        res.json(tasks);
    } catch (error) {
        console.error('Greška na serveru prilikom dohvatanja taska:', error);
        res.status(500).json({ message: 'Greška na serveru prilikom dohvatanja taska.' });
    }
});

router.get('/:taskId', async (req, res) => {
    const { taskId } = req.params;

    try {
        const task = await db.Taskovi.findByPk(taskId);

        if (!task) {
            return res.status(404).json({ message: 'Task nije pronađen.' });
        }

        res.json(task); // Vrati task kao odgovor
    } catch (error) {
        console.error('Greška prilikom dohvatanja taska:', error);
        res.status(500).json({ message: 'Greška na serveru prilikom dohvatanja taska.' });
    }
});

module.exports = router;

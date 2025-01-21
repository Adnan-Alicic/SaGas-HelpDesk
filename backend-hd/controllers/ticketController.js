const db = require('../models');
const sendEmail = require('../services/emailService');
const logController = require('../services/logService');
const { Users, Taskovi } = require('../models');
const { logActivity } = require('../services/logService');

// Kreiranje novog tiketa
exports.createTicket = async (req, res) => {
    try {
        const { title, description, userId } = req.body;
        const ticket = await db.Ticket.create({
            title,
            description,
            userId
        });

        // Logovanje kreiranja tiketa
        await logController.logTaskAction(userId, 'ticket-create', ticket.id);

        res.status(201).json(ticket);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Nešto je pošlo po zlu prilikom kreiranja tiketa.' });
    }
};

// Dobijanje svih tiketa
exports.getAllTickets = async (req, res) => {
    try {
        const tickets = await db.Ticket.findAll();
        res.json(tickets);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Nešto je pošlo po zlu prilikom dobijanja tiketa.' });
    }
};

// Ažuriranje tiketa
exports.updateTicket = async (req, res) => {
    try {
        const { title, description } = req.body;
        const ticket = await db.Ticket.findByPk(req.params.id);
        if (ticket) {
            ticket.title = title;
            ticket.description = description;
            await ticket.save();

            // Logovanje ažuriranja tiketa
            await logController.logTaskAction(ticket.userId, 'ticket-update', ticket.id);

            res.json(ticket);
        } else {
            res.status(404).json({ error: 'Ticket nije pronađen.' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Nešto je pošlo po zlu prilikom ažuriranja tiketa.' });
    }
};

// Brisanje tiketa
exports.deleteTicket = async (req, res) => {
    try {
        const ticket = await db.Ticket.findByPk(req.params.id);
        if (ticket) {
            await ticket.destroy();

            // Logovanje brisanja tiketa
            await logController.logTaskAction(ticket.userId, 'ticket-delete', ticket.id);

            res.status(204).send();
        } else {
            res.status(404).json({ error: 'Ticket nije pronađen.' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Nešto je pošlo po zlu prilikom brisanja tiketa.' });
    }
};

// Funkcija kada radnik završi task
exports.completeTask = async (req, res) => {
    const { taskId, userId } = req.body;

    try {
        const task = await Taskovi.findByPk(taskId);
        const radnik = await Users.findByPk(userId); // Radnik koji završava task

        if (task && radnik) {
            task.status = 'completed';
            await task.save();

            // Logovanje aktivnosti
            await logActivity(userId, 'complete_task', `Završen task sa ID: ${task.id}`);

            // Pronađi voditelja sektora na osnovu sektora radnika i role 'Sector Manager'
            const voditelj = await Users.findOne({ where: { role: 'Sector Manager', sector: radnik.sector } });

            if (voditelj) {
                // Slanje emaila voditelju
                const subject = `Task završen: ${task.sifra_taska}`;
                const text = `Task "${task.naziv_taska}" sa šifrom "${task.sifra_taska}" je uspješno završen.`;

                await sendEmail(voditelj.email, subject, text);

                // Logovanje završetka taska
                await logController.logTaskAction(userId, 'task-complete', task.id);

                res.status(200).json({ message: 'Task je završen i email je poslan voditelju.' });
            } else {
                res.status(404).json({ message: 'Nije pronađen voditelj za ovaj sektor.' });
            }
        } else {
            res.status(404).json({ message: 'Task ili radnik nije pronađen.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Došlo je do greške.', error });
    }
};

// Funkcija za kreiranje taska i slanje obavještenja radniku
exports.createTask = async (req, res) => {
    const { naziv_taska, sifra_taska, userId } = req.body;

    try {
        const task = await Taskovi.create({
            naziv_taska,
            sifra_taska,
            userId,
            status: 'pending',
        });

        // Pronađi radnika kojem je task dodijeljen
        const radnik = await Users.findByPk(userId);

        if (radnik && radnik.role === 'User') {
            // Slanje emaila radniku
            const subject = `Novi task: ${task.sifra_taska}`;
            const text = `Dobili ste novi task "${task.naziv_taska}". Molimo da se posvetite zadatku.`;

            await sendEmail(radnik.email, subject, text);

            // Logovanje kreiranja taska
            await logController.logTaskAction(userId, 'task-create', task.id);

            res.status(201).json({ message: 'Task kreiran i obavještenje poslano radniku.' });
        } else {
            res.status(404).json({ message: 'Radnik nije pronađen ili nema ulogu User.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Došlo je do greške prilikom kreiranja taska.', error });
    }
};



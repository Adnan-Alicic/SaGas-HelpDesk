const { Reports, Taskovi, PrijavaSmetnji } = require('../models');
const { logActivity } = require('../services/logService');
// Kreiranje i generisanje izveštaja
exports.generateReport = async (req, res) => {
    try {
        const { status, priority, verification, validation, sector } = req.query;
        let filters = {};

        if (status) filters.status = status;
        if (priority) filters.priority = priority;
        if (verification) filters.verification = verification === 'true';
        if (validation) filters.validation = validation === 'true';
        if (sector) filters.sector = sector;

        const tasks = await Taskovi.findAll({ where: filters });
        const complaints = await PrijavaSmetnji.findAll();

        res.json({ tasks, complaints });
    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({ error: 'Error generating report' });
    }
};

exports.createComplaint = async (req, res) => {
    try {
        const { userId } = req.body; // Pretpostavljamo da dolazi user ID
        const complaint = await PrijavaSmetnji.create({ ...req.body });

        // Logovanje aktivnosti
        await logActivity(userId, 'create_complaint', `Kreirana prijava sa ID: ${complaint.id}`);

        res.status(201).json({ message: 'Prijava je uspešno kreirana.', complaint });
    } catch (error) {
        console.error('Greška prilikom kreiranja prijave:', error);
        res.status(500).json({ message: 'Greška na serveru.' });
    }
};


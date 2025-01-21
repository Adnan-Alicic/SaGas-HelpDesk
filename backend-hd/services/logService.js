
const { Log, User } = require('../models');
// Definicija funkcija
exports.logActivity = async (userId, action, description = '') => {
    try {
        console.log(`Logovanje aktivnosti: ${action} za korisnika sa ID: ${userId}`);
        await Log.create({
            user_id: userId,
            action,
            description,
            timestamp: new Date(),
        });
        console.log(`Aktivnost ${action} logovana za korisnika sa ID: ${userId}`);
    } catch (error) {
        console.error('Greška prilikom logovanja aktivnosti:', error);
    }
};

exports.logLogin = async (userId) => {
    try {
        console.log(`Logovanje prijave za korisnika sa ID: ${userId}`);
        await Log.create({
            user_id: userId,
            action: 'login',
            description: 'Korisnik se uspešno prijavio',
            timestamp: new Date(),
        });
        console.log(`Login log kreiran za korisnika sa ID: ${userId}`);
    } catch (error) {
        console.error('Greška prilikom logovanja prijave:', error);
    }
};

exports.logLogout = async (userId) => {
    try {
        console.log(`Logovanje odjave za korisnika sa ID: ${userId}`);
        await Log.create({
            user_id: userId,
            action: 'logout',
            description: 'Korisnik se uspešno odjavio',
            timestamp: new Date(),
        });
        console.log(`Logout log kreiran za korisnika sa ID: ${userId}`);
    } catch (error) {
        console.error('Greška prilikom logovanja odjave:', error);
    }
};



// Funkcija za dohvaćanje svih logova
exports.getLogs = async () => {
    try {
        const logs = await Log.findAll({
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['firstname', 'lastname', 'email'], // Prilagodite atribute po potrebi
                },
            ],
        });
        console.log('Dohvaćeni logovi:', logs);
        return logs;
    } catch (error) {
        console.error('Greška prilikom dohvatanja logova:', error);
        throw error;
    }
};

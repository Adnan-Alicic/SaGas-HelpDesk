// Importovanje osnovnih modula
const express = require('express'); // Web framework za Node.js
const bodyParser = require('body-parser'); // Middleware za parsiranje tela HTTP zahteva
const session = require('express-session'); // Middleware za sesije
const passport = require('passport'); // Middleware za autentifikaciju
const Sequelize = require('sequelize'); // ORM za rad sa bazama podataka
const cors = require('cors'); // Middleware za omogućavanje CORS-a
const swaggerConfig = require('./config/swagger'); // Import Swagger konfiguracije
const path = require('path');
// Kreiranje Express aplikacije
const app = express(); // Ova linija mora biti pre korišćenja 'app'
require('./config/passport-config')(passport); // Konfiguracija Passport-a

// Omogućavanje CORS-a za sve zahteve
app.use(cors({
    origin: '*'
}));
// Testiranje konekcije sa bazom
const sequelize = new Sequelize('SaGas', 'postgres', 'adminadmin', {
    host: 'localhost',
    dialect: 'postgres'
});

// Testiranje konekcije sa bazom
sequelize.authenticate()
    .then(() => console.log('Povezan sa bazom podataka.'))
    .catch(err => console.error('Neuspela konekcija sa bazom:', err));

// Middleware za parsiranje JSON i URL-encoded podataka
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Konfiguracija sesija
app.use(session({
    secret: 'tajnaRečZaSesiju', // Tajna reč za enkripciju sesija
    resave: false, // Ne obnavlja sesiju ako nema promena
    saveUninitialized: false, // Ne čuva prazne sesije
}));



// Inicijalizacija Passport-a za autentifikaciju
app.use(passport.initialize());
app.use(passport.session());
//Iport AD Logina

// Importovanje ruta
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const tasksRouter = require('./routes/tasks');
const reportIssueRoutes = require('./routes/reportIssue');
const workerRoutes = require('./routes/worker');
const ticketController = require('./controllers/ticketController');

// Korišćenje ruta
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes); // Korištenje admin ruta
app.use('/api/tasks', tasksRouter);
app.use('/api', workerRoutes);
app.use('/api/report-issue', reportIssueRoutes);

app.use(express.json());

// Rute za taskove
app.post('/task/complete', ticketController.completeTask);
app.post('/task/create', ticketController.createTask);

// Posluži statičke fajlove iz React build direktorijuma
app.use(express.static(path.join(__dirname, 'frontend/build')));

app.get('/worker-dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/build/index.html')); // Ovo šalje index.html za sve rute
});

// Dodavanje Swagger dokumentacije
swaggerConfig(app); // Dodavanje Swagger dokumentacije


process.on('uncaughtException', (err) => {
    console.error('Neadresirana greška:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Neadresirano odbijanje obećanja:', reason);
});




// Startovanje servera

const PORT = process.env.PORT || 3000;
app.listen(3000, '0.0.0.0', () => {
    console.log(`Server je pokrenut na portu ${PORT}`);
    console.log(`API dokumentacija je dostupna na http://localhost:${PORT}/api-docs`);
});
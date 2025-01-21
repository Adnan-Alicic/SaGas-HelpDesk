require('dotenv').config();
const ldap = require('ldapjs');

module.exports = {
    adminDN: process.env.LDAP_ADMIN_DN,
    adminPassword: process.env.LDAP_ADMIN_PASSWORD,

    userSearchBase: process.env.LDAP_USER_BASE,
    createLdapClient: () => {
        if (!process.env.LDAP_URL) {
            throw new Error('LDAP_URL nije definisan u .env fajlu');
        }
        return ldap.createClient({
            url: process.env.LDAP_URL,
        });
    },
};



/*require('dotenv').config();

const ldap = require('ldapjs');

const createLdapClient = () => {
    const client = ldap.createClient({
        url: process.env.LDAP_URL || '', // Uzimanje URL-a iz okruženja ili default
    });

    client.on('error', (err) => {
        console.error('LDAP Client Error:', err);
    });

    return client;
};

const ldapConfig = {
    adminDN: process.env.LDAP_ADMIN_DN || '', // Administrator DN
    adminPassword: process.env.LDAP_ADMIN_PASSWORD || '', // Administrator lozinka
    userSearchBase: '', // Mjesto gdje pretražuje korisnike
    createLdapClient,
};

module.exports = ldapConfig;


 
  passport-ldap.js
const passport = require('passport');
const LdapStrategy = require('passport-ldapauth');

// LDAP konfiguracija
const LDAP_OPTIONS = {
    server: {
        url: '', // Zameni sa URL-om vašeg DC-a
        bindDN: '', // Admin DN
        bindCredentials: '', // Admin lozinka
        searchBase: '', // Baza pretrage
        searchFilter: '(mail={{username}})' // Pretraga po emailu
    }
};

// Postavljanje LDAP strategije za Passport autentifikaciju
passport.use(new LdapStrategy(LDAP_OPTIONS, (user, done) => {
    console.log('Ulogovani korisnik iz LDAP-a:', user); // Loguj LDAP korisničke podatke
    done(null, user);
}));

// Serijalizacija i deserializacija korisnika
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

module.exports = passport;*/

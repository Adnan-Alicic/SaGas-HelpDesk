const xlsx = require('xlsx');
const fs = require('fs');
const bcrypt = require('bcrypt');

// Učitajte Excel fajl
const workbook = xlsx.readFile('employees.xlsx'); // Zamenite 'employees.xlsx' nazivom vašeg fajla
const sheetName = workbook.SheetNames[0];
const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

// Obrada podataka i generisanje lozinki
const preparedUsers = sheetData.map(user => {
    // Provera da li nedostaju obavezni podaci
    if (!user.firstname || !user.lastname || !user.email) {
        console.error('Nedostaju obavezna polja za korisnika:', user);
        return null; // Preskače korisnika sa nedostajućim podacima
    }

    // Generisanje i hesiranje lozinke
    const password = `${user.firstname}!23`; // Generisanje lozinke
    const hashedPassword = bcrypt.hashSync(password, 10); // Hesiranje lozinke

    return {
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        password: hashedPassword, // Hesirana lozinka
        role: user.role || 'User', // Defaultna rola ako nije uneta
        sector: user.sector || null, // Default na null ako nije uneto
        pozicija: user.pozicija || 'Employee', // Defaultna pozicija ako nije uneta
    };
});

// Filtrirajte null vrednosti (nedostajući korisnici)
const validUsers = preparedUsers.filter(user => user !== null);

// Sačuvajte pripremljene podatke u JSON fajl
fs.writeFileSync('preparedUsers.json', JSON.stringify(validUsers, null, 2));
console.log('Korisnici su uspešno pripremljeni za unos u bazu!');

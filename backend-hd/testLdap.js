const ldap = require('ldapjs');

const client = ldap.createClient({
    url: 'ldap://192.168.35.247:389',
});

const adminDN = 'CN=Administrator,CN=Users,DC=sarajevogas,DC=ba';
const adminPassword = '5@r@jev.6@51975#!';
const baseDN = 'OU=Butila,OU=Sarajevogas,DC=sarajevogas,DC=ba';


client.bind(adminDN, adminPassword, (err) => {
    if (err) {
        console.error('LDAP bind greška:', err);
        return;
    }
    console.log('Bind uspješan!');

    const searchOptions = {
        filter: '(sAMAccountName=enver.mehic)', // Ili `(cn=Enver Mehic)`
        scope: 'sub',
        attributes: ['cn', 'mail', 'distinguishedName'],
    };
    

    console.log('Pretražujem bazu:', baseDN);

    client.search(baseDN, searchOptions, (err, res) => {
        if (err) {
            console.error('Greška tokom pretrage:', err);
            return;
        }

        res.on('searchEntry', (entry) => {
            console.log('Cijeli zapis korisnika:', entry.object); // Ovo će prikazati sve dostupne atribute
            if (entry.object) {
                console.log('Pronađeni atributi:', entry.object.Name);
            } else {
                console.log('Korisnik nije pronađen ili nema atribute.');
            }
        });
        

        res.on('error', (err) => {
            console.error('Greška tokom obrade rezultata pretrage:', err);
        });

        res.on('end', (result) => {
            console.log('Pretraga završena. Status:', result.status);
            client.unbind();
        });
    });
});

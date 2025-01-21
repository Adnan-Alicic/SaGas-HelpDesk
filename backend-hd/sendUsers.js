const fetch = require('node-fetch');
const fs = require('fs');

// Učitajte pripremljene korisnike sa lozinkama
const users = JSON.parse(fs.readFileSync('preparedUsers.json', 'utf-8'));

// Hardkodirani token za testiranje (zamenite ovo sa stvarnim tokenom)
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6IkFkbWluIiwiaWF0IjoxNzMzODM0NzA4LCJleHAiOjE3MzM4MzgzMDh9.AMqMWu3josDYwhVy7gYFkvG4mRHqXimD5JPlISSfSdE'; // Zamenite sa pravim tokenom

async function sendUsers() {
    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/';
    try {
        const response = await fetch(`${apiBaseUrl}admin/bulk-insert`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`, // Dodavanje tokena u zaglavlje
            },
            body: JSON.stringify({ users }),
        });

        const data = await response.json();
        console.log('Rezultat:', data);
    } catch (error) {
        console.error('Greška prilikom slanja korisnika:', error);
    }
}

sendUsers();

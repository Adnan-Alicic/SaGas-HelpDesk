import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

const AdminPage = () => {
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('User');
    const [message, setMessage] = useState('');
    const history = useHistory();

    // Provera da li je korisnik admin
    useEffect(() => {
        const userRole = localStorage.getItem('userRole'); // Pretpostavka da čuvaš ulogu korisnika u localStorage
        if (userRole !== 'Admin') {
            history.push('/login'); // Ako korisnik nije admin, preusmeri na login
        }
    }, [history]);

    const handleCreateUser = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/admin/create-user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ firstname, lastname, email, password, role }),
            });

            const data = await response.json();
            if (response.ok) {
                setMessage('Korisnik kreiran uspešno.');
            } else {
                setMessage(`Greška: ${data.message}`);
            }
        } catch (error) {
            setMessage('Došlo je do greške prilikom kreiranja korisnika.');
        }
    };

    return (
        <div>
            <h2>Kreiraj novog korisnika</h2>
            <input
                type="text"
                placeholder="Ime"
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
            />
            <input
                type="text"
                placeholder="Prezime"
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
            />
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                type="password"
                placeholder="Lozinka"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="User">User</option>
                <option value="Admin">Admin</option>
            </select>
            <button onClick={handleCreateUser}>Kreiraj korisnika</button>
            {message && <p>{message}</p>}
        </div>
    );
};

export default AdminPage;

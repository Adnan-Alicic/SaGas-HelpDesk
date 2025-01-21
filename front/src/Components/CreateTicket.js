import React, { useState } from 'react';

const CreateTicket = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [workerId, setWorkerId] = useState('');

    const handleCreateTicket = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/tickets`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title, description, workerId }),
            });
            const data = await response.json();
            if (response.ok) {
                console.log('Ticket kreiran:', data);
                // Prikaz poruke o uspehu ili osveži listu tiketa
            } else {
                console.error('Greška prilikom kreiranja tiketa:', data.message);
            }
        } catch (error) {
            console.error('Greška:', error);
        }
    };

    return (
        <div>
            <h2>Kreiraj Ticket</h2>
            <input type="text" placeholder="Naslov" value={title} onChange={(e) => setTitle(e.target.value)} />
            <textarea placeholder="Opis" value={description} onChange={(e) => setDescription(e.target.value)} />
            <input type="text" placeholder="ID radnika" value={workerId} onChange={(e) => setWorkerId(e.target.value)} />
            <button onClick={handleCreateTicket}>Kreiraj Ticket</button>
        </div>
    );
};

export default CreateTicket;

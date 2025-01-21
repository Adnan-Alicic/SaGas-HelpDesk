import React, { useState, useEffect } from 'react';
import './Validacija.css';
import { Button, Modal, ModalBody, ModalFooter } from 'reactstrap';
import { useParams, useNavigate } from 'react-router-dom';

function Validacija() {
    const { taskId } = useParams(); // Preuzimamo taskId iz URL-a
    const [task, setTask] = useState(null);
    const [validationResult, setValidationResult] = useState('');
    const [comment, setComment] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTask = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/tasks/${taskId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                const data = await response.json();
                setTask(data);
            } catch (error) {
                console.error('Greška prilikom preuzimanja taska:', error);
            }
        };

        fetchTask();
    }, [taskId]);

    const submitValidation = async () => {
        if (!validationResult) {
            alert('Molimo odaberite validaciju: Odobreno ili Odbijeno.');
            return;
        }

        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/tasks/validate/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ validation: validationResult, comment }),
            });

            if (response.ok) {
                alert('Validacija je uspješno poslana!');
                navigate('/'); // Preusmjeri na dashboard nakon validacije
            } else {
                alert('Greška prilikom validacije.');
            }
        } catch (error) {
            console.error('Greška prilikom slanja validacije:', error);
            alert('Došlo je do greške na serveru.');
        }
    };

    return (
        <div className='validacija-container'>
            <h2 id='validacija-h2'>Validacija taska {task && task.naziv_taska}</h2>
            <div className='validation-options'>
                <label>
                    <input
                        type='radio'
                        name='validation'
                        value='Odobreno'
                        onChange={() => setValidationResult('Odobreno')}
                    />
                    Odobreno
                </label>
                <label>
                    <input
                        type='radio'
                        name='validation'
                        value='Odbijeno'
                        onChange={() => setValidationResult('Odbijeno')}
                    />
                    Odbijeno
                </label>
            </div>

            {validationResult === 'Odbijeno' && (
                <div>
                    <label>Unesite razlog odbijanja:</label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className='comment-box'
                        placeholder='Unesite komentar...'
                    />
                </div>
            )}

            <Button className='btn-submit' onClick={submitValidation}>Pošalji validaciju</Button>
        </div>
    );
}

export default Validacija;

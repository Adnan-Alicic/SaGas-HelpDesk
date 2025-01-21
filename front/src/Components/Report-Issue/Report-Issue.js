import React, { useState, useEffect } from 'react'; // Dodajte useEffect ovdje
import './Report-Issue.css';
import { Button } from "reactstrap";
import { Link } from "react-router-dom";
import { BrowserView, MobileView } from "react-device-detect";

function ReportIssue() {
    const [selectedOption, setSelectedOption] = useState('');
    const [modal, setModal] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [sectors, setSectors] = useState([]); // State za čuvanje sektora

    const handleChange = (event) => {
        setSelectedOption(event.target.value);
    };

    const toggleModal = () => {
        if (modal) {
            setName('');
            setEmail('');
            setMessage('');
            setSelectedOption('');
        }
        setModal(!modal);
    };

    const fetchSectors = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/report-issue/sectors`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
            });
            const data = await response.json();
            console.log('Dohvaćeni sektori:', data); 
            setSectors(data || []); 
        } catch (error) {
            console.error('Greška prilikom dohvata sektora:', error);
        }
    };





    useEffect(() => {
        fetchSectors(); // Dohvati sektore kad se komponenta učita
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/report-issue`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, sector: selectedOption, message }),
            });

            if (response.ok) {
                alert('Smetnja je uspješno prijavljena!');
                toggleModal();
            } else {
                alert('Došlo je do greške prilikom prijave smetnje.');
            }
        } catch (error) {
            console.error('Greška prilikom slanja prijave smetnje:', error);
            alert('Došlo je do greške prilikom slanja prijave smetnje.');
        }
    };

    return (
        <>
            <Button className='button-add-issue'
                onClick={toggleModal}
                size="lg"
                tag={Link}> 
                <BrowserView> Prijavite smetnju</BrowserView>
                <MobileView> Prijavite smetnju </MobileView>
            </Button>

            {modal && (
                <div className='modal'>
                    <div className='overlay-issue'></div>
                    <div className="container-issue">
                        <div className="form-container">
                            <h2 id='issue-title-modal'>Prijavi smetnju:</h2>
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <input 
                                        type="text" 
                                        id="name" 
                                        name="name" 
                                        placeholder="Ime i Prezime" 
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required 
                                    />
                                </div>
                                <div className="form-group">
                                    <input 
                                        type="email" 
                                        id="email-issue" 
                                        name="email" 
                                        placeholder="tvoj_email@sarajevogas.ba" 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required 
                                    />
                                </div>
                                <div className="form-group">
                                    <label id='porukaBoja' htmlFor="message">Poruka:</label>
                                    <textarea 
                                        id="message" 
                                        name="message" 
                                        rows="4" 
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        required
                                    ></textarea>
                                </div>
                                <div className="form-group">
                                    <select 
                                        value={selectedOption}
                                        onChange={handleChange}
                                        className={selectedOption === '' ? 'select-default' : 'select-active'} 
                                        name="sector" 
                                        required
                                    >
                                        <option value="" disabled>Izaberi sektor</option>
                                        {sectors.map(sector => (
                                            <option key={sector.id} value={sector}>{sector}</option>
                                        ))}
                                    </select>
                                </div>
                                <button className='button-save-issue' type="submit">Pošalji</button>
                                <button onClick={toggleModal} type="button" id='closebtn'>Zatvori</button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default ReportIssue;

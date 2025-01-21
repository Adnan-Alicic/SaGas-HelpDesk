import React, { useState, useEffect } from "react";
import './Add-Edit-Task.css';
import { Button } from "reactstrap";
import { Link } from "react-router-dom";
import { BrowserView, MobileView } from "react-device-detect";
import Swal from 'sweetalert2';

function AddEditTask({ isOpen, toggle, defaultData, onTaskCreated }) { // Primamo isOpen, toggle, i defaultData propse
  const [modal, setModal] = useState(false);
  const [workers, setWorkers] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [sector, setSector] = useState('');
  const [priority, setPriority] = useState('');
  const [workerEmail, setWorkerEmail] = useState('');
  const [status, setStatus] = useState('U toku');

  useEffect(() => {
    setModal(isOpen);
    if (defaultData) {
      setSector(defaultData.sektor || '');
      setDescription(defaultData.opis || '');
    }
  }, [isOpen, defaultData]);

  const fetchWorkers = async () => {
    try {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/workers?sector=${encodeURIComponent(sector)}`);
        if (!response.ok) {
            throw new Error(`Greška: ${response.statusText}`);
        }
        const data = await response.json();
        setWorkers(data);
    } catch (error) {
        console.error('Greška prilikom preuzimanja radnika:', error);
    }
};

  useEffect(() => {
    if (sector) {
      fetchWorkers();
    }
  }, [sector]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Generiši šifru taska (ili možeš tražiti od korisnika da unese)
    const sifra_taska = `TASK-${Math.floor(Math.random() * 100000)}`;

    // Pronađi userId na osnovu emaila radnika (moraš dobiti userId iz baze na osnovu emaila)
    const selectedWorker = workers.find(worker => worker.email === workerEmail);

    if (!selectedWorker) {
        Swal.fire('Greška', 'Nema radnika s ovim emailom', 'error');
        return;
    }

    const userId = selectedWorker.id; // Dobij userId radnika

    // Provjeri da li sektor postoji
    console.log('Sector koji se šalje:', sector);

    try {
        // Priprema tijela zahtjeva
        const body = {
            naziv_taska: title,
            tekst_taska: description,
            prioritet: priority,
            sifra_taska, // Dodaj šifru taska
            userId, // Dodaj ID radnika
            sector, // Dodaj sektor
            status,
        };

        // Ako postoji prijava smetnji, dodaj prijavaSmetnjiId u tijelo zahtjeva
        if (defaultData && defaultData.prijavaId) {
            body.prijavaSmetnjiId = defaultData.prijavaId;
        }

        // Slanje zahtjeva za kreiranje taska
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/tasks/create-task`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (response.ok) {
            Swal.fire('Uspjeh!', 'Task je uspješno kreiran!', 'success');
            onTaskCreated(defaultData ? defaultData.prijavaId : null); // Ažuriraj prijave na parent komponenti
            toggle(); // Zatvori modal nakon uspješnog kreiranja taska
        } else {
            Swal.fire('Greška', 'Došlo je do greške prilikom kreiranja taska.', 'error');
        }
    } catch (error) {
        console.error('Greška prilikom slanja taska:', error);
        Swal.fire('Greška', 'Došlo je do greške prilikom slanja taska.', 'error');
    }
};



  return (
    <>
      <BrowserView>
        {modal && (
          <div className="modal">
            <div className="overlay"></div>
            <div className="modal-content">
              <div className="login-box-task" style={{marginTop:"7.5%", justifyContent:'center'}}>
                <form onSubmit={handleSubmit}>
                  <input 
                    placeholder="Naziv zadatka" 
                    type="text" 
                    id="title" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required 
                  />
                  <textarea 
                    placeholder="Počnite pisati..." 
                    id="task-description" 
                    name="message" 
                    rows="4" 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  ></textarea>
                  <div className="task-form-actions">
                    <select 
                      id="priority" 
                      name="sector" 
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      required
                    >
                      <option value="" disabled selected>Prioritet</option>
                      <option value="Urgentno">Urgentno</option>
                      <option value="Visoki">Visoki</option>
                      <option value="Srednji">Srednji</option>
                      <option value="Niski">Niski</option>
                    </select>
                    <select 
                      id="worker-select" 
                      value={workerEmail}
                      onChange={(e) => setWorkerEmail(e.target.value)}
                      required
                    >
                      <option value="" disabled selected>Dodijelite task</option>
                      {workers.map(worker => (
                        <option key={worker.id} value={worker.email}>
                          {worker.firstname} {worker.lastname}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="task-form-actions-two">
                    <label id="status-heading">Status:</label>
                    <select 
                      id="task-progress-select" 
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      required
                    >
                      <option value="U toku">U toku</option>
                      <option value="Završeno">Završeno</option>
                    </select>
                  </div>
                  <Button style={{textAlign:"center", textDecoration:"none"}} className='button-save' type="submit" size="lg">
                    Spasi
                  </Button>
                  <button onClick={toggle} type="button" id='closebtntask'>Zatvori</button>
                </form>
              </div>
            </div>
          </div>
        )}
      </BrowserView>

      <MobileView>
        {modal && (
          <div className="modal">
            <div className="overlay"></div>
            <div className="modal-content" style={{width: "70%"}}>
              <Button className="button-close" onClick={toggle}>
                <img style={{width:"100%", height:"100%"}} src="X-icon.png" alt="SarajevoGas Logo" />
              </Button>
              <div className="login-box" style={{marginTop:"25%"}}>
                <h2 style={{color:"#224798", textAlign:"center"}}>Dodajte Task</h2>
                <form onSubmit={handleSubmit}>
                  <label style={{color:"#224798"}} htmlFor="email">Naslov</label>
                  <input 
                    type="text" 
                    id="email" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required 
                  />
                  <label style={{color:"#224798"}} htmlFor="password">Opis</label>
                  <textarea 
                    name="message" 
                    rows="4" 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  ></textarea>
                  <Button style={{textAlign:"center", textDecoration:"none"}} className='button' type="submit" size="lg">
                    Sačuvaj
                  </Button>
                </form>
              </div>
            </div>
          </div>
        )}
      </MobileView>
    </>
  );
}

export default AddEditTask;

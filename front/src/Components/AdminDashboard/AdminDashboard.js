import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Table, Form, Input, FormGroup, Label } from 'reactstrap';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]); // Lista korisnika
    const [logs, setLogs] = useState([]); // Lista logova
    const [reports, setReports] = useState([]); // Lista izveštaja
    const [selectedUser, setSelectedUser] = useState(null); // Selektovani korisnik za izmene
    const [newUser, setNewUser] = useState({ firstname: '', lastname: '', email: '', password: '', role: '',pozicija: '', sector: '' }); // Novi korisnik
    const [logFilter, setLogFilter] = useState({ userId: '', type: '', date: '' }); // Filter za logove
    const [reportFilter, setReportFilter] = useState({ status: '', priority: '', validation: '', verification: '' }); // Filter za izveštaje
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState(''); // Termin za pretragu
    const [filteredUsers, setFilteredUsers] = useState([]); // Filtrirani korisnici


    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
        const userRole = localStorage.getItem('userRole');
        if (userRole !== 'Admin') {
            navigate('/login');
        } else {
            fetchUsers();
            fetchLogs();
            fetchReports();
        }
    }, [navigate]);

    // Fetch korisnika iz baze
    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Token nije pronađen. Prijavite se ponovo.');
            }

            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/admin/users`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            const data = await response.json();
            setUsers(data.users || []);
            setFilteredUsers(data.users || []); // Postavi inicijalne korisnike za prikaz

        } catch (error) {
            console.error('Greška prilikom preuzimanja korisnika:', error);
        }
    };

  // Funkcija za filtriranje korisnika na osnovu termina za pretragu
const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    setFilteredUsers(
        users.filter(user =>
            `${user.firstname} ${user.lastname} ${user.email}`
                .toLowerCase()
                .includes(value)
        )
    );
};
  

    // Fetch logova iz baze
    const fetchLogs = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/admin/logs`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            const data = await response.json();
            setLogs(data.logs || []);
        } catch (error) {
            console.error('Greška prilikom preuzimanja logova:', error);
        }
    };

    // Fetch izveštaja iz baze
    const fetchReports = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/admin/reports`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            const data = await response.json();
            setReports(data.reports || []);
        } catch (error) {
            console.error('Greška prilikom preuzimanja izveštaja:', error);
        }
    };

    // Kreiranje novog korisnika
    const handleCreateUser = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/admin/create-user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(newUser),
            });
            if (response.ok) {
                fetchUsers();
                setNewUser({ firstname: '', lastname: '', email: '', password: '', role: '',pozicija: '', sector: '' });
            } else {
                const errorData = await response.json();
                alert(`Greška prilikom kreiranja korisnika: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Greška prilikom kreiranja korisnika:', error);
        }
    };

    const handleUserUpdate = async (userId) => {
        if (!selectedUser || !selectedUser.firstname || !selectedUser.lastname || !selectedUser.email || !selectedUser.role|| !selectedUser.pozicija || !selectedUser.sector) {
            alert('Molimo unesite sva polja.');
            return;
        }

        console.log('Ažuriranje korisnika:', selectedUser); // debg

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/admin/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    firstname: selectedUser.firstname,
                    lastname: selectedUser.lastname,
                    email: selectedUser.email,
                    role: selectedUser.role,
                    pozicija: selectedUser.pozicija,
                    sector: selectedUser.sector,
                }),
            });

            console.log('Response:', response); // debg

            if (response.ok) {
                setUsers((prevUsers) =>
                    prevUsers.map((user) =>
                        user.id === selectedUser.id ? { ...user, ...selectedUser } : user
                    )
                );
                setSelectedUser(null);
                alert('Podaci korisnika su uspešno ažurirani.');
            } else {
                const errorData = await response.json();
                alert(`Došlo je do greške: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Greška prilikom ažuriranja korisnika:', error);
        }
    };

    const handleDeleteUser = async (userId) => {
        try {
            const token = localStorage.getItem('token'); // Pretpostavljam da token čuvaš u localStorage
            console.log('Token to be sent:', token); // Dodaj log za token
    
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/admin/delete-user/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`, // Dodaj token u zaglavlje
                    'Content-Type': 'application/json',
                },
            });
    
            if (response.ok) {
                fetchUsers(); // Osvježi listu korisnika nakon uspješnog brisanja
            } else {
                const errorMsg = await response.json();
                console.error('Greška prilikom brisanja korisnika:', errorMsg);
            }
        } catch (error) {
            console.error('Greška prilikom brisanja korisnika:', error);
        }
    };

    // Filtriranje logova
    const filterLogs = (log) => {
        const { userId, type, date } = logFilter;
        return (
            (!userId || log.userId === userId) &&
            (!type || log.type === type) &&
            (!date || log.date.startsWith(date))
        );
    };

    // Preuzimanje logova u PDF ili Excel formatu
    const downloadLogs = (format) => {
        window.location.href = `${process.env.REACT_APP_API_BASE_URL}/admin/logs/download?format=${format}`;
    };

    // Preuzimanje izveštaja u PDF ili Excel formatu
    const downloadReports = (format) => {
        window.location.href = `${process.env.REACT_APP_API_BASE_URL}/admin/reports/download?format=${format}`;
    };

    return (
        <div className="admin-dashboard">
            <h2 id='admin-title'>Admin Dashboard</h2>

            {/* Forma za kreiranje korisnika */}
            <h3>Kreiraj novog korisnika</h3>
            <Form>
                <Input placeholder="Ime" value={newUser.firstname} onChange={(e) => setNewUser({ ...newUser, firstname: e.target.value })} />
                <Input placeholder="Prezime" value={newUser.lastname} onChange={(e) => setNewUser({ ...newUser, lastname: e.target.value })} />
                <Input placeholder="Email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
                <Input placeholder="Lozinka" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
                <Input placeholder="Pozicija" value={newUser.pozicija} onChange={(e) => setNewUser({ ...newUser, pozicija: e.target.value })}/>
                <Input type="select" value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
                    <option value="">Izaberi ulogu</option>
                    <option value="User">User</option>
                    <option value="Sector Manager">Sector Manager</option>
                    <option value="Admin">Admin</option>
                </Input>
                <Input type="select" value={newUser.sector} onChange={(e) => setNewUser({ ...newUser, sector: e.target.value })}>
                    <option value="">Izaberi sektor</option>
                    <option value="Sektor za projektovanje i podršku korisnicima">Sektor za projektovanje i podršku korisnicima</option>
                    <option value="Sektor za gradnju, pogon i održavanje">Sektor za gradnju, pogon i održavanje</option>
                    <option value="Sektor ekonomike">Sektor ekonomike</option>
                    <option value="Sektor pravnih, kadrovskih i zajedničkih poslova">Sektor pravnih, kadrovskih i zajedničkih poslova</option>
                </Input>
                <Button onClick={handleCreateUser}>Kreiraj korisnika</Button>
            </Form>

            {/* Lista korisnika */}
            <div className="table-header">
    <h3>Kontrola korisnika</h3>
    <Input
        type="text"
        className="search-input"
        placeholder="Pretraži korisnike..."
        value={searchTerm}
        onChange={handleSearch}
    />
</div>

           <div className="table-container"> 

            <Table>
                <thead>
                    <tr>
                        <th>Ime</th>
                        <th>Prezime</th>
                        <th>Email</th>
                        <th>Uloga</th>
                        <th>Pozicija</th>
                        <th>Sektor</th>
                        <th>Akcije</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredUsers.length > 0 ? (
                        filteredUsers.map(user => (
                            <tr key={user.id}>
                                <td>{user.firstname}</td>
                                <td>{user.lastname}</td>
                                <td>{user.email}</td>
                                <td>{user.role}</td>
                                <td>{user.pozicija}</td>
                                <td>{user.sector}</td>
                                <td>
                                <Button onClick={() => {
                                    console.log('Izabrani korisnik:', user); // Debugging
                                    setSelectedUser(user);}}>
                                    Izmjeni
                                </Button>

                                    <Button onClick={() => handleDeleteUser(user.id)}>Obriši</Button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6">Nema korisnika za prikaz.</td>
                        </tr>
                    )}
                </tbody>
            </Table>
            {selectedUser && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Izmeni korisnika</h3>
                        <Form>
                            <Input
                                placeholder="Ime"
                                value={selectedUser.firstname}
                                onChange={(e) => setSelectedUser({ ...selectedUser, firstname: e.target.value })}
                            />
                            <Input
                                placeholder="Prezime"
                                value={selectedUser.lastname}
                                onChange={(e) => setSelectedUser({ ...selectedUser, lastname: e.target.value })}
                            />
                            <Input
                                placeholder="Email"
                                value={selectedUser.email}
                                onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                            />
                            <Input
                                type="select"
                                value={selectedUser.role}
                                onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                            >
                                <option value="User">User</option>
                                <option value="Sector Manager">Sector Manager</option>
                                <option value="Admin">Admin</option>
                            </Input>
                            <Input
                                type="select"
                                value={selectedUser.pozicija}
                                onChange={(e) => setSelectedUser({ ...selectedUser, pozicija: e.target.value })}
                            >
                                <option value="Rukovodilac sektora">Rukovodilac sektora</option>
                                <option value="Šef službe">Šef službe</option>
                                <option value="User">User</option>
                            </Input>
                            <Input
                                type="select"
                                value={selectedUser.sector}
                                onChange={(e) => setSelectedUser({ ...selectedUser, sector: e.target.value })}
                            >
                                <option value="Sektor za projektovanje i podršku korisnicima">Sektor za projektovanje i podršku korisnicima</option>
                                <option value="Sektor za gradnju, pogon i održavanje">Sektor za gradnju, pogon i održavanje</option>
                                <option value="Sektor ekonomike">Sektor ekonomike</option>
                                <option value="Sektor pravnih, kadrovskih i zajedničkih poslova">Sektor pravnih, kadrovskih i zajedničkih poslova</option>
                            </Input>
                            <div className="modal-actions">
                                <Button onClick={() => handleUserUpdate(selectedUser.id)}>Sačuvaj izmene</Button>
                                <Button onClick={() => setSelectedUser(null)}>Otkaži</Button>
                            </div>
                        </Form>
                    </div>
                </div>
            )}

            </div>

            {/* Logovi */}
            <h3>Pregled i Filtriranje Logova</h3>
            <Form >
                <FormGroup>
                    <Label for="logUserId">Korisnik:</Label>
                    <Input type="select" id="logUserId" value={logFilter.userId} onChange={(e) => setLogFilter({ ...logFilter, userId: e.target.value })}>
                        <option value="">Svi korisnici</option>
                        {users.map(user => (
                            <option key={user.id} value={user.id}>
                                {user.firstname} {user.lastname}
                            </option>
                        ))}
                    </Input>
                </FormGroup>
            </Form>
            <Button onClick={() => downloadLogs('pdf')}>Preuzmi PDF</Button>
            <Button onClick={() => downloadLogs('excel')}>Preuzmi Excel</Button>

            {/* Izveštaji */}
            <h3>Pregled i Filtriranje Izveštaja</h3>
            <Button onClick={() => downloadReports('pdf')}>Preuzmi PDF</Button>
            <Button onClick={() => downloadReports('excel')}>Preuzmi Excel</Button>
        </div>
    );
};

export default AdminDashboard;

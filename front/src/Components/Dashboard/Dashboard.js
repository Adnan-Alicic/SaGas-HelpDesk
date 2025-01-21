import './Dashboard.css';
import { Button } from "reactstrap";
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { BrowserView } from "react-device-detect";
import AddEditTask from '../Add-Edit-Task/Add-Edit-Task';
import ReportIssue from '../Report-Issue/Report-Issue';

function DashBoard() {
    const [role, setRole] = useState('');
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [listView, setListView] = useState(false);
    const [user, setUser] = useState({ firstname: '', lastname: '', sector: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [showComment, setShowComment] = useState({});
    const [showValidation, setShowValidation] = useState({});
    const [loadingComplaints, setLoadingComplaints] = useState(true);
    const [complaints, setComplaints] = useState([]);
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [workers, setWorkers] = useState([]);

    const tasksPerPage = 3;

    useEffect(() => {
        const userRole = localStorage.getItem('userRole');
        setRole(userRole);
        if (userRole !== 'Sector Manager' && userRole !== 'User') {
            navigate('/index');
        }
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (userData) {
            setUser(userData);
        }
    }, [navigate]);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/tasks/all-tasks`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                const data = await response.json();
                setTasks(data);
            } catch (error) {
                console.error('Greška prilikom preuzimanja taskova:', error);
            }
        };
        fetchTasks();
    }, []);

    useEffect(() => {
        const fetchComplaints = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/report-issue/all-complaints`);
                const data = await response.json();
                setComplaints(data);
            } catch (error) {
                console.error("Greška prilikom učitavanja prijava smetnji:", error);
            } finally {
                setLoadingComplaints(false);
            }
        };
        fetchComplaints();
    }, []);

    
    
    const filteredTasks = tasks.filter(task => 
        task.naziv_taska.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.tekst_taska.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastTask = currentPage * tasksPerPage;
    const indexOfFirstTask = indexOfLastTask - tasksPerPage;
    const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);

    const toggleComment = (taskId) => {
        setShowComment((prev) => ({
            ...prev,
            [taskId]: !prev[taskId],
        }));
    };

    const toggleValidation = (taskId) => {
        setShowValidation((prev) => ({
            ...prev,
            [taskId]: !prev[taskId],
        }));
    };

    const handleVerifyTask = async (taskId) => {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/tasks/verify-task/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            alert('Task je uspješno ovjeren!');
            setTasks(tasks.map(t => t.id === taskId ? { ...t, verifikacija: true } : t));
        } else {
            alert('Došlo je do greške prilikom verifikacije taska.');
        }
    };

    const handleCreateTask = (complaint) => {
        setSelectedComplaint(complaint);
        setModalOpen(true);
    };

    return (
        <>
            <BrowserView>
                <div className='body-dashboard'>
                    <div className='image-div'>
                        <img style={{ height: "100%", marginTop: "5px" }} src="SarajevogasLogo2.jpg" alt="SarajevoGas Logo"></img>
                    </div>

                    <div className='heading-div'>
                        <h2 id='h2-ds'>Helpdesk</h2>
                        <Button style={{ textAlign: "center", textDecoration: "none", width: "10%" }} className='button-logout' to="/index" size="lg" tag={Link}>Logout</Button>
                    </div>

                    <div className='greeting-message-div'>
                        <h2 style={{ textAlign: "center", color: "#224798" }}>Dobrodošao, {user.firstname} {user.lastname} ({user.sector})</h2>
                    </div>

                    <div className='task-heading'>
                        <h3>Taskovi</h3>
                        <Button onClick={() => setModalOpen(true)} className='button-add' size="lg">
                                <img style={{ width: "25%", height: "100%" }} src="Plus-icon.png" alt="SarajevoGas Logo" />
                            </Button>
                        <Button onClick={() => setListView(!listView)} className='button-toggle-view' size="lg">
                            {listView ? 'Grid View' : 'List View'}
                        </Button>
                        <input
                            type="text"
                            placeholder="Pretraži taskove"
                            className="search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ marginLeft: "auto", height: "40px" }}
                        />
                    </div>

                    {listView ? (
                        <table className="task-table">
                            <thead>
                                <tr>
                                    <th>Naziv Taska</th>
                                    <th>Datum</th>
                                    <th>Tekst Taska</th>
                                    <th>Prioritet</th>
                                    <th>Radnik</th>
                                    <th>Status</th>
                                    <th>Validacija</th>
                                    <th>Verifikacija</th>
                                    <th>Komentar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentTasks.map(task => (
                                    <tr key={task.id}>
                                        <td>{task.naziv_taska}</td>
                                        <td>{task.datum || '2024-11-05'}</td>
                                        <td>{task.tekst_taska}</td>
                                        <td>{task.prioritet}</td>
                                        <td>{task.User ? `${task.User.firstname} ${task.User.lastname}` : 'N/A'}</td>
                                        <td>{task.status}</td>
                                        <td>
                                            {task.PrijavaSmetnji && task.PrijavaSmetnji.validacija !== null ? (
                                                task.PrijavaSmetnji.validacija 
                                                ? 'Uspješna' 
                                                : (
                                                    <>
                                                        Odbijena: 
                                                        <Button className='btn-show-validation' onClick={() => toggleValidation(task.id)}>
                                                            {showValidation[task.id] ? 'Sakrij' : 'Prikaži'}
                                                        </Button>
                                                        {showValidation[task.id] && (
                                                            <div className='validation-comment'>
                                                                <p>{task.PrijavaSmetnji.comment}</p>
                                                            </div>
                                                        )}
                                                    </>
                                                )
                                            ) : 'N/A'}
                                        </td>
                                        <td>{task.verifikacija ? 'Ovjereno' : 'Nije ovjereno'}</td>
                                        <td>{task.comment ? task.comment : 'Nema komentara'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className='task-list'>
    {currentTasks.length > 0 ? (
        currentTasks.map(task => (
            <div key={task.id} className='task-item'>
                {/* Hard-kodirani datum prikazan u gornjem desnom uglu */}
                <div className="task-date">2024-11-05</div>
                                        <h3>{task.naziv_taska}</h3>
                                        <p>{task.tekst_taska}</p>
                                        <p><strong>Prioritet:</strong> {task.prioritet}</p>
                                        <p><strong>Radnik:</strong> {task.User ? `${task.User.firstname} ${task.User.lastname}` : 'N/A'}</p>
                                        <p><strong>Status:</strong> {task.status}</p>

                                        <p><strong>Komentar:</strong></p>
                                        {task.comment ? (
                                            <>
                                                <Button className='btn-show-comment' onClick={() => toggleComment(task.id)}>
                                                    {showComment[task.id] ? 'Hide Comment' : 'Show Comment'}
                                                </Button>
                                                {showComment[task.id] && (
                                                    <div className='comment-section'>
                                                        <p>{task.comment}</p>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <p>Nema komentara</p>
                                        )}

                                        <p><strong>Validacija:</strong>
                                            {task.PrijavaSmetnji && task.PrijavaSmetnji.validacija !== null ? (
                                                task.PrijavaSmetnji.validacija 
                                                ? 'Uspješna' 
                                                : (
                                                    <>
                                                        Odbijena: 
                                                        <Button className='btn-show-validation' onClick={() => toggleValidation(task.id)}>
                                                            {showValidation[task.id] ? 'Sakrij' : 'Prikaži'}
                                                        </Button>
                                                        {showValidation[task.id] && (
                                                            <div className='validation-comment'>
                                                                <p>{task.PrijavaSmetnji.comment}</p>
                                                            </div>
                                                        )}
                                                    </>
                                                )
                                            ) : 'Validacija nije dostupna'}
                                        </p>

                                        {task.status === 'Završeno' && !task.verifikacija && (
                                            <Button className='btn-ovjera' onClick={() => handleVerifyTask(task.id)}>
                                                Ovjeri
                                            </Button>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p>Nema taskova za prikaz.</p>
                            )}
                        </div>
                    )}

<div className="pagination">
                        {[...Array(totalPages).keys()].map((page) => (
                            <Button
                                key={page + 1}
                                onClick={() => paginate(page + 1)}
                                className={currentPage === page + 1 ? 'active' : ''}
                            >
                                {page + 1}
                            </Button>
                        ))}
                    </div>

                    <div className='task-heading'>
                        <h3 style={{ margin: "10px 0px 0px 16%", color: "#ff0808" }}>Prijave </h3>
                    </div>

                    <div className='complaints-list'>
                        {loadingComplaints ? (
                            <p>Loading prijave smetnji...</p>
                        ) : complaints.length > 0 ? (
                            complaints
                                .sort((a, b) => a.hasTask - b.hasTask)
                                .map(complaint => (
                                    <div key={complaint.id} className='complaint-item'>
                                        <h3>{complaint.opis}</h3>
                                        <p><strong>Sektor:</strong> {complaint.sektor}</p>
                                        <p><strong>Ime:</strong> {complaint.ime}</p>
                                        <p><strong>Email:</strong> {complaint.email}</p>
                                        {complaint.hasTask ? (
                                            <p style={{ color: 'green' }}>Task kreiran</p>
                                        ) : (
                                            <Button onClick={() => handleCreateTask(complaint)}>Kreiraj Task</Button>
                                        )}
                                    </div>
                                ))
                        ) : (
                            <p>Nema prijava smetnji za prikaz.</p>
                        )}
                    </div>

                    {role === 'Sector Manager' && (
                        <div className='footer-div'>
                            <ReportIssue />
                        </div>
                    )}
                </div>
            </BrowserView>

            {modalOpen && (
                <AddEditTask
                    isOpen={modalOpen}
                    toggle={() => setModalOpen(false)}
                    defaultData={selectedComplaint ? {
                        sektor: selectedComplaint.sektor,
                        opis: selectedComplaint.opis,
                        prijavaId: selectedComplaint.id
                    } : {
                        sektor: user.sector,
                        opis: '',
                        prijavaId: null
                    }}
                    workers={workers}
                    onTaskCreated={() => {
                        if (selectedComplaint) {
                            setComplaints(complaints => complaints.map(c =>
                                c.id === selectedComplaint.id ? { ...c, hasTask: true } : c
                            ));
                        }
                        setModalOpen(false);
                    }}
                />
            )}
        </>
    );
}

export default DashBoard;

import './WorkerDash.css';
import { useState, useEffect } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { Link, useNavigate } from 'react-router-dom';
import ReportIssue from '../Report-Issue/Report-Issue';

function WorkerDash() {
    const [tasks, setTasks] = useState([]); 
    const [role, setRole] = useState('');
    const [user, setUser] = useState({ firstname: '', lastname: '', sector: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const tasksPerPage = 3;
    const navigate = useNavigate();

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [commentText, setCommentText] = useState('');
    const [showComment, setShowComment] = useState({});
    const [searchTerm, setSearchTerm] = useState(''); // Stanje za pretragu

    useEffect(() => {
        const userRole = localStorage.getItem('userRole');
        setRole(userRole);

        if (userRole !== 'User') {
            navigate('/');
        }

        const userData = JSON.parse(localStorage.getItem('userData'));
        if (userData) {
            setUser(userData);
        }
    }, [navigate]);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/tasks/worker-tasks`, { 
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                });

                const data = await response.json();
                console.log('Preuzeti podaci:', data); 
            
                if (Array.isArray(data)) {
                    setTasks(data);
                } else {
                    setTasks([]);
                    console.error('Greška: Podaci nisu niz.');
                }
            } catch (error) {
                console.error('Greška prilikom preuzimanja taskova:', error);
            }
        };

        fetchTasks(); 
    }, []);

    // Funkcija za otvaranje/zatvaranje modala
    const toggleModal = (task) => {
        setSelectedTask(task);
        setModalOpen(!modalOpen);
    };

    // Filtriraj taskove na osnovu pretrage
    const filteredTasks = tasks.filter(task => 
        task.naziv_taska.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.tekst_taska.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Funkcija za paginaciju
    const indexOfLastTask = currentPage * tasksPerPage;
    const indexOfFirstTask = indexOfLastTask - tasksPerPage;
    const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);

    // Funkcija za slanje komentara
    const submitComment = async (taskId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/tasks/add-comment/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ comment: commentText })
            });
    
            if (response.ok) {
                alert('Komentar uspješno pohranjen!');
                setTasks(tasks.map(t => t.id === taskId ? { ...t, comment: commentText } : t));
                setCommentText('');
                setModalOpen(false);
            } else {
                const errorMessage = await response.json();
                console.error('Greška prilikom slanja komentara:', errorMessage);
                alert('Došlo je do greške prilikom pohranjivanja komentara.');
            }
        } catch (error) {
            console.error('Greška prilikom slanja komentara:', error);
            alert('Došlo je do greške na serveru.');
        }
    };

    // Funkcija za označavanje taska kao završenog
    const completeTask = async (taskId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/tasks/complete-task/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                alert('Task je uspješno završen!');
                setTasks(tasks.map(t => t.id === taskId ? { ...t, status: 'Završeno' } : t));
            } else {
                alert('Došlo je do greške prilikom završavanja taska.');
            }
        } catch (error) {
            console.error('Greška prilikom završavanja taska:', error);
            alert('Došlo je do greške na serveru.');
        }
    };

    return (
        <>
            <div className='body-dashboard'>
                <div className='image-div'>
                    <img className='logo-img' src="SarajevogasLogo2.jpg" alt="SarajevoGas Logo"></img>
                </div>

                <div className='heading-div'>
                    <h2 id='h2-ds'>Helpdesk</h2>
                    <Button style={{ textAlign: "center", textDecoration: "none", width: "10%" }} className='button-logout' to="/index" size="lg" tag={Link}>Logout</Button>
                </div>

                <div className='greeting-message-div'>
                    <h2 className='greeting-message'>Dobrodošao, {user.firstname} {user.lastname} ({user.sector})</h2>
                </div>

                <div className='task-heading'>
                    <h3>Moji Taskovi</h3>
                    <input
                        type="text"
                        placeholder="Pretraži taskove"
                        className="search-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ marginLeft: "auto", height: "40px" }}
                    />
                </div>

                <div className='task-list'>
    {currentTasks.length > 0 ? (
        currentTasks.map(task => (
            <div key={task.id} className='task-item'>
                {/* Hard-kodirani datum prikazan u gornjem desnom uglu */}
                <div className="task-date">Datum: 2024-11-05</div> 
                
                <h3>{task.naziv_taska}</h3>
                <p>{task.tekst_taska}</p>
                <p><strong>Prioritet:</strong> {task.prioritet}</p>
                <p><strong>Status:</strong> {task.status}</p>

                {task.comment ? (
                    <Button 
                        onClick={() => setShowComment(prev => ({ ...prev, [task.id]: !prev[task.id] }))}
                        className='btn-show-hide'
                    >
                        {showComment[task.id] ? 'Hide Comment' : 'Show Comment'}
                    </Button>
                ) : (
                    <Button className='btn-add-comment' onClick={() => toggleModal(task)}>Dodaj Komentar</Button>
                )}

                {showComment[task.id] && (
                    <div className='comment-section'>
                        <p><strong>Komentar:</strong> {task.comment}</p>
                    </div>
                )}

                                <Button className='btn-done' onClick={() => completeTask(task.id)}>
                                    DONE
                                </Button>
                            </div>
                        ))
                    ) : (
                        <p>Nema taskova za prikaz.</p>
                    )}
                </div>

                {role === 'User' && (
                    <div className='footer-div'>
                        <ReportIssue />
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

                <Modal isOpen={modalOpen} toggle={toggleModal}>
                    <ModalHeader toggle={toggleModal}>Dodaj komentar</ModalHeader>
                    <ModalBody>
                        <textarea
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            className='comment-box'
                            placeholder='Unesite vaš komentar...'
                        />
                    </ModalBody>
                    <ModalFooter>
                        <Button color="primary" onClick={() => submitComment(selectedTask.id)}>Pošalji</Button>{' '}
                        <Button color="secondary" onClick={toggleModal}>Poništi</Button>
                    </ModalFooter>
                </Modal>
            </div>
        </>
    );
}

export default WorkerDash;

import React, { useState } from "react";
import './Login.css';
import { BrowserView } from "react-device-detect";
import { useNavigate } from "react-router-dom";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";

function Login() {
    const [loginType, setLoginType] = useState('local'); // Default je lokalna prijava
    const [username, setUsername] = useState(''); // Za AD prijavu
    const [email, setEmail] = useState(''); // Za lokalnu prijavu
    const [password, setPassword] = useState(''); // Lozinka
    const [errorMessage, setErrorMessage] = useState(''); // Poruke o grešci
    const [modal, setModal] = useState(false); // Modal za promenu lozinke
    const [oldPassword, setOldPassword] = useState(''); // Stara lozinka
    const [newPassword, setNewPassword] = useState(''); // Nova lozinka
    const navigate = useNavigate();

    const toggleModal = () => setModal(!modal); // Funkcija za otvaranje/zatvaranje modala

    const handleChangePassword = () => {
        console.log('Stara lozinka:', oldPassword);
        console.log('Nova lozinka:', newPassword);
        toggleModal(); // Zatvori modal
        // Ovde možete implementirati logiku za promenu lozinke
    };

    const handleLogin = async (e) => {
        e.preventDefault(); // Sprečavanje defaultnog ponašanja

        const endpoint =
            loginType === 'local'
                ? `${process.env.REACT_APP_API_BASE_URL}/auth/login`
                : `${process.env.REACT_APP_API_BASE_URL}/auth/ad-login`;

        const requestData = loginType === 'local'
            ? { email, password }
            : { username, password };

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            });

            const data = await response.json();
            console.log('Server odgovor:', data);

            if (response.ok) {
                localStorage.setItem('token', data.token || '');
                localStorage.setItem('userRole', data.user.role);
                localStorage.setItem('userId', data.user.id);

                localStorage.setItem('userData', JSON.stringify({
                    firstname: data.user.firstname,
                    lastname: data.user.lastname,
                    sector: data.user.sector || 'Nije definisan sektor',
                }));

                const redirectAfterLogin = localStorage.getItem('redirectAfterLogin');
                if (redirectAfterLogin) {
                    localStorage.removeItem('redirectAfterLogin');
                    navigate(redirectAfterLogin);
                } else if (data.redirect) {
                    navigate(data.redirect);
                } else {
                    console.error('Nema postavljenog redirect URL-a');
                }
            } else {
                setErrorMessage(data.message || 'Greška prilikom prijave.');
                alert(`Greška: ${data.message}`);
            }
        } catch (error) {
            console.error('Greška prilikom prijave:', error);
            setErrorMessage('Došlo je do greške na serveru.');
        }
    };

    return (
        <>
            <BrowserView>
                <div className="background">
                    <div className="container">
                        <div className="left-side">
                            <div className="logo-container">
                                <div className="logo-container-sc">
                                    <img src="logo_samo.png" alt="SarajevoGas Logo" className="logo" />
                                </div>
                                <h2>SarajevoGas HelpDesk</h2>
                            </div>
                        </div>
                        <div className="right-side">
                            <div className="login-box">
                                <h2 style={{ color: "#224798", textAlign: "center" }}>Login</h2>
                                {errorMessage && <p style={{ color: 'red', textAlign: 'center' }}>{errorMessage}</p>}
                                <form className="form" onSubmit={handleLogin}>
                                    <label style={{ color: "#224798" }} htmlFor="loginType">Vrsta prijave</label>
                                    <select
                                        id="loginType"
                                        value={loginType}
                                        onChange={(e) => setLoginType(e.target.value)}
                                        className="login-type-dropdown"
                                    >
                                        <option value="local">Lokalna prijava</option>
                                        <option value="ad">Prijava putem AD-a</option>
                                    </select>
    
                                    {loginType === 'local' && (
                                        <>
                                            <label style={{ color: "#224798" }} htmlFor="email">Email</label>
                                            <input
                                                type="email"
                                                id="email"
                                                placeholder="ime.prezime@sarajevogas.ba"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                            />
                                        </>
                                    )}
    
                                    {loginType === 'ad' && (
                                        <>
                                            <label style={{ color: "#224798" }} htmlFor="username">Korisničko ime</label>
                                            <input
                                                type="text"
                                                id="username"
                                                placeholder="ime.prezime"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                            />
                                        </>
                                    )}
    
                                    <label style={{ color: "#224798" }} htmlFor="password">Lozinka</label>
                                    <input
                                        type="password"
                                        id="password"
                                        placeholder="Unesi svoju lozinku"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
    
                                    <div style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
                                        <Button
                                            className='button'
                                            size="lg"
                                            type="submit"
                                        >
                                            Login
                                        </Button>
                                        <Button
                                            className='button'
                                            id="btn-change"
                                            size="lg"
                                            onClick={toggleModal}
                                        >
                                            Promijeni lozinku
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </BrowserView>
    
            {/* Dodaj zatamnjenu pozadinu kada je modal otvoren */}
            {modal && <div className="modal-backdrop"></div>}
    
            <Modal isOpen={modal} toggle={toggleModal}>
            <ModalHeader toggle={false}>Promjena lozinke</ModalHeader> {/* Uklonjen automatski dugme */}
                <ModalBody>
                    <label>Unesite staru lozinku</label>
                    <input
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                    />
                    <label>Unesite novu lozinku</label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={handleChangePassword}>
                        Promijeni
                    </Button>
                    <Button color="secondary" onClick={toggleModal}>
                        Zatvori
                    </Button>
                </ModalFooter>
            </Modal>
        </>
    );
    
}

export default Login;

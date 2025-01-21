import { Navigate, useLocation } from 'react-router-dom';

function ProtectedRoute({ children }) {
    const isAuthenticated = localStorage.getItem('token'); // Provjera autentifikacije
    const location = useLocation();

    if (!isAuthenticated) {
        localStorage.setItem('redirectAfterLogin', location.pathname); // Spremanje trenutnog URL-a
        return <Navigate to="/login" />; // Preusmjeravanje na login ako nije prijavljen
    }

    return children; // Ako je prijavljen, prikazuje sadržaj unutar rute
}

export default ProtectedRoute;

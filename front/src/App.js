import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Login from './components/Login';  // Ako je Login.js u components folderu
import CreateTicket from './components/CreateTicket';
import TicketList from './components/TicketList';
import AdminPage from './components/AdminPage'; // Import AdminPage komponente
import AdminDashboard from './Components/AdminDashboard/AdminDashboard';
import WorkerDash from './Components/WorkerDash/WorkerDash'; 
import Validacija from './Components/Validacija/Validacija';

const App = () => {
    return (
        <Router>
            <Switch>
                <Route path="/login" component={Login} />
                <Route path="/create-ticket" component={CreateTicket} />
                <Route path="/tickets/:workerId" component={TicketList} />
                <Route path="/admin" component={AdminPage} /> 
                <Route path="/admin-dashboard" component={AdminDashboard} />
                <Route path="/worker-dashboard" component={WorkerDash} />
                <Route path="/validacija" component={Validacija} />
                <Route path="/" exact component={Login} />
            </Switch>
        </Router>
    );
};

export default App;

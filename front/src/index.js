import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import DashBoard from './Components/Dashboard/Dashboard';
import AdminDashboard from './Components/AdminDashboard/AdminDashboard';
import WorkerDash from './Components/WorkerDash/WorkerDash';
import Login from './Components/Login/Login';
import Validacija from './Components/Validacija/Validacija';
import ProtectedRoute from './ProtectedRoute'; // Uvezi ProtectedRoute

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/index" element={<Login />} />
      <Route path="/dashboard" element={<ProtectedRoute><DashBoard /></ProtectedRoute>} />
      <Route path="/admin-dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      <Route path="/worker-dashboard" element={<ProtectedRoute><WorkerDash /></ProtectedRoute>} />
      <Route path="/validacija/:taskId" element={<ProtectedRoute><Validacija/></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/index" replace />} />
    </Routes>
  </BrowserRouter>
);

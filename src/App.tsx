import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import CustomerProtectedRoute from './components/CustomerProtectedRoute';
import AdminLayout from './components/AdminLayout'; // Nosso novo layout

// Pages
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Booking from './pages/Booking';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CustomerRegister from './pages/CustomerRegister';
import CustomerDashboard from './pages/CustomerDashboard';
import AdminServices from './pages/admin/Services'; // Importa a nova página

import './App.css';

function App() {
  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />
        <main style={{ flex: '1' }}>
          <Routes>
            {/* Rotas Públicas */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/customer/register" element={<CustomerRegister />} />

            {/* Área de Administração */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              {/* Rotas filhas de /admin. Ex: /admin/dashboard */}
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="services" element={<AdminServices />} />
              {/* Futuras rotas de admin virão aqui */}
            </Route>

            {/* Área do Cliente */}
            <Route
              path="/customer/dashboard"
              element={
                <CustomerProtectedRoute>
                  <CustomerDashboard />
                </CustomerProtectedRoute>
              }
            />

            {/* Redirecionamento da rota antiga para a nova */}
            <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />

          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
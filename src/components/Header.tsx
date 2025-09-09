import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/images/logo2.png';

const Header = () => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isCustomerAuthenticated, setIsCustomerAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const adminToken = localStorage.getItem('auth-token');
    const customerToken = localStorage.getItem('customer-auth-token');
    setIsAdminAuthenticated(!!adminToken);
    setIsCustomerAuthenticated(!!customerToken);
  }, [location]); // Re-verifica a cada mudança de rota

  const handleAdminLogout = () => {
    localStorage.removeItem('auth-token');
    setIsAdminAuthenticated(false);
    navigate('/');
  };

  const handleCustomerLogout = () => {
    localStorage.removeItem('customer-auth-token');
    setIsCustomerAuthenticated(false);
    navigate('/');
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" style={{ borderBottom: '2px solid yellow' }}>
      <Container>
        <Navbar.Brand as={Link} to="/">
          <img
            src={logo}
            height="40"
            className="d-inline-block align-top me-2"
            alt="Studio Carvalho Estetica Automotiva logo"
          />
          <span style={{ color: 'yellow', fontWeight: 'bold' }}>Studio Carvalho Estetica Automotiva</span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/" style={{ color: 'yellow' }}>Início</Nav.Link>
            <Nav.Link as={Link} to="/about" style={{ color: 'yellow' }}>Sobre</Nav.Link>
            <Nav.Link as={Link} to="/services" style={{ color: 'yellow' }}>Serviços</Nav.Link>
            <Nav.Link as={Link} to="/booking" style={{ color: 'yellow' }}>Agendamento</Nav.Link>

            {isAdminAuthenticated ? (
              <>
                <Nav.Link as={Link} to="/dashboard" style={{ color: 'yellow' }}>Painel Admin</Nav.Link>
                <Button variant="outline-warning" onClick={handleAdminLogout} className="ms-2">Sair Admin</Button>
              </>
            ) : isCustomerAuthenticated ? (
              <>
                <Nav.Link as={Link} to="/customer/dashboard" style={{ color: 'yellow' }}>Painel Cliente</Nav.Link>
                <Button variant="outline-info" onClick={handleCustomerLogout} className="ms-2">Sair Cliente</Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login" style={{ color: 'yellow' }}>Login</Nav.Link>
                <Nav.Link as={Link} to="/customer/register" style={{ color: 'yellow' }}>Cadastro Cliente</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Header;
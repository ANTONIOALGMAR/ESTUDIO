import React, { useState, useEffect, useCallback } from 'react';
import { Container, Table, Spinner, Alert, Form, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

// Interface for the customer data
interface ICustomer {
  _id: string;
  fullName: string;
  email: string;
  phone?: string; // Phone might be optional
  createdAt: string;
}

const AdminCustomers = () => {
  const [customers, setCustomers] = useState<ICustomer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<ICustomer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCustomers = useCallback(async () => {
    const token = localStorage.getItem('auth-token');
    if (!token) {
      setError("Token não encontrado. Faça login novamente.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      const response = await fetch(`${apiUrl}/api/customers`, {
        headers: {
          'auth-token': token,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao buscar clientes.');
      }

      const data = await response.json();
      setCustomers(data);
      setFilteredCustomers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Efeito para filtrar os clientes
  useEffect(() => {
    const results = customers.filter(customer =>
      customer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCustomers(results);
  }, [searchTerm, customers]);

  return (
    <Container fluid>
      <Row className="align-items-center mb-4">
        <Col sm={8}>
          <h1>Gestão de Clientes</h1>
        </Col>
        <Col sm={4}>
          <Form.Control
            type="text"
            placeholder="Buscar por nome ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Col>
      </Row>

      {loading && (
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p>Carregando clientes...</p>
        </div>
      )}

      {error && <Alert variant="danger">{error}</Alert>}

      {!loading && !error && (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Telefone</th>
              <th>Cliente Desde</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((customer) => (
              <tr key={customer._id}>
                <td><Link to={`/admin/customers/${customer._id}`}>{customer.fullName}</Link></td>
                <td>{customer.email}</td>
                <td>{customer.phone || 'N/A'}</td>
                <td>{new Date(customer.createdAt).toLocaleDateString('pt-BR')}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default AdminCustomers;

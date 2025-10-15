import React, { useState, useEffect, useCallback } from 'react';
import { Container, Card, Table, Spinner, Alert, Row, Col } from 'react-bootstrap';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';

// Interfaces
interface IBooking {
  _id: string;
  service: string[];
  date: string;
  status: string;
  createdAt: string;
}

interface ICustomer {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  createdAt: string;
}

interface ICustomerDetails {
  customer: ICustomer;
  bookings: IBooking[];
}

const CustomerDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [details, setDetails] = useState<ICustomerDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, isInitialLoading } = useAuth();

  const fetchCustomerDetails = useCallback(async () => {
    if (isInitialLoading) return; // Não faz nada enquanto o AuthContext está carregando

    if (!id || !user || user.userType !== 'admin') {
      setError("Acesso negado. ID do cliente ou privilégios de administrador não encontrados.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await api.get(`/api/customers/${id}`);
      setDetails(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Erro ao buscar detalhes do cliente.');
    } finally {
      setLoading(false);
    }
  }, [id, user, isInitialLoading]);

  useEffect(() => {
    fetchCustomerDetails();
  }, [fetchCustomerDetails]);

  if (loading) {
    return (
      <div className="text-center">
        <Spinner animation="border" variant="primary" />
        <p>Carregando detalhes do cliente...</p>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (!details) {
    return <Alert variant="warning">Nenhum detalhe encontrado para este cliente.</Alert>;
  }

  const { customer, bookings } = details;

  return (
    <Container fluid>
      <Link to="/admin/customers" className="btn btn-outline-secondary mb-4">
        &larr; Voltar para Todos os Clientes
      </Link>

      <Card className="mb-4">
        <Card.Header>
          <h2>{customer.fullName}</h2>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <strong>Email:</strong> {customer.email}
            </Col>
            <Col md={6}>
              <strong>Telefone:</strong> {customer.phone || 'N/A'}
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <strong>Cliente Desde:</strong> {new Date(customer.createdAt).toLocaleDateString('pt-BR')}
            </Col>
            <Col md={6}>
              <strong>Total de Agendamentos:</strong> {bookings.length}
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <h4>Histórico de Agendamentos</h4>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Data do Pedido</th>
            <th>Data do Serviço</th>
            <th>Serviços</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {bookings.length > 0 ? (
            bookings.map((booking) => (
              <tr key={booking._id}>
                <td>{new Date(booking.createdAt).toLocaleDateString('pt-BR')}</td>
                <td>{new Date(booking.date).toLocaleDateString('pt-BR')}</td>
                <td>{Array.isArray(booking.service) ? booking.service.join(', ') : booking.service}</td>
                <td>{booking.status}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="text-center">Nenhum agendamento encontrado para este cliente.</td>
            </tr>
          )}
        </tbody>
      </Table>
    </Container>
  );
};

export default CustomerDetails;

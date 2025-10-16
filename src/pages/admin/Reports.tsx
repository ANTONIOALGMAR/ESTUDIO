import React, { useState, useEffect, useCallback } from 'react';
import { Container, Form, Button, Row, Col, Table, Spinner, Alert, Card } from 'react-bootstrap';
import api from '../../api/api'; // Importa a instância do Axios

// Re-using interfaces
interface IBooking {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  car?: string;
  licensePlate?: string;
  service: string[];
  date: string;
  createdAt: string;
  status: string;
}

interface IService {
  _id: string;
  name: string;
  price: number;
}

const AdminReports = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('all');
  const [filteredBookings, setFilteredBookings] = useState<IBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [services, setServices] = useState<IService[]>([]);

  const STATUS_OPTIONS = ['all', 'aguardando', 'em andamento', 'pronto', 'entregue'];

  const fetchAllServices = useCallback(async () => {
    try {
      const response = await api.get('/api/services/all');
      setServices(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Falha ao buscar lista de serviços.');
    }
  }, []);

  useEffect(() => {
    fetchAllServices();
  }, [fetchAllServices]);

  const calculateRevenue = useCallback((bookings: IBooking[]) => {
    let revenue = 0;
    const serviceMap = new Map(services.map(s => [s.name, s.price]));

    bookings.forEach(booking => {
      if (booking.status === 'entregue') {
        booking.service.forEach(serviceName => {
          revenue += serviceMap.get(serviceName) || 0;
        });
      }
    });
    return revenue;
  }, [services]);

  const fetchFilteredBookings = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/api/bookings/filtered', {
        params: {
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          status: status === 'all' ? undefined : status,
        },
      });
      setFilteredBookings(response.data);
      setTotalRevenue(calculateRevenue(response.data));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Falha ao buscar agendamentos filtrados.');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, status, calculateRevenue]);

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    fetchFilteredBookings();
  };

  // Initial fetch when component mounts
  useEffect(() => {
    fetchFilteredBookings();
  }, [fetchFilteredBookings]);


  return (
    <Container fluid>
      <h1>Relatórios de Agendamentos</h1>

      <Form onSubmit={handleFilter} className="mb-4">
        <Row className="align-items-end">
          <Col md={4}>
            <Form.Group controlId="startDate">
              <Form.Label className="text-dark">Data Inicial</Form.Label>
              <Form.Control
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group controlId="endDate">
              <Form.Label className="text-dark">Data Final</Form.Label>
              <Form.Control
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group controlId="statusFilter">
              <Form.Label className="text-dark">Status</Form.Label>
              <Form.Select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt === 'all' ? 'Todos' : opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={1}>
            <Button variant="primary" type="submit">
              Filtrar
            </Button>
          </Col>
        </Row>
      </Form>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p>Carregando relatórios...</p>
        </div>
      ) : (
        <>
          <Row className="mb-4">
            <Col md={6}>
              <Card bg="info" text="white">
                <Card.Body>
                  <Card.Title>Total de Agendamentos Filtrados</Card.Title>
                  <Card.Text className="fs-4 fw-bold">{filteredBookings.length}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card bg="success" text="white">
                <Card.Body>
                  <Card.Title>Faturamento do Período</Card.Title>
                  <Card.Text className="fs-4 fw-bold">R$ {totalRevenue.toFixed(2)}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {filteredBookings.length === 0 ? (
            <Alert variant="info">Nenhum agendamento encontrado para os filtros selecionados.</Alert>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Data do Pedido</th>
                  <th>Nome Completo</th>
                  <th>Email</th>
                  <th>Serviço(s)</th>
                  <th>Data do Serviço</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking._id}>
                    <td>{new Date(booking.createdAt).toLocaleDateString('pt-BR')}</td>
                    <td>{booking.fullName}</td>
                    <td>{booking.email}</td>
                    <td>{Array.isArray(booking.service) ? booking.service.join(', ') : booking.service}</td>
                    <td>{new Date(booking.date).toLocaleDateString('pt-BR')}</td>
                    <td>{booking.status}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </>
      )}
    </Container>
  );
};

export default AdminReports;

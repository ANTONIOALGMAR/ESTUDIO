import React, { useEffect, useState, useCallback } from 'react';
import { Container, Table, Alert, Spinner, Button, Form, Row, Col, Card } from 'react-bootstrap';
import BookingEditModal from '../components/BookingEditModal';
import useMediaQuery from '../hooks/useMediaQuery';
import { useAuth } from '../context/AuthContext'; // Importar o AuthContext
import api from '../api/api'; // Importar a instância do axios

// Interfaces
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

interface ISummary {
  totalCustomers: number;
  totalBookings: number;
  totalRevenue: number;
}

const STATUS_OPTIONS = ['aguardando', 'em andamento', 'pronto', 'entregue'];

// Helper function to get Bootstrap variant for status
const getStatusVariant = (status: string) => {
  switch (status) {
    case 'aguardando':
      return 'danger'; // Vermelho
    case 'em andamento':
      return 'warning'; // Laranja
    case 'pronto':
      return 'info'; // Azul claro
    case 'entregue':
      return 'success'; // Verde
    default:
      return 'secondary'; // Cinza padrão
  }
};

const Dashboard = () => {
  // States
  const [bookings, setBookings] = useState<IBooking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<IBooking[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [summary, setSummary] = useState<ISummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<IBooking | null>(null);
  const { isInitialLoading } = useAuth(); // Usar o estado de loading do contexto

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Busca dados dos agendamentos e do resumo em paralelo
      const [bookingsResponse, summaryResponse] = await Promise.all([
        api.get('/api/bookings/all'),
        api.get('/api/analytics/summary')
      ]);

      // Trata a resposta dos agendamentos
      const bookingsData = bookingsResponse.data;
      setBookings(bookingsData);
      setFilteredBookings(bookingsData);

      // Trata a resposta do resumo
      const summaryData = summaryResponse.data;
      setSummary(summaryData);

    } catch (err: any) {
      // O interceptador do axios já trata o logout. Apenas mostramos o erro.
      setError(err.response?.data?.message || err.message || 'Falha ao carregar dados do painel.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Só busca os dados quando a verificação inicial de auth terminar
    if (!isInitialLoading) {
      fetchData();
    }
  }, [fetchData, isInitialLoading]);

  // Efeito para filtrar os agendamentos
  useEffect(() => {
    const results = bookings.filter(booking =>
      booking.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (booking.car && booking.car.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (booking.licensePlate && booking.licensePlate.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (Array.isArray(booking.service) && booking.service.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())))
    );
    setFilteredBookings(results);
  }, [searchTerm, bookings]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este agendamento?')) {
      try {
        await api.delete(`/api/bookings/${id}`);
        fetchData(); // Re-busca todos os dados para atualizar o dashboard
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'Falha ao excluir agendamento.');
      }
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await api.put(`/api/bookings/${id}`, {
        status: newStatus
      });
      fetchData(); // Re-busca todos os dados para atualizar o dashboard
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Falha ao atualizar status.');
    }
  };

  // Funções do modal
  const handleEditClick = (booking: IBooking) => {
    setSelectedBooking(booking);
    setShowEditModal(true);
  };
  const handleModalClose = () => {
    setShowEditModal(false);
    setSelectedBooking(null);
  };
  const handleModalSave = () => {
    fetchData(); // Re-busca todos os dados após salvar
  };;

  // Mostra um loader unificado enquanto o AuthContext verifica o token ou os dados estão carregando
  if (isInitialLoading || loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="warning" />
        <p>{isInitialLoading ? 'Verificando acesso...' : 'Carregando dados do painel...'}</p>
      </Container>
    );
  }

  if (error && !loading) {
    return <Alert variant="danger" className="m-3">{error}</Alert>;
  }

  return (
    <Container fluid>
      {/* Seção de Analytics */}
      <Row className="mb-4">
        <Col md={4} className="mb-3">
          <Card bg="dark" text="white">
            <Card.Body>
              <Card.Title>Faturamento Total</Card.Title>
              <Card.Text className="fs-4 fw-bold">
                {summary ? `R$ ${summary.totalRevenue.toFixed(2)}` : <Spinner size="sm" />}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card bg="secondary" text="white">
            <Card.Body>
              <Card.Title>Total de Clientes</Card.Title>
              <Card.Text className="fs-4 fw-bold">
                {summary ? summary.totalCustomers : <Spinner size="sm" />}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-3">
          <Card bg="warning" text="dark">
            <Card.Body>
              <Card.Title>Total de Agendamentos</Card.Title>
              <Card.Text className="fs-4 fw-bold">
                {summary ? summary.totalBookings : <Spinner size="sm" />}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Seção da Tabela de Agendamentos */}
      <Card>
        <Card.Header>
          <Row className="align-items-center">
            <Col sm={8}><h5>Agendamentos Recentes</h5></Col>
            <Col sm={4}>
              <Form.Control
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Col>
          </Row>
        </Card.Header>
        <Card.Body>
          {bookings.length === 0 ? (
            <Alert variant="info">Nenhum agendamento encontrado.</Alert>
          ) : filteredBookings.length === 0 ? (
            <Alert variant="warning">Nenhum resultado encontrado para "{searchTerm}".</Alert>
          ) : (
            isMobile ? (
              <div>
                {filteredBookings.map((booking) => (
                  <Card key={booking._id} className="mb-3" bg="light">
                    <Card.Body>
                      <Card.Title>{booking.fullName}</Card.Title>
                      <Card.Subtitle className="mb-2 text-muted">{booking.car || 'Carro não informado'} - {booking.licensePlate || 'Placa não informada'}</Card.Subtitle>
                      <hr />
                      <Row className="mb-2"><Col xs={4} as="strong">Serviço:</Col><Col xs={8}>{Array.isArray(booking.service) ? booking.service.join(', ') : booking.service}</Col></Row>
                      <Row className="mb-2"><Col xs={4} as="strong">Data:</Col><Col xs={8}>{new Date(booking.date).toLocaleDateString('pt-BR')}</Col></Row>
                      <Row className="mb-2"><Col xs={4} as="strong">Email:</Col><Col xs={8}>{booking.email}</Col></Row>
                      <Row className="mb-2"><Col xs={4} as="strong">Telefone:</Col><Col xs={8}>{booking.phone}</Col></Row>
                      <hr />
                      <div className="d-flex justify-content-between align-items-center">
                        <Form.Select
                          value={booking.status}
                          onChange={(e) => handleStatusChange(booking._id, e.target.value)}
                          size="sm"
                          className={`bg-${getStatusVariant(booking.status)} ${getStatusVariant(booking.status) === 'warning' ? 'text-dark' : 'text-white'}`}
                          style={{ width: '150px' }}
                        >
                          {STATUS_OPTIONS.map(status => (<option key={status} value={status}>{status}</option>))}
                        </Form.Select>
                        <div>
                          {booking.status === 'aguardando' && (
                            <Button
                              variant="outline-success"
                              size="sm"
                              className="me-2"
                              onClick={() => handleStatusChange(booking._id, 'em andamento')}
                            >
                              Aceitar
                            </Button>
                          )}
                          <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleEditClick(booking)}>Editar</Button>
                          <Button variant="outline-danger" size="sm" onClick={() => { if (booking._id) { handleDelete(booking._id); } }} disabled={!booking._id}>Excluir</Button>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            ) : (
              <Table striped bordered hover responsive="md">
                <thead>
                  <tr>
                    <th>Data do Pedido</th><th>Nome Completo</th><th>Email</th><th>Telefone</th><th>Carro</th><th>Placa</th><th>Serviço</th><th>Data do Serviço</th><th>Status</th><th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking) => (
                    <tr key={booking._id}>
                      <td>{new Date(booking.createdAt).toLocaleDateString('pt-BR')}</td>
                      <td>{booking.fullName}</td>
                      <td>{booking.email}</td>
                      <td>{booking.phone}</td>
                      <td>{booking.car}</td>
                      <td>{booking.licensePlate}</td>
                      <td>{Array.isArray(booking.service) ? booking.service.join(', ') : booking.service}</td>
                      <td>{new Date(booking.date).toLocaleDateString('pt-BR')}</td>
                      <td>
                        <Form.Select
                          value={booking.status}
                          onChange={(e) => handleStatusChange(booking._id, e.target.value)}
                          size="sm"
                          className={`bg-${getStatusVariant(booking.status)} ${getStatusVariant(booking.status) === 'warning' ? 'text-dark' : 'text-white'}`}
                        >
                          {STATUS_OPTIONS.map(status => (<option key={status} value={status}>{status}</option>))}
                        </Form.Select>
                      </td>
                      <td>
                        {booking.status === 'aguardando' && (
                          <Button
                            variant="outline-success"
                            size="sm"
                            className="me-2"
                            onClick={() => handleStatusChange(booking._id, 'em andamento')}
                          >
                            Aceitar
                          </Button>
                        )}
                        <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleEditClick(booking)}>Editar</Button>
                        <Button variant="outline-danger" size="sm" onClick={() => { if (booking._id) { handleDelete(booking._id); } }} disabled={!booking._id}>Excluir</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )
          )}
        </Card.Body>
      </Card>

      <BookingEditModal
        show={showEditModal}
        onHide={handleModalClose}
        booking={selectedBooking}
        onSave={handleModalSave}
      />
    </Container>
  );
};

export default Dashboard;

import React, { useEffect, useState } from 'react';
import { Container, Table, Alert, Spinner, Button, Form, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import BookingEditModal from '../components/BookingEditModal'; // Importa o Modal

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
  status: string; // Adicionado o status
}

const STATUS_OPTIONS = ['aguardando', 'em andamento', 'pronto', 'entregue'];

const Dashboard = () => {
  const [bookings, setBookings] = useState<IBooking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<IBooking[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // State para o modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<IBooking | null>(null);

  const fetchBookings = async () => {
    const token = localStorage.getItem('auth-token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('http://localhost:5001/api/bookings', {
        headers: {
          'auth-token': token,
        },
      });

      if (response.status === 401) {
        localStorage.removeItem('auth-token');
        navigate('/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Falha ao buscar agendamentos.');
      }

      const data = await response.json();
      setBookings(data);
      setFilteredBookings(data); // Inicializa a lista filtrada
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [navigate]);

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
      const token = localStorage.getItem('auth-token');
      try {
        const response = await fetch(`http://localhost:5001/api/bookings/${id}`, {
          method: 'DELETE',
          headers: {
            'auth-token': token!,
          },
        });

        if (!response.ok) {
          throw new Error('Falha ao excluir agendamento.');
        }

        // Atualiza o estado principal de bookings, o useEffect cuidará de re-filtrar
        setBookings(bookings.filter(b => b._id !== id));

      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    const token = localStorage.getItem('auth-token');
    try {
      const response = await fetch(`http://localhost:5001/api/bookings/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': token!,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Falha ao atualizar status.');
      }

      // Atualiza o estado localmente
      setBookings(prevBookings =>
        prevBookings.map(booking =>
          booking._id === id ? { ...booking, status: newStatus } : booking
        )
      );

    } catch (err: any) {
      setError(err.message);
    }
  };

  // Funções para controlar o modal
  const handleEditClick = (booking: IBooking) => {
    setSelectedBooking(booking);
    setShowEditModal(true);
  };

  const handleModalClose = () => {
    setShowEditModal(false);
    setSelectedBooking(null);
  };

  const handleModalSave = (updatedBooking: IBooking) => {
    // Atualiza o estado principal de bookings, o useEffect cuidará de re-filtrar
    setBookings(bookings.map(b => b._id === updatedBooking._id ? updatedBooking : b));
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="warning" />
        <p>Carregando agendamentos...</p>
      </Container>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <Container style={{ paddingTop: '50px' }}>
      <Row className="align-items-center mb-4">
        <Col><h2>Painel do Administrador - Agendamentos</h2></Col>
        <Col md={4}>
          <Form.Control
            type="text"
            placeholder="Buscar por nome, placa, serviço..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Col>
      </Row>
      
      {bookings.length === 0 ? (
        <Alert variant="info">Nenhum agendamento encontrado.</Alert>
      ) : filteredBookings.length === 0 ? (
        <Alert variant="warning">Nenhum resultado encontrado para "{searchTerm}".</Alert>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Data do Pedido</th>
              <th>Nome Completo</th>
              <th>Email</th>
              <th>Telefone</th>
              <th>Carro</th>
              <th>Placa</th>
              <th>Serviço</th>
              <th>Data do Serviço</th>
              <th>Status</th>
              <th>Ações</th>
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
                  >
                    {STATUS_OPTIONS.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </Form.Select>
                </td>
                <td>
                  <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleEditClick(booking)}>Editar</Button>
                  <Button variant="outline-danger" size="sm" onClick={() => handleDelete(booking._id)}>Excluir</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

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

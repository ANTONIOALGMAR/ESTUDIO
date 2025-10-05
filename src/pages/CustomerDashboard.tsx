import React, { useEffect, useState, useCallback } from 'react';
import { Container, Table, Alert, Spinner, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

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

const CustomerDashboard = () => {
  const [bookings, setBookings] = useState<IBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAssociateButton, setShowAssociateButton] = useState(false);
  const navigate = useNavigate();

  const fetchCustomerBookings = useCallback(async () => {
    const token = localStorage.getItem('customer-auth-token');
    if (!token) {
      setError("Sessão não encontrada. Por favor, faça login novamente.");
      navigate('/customer/login');
      return;
    }

    try {
      setLoading(true);
      const apiUrl = process.env.REACT_APP_API_URL || 'https://estudio-backend-skzl.onrender.com';

      const response = await fetch(`${apiUrl}/api/bookings/customer`, {
        headers: {
          'customer-auth-token': token,
        },
      });

      if (!response.ok) {
        // Se o token for inválido ou expirado, o servidor retornará 401 ou 403
        localStorage.removeItem('customer-auth-token');
        navigate('/customer/login');
        return;
      }

      const data = await response.json();
      setBookings(data);
      // Mostra o botão se não houver agendamentos, permitindo ao usuário tentar vincular agendamentos antigos.
      setShowAssociateButton(data.length === 0);
    } catch (err: any) {
      setError(err.message || 'Falha ao carregar agendamentos. Verifique sua conexão com a internet.');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchCustomerBookings();
  }, [fetchCustomerBookings]);

  const handleAssociateBookings = async () => {
    const token = localStorage.getItem('customer-auth-token');
    if (!token) return;

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'https://estudio-backend-skzl.onrender.com';

      const response = await fetch(`${apiUrl}/api/bookings/associate-customer`, {
        method: 'POST',
        headers: {
          'customer-auth-token': token,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Falha ao associar agendamentos.');
      }

      const data = await response.json();
      // Atualiza o estado com a lista de agendamentos retornada pela API.
      if (data.bookings) {
        setBookings(data.bookings);
        setShowAssociateButton(data.bookings.length === 0);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm('Tem certeza que deseja cancelar este agendamento?')) {
      return;
    }

    const token = localStorage.getItem('customer-auth-token');
    if (!token) return;

    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'https://estudio-backend-skzl.onrender.com';
      const response = await fetch(`${apiUrl}/api/bookings/${bookingId}/cancel`, {
        method: 'PUT',
        headers: {
          'customer-auth-token': token,
        },
      });

      if (!response.ok) {
        throw new Error('Falha ao cancelar agendamento.');
      }

      // Re-busca os agendamentos para atualizar a lista
      fetchCustomerBookings();

    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="warning" />
        <p>Carregando seus agendamentos...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="text-center mt-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container style={{ paddingTop: '50px' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Meus Agendamentos</h2>
        <Button variant="warning" onClick={() => navigate('/booking')}>
          Agendar Novo Serviço
        </Button>
      </div>
      {bookings.length === 0 ? (
        <>
          <Alert variant="info">Você ainda não possui agendamentos.</Alert>
          {showAssociateButton && (
            <Button variant="primary" onClick={handleAssociateBookings}>
              Vincular Agendamentos Anteriores
            </Button>
          )}
        </>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Data do Pedido</th>
              <th>Serviço(s)</th>
              <th>Carro</th>
              <th>Placa</th>
              <th>Data do Serviço</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking._id}>
                <td>{new Date(booking.createdAt).toLocaleDateString('pt-BR')}</td>
                <td>{Array.isArray(booking.service) ? booking.service.join(', ') : booking.service}</td>
                <td>{booking.car}</td>
                <td>{booking.licensePlate}</td>
                <td>{new Date(booking.date).toLocaleDateString('pt-BR')}</td>
                <td>{booking.status}</td>
                <td>
                  {booking.status === 'aguardando' && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleCancelBooking(booking._id)}
                    >
                      Cancelar
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default CustomerDashboard;

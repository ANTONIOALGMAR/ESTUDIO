import React, { useEffect, useState, useCallback } from 'react';
import { Container, Table, Alert, Spinner, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../api/api'; // Importar a instância do axios
import { useAuth } from '../context/AuthContext'; // Importar para verificar o loading inicial

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
  const { isInitialLoading } = useAuth(); // Usar o estado de loading do contexto
  const navigate = useNavigate();

  const fetchCustomerBookings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/bookings/customer');
      setBookings(response.data);
      // Mostra o botão se não houver agendamentos, permitindo ao usuário tentar vincular agendamentos antigos.
      setShowAssociateButton(response.data.length === 0);
    } catch (err: any) {
      // O interceptador do axios já trata o logout. Apenas mostramos o erro.
      setError(err.response?.data?.message || err.message || 'Falha ao carregar agendamentos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Só busca os dados quando a verificação inicial de auth terminar
    if (!isInitialLoading) {
      fetchCustomerBookings();
    }
  }, [fetchCustomerBookings, isInitialLoading]);

  const handleAssociateBookings = async () => {
    try {
      const response = await api.post('/api/bookings/associate-customer');
      const data = response.data;
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
    try {
      await api.put(`/api/bookings/${bookingId}/cancel`);
      // Re-busca os agendamentos para atualizar a lista
      fetchCustomerBookings();

    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleReschedule = (booking: IBooking) => {
    navigate('/booking', { state: { bookingToReschedule: booking } });
  };

  // Mostra um loader unificado enquanto o AuthContext verifica o token ou os dados estão carregando
  if (isInitialLoading || loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="warning" />
        <p>{isInitialLoading ? 'Verificando acesso...' : 'Carregando seus agendamentos...'}</p>
      </Container>
    );
  }

  if (error && !isInitialLoading) {
    return (
      // Adicionamos uma verificação para não mostrar o erro se o componente já estiver carregando
      // Isso evita que um erro de uma chamada anterior pisque na tela durante um novo carregamento.
      // O erro só será exibido se o carregamento tiver terminado.
      !loading &&
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
                    <>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleCancelBooking(booking._id)}
                        style={{ marginRight: '5px' }}
                      >
                        Cancelar
                      </Button>
                      <Button
                        variant="info"
                        size="sm"
                        onClick={() => handleReschedule(booking)}
                      >
                        Remarcar
                      </Button>
                    </>
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

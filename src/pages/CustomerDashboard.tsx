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
      navigate('/customer/login');
      return;
    }

    try {
      setLoading(true); // Added this line
      const apiUrl = process.env.REACT_APP_API_URL || 'https://estudio-backend-skzl.onrender.com';

      const response = await fetch(`${apiUrl}/api/bookings/customer`, {
        headers: {
          'auth-token': token,
        },
      });

      if (!response.ok) {
        localStorage.removeItem('customer-auth-token');
        navigate('/customer/login');
        return;
      }

      const data = await response.json();
      setBookings(data);
      if (data.length === 0) { // Added this block
        setShowAssociateButton(true);
      } else {
        setShowAssociateButton(false);
      }
    } catch (err: any) {
      setError(err.message);
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
      alert(data.message);
      fetchCustomerBookings(); // Recarrega os agendamentos

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
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <Container style={{ paddingTop: '50px' }}>
      <h2>Meus Agendamentos</h2>
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
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default CustomerDashboard;

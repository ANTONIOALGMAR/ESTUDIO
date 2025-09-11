import React, { useState, useEffect, useCallback } from 'react';
import { Container, Button, Table, Spinner, Alert } from 'react-bootstrap';

// Definindo a interface para o tipo de serviço
interface IService {
  _id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  isActive: boolean;
}

const AdminServices = () => {
  const [services, setServices] = useState<IService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchServices = useCallback(async () => {
    const token = localStorage.getItem('auth-token');
    if (!token) {
      setError("Token não encontrado. Faça login novamente.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      const response = await fetch(`${apiUrl}/api/services/all`, {
        headers: {
          'auth-token': token,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao buscar serviços.');
      }

      const data = await response.json();
      setServices(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Gestão de Serviços</h1>
        <Button variant="primary">Adicionar Novo Serviço</Button>
      </div>

      {loading && (
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p>Carregando serviços...</p>
        </div>
      )}

      {error && <Alert variant="danger">{error}</Alert>}

      {!loading && !error && (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Descrição</th>
              <th>Preço (R$)</th>
              <th>Duração (min)</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr key={service._id}>
                <td>{service.name}</td>
                <td>{service.description}</td>
                <td>{service.price.toFixed(2)}</td>
                <td>{service.duration}</td>
                <td>{service.isActive ? 'Ativo' : 'Inativo'}</td>
                <td>
                  <Button variant="outline-secondary" size="sm" className="me-2">
                    Editar
                  </Button>
                  <Button variant="outline-danger" size="sm">
                    Excluir
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default AdminServices;

import React, { useState, useEffect, useCallback } from 'react';
import { Container, Button, Table, Spinner, Alert } from 'react-bootstrap';
import ServiceFormModal, { IService } from '../../components/ServiceFormModal';

const AdminServices = () => {
  const [services, setServices] = useState<IService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados para o Modal
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<IService | null>(null);

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

  const handleOpenModal = (service: IService | null) => {
    setEditingService(service);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingService(null);
  };

  const handleSaveService = async (serviceData: IService) => {
    const token = localStorage.getItem('auth-token');
    const method = serviceData._id ? 'PUT' : 'POST';
    const url = serviceData._id
      ? `${process.env.REACT_APP_API_URL}/api/services/${serviceData._id}`
      : `${process.env.REACT_APP_API_URL}/api/services`;

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'auth-token': token!,
        },
        body: JSON.stringify(serviceData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao salvar serviço.');
      }

      handleCloseModal();
      fetchServices(); // Re-busca os serviços para atualizar a lista
    } catch (err: any) {
      setError(err.message);
      // Não fechar o modal em caso de erro para o usuário poder corrigir
    }
  };

  const handleDeleteService = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este serviço?')) {
      const token = localStorage.getItem('auth-token');
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/services/${id}`, {
          method: 'DELETE',
          headers: {
            'auth-token': token!,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Falha ao excluir serviço.');
        }
        
        fetchServices(); // Re-busca os serviços
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Gestão de Serviços</h1>
        <Button variant="primary" onClick={() => handleOpenModal(null)}>
          Adicionar Novo Serviço
        </Button>
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
                  <Button variant="outline-secondary" size="sm" className="me-2" onClick={() => handleOpenModal(service)}>
                    Editar
                  </Button>
                  <Button variant="outline-danger" size="sm" onClick={() => handleDeleteService(service._id)}>
                    Excluir
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <ServiceFormModal 
        show={showModal}
        onHide={handleCloseModal}
        onSave={handleSaveService}
        service={editingService}
      />
    </Container>
  );
};

export default AdminServices;

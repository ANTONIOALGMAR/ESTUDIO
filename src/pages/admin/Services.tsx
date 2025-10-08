import React, { useState, useEffect, useCallback } from 'react';
import { Container, Button, Table, Spinner, Alert } from 'react-bootstrap';
import ServiceFormModal, { IService } from '../../components/ServiceFormModal';
import api from '../../api/api'; // Importando nossa instância do Axios

const AdminServices = () => {
  const [services, setServices] = useState<IService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<IService | null>(null);

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/services/all');
      setServices(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Falha ao buscar serviços.');
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
    try {
      if (serviceData._id) {
        // Atualizar serviço existente
        await api.put(`/api/services/${serviceData._id}`, serviceData);
      } else {
        // Criar novo serviço
        await api.post('/api/services', serviceData);
      }
      handleCloseModal();
      fetchServices(); // Re-busca os serviços para atualizar a lista
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Falha ao salvar serviço.');
    }
  };

  const handleDeleteService = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este serviço?')) {
      try {
        await api.delete(`/api/services/${id}`);
        fetchServices(); // Re-busca os serviços
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'Falha ao excluir serviço.');
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
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => {
                      if (service._id) {
                        handleDeleteService(service._id);
                      }
                    }}
                    disabled={!service._id}
                  >
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
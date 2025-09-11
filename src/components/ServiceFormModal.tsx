import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';

// Interface for the service data
export interface IService {
  _id?: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  isActive?: boolean;
}

// Interface for the component's props
interface ServiceFormModalProps {
  show: boolean;
  onHide: () => void;
  onSave: (service: IService) => void;
  service: IService | null; // O serviço a ser editado, ou null para um novo
}

const ServiceFormModal: React.FC<ServiceFormModalProps> = ({ show, onHide, onSave, service }) => {
  const [formData, setFormData] = useState<IService>({
    name: '',
    description: '',
    price: 0,
    duration: 30,
  });

  // Efeito para preencher o formulário quando um serviço é passado para edição
  useEffect(() => {
    if (service) {
      setFormData(service);
    } else {
      // Reseta o formulário para o estado inicial se não houver serviço (modo de adição)
      setFormData({
        name: '',
        description: '',
        price: 0,
        duration: 30,
      });
    }
  }, [service, show]); // Roda quando o serviço ou a visibilidade do modal muda

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const isNumber = e.target.type === 'number';
    setFormData({
      ...formData,
      [name]: isNumber ? parseFloat(value) || 0 : value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{service ? 'Editar Serviço' : 'Adicionar Novo Serviço'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3" controlId="serviceName">
            <Form.Label>Nome do Serviço</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="serviceDescription">
            <Form.Label>Descrição</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Row>
            <Col>
              <Form.Group className="mb-3" controlId="servicePrice">
                <Form.Label>Preço (R$)</Form.Label>
                <Form.Control
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  step="0.01"
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="mb-3" controlId="serviceDuration">
                <Form.Label>Duração (minutos)</Form.Label>
                <Form.Control
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  required
                  step="5"
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit">
            Salvar
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ServiceFormModal;

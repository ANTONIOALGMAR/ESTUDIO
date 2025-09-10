import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert, Spinner } from 'react-bootstrap';

const ALL_SERVICES = [
  'Lavagem Basica',
  'Lavagem Técnica',
  'Higienizacao de Tecido/Couro',
  'Hidratacao de Couro',
  'Polimento',
  'Vitrificacao',
  'Nano Protecao',
  'Descontaminacao de Vidros',
  'Cistalizacao de Farol',
];

interface IBooking {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  car?: string;
  licensePlate?: string;
  service: string[]; // Alterado para array
  date: string;
  createdAt: string;
  status: string; // Adicionado para consistência
}

interface BookingEditModalProps {
  show: boolean;
  onHide: () => void;
  booking: IBooking | null;
  onSave: (updatedBooking: IBooking) => void;
}

const BookingEditModal: React.FC<BookingEditModalProps> = ({ show, onHide, booking, onSave }) => {
  const [formData, setFormData] = useState<IBooking | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Garante que o serviço seja sempre um array ao carregar
    if (booking) {
      const sanitizedBooking = {
        ...booking,
        service: Array.isArray(booking.service) ? booking.service : [booking.service],
      };
      setFormData(sanitizedBooking);
    } else {
      setFormData(null);
    }
    setError('');
  }, [booking]);

  const handleChange = (e: React.ChangeEvent<any>) => {
    if (formData) {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleServiceChange = (serviceName: string) => {
    if (formData) {
      setFormData(prevFormData => {
        if (!prevFormData) return null;
        const currentServices = Array.isArray(prevFormData.service) ? prevFormData.service : [prevFormData.service];
        const newServices = currentServices.includes(serviceName)
          ? currentServices.filter(s => s !== serviceName)
          : [...currentServices, serviceName];
        return { ...prevFormData, service: newServices };
      });
    }
  };

  const handleSave = async () => {
    if (!formData) return;

    if (formData.service.length === 0) {
      setError('Por favor, selecione ao menos um serviço.');
      return;
    }

    setIsLoading(true);
    setError('');
    const token = localStorage.getItem('auth-token');

    try {
      const response = await fetch(`process.env.REACT_APP_API_URL/api/bookings/${formData._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': token!,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Falha ao atualizar agendamento.');
      }

      onSave(data);
      onHide();

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!formData) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Editar Agendamento</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form>
          <Row className="mb-3">
            <Form.Group as={Col} controlId="formGridFullName">
              <Form.Label>Nome Completo</Form.Label>
              <Form.Control type="text" name="fullName" value={formData.fullName} onChange={handleChange} />
            </Form.Group>
          </Row>
          <Row className="mb-3">
            <Form.Group as={Col} controlId="formGridEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} />
            </Form.Group>
            <Form.Group as={Col} controlId="formGridPhone">
              <Form.Label>Telefone</Form.Label>
              <Form.Control type="tel" name="phone" value={formData.phone} onChange={handleChange} />
            </Form.Group>
          </Row>
          <Row className="mb-3">
            <Form.Group as={Col} controlId="formGridCar">
              <Form.Label>Carro</Form.Label>
              <Form.Control type="text" name="car" value={formData.car || ''} onChange={handleChange} />
            </Form.Group>
            <Form.Group as={Col} controlId="formGridLicensePlate">
              <Form.Label>Placa</Form.Label>
              <Form.Control type="text" name="licensePlate" value={formData.licensePlate || ''} onChange={handleChange} />
            </Form.Group>
          </Row>
          <Row className="mb-3">
            <Form.Group as={Col} controlId="formGridService">
              <Form.Label>Selecione o(s) Serviço(s)</Form.Label>
              <div className="mt-2">{
                ALL_SERVICES.map(serviceName => (
                  <Form.Check 
                    type="checkbox"
                    key={serviceName}
                    id={`edit-service-${serviceName}`}
                    label={serviceName}
                    checked={Array.isArray(formData.service) && formData.service.includes(serviceName)}
                    onChange={() => handleServiceChange(serviceName)}
                  />
                ))
              }</div>
            </Form.Group>
            <Form.Group as={Col} controlId="formGridDate">
              <Form.Label>Data do Agendamento</Form.Label>
              <Form.Control type="date" name="date" value={new Date(formData.date).toISOString().split('T')[0]} onChange={handleChange} />
            </Form.Group>
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={isLoading}>Cancelar</Button>
        <Button variant="primary" onClick={handleSave} disabled={isLoading}>
          {isLoading ? <><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Salvando...</> : 'Salvar Alterações'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default BookingEditModal;

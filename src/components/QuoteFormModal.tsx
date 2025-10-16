import React, { useState, useEffect, useMemo } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  Box, 
  Typography, 
  FormGroup, 
  FormControlLabel, 
  Checkbox, 
  CircularProgress, 
  Alert 
} from '@mui/material';

import api from '../api/api'; // Importa a instância do Axios

// Interfaces
interface IService {
  _id: string;
  name: string;
  price: number;
}

interface QuoteFormModalProps {
  show: boolean;
  onHide: () => void;
  onSave: (quoteData: any) => void;
}

const QuoteFormModal: React.FC<QuoteFormModalProps> = ({ show, onHide, onSave }) => {
  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);

  // Data & UI State
  const [allServices, setAllServices] = useState<IService[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch services when modal opens
  useEffect(() => {
    if (show) {
      const fetchServices = async () => {
        setLoading(true);
        setError('');
        try {
          const response = await api.get('/api/services/all');
          setAllServices(response.data);
        } catch (err: any) {
          setError(err.response?.data?.message || 'Falha ao buscar serviços.');
        } finally {
          setLoading(false);
        }
      };
      fetchServices();
    }
  }, [show]);

  // Reset form when modal is hidden
  useEffect(() => {
    if (!show) {
      setCustomerName('');
      setCustomerEmail('');
      setCustomerPhone('');
      setSelectedServiceIds([]);
      setError('');
    }
  }, [show]);

  const handleServiceChange = (serviceId: string) => {
    setSelectedServiceIds(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId) 
        : [...prev, serviceId]
    );
  };

  // Calculate total price
  const totalPrice = useMemo(() => {
    return allServices
      .filter(service => selectedServiceIds.includes(service._id))
      .reduce((total, service) => total + service.price, 0);
  }, [selectedServiceIds, allServices]);

  const handleSave = () => {
    if (!customerName) {
      setError('O nome do cliente é obrigatório.');
      return;
    }
    if (selectedServiceIds.length === 0) {
      setError('Selecione ao menos um serviço.');
      return;
    }

    const quoteData = {
      customer: {
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
      },
      serviceIds: selectedServiceIds,
    };
    onSave(quoteData);
  };

  return (
    <Dialog open={show} onClose={onHide} maxWidth="sm" fullWidth>
      <DialogTitle>Criar Novo Orçamento</DialogTitle>
      <DialogContent>
        <Box component="form" sx={{ mt: 2 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <Typography variant="h6" gutterBottom>Dados do Cliente</Typography>
          <TextField label="Nome Completo" fullWidth margin="normal" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
          <TextField label="Email" type="email" fullWidth margin="normal" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} />
          <TextField label="Telefone" fullWidth margin="normal" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
          
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Serviços</Typography>
          {loading ? <CircularProgress /> : (
            <FormGroup>
              {allServices.map(service => (
                <FormControlLabel 
                  key={service._id} 
                  control={<Checkbox checked={selectedServiceIds.includes(service._id)} onChange={() => handleServiceChange(service._id)} />} 
                  label={`${service.name} - R$ ${service.price.toFixed(2)}`}
                />
              ))}
            </FormGroup>
          )}

          <Typography variant="h5" sx={{ mt: 3, fontWeight: 'bold' }}>
            Total: R$ {totalPrice.toFixed(2)}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onHide}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained">Salvar Orçamento</Button>
      </DialogActions>
    </Dialog>
  );
};

export default QuoteFormModal;
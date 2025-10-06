import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Grid, TextField, FormControl, FormLabel, FormGroup, FormControlLabel, Checkbox, Button, Alert, CircularProgress } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useNavigate, useLocation } from 'react-router-dom';
import dayjs, { Dayjs } from 'dayjs';

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

const Booking = () => {
  const [showAddress, setShowAddress] = useState(false);
  const [feedback, setFeedback] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [loading, setLoading] = useState(false);

  // States for form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [car, setCar] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [services, setServices] = useState<string[]>([]);
  const [date, setDate] = useState<Dayjs | null>(null);
  const [createAccount, setCreateAccount] = useState(false);
  const [password, setPassword] = useState('');

  // States for address fields
  const [cep, setCep] = useState('');
  const [address, setAddressState] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');

  // State for reschedule mode
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Effect to pre-fill form for rescheduling
  useEffect(() => {
    const { bookingToReschedule } = location.state || {};
    if (bookingToReschedule) {
      setRescheduleId(bookingToReschedule._id);
      setFullName(bookingToReschedule.fullName || '');
      setEmail(bookingToReschedule.email || '');
      setPhone(bookingToReschedule.phone || '');
      setCar(bookingToReschedule.car || '');
      setLicensePlate(bookingToReschedule.licensePlate || '');
      setServices(Array.isArray(bookingToReschedule.service) ? bookingToReschedule.service : [bookingToReschedule.service]);
      // Não preenchemos a data, pois é o que o usuário vai alterar
      setDate(null);
    } else {
      // Preenche com dados do usuário logado se não for remarcação
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          setFullName(user.fullName || '');
          setEmail(user.email || '');
          setPhone(user.phone || '');
        } catch (error) {
          console.error("Erro ao parsear dados do usuário:", error);
        }
      }
    }
  }, [location.state]);

  const handleServiceChange = (serviceName: string) => {
    setServices(prevServices => 
      prevServices.includes(serviceName) 
        ? prevServices.filter(s => s !== serviceName) 
        : [...prevServices, serviceName]
    );
  };

  const fetchCepData = async (cepValue: string) => {
    const currentCep = cepValue.replace(/\D/g, '');
    if (currentCep.length !== 8) return;
    try {
      const response = await fetch(`https://viacep.com.br/ws/${currentCep}/json/`);
      const data = await response.json();
      if (!data.erro) {
        setAddressState(data.logradouro);
        setNeighborhood(data.bairro);
        setCity(data.localidade);
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    }
  };

  const resetForm = () => {
    setFullName(''); setEmail(''); setPhone(''); setCar(''); setLicensePlate('');
    setServices([]); setDate(null); setCreateAccount(false); setPassword('');
    setCep(''); setAddressState(''); setNumber(''); setComplement(''); setNeighborhood(''); setCity('');
    setShowAddress(false);
    setRescheduleId(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFeedback(null);
    setLoading(true);

    if (!date) {
      setFeedback({ type: 'error', message: 'Por favor, selecione uma nova data para remarcar.' });
      setLoading(false);
      return;
    }

    // --- RESCHEDULE LOGIC ---
    if (rescheduleId) {
      const token = localStorage.getItem('customer-auth-token');
      if (!token) {
        setFeedback({ type: 'error', message: 'Sessão expirada. Faça login novamente.' });
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/bookings/${rescheduleId}/reschedule`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'customer-auth-token': token
          },
          body: JSON.stringify({ date: date.format('YYYY-MM-DD') }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Falha ao remarcar agendamento.');

        setFeedback({ type: 'success', message: 'Agendamento remarcado com sucesso!' });
        setTimeout(() => navigate('/customer/dashboard'), 2000);

      } catch (error: any) {
        setFeedback({ type: 'error', message: error.message || 'Ocorreu um erro ao remarcar.' });
      } finally {
        setLoading(false);
      }
      return; // Encerra a função aqui
    }

    // --- CREATE NEW BOOKING LOGIC ---
    if (services.length === 0) {
      setFeedback({ type: 'error', message: 'Por favor, selecione ao menos um serviço.' });
      setLoading(false);
      return;
    }
    if (createAccount && !password) {
      setFeedback({ type: 'error', message: 'Por favor, crie uma senha para sua conta.' });
      setLoading(false);
      return;
    }

    const bookingData: any = {
      fullName, email, phone, car, licensePlate, service: services,
      date: date.format('YYYY-MM-DD'),
      needsPickup: showAddress,
      address: showAddress ? { cep, street: address, number, complement, neighborhood, city } : undefined,
    };

    if (createAccount) bookingData.password = password;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Falha ao enviar agendamento.');

      setFeedback({ type: 'success', message: 'Agendamento confirmado com sucesso! Entraremos em contato em breve.' });
      resetForm();

      if (data.customerToken) {
        localStorage.setItem('customer-auth-token', data.customerToken);
        setTimeout(() => navigate('/customer/dashboard'), 2000);
      }
    } catch (error: any) {
      setFeedback({ type: 'error', message: error.message || 'Ocorreu um erro ao confirmar o agendamento.' });
    } finally {
      setLoading(false);
    }
  };

  const isRescheduleMode = !!rescheduleId;

  return (
    <Container sx={{ py: 5 }} maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom textAlign="center">
        {isRescheduleMode ? 'Remarcar Agendamento' : 'Agendamento de Serviços'}
      </Typography>
      <Typography variant="body1" textAlign="center" mb={4}>
        {isRescheduleMode ? 'Selecione uma nova data para o seu agendamento.' : 'Preencha o formulário abaixo e selecione os serviços desejados.'}
      </Typography>
      
      {feedback && <Alert severity={feedback.type} sx={{ mb: 2 }}>{feedback.message}</Alert>}

      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField fullWidth label="Nome Completo" value={fullName} onChange={e => setFullName(e.target.value)} required disabled={isRescheduleMode} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth type="email" label="Email" value={email} onChange={e => setEmail(e.target.value)} required disabled={isRescheduleMode} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth type="tel" label="Telefone" placeholder="(11) 99999-9999" value={phone} onChange={e => setPhone(e.target.value)} required disabled={isRescheduleMode} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Carro" placeholder="Ex: Honda Civic" value={car} onChange={e => setCar(e.target.value)} disabled={isRescheduleMode} />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Placa" placeholder="Ex: ABC-1234" value={licensePlate} onChange={e => setLicensePlate(e.target.value)} disabled={isRescheduleMode} />
          </Grid>

          <Grid item xs={12} md={6}>
            <FormControl component="fieldset" fullWidth disabled={isRescheduleMode}>
              <FormLabel component="legend">Selecione o(s) Serviço(s)</FormLabel>
              <FormGroup>
                <Grid container>
                  {ALL_SERVICES.map(serviceName => (
                    <Grid item xs={12} sm={6} key={serviceName}>
                      <FormControlLabel
                        control={<Checkbox checked={services.includes(serviceName)} onChange={() => handleServiceChange(serviceName)} name={serviceName} />}
                        label={serviceName}
                      />
                    </Grid>
                  ))}
                </Grid>
              </FormGroup>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6} container alignItems="center">
            <DatePicker
              label={isRescheduleMode ? "Nova Data do Agendamento" : "Data do Agendamento"}
              value={date}
              onChange={(newValue) => setDate(newValue)}
              sx={{ width: '100%' }}
            />
          </Grid>

          {!isRescheduleMode && (
            <>
              <Grid item xs={12}>
                <FormControlLabel
                  control={<Checkbox checked={showAddress} onChange={(e) => setShowAddress(e.target.checked)} />}
                  label="Necessito do serviço Leva e Trás"
                />
              </Grid>

              {showAddress && (
                <>
                  <Grid item xs={12}><Typography variant="h6">Endereço de Retirada e Entrega</Typography></Grid>
                  <Grid item xs={12} md={4}>
                    <TextField fullWidth label="CEP" value={cep} onChange={e => setCep(e.target.value.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2'))} onBlur={e => fetchCepData(e.target.value)} inputProps={{ maxLength: 9 }} />
                  </Grid>
                  <Grid item xs={12} md={8}>
                    <TextField fullWidth label="Endereço" value={address} onChange={e => setAddressState(e.target.value)} />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField fullWidth label="Número" value={number} onChange={e => setNumber(e.target.value)} />
                  </Grid>
                  <Grid item xs={12} md={8}>
                    <TextField fullWidth label="Complemento" value={complement} onChange={e => setComplement(e.target.value)} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Bairro" value={neighborhood} onChange={e => setNeighborhood(e.target.value)} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField fullWidth label="Cidade" value={city} onChange={e => setCity(e.target.value)} />
                  </Grid>
                </>
              )}

              <Grid item xs={12}>
                <FormControlLabel
                  control={<Checkbox checked={createAccount} onChange={(e) => setCreateAccount(e.target.checked)} />}
                  label="Deseja criar uma conta para acompanhar seu agendamento?"
                />
              </Grid>

              {createAccount && (
                <Grid item xs={12} md={6}>
                  <TextField fullWidth type="password" label="Crie uma Senha" value={password} onChange={e => setPassword(e.target.value)} required />
                </Grid>
              )}
            </>
          )}

          <Grid item xs={12}>
            <Button type="submit" variant="contained" size="large" fullWidth disabled={loading}>
              {loading ? <CircularProgress size={24} /> : (isRescheduleMode ? 'Confirmar Remarcação' : 'Confirmar Agendamento')}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}

export default Booking;
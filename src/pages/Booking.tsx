import React, { useState } from 'react';
import { Container, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

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
  const [feedback, setFeedback] = useState<{type: 'success' | 'danger', message: string} | null>(null);

  // States for form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [car, setCar] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [services, setServices] = useState<string[]>([]);
  const [date, setDate] = useState('');
  const [createAccount, setCreateAccount] = useState(false);
  const [password, setPassword] = useState('');

  // States for address fields
  const [cep, setCep] = useState('');
  const [address, setAddressState] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');

  const navigate = useNavigate();

  const handleServiceChange = (serviceName: string) => {
    setServices(prevServices => 
      prevServices.includes(serviceName) 
        ? prevServices.filter(s => s !== serviceName) 
        : [...prevServices, serviceName]
    );
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    if (rawValue.length <= 8) {
      const maskedValue = rawValue.replace(/(\d{5})(\d)/, '$1-$2');
      setCep(maskedValue);
    }
  };

  const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    fetchCepData(e.target.value);
  };

  const handleCepKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      fetchCepData(e.currentTarget.value);
    }
  };

  const fetchCepData = async (cepValue: string) => {
    const currentCep = cepValue.replace(/\D/g, '');
    if (currentCep.length !== 8) {
      return;
    }

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
    setFullName('');
    setEmail('');
    setPhone('');
    setCar('');
    setLicensePlate('');
    setServices([]);
    setDate('');
    setCep('');
    setAddressState('');
    setNumber('');
    setComplement('');
    setNeighborhood('');
    setCity('');
    setShowAddress(false);
    setCreateAccount(false);
    setPassword('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFeedback(null);

    if (services.length === 0) {
      setFeedback({ type: 'danger', message: 'Por favor, selecione ao menos um serviço.' });
      return;
    }

    if (createAccount && !password) {
      setFeedback({ type: 'danger', message: 'Por favor, crie uma senha para sua conta.' });
      return;
    }

    const bookingData: any = {
      fullName,
      email,
      phone,
      car,
      licensePlate,
      service: services,
      date,
      needsPickup: showAddress,
      address: showAddress ? {
        cep,
        street: address,
        number,
        complement,
        neighborhood,
        city,
      } : undefined,
    };

    if (createAccount) {
      bookingData.password = password;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Falha ao enviar agendamento.');
      }

      setFeedback({ type: 'success', message: 'Agendamento confirmado com sucesso! Entraremos em contato em breve.' });
      resetForm();

      // Se um token de cliente for retornado, salva e redireciona
      if (data.customerToken) {
        localStorage.setItem('customer-auth-token', data.customerToken);
        navigate('/customer/dashboard');
      }

    } catch (error: any) {
      setFeedback({ type: 'danger', message: error.message || 'Ocorreu um erro ao confirmar o agendamento.' });
    }
  };

  return (
    <Container style={{ paddingTop: '50px', paddingBottom: '50px' }}>
      <h2>Agendamento de Serviços</h2>
      <p>Preencha o formulário abaixo e selecione os serviços desejados.</p>
      
      {feedback && <Alert variant={feedback.type}>{feedback.message}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Row>
          <Form.Group as={Col} sm={12} className="mb-3" controlId="formGridFullName">
            <Form.Label>Nome Completo</Form.Label>
            <Form.Control type="text" placeholder="Digite seu nome completo" value={fullName} onChange={e => setFullName(e.target.value)} required />
          </Form.Group>
        </Row>

        <Row className="mb-3">
          <Form.Group as={Col} md={6} sm={12} className="mb-3 mb-md-0">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" placeholder="Digite seu email" value={email} onChange={e => setEmail(e.target.value)} required />
          </Form.Group>

          <Form.Group as={Col} controlId="formGridPhone">
            <Form.Label>Telefone</Form.Label>
            <Form.Control type="tel" placeholder="(11) 99999-9999" value={phone} onChange={e => setPhone(e.target.value)} required />
          </Form.Group>
        </Row>

        <Row className="mb-3">
          <Form.Group as={Col} md={6} sm={12} className="mb-3 mb-md-0">
            <Form.Label>Carro</Form.Label>
            <Form.Control type="text" placeholder="Ex: Honda Civic" value={car} onChange={e => setCar(e.target.value)} />
          </Form.Group>

          <Form.Group as={Col} md={6} sm={12}>
            <Form.Label>Placa</Form.Label>
            <Form.Control type="text" placeholder="Ex: ABC-1234" value={licensePlate} onChange={e => setLicensePlate(e.target.value)} />
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
                  id={`service-${serviceName}`}
                  label={serviceName}
                  checked={services.includes(serviceName)}
                  onChange={() => handleServiceChange(serviceName)}
                />
              ))
            }</div>
          </Form.Group>

          <Form.Group as={Col} md={6} sm={12} className="mt-3 mt-md-0">
            <Form.Label>Data do Agendamento</Form.Label>
            <Form.Control type="date" value={date} onChange={e => setDate(e.target.value)} required />
          </Form.Group>
        </Row>

        <Form.Group className="mb-3" id="formGridCheckbox" style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '5px' }}>
          <Form.Check 
            type="checkbox" 
            label="Necessito do serviço Leva e Trás"
            checked={showAddress}
            onChange={(e) => setShowAddress(e.target.checked)}
          />
        </Form.Group>

        {showAddress && (
          <>
            <h4 className="mt-4">Endereço de Retirada e Entrega</h4>
            <Row className="mb-3">
              <Form.Group as={Col} md={4} sm={12} controlId="formGridCep">
                <Form.Label>CEP</Form.Label>
                <Form.Control type="text" placeholder="Digite o CEP" value={cep} onChange={handleCepChange} onBlur={handleCepBlur} onKeyDown={handleCepKeyDown} maxLength={9} />
              </Form.Group>
            </Row>
            <Row className="mb-3">
              <Form.Group as={Col} sm={12} controlId="formGridAddress">
                <Form.Label>Endereço</Form.Label>
                <Form.Control type="text" placeholder="Rua, Avenida..." value={address} onChange={e => setAddressState(e.target.value)} />
              </Form.Group>
            </Row>
            <Row className="mb-3">
              <Form.Group as={Col} md={4} sm={12} className="mb-3 mb-md-0">
                <Form.Label>Número</Form.Label>
                <Form.Control type="text" placeholder="Nº" value={number} onChange={e => setNumber(e.target.value)} />
              </Form.Group>
              <Form.Group as={Col} controlId="formGridComplement">
                <Form.Label>Complemento</Form.Label>
                <Form.Control type="text" placeholder="Apto, Bloco, Casa" value={complement} onChange={e => setComplement(e.target.value)} />
              </Form.Group>
            </Row>
            <Row className="mb-3">
              <Form.Group as={Col} md={6} sm={12} className="mb-3 mb-md-0">
                <Form.Label>Bairro</Form.Label>
                <Form.Control type="text" value={neighborhood} onChange={e => setNeighborhood(e.target.value)} />
              </Form.Group>
              <Form.Group as={Col} md={6} sm={12}>
                <Form.Label>Cidade</Form.Label>
                <Form.Control type="text" value={city} onChange={e => setCity(e.target.value)} />
              </Form.Group>
            </Row>
          </>
        )}

        <Form.Group className="mb-3 mt-4">
          <Form.Check 
            type="checkbox" 
            label="Deseja criar uma conta para acompanhar seu agendamento?"
            checked={createAccount}
            onChange={(e) => setCreateAccount(e.target.checked)}
          />
        </Form.Group>

        {createAccount && (
          <Form.Group className="mb-3" controlId="formGridPassword">
            <Form.Label>Crie uma Senha</Form.Label>
            <Form.Control 
              type="password" 
              placeholder="Sua senha para a conta"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Form.Group>
        )}

        <Button variant="warning" type="submit" className="mt-3">
          Confirmar Agendamento
        </Button>
      </Form>
    </Container>
  );
}

export default Booking;
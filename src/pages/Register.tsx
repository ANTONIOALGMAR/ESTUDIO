import React, { useState } from 'react';
import { Container, Form, Button, Alert, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Importa os ícones

const Register = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Novo estado
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('https://estudio-backend-skzl.onrender.com/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fullName, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Falha ao registrar.');
      }

      // Redireciona para a página de login após o sucesso
      navigate('/login');

    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Container style={{ paddingTop: '50px', maxWidth: '500px' }}>
      <h2>Registro de Administrador</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="formBasicFullName">
          <Form.Label>Nome Completo</Form.Label>
          <Form.Control 
            type="text" 
            placeholder="Digite seu nome completo" 
            value={fullName} 
            onChange={(e) => setFullName(e.target.value)} 
            required 
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label>Email</Form.Label>
          <Form.Control 
            type="email" 
            placeholder="Digite seu email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label>Senha</Form.Label>
          <InputGroup>
            <Form.Control 
              type={showPassword ? 'text' : 'password'} // Tipo dinâmico
              placeholder="Crie uma senha" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
            <Button variant="outline-secondary" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </Button>
          </InputGroup>
        </Form.Group>

        <Button variant="warning" type="submit">
          Registrar
        </Button>
      </Form>
    </Container>
  );
};

export default Register;

import React, { useState } from 'react';
import { Container, Form, Button, Alert, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/unified-auth/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Falha ao fazer login.');
      }

      // ✅ O backend retorna { token, user: { userType, ... } }
      if (data.user?.userType === 'admin') {
        localStorage.setItem('auth-token', data.token);
        navigate('/dashboard');
      } else if (data.user?.userType === 'customer') {
        localStorage.setItem('customer-auth-token', data.token);
        navigate('/customer/dashboard');
      } else {
        setError('Tipo de usuário desconhecido.');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Container style={{ paddingTop: '50px', maxWidth: '500px' }}>
      <h2>Login</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit}>
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
              type={showPassword ? 'text' : 'password'}
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button
              variant="outline-secondary"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </Button>
          </InputGroup>
        </Form.Group>

        <Button variant="warning" type="submit">
          Entrar
        </Button>
      </Form>
    </Container>
  );
};

export default Login;

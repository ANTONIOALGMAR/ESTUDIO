import React, { useState } from 'react';
import { Container, Form, Button, Alert, InputGroup, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); // Estado para o carregamento
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true); // Inicia o carregamento
    
    // Garante que a URL da API seja a de produção, mesmo que a variável de ambiente falhe.
    const apiUrl = process.env.REACT_APP_API_URL || 'https://estudio-backend-skzl.onrender.com';

    try {
      const response = await fetch(
        `${apiUrl}/api/unified-auth/login`,
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

      // O backend retorna { token, user: { userType, ... } }
      if (data.token && data.user) {
        // Limpa tokens antigos para evitar conflitos
        localStorage.removeItem('auth-token');
        localStorage.removeItem('customer-auth-token');
        
        // Salva o token e os dados do usuário para a nova sessão
        const tokenKey = data.user.userType === 'admin' ? 'auth-token' : 'customer-auth-token';
        localStorage.setItem(tokenKey, data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Redireciona com base no tipo de usuário
        if (data.user.userType === 'admin') {
          navigate('/admin/dashboard');
        } else if (data.user.userType === 'customer') {
          navigate('/customer/dashboard');
        } else {
          // Limpa os dados em caso de tipo de usuário inesperado
          localStorage.removeItem('auth-token');
          localStorage.removeItem('user');
          setError('Tipo de usuário desconhecido.');
        }
      } else {
        throw new Error(data.message || 'Resposta inválida do servidor.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false); // Finaliza o carregamento
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

        <Button variant="warning" type="submit" disabled={loading}>
          {loading ? (
            <>
              <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
              <span className="visually-hidden">Carregando...</span>
            </>
          ) : 'Entrar'}
        </Button>
      </Form>
    </Container>
  );
};

export default Login;

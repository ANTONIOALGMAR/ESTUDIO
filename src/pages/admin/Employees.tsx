import React, { useState, useEffect, useCallback } from 'react';
import { Container, Button, Table, Spinner, Alert } from 'react-bootstrap';

// Interface for the user data (matching backend User.model.js)
interface IUser {
  _id: string;
  fullName: string;
  email: string;
  role: 'admin' | 'funcionario';
  createdAt: string;
}

const AdminEmployees = () => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = useCallback(async () => {
    const token = localStorage.getItem('auth-token');
    if (!token) {
      setError("Token não encontrado. Faça login novamente.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
      const response = await fetch(`${apiUrl}/api/users`, {
        headers: {
          'auth-token': token,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao buscar usuários.');
      }

      const data = await response.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Gestão de Funcionários</h1>
        <Button variant="primary">Adicionar Novo Funcionário</Button>
      </div>

      {loading && (
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p>Carregando funcionários...</p>
        </div>
      )}

      {error && <Alert variant="danger">{error}</Alert>}

      {!loading && !error && (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Nome Completo</th>
              <th>Email</th>
              <th>Função</th>
              <th>Membro Desde</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.fullName}</td>
                <td>{user.email}</td>
                <td>{user.role === 'admin' ? 'Administrador' : 'Funcionário'}</td>
                <td>{new Date(user.createdAt).toLocaleDateString('pt-BR')}</td>
                <td>
                  <Button variant="outline-secondary" size="sm" className="me-2">
                    Editar
                  </Button>
                  <Button variant="outline-danger" size="sm">
                    Excluir
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default AdminEmployees;

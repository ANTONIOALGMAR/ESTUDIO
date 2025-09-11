import React, { useState, useEffect, useCallback } from 'react';
import { Container, Button, Table, Spinner, Alert } from 'react-bootstrap';
import UserFormModal, { IUser } from '../../components/UserFormModal'; // Importa o modal e a interface

const AdminEmployees = () => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estados para o Modal
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<IUser | null>(null);

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

  const handleOpenModal = (user: IUser | null) => {
    setEditingUser(user);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
  };

  const handleSaveUser = async (userData: IUser) => {
    const token = localStorage.getItem('auth-token');
    const method = userData._id ? 'PUT' : 'POST';
    const url = userData._id
      ? `${process.env.REACT_APP_API_URL}/api/users/${userData._id}`
      : `${process.env.REACT_APP_API_URL}/api/users`;

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'auth-token': token!,
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao salvar usuário.');
      }

      handleCloseModal();
      fetchUsers(); // Re-busca os usuários para atualizar a lista
    } catch (err: any) {
      setError(err.message);
      // Não fechar o modal em caso de erro para o usuário poder corrigir
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      const token = localStorage.getItem('auth-token');
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/${id}`, {
          method: 'DELETE',
          headers: {
            'auth-token': token!,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Falha ao excluir usuário.');
        }
        
        fetchUsers(); // Re-busca os usuários
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Gestão de Funcionários</h1>
        <Button variant="primary" onClick={() => handleOpenModal(null)}>
          Adicionar Novo Funcionário
        </Button>
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
                  <Button variant="outline-secondary" size="sm" className="me-2" onClick={() => handleOpenModal(user)}>
                    Editar
                  </Button>
                  <Button variant="outline-danger" size="sm" onClick={() => handleDeleteUser(user._id!)}>
                    Excluir
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <UserFormModal 
        show={showModal}
        onHide={handleCloseModal}
        onSave={handleSaveUser}
        user={editingUser}
      />
    </Container>
  );
};

export default AdminEmployees;

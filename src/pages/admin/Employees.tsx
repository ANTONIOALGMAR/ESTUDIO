import React, { useState, useEffect, useCallback } from 'react';
import { Box, Button, Typography, Alert, CircularProgress } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import UserFormModal, { IUser } from '../../components/UserFormModal';

const AdminEmployees = () => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
      const response = await fetch(`${apiUrl}/api/users`, { headers: { 'auth-token': token } });
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
        headers: { 'Content-Type': 'application/json', 'auth-token': token! },
        body: JSON.stringify(userData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao salvar usuário.');
      }
      handleCloseModal();
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      const token = localStorage.getItem('auth-token');
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/${id}`, {
          method: 'DELETE',
          headers: { 'auth-token': token! },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Falha ao excluir usuário.');
        }
        fetchUsers();
      } catch (err: any) { setError(err.message); }
    }
  };

  const columns: GridColDef[] = [
    { field: 'fullName', headerName: 'Nome Completo', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    {
      field: 'role',
      headerName: 'Função',
      flex: 0.5,
      valueGetter: (value) => value === 'admin' ? 'Administrador' : 'Funcionário',
    },
    {
      field: 'createdAt',
      headerName: 'Membro Desde',
      flex: 0.5,
      valueGetter: (value) => value ? new Date(value).toLocaleDateString('pt-BR') : 'N/A',
    },
    {
      field: 'actions',
      headerName: 'Ações',
      sortable: false,
      flex: 1,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Button variant="outlined" size="small" onClick={() => handleOpenModal(params.row)} sx={{ mr: 1 }}>
            Editar
          </Button>
          <Button variant="outlined" size="small" color="error" onClick={() => handleDeleteUser(params.id as string)}>
            Excluir
          </Button>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3, width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Gestão de Funcionários</Typography>
        <Button variant="contained" onClick={() => handleOpenModal(null)}>
          Adicionar Novo Funcionário
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ height: 650, width: '100%' }}>
        <DataGrid
          rows={users}
          columns={columns}
          loading={loading}
          getRowId={(row) => row._id!}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          pageSizeOptions={[5, 10, 20]}
        />
      </Box>

      <UserFormModal 
        show={showModal}
        onHide={handleCloseModal}
        onSave={handleSaveUser}
        user={editingUser}
      />
    </Box>
  );
};

export default AdminEmployees;

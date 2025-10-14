import React, { useState, useEffect, useCallback } from 'react';
import { Box, Button, Typography, Alert } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import UserFormModal, { IUser } from '../../components/UserFormModal';
import api from '../../api/api'; // Importar a instância do axios
import { useAuth } from '../../context/AuthContext'; // Importar para verificar o loading inicial

const AdminEmployees = () => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<IUser | null>(null);
  const { isInitialLoading } = useAuth(); // Usar o estado de loading do contexto

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      // Usar a instância do 'api' que já tem o token configurado
      const response = await api.get('/api/users');
      setUsers(response.data);
    } catch (err: any) {
      // O interceptador do axios já trata o logout em caso de token inválido.
      // Aqui, apenas mostramos o erro para o usuário.
      setError(err.response?.data?.message || err.message || 'Falha ao buscar usuários.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Só busca os dados quando a verificação inicial de autenticação terminar
    if (!isInitialLoading) {
      fetchUsers();
    }
  }, [fetchUsers, isInitialLoading]);

  const handleOpenModal = (user: IUser | null) => {
    setEditingUser(user);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
  };

  const handleSaveUser = async (userData: IUser) => {
    const method = userData._id ? 'PUT' : 'POST';
    const url = userData._id ? `/api/users/${userData._id}` : '/api/users';
    try {
      await api.request({
        url: url,
        method: method,
        data: userData,
      });
      handleCloseModal();
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        await api.delete(`/api/users/${id}`);
        fetchUsers();
      } catch (err: any) { 
        setError(err.response?.data?.message || err.message || 'Falha ao excluir usuário.');
      }
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

  // Mostra um loader centralizado enquanto o AuthContext verifica o token
  if (isInitialLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><Typography>Verificando acesso...</Typography></Box>
    );
  }

  return (
    <Box sx={{ p: 3, width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Gestão de Funcionários</Typography>
        <Button variant="contained" onClick={() => handleOpenModal(null)}>
          Adicionar Novo Funcionário
        </Button>
      </Box>

      {error && !loading && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

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

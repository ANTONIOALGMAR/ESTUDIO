import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';

interface Customer {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
}

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const token = localStorage.getItem('auth-token');
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/customers`, {
          headers: {
            'auth-token': token || '',
          },
        });

        if (!response.ok) {
          throw new Error('Falha ao buscar clientes.');
        }

        const data = await response.json();
        setCustomers(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const columns: GridColDef[] = [
    { field: 'fullName', headerName: 'Nome Completo', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'phone', headerName: 'Telefone', flex: 1 },
    { 
      field: 'actions',
      headerName: 'Ações',
      sortable: false,
      flex: 0.5,
      renderCell: (params: GridRenderCellParams) => (
        <Button
          variant="contained"
          size="small"
          onClick={() => navigate(`/admin/customers/${params.id}`)}
        >
          Ver Detalhes
        </Button>
      ),
    },
  ];

  if (loading) {
    return <Typography>Carregando clientes...</Typography>;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Gerenciamento de Clientes
      </Typography>
      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={customers}
          columns={columns}
          getRowId={(row) => row._id}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          pageSizeOptions={[5, 10, 20]}
          checkboxSelection
          disableRowSelectionOnClick
        />
      </Box>
    </Box>
  );
};

export default Customers;

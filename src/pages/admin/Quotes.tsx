
import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import QuoteFormModal from '../../components/QuoteFormModal'; // Importa o modal

// Interface para o Orçamento (deve corresponder ao modelo do backend)
interface IQuote {
  _id: string;
  quoteNumber: string;
  customer: {
    name: string;
    email?: string;
  };
  totalPrice: number;
  status: string;
  createdAt: string;
}

const Quotes = () => {
  const [quotes, setQuotes] = useState<IQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para controlar o modal

  const fetchQuotes = useCallback(async () => {
    const token = localStorage.getItem('auth-token');
    if (!token) {
      setError("Token de administrador não encontrado. Faça login novamente.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const apiUrl = process.env.REACT_APP_API_URL || 'https://estudio-backend-skzl.onrender.com';
      const response = await fetch(`${apiUrl}/api/quotes`, { 
        headers: { 'auth-token': token }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao buscar orçamentos.');
      }

      const data = await response.json();
      setQuotes(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  const handleSaveQuote = async (quoteData: any) => {
    const token = localStorage.getItem('auth-token');
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'https://estudio-backend-skzl.onrender.com';
      const response = await fetch(`${apiUrl}/api/quotes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'auth-token': token!
        },
        body: JSON.stringify(quoteData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao salvar orçamento.');
      }

      setIsModalOpen(false); // Fecha o modal
      fetchQuotes(); // Atualiza a lista de orçamentos

    } catch (err: any) {
      setError(err.message); // Mostra o erro na tela
    }
  };

  const columns: GridColDef[] = [
    { field: 'quoteNumber', headerName: 'Nº Orçamento', flex: 1 },
    { 
      field: 'customerName', 
      headerName: 'Cliente', 
      flex: 1.5, 
      valueGetter: (value, row) => row.customer.name 
    },
    { 
      field: 'totalPrice', 
      headerName: 'Valor Total', 
      flex: 1, 
      valueFormatter: (value) => `R$ ${Number(value).toFixed(2)}`
    },
    { field: 'status', headerName: 'Status', flex: 1 },
    {
      field: 'createdAt',
      headerName: 'Criado em',
      flex: 1,
      valueGetter: (value) => value ? new Date(value).toLocaleDateString('pt-BR') : 'N/A',
    },
    {
      field: 'actions',
      headerName: 'Ações',
      sortable: false,
      flex: 1,
      renderCell: (params: GridRenderCellParams) => (
        <Button variant="outlined" size="small" onClick={() => alert('Ver detalhes do orçamento: ' + params.row.quoteNumber)}>
          Ver Detalhes
        </Button>
      ),
    },
  ];

  return (
    <Box sx={{ p: 3, width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Gestão de Orçamentos</Typography>
        <Button variant="contained" onClick={() => setIsModalOpen(true)}>
          Criar Novo Orçamento
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ height: 650, width: '100%' }}>
        <DataGrid
          rows={quotes}
          columns={columns}
          loading={loading}
          getRowId={(row) => row._id}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          pageSizeOptions={[5, 10, 20]}
        />
      </Box>

      <QuoteFormModal 
        show={isModalOpen}
        onHide={() => setIsModalOpen(false)}
        onSave={handleSaveQuote}
      />
    </Box>
  );
};

export default Quotes;
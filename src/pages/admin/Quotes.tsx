
import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import QuoteFormModal from '../../components/QuoteFormModal'; // Importa o modal
import { useAuth } from '../../context/AuthContext';
import api from '../../api/api';

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
  const { user, isInitialLoading } = useAuth();

  const fetchQuotes = useCallback(async () => {
    if (isInitialLoading) return; // Não faz nada enquanto o AuthContext está carregando

    if (!user || user.userType !== 'admin') {
      setError("Acesso negado. Apenas administradores podem visualizar orçamentos.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await api.get('/api/quotes');
      setQuotes(response.data);
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
    if (!user || user.userType !== 'admin') {
      setError("Acesso negado. Apenas administradores podem criar orçamentos.");
      return;
    }
    try {
      const response = await api.post('/api/quotes', quoteData);

      // Axios lança um erro para status != 2xx, então não precisamos de response.ok
      // Se chegou aqui, a requisição foi bem-sucedida (status 2xx)
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
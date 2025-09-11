import React from 'react';
import { Container, Button } from 'react-bootstrap';

const AdminServices = () => {
  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Gestão de Serviços</h1>
        <Button variant="primary">Adicionar Novo Serviço</Button>
      </div>
      <p>A tabela com a lista de serviços aparecerá aqui em breve.</p>
    </Container>
  );
};

export default AdminServices;

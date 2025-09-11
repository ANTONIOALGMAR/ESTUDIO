import React from 'react';
import { Container, Button } from 'react-bootstrap';

const AdminEmployees = () => {
  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Gestão de Funcionários</h1>
        <Button variant="primary">Adicionar Novo Funcionário</Button>
      </div>
      <p>A tabela com a lista de funcionários será exibida aqui.</p>
    </Container>
  );
};

export default AdminEmployees;

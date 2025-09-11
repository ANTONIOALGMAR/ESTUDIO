import React from 'react';
import { Container } from 'react-bootstrap';
import { useParams } from 'react-router-dom';

const CustomerDetails = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <Container fluid>
      <div className="mb-4">
        <h1>Detalhes do Cliente</h1>
        <p>Exibindo detalhes para o cliente com ID: {id}</p>
      </div>
      <p>O histórico de agendamentos do cliente e outras informações aparecerão aqui em breve.</p>
    </Container>
  );
};

export default CustomerDetails;

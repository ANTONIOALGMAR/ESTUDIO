import React, { useState } from 'react';
import { Container, Form, Button, Row, Col, Table } from 'react-bootstrap';

const AdminReports = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('all');
  const [filteredBookings, setFilteredBookings] = useState([]); // Placeholder for now

  const STATUS_OPTIONS = ['all', 'aguardando', 'em andamento', 'pronto', 'entregue'];

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    // Lógica para buscar os agendamentos filtrados virá aqui
    console.log('Filtrando por:', { startDate, endDate, status });
  };

  return (
    <Container fluid>
      <h1>Relatórios de Agendamentos</h1>

      <Form onSubmit={handleFilter} className="mb-4">
        <Row className="align-items-end">
          <Col md={4}>
            <Form.Group controlId="startDate">
              <Form.Label>Data Inicial</Form.Label>
              <Form.Control
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group controlId="endDate">
              <Form.Label>Data Final</Form.Label>
              <Form.Control
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group controlId="statusFilter">
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt === 'all' ? 'Todos' : opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={1}>
            <Button variant="primary" type="submit">
              Filtrar
            </Button>
          </Col>
        </Row>
      </Form>

      {/* Tabela de resultados (placeholder por enquanto) */}
      <p>Os agendamentos filtrados aparecerão aqui.</p>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Serviço</th>
            <th>Data</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {/* Exemplo de linha, será substituído por dados reais */}
          <tr>
            <td>Cliente Teste</td>
            <td>Lavagem Básica</td>
            <td>10/09/2025</td>
            <td>pronto</td>
          </tr>
        </tbody>
      </Table>
    </Container>
  );
};

export default AdminReports;

const getStatusVariant = (status: string) => {
  switch (status) {
    case 'aguardando':
      return 'danger'; // Vermelho
    case 'em andamento':
      return 'warning'; // Laranja
    case 'pronto':
      return 'info'; // Azul claro
    case 'entregue':
      return 'success'; // Verde
    default:
      return 'secondary'; // Cinza padrão
  }
};

const Dashboard = () => {
  // ... (existing states and fetch logic) ...

  // ... (useEffect for filter, handleDelete, handleStatusChange, etc. remain the same) ...

  // ... (loading and error return statements remain the same) ...

  return (
    <Container fluid>
      {/* Seção de Analytics */}
      {/* ... (analytics cards remain the same) ... */}

      {/* Seção da Tabela de Agendamentos */}
      <Card>
        <Card.Header>
          <Row className="align-items-center">
            <Col sm={8}><h5>Agendamentos Recentes</h5></Col>
            <Col sm={4}>
              <Form.Control
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Col>
          </Row>
        </Card.Header>
        <Card.Body>
          {bookings.length === 0 ? (
            <Alert variant="info">Nenhum agendamento encontrado.</Alert>
          ) : filteredBookings.length === 0 ? (
            <Alert variant="warning">Nenhum resultado encontrado para "{searchTerm}".</Alert>
          ) : (
            isMobile ? (
              <div>
                {filteredBookings.map((booking) => (
                  <Card key={booking._id} className="mb-3" bg="dark" text="white">
                    <Card.Body>
                      <Card.Title>{booking.fullName}</Card.Title>
                      <Card.Subtitle className="mb-2 text-muted">{booking.car || 'Carro não informado'} - {booking.licensePlate || 'Placa não informada'}</Card.Subtitle>
                      <hr />
                      <Row className="mb-2"><Col xs={4} as="strong">Serviço:</Col><Col xs={8}>{Array.isArray(booking.service) ? booking.service.join(', ') : booking.service}</Col></Row>
                      <Row className="mb-2"><Col xs={4} as="strong">Data:</Col><Col xs={8}>{new Date(booking.date).toLocaleDateString('pt-BR')}</Col></Row>
                      <Row className="mb-2"><Col xs={4} as="strong">Email:</Col><Col xs={8}>{booking.email}</Col></Row>
                      <Row className="mb-2"><Col xs={4} as="strong">Telefone:</Col><Col xs={8}>{booking.phone}</Col></Row>
                      <hr />
                      <div className="d-flex justify-content-between align-items-center">
                        <Form.Select
                          value={booking.status}
                          onChange={(e) => handleStatusChange(booking._id, e.target.value)}
                          size="sm"
                          className={`bg-${getStatusVariant(booking.status)} ${getStatusVariant(booking.status) === 'warning' ? 'text-dark' : 'text-white'}`}
                          style={{ width: '150px' }}
                        >
                          {STATUS_OPTIONS.map(status => (<option key={status} value={status}>{status}</option>))}
                        </Form.Select>
                        <div>
                          <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleEditClick(booking)}>Editar</Button>
                          <Button variant="outline-danger" size="sm" onClick={() => { if (booking._id) { handleDelete(booking._id); } }} disabled={!booking._id}>Excluir</Button>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            ) : (
              <Table striped bordered hover responsive="md">
                <thead>
                  <tr>
                    <th>Data do Pedido</th><th>Nome Completo</th><th>Email</th><th>Telefone</th><th>Carro</th><th>Placa</th><th>Serviço</th><th>Data do Serviço</th><th>Status</th><th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking) => (
                    <tr key={booking._id}>
                      <td>{new Date(booking.createdAt).toLocaleDateString('pt-BR')}</td>
                      <td>{booking.fullName}</td>
                      <td>{booking.email}</td>
                      <td>{booking.phone}</td>
                      <td>{booking.car}</td>
                      <td>{booking.licensePlate}</td>
                      <td>{Array.isArray(booking.service) ? booking.service.join(', ') : booking.service}</td>
                      <td>{new Date(booking.date).toLocaleDateString('pt-BR')}</td>
                      <td>
                        <Form.Select
                          value={booking.status}
                          onChange={(e) => handleStatusChange(booking._id, e.target.value)}
                          size="sm"
                          className={`bg-${getStatusVariant(booking.status)} ${getStatusVariant(booking.status) === 'warning' ? 'text-dark' : 'text-white'}`}
                        >
                          {STATUS_OPTIONS.map(status => (<option key={status} value={status}>{status}</option>))}
                        </Form.Select>
                      </td>
                      <td>
                        <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleEditClick(booking)}>Editar</Button>
                        <Button variant="outline-danger" size="sm" onClick={() => { if (booking._id) { handleDelete(booking._id); } }} disabled={!booking._id}>Excluir</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )
          )}
        </Card.Body>
      </Card>

      <BookingEditModal
        show={showEditModal}
        onHide={handleModalClose}
        booking={selectedBooking}
        onSave={handleModalSave}
      />
    </Container>
  );
};

export default Dashboard;

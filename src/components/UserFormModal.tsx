import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Alert } from 'react-bootstrap';

// Interface for the user data
export interface IUser {
  _id?: string;
  fullName: string;
  email: string;
  password?: string; // Optional for editing, required for new
  role: 'admin' | 'funcionario';
  createdAt?: string; // Adicionado para corresponder ao backend
}

// Interface for the component's props
interface UserFormModalProps {
  show: boolean;
  onHide: () => void;
  onSave: (user: IUser) => void;
  user: IUser | null; // O usuário a ser editado, ou null para um novo
}

const UserFormModal: React.FC<UserFormModalProps> = ({ show, onHide, onSave, user }) => {
  const [formData, setFormData] = useState<IUser>({
    fullName: '',
    email: '',
    password: '',
    role: 'funcionario',
  });
  const [passwordRequired, setPasswordRequired] = useState(false);

  // Efeito para preencher o formulário quando um usuário é passado para edição
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        password: '', // Senha sempre vazia ao editar, para não sobrescrever
      });
      setPasswordRequired(false); // Senha não é obrigatória ao editar
    } else {
      // Reseta o formulário para o estado inicial se não houver usuário (modo de adição)
      setFormData({
        fullName: '',
        email: '',
        password: '',
        role: 'funcionario',
      });
      setPasswordRequired(true); // Senha é obrigatória ao adicionar
    }
  }, [user, show]); // Roda quando o usuário ou a visibilidade do modal muda

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const [error, setError] = useState(''); // Estado para erro local

  // Limpa o erro quando o modal é fechado
  const handleHide = () => {
    setError('');
    onHide();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validação extra: se for um novo usuário, a senha é obrigatória
    if (!user && (!formData.password || formData.password.trim() === '')) {
      setError('O campo senha é obrigatório para novos usuários.');
      return; // Impede o envio
    }
    setError(''); // Limpa o erro se a validação passar
    onSave(formData);
  };

  return (
    <Modal show={show} onHide={handleHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{user ? 'Editar Usuário' : 'Adicionar Novo Usuário'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
          <Form.Group className="mb-3" controlId="userFullName">
            <Form.Label>Nome Completo</Form.Label>
            <Form.Control
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="userEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="userPassword">
            <Form.Label>Senha {passwordRequired ? '*' : '(opcional para edição)'}</Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required={passwordRequired}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="userRole">
            <Form.Label>Função</Form.Label>
            <Form.Select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="funcionario">Funcionário</option>
              <option value="admin">Administrador</option>
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit">
            Salvar
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default UserFormModal;

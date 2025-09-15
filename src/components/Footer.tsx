import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FaInstagram, FaWhatsapp, FaFacebook, FaPhone } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer style={{ paddingTop: '30px', paddingBottom: '30px', marginTop: '50px', borderTop: '1px solid #333' }}>
      <Container>
        <Row>
          <Col className="text-center">
            <p>Siga-nos nas redes sociais!</p>
            <a href="https://www.instagram.com/studioo__carvalhoo/" target="_blank" rel="noopener noreferrer" style={{ color: 'yellow', margin: '0 15px' }}><FaInstagram size={30} /></a>
            <a href="https://wa.me/5511954989495" target="_blank" rel="noopener noreferrer" style={{ color: 'yellow', margin: '0 15px' }}><FaWhatsapp size={30} /></a>
            <a href="https://www.facebook.com/profile.php?id=61564202844778" target="_blank" rel="noopener noreferrer" style={{ color: 'yellow', margin: '0 15px' }}><FaFacebook size={30} /></a>
          </Col>
        </Row>
        <Row>
          <Col className="text-center" style={{ paddingTop: '20px' }}>
            <p>
              <a href="tel:+5511954989495" style={{ color: 'white', textDecoration: 'none' }}>
                <FaPhone size={20} style={{ marginRight: '10px' }} />
                (11) 95498-9495
              </a>
            </p>
          </Col>
        </Row>
        <Row>
          <Col className="text-center">
            <p>&copy; 2025 Carvalho Studio. Todos os direitos reservados.</p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}

export default Footer;
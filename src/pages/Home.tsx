import React from 'react';
import { Carousel } from 'react-bootstrap';
import 'styles/Carousel.css'; // Caminho absoluto a partir de src

const Home = () => {
  return (
    <Carousel>
      <Carousel.Item>
        <img
          className="d-block w-100"
          // URL otimizada para diferentes tamanhos de tela
          src="https://images.pexels.com/photos/120049/pexels-photo-120049.jpeg?auto=compress&cs=tinysrgb&w=800"
          alt="Polimento Técnico"
        />
        <Carousel.Caption>
          <h3>Polimento Técnico</h3>
          <p>Restaure o brilho e a profundidade da cor do seu veículo.</p>
        </Carousel.Caption>
      </Carousel.Item>
      <Carousel.Item>
        <img
          className="d-block w-100"
          src="https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg?auto=compress&cs=tinysrgb&w=800"
          alt="Restauração de Pintura"
        />
        <Carousel.Caption>
          <h3>Restauração de Pintura</h3>
          <p>Correção de imperfeições e proteção de longa duração.</p>
        </Carousel.Caption>
      </Carousel.Item>
      <Carousel.Item>
        <img
          className="d-block w-100"
          src="https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=800"
          alt="Lavagem Detalhada"
        />
        <Carousel.Caption>
          <h3>Lavagem Detalhada</h3>
          <p>Cuidado minucioso para cada parte do seu carro.</p>
        </Carousel.Caption>
      </Carousel.Item>
      <Carousel.Item>
        <img
          className="d-block w-100"
          src="https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg?auto=compress&cs=tinysrgb&w=800"
          alt="Manutenção Preventiva"
        />
        <Carousel.Caption>
          <h3>Manutenção Preventiva</h3>
          <p>Conserve a beleza e a performance do seu veículo com nossos cuidados preventivos.</p>
        </Carousel.Caption>
      </Carousel.Item>
      <Carousel.Item>
        <img
          className="d-block w-100"
          src="https://images.pexels.com/photos/1715193/pexels-photo-1715193.jpeg?auto=compress&cs=tinysrgb&w=800"
          alt="Serviços para Motos"
        />
        <Carousel.Caption>
          <h3>Serviços para Motos</h3>
          <p>Cuidado e detalhamento especializado para sua motocicleta.</p>
        </Carousel.Caption>
      </Carousel.Item>
    </Carousel>
  );
}

export default Home;
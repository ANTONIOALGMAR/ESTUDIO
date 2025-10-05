import React from 'react';
import Slider from 'react-slick';
import { Box, Typography } from '@mui/material';

// Import slick carousel styles
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const slides = [
  {
    src: "https://images.pexels.com/photos/120049/pexels-photo-120049.jpeg?auto=compress&cs=tinysrgb&w=1280",
    alt: "Polimento Técnico",
    title: "Polimento Técnico",
    description: "Restaure o brilho e a profundidade da cor do seu veículo.",
  },
  {
    src: "https://images.pexels.com/photos/1545743/pexels-photo-1545743.jpeg?auto=compress&cs=tinysrgb&w=1280",
    alt: "Restauração de Pintura",
    title: "Restauração de Pintura",
    description: "Correção de imperfeições e proteção de longa duração.",
  },
  {
    src: "https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=1280",
    alt: "Lavagem Detalhada",
    title: "Lavagem Detalhada",
    description: "Cuidado minucioso para cada parte do seu carro.",
  },
  {
    src: "https://images.pexels.com/photos/3729464/pexels-photo-3729464.jpeg?auto=compress&cs=tinysrgb&w=1280",
    alt: "Manutenção Preventiva",
    title: "Manutenção Preventiva",
    description: "Conserve a beleza e a performance do seu veículo com nossos cuidados preventivos.",
  },
  {
    src: "https://images.pexels.com/photos/1715193/pexels-photo-1715193.jpeg?auto=compress&cs=tinysrgb&w=1280",
    alt: "Serviços para Motos",
    title: "Serviços para Motos",
    description: "Cuidado e detalhamento especializado para sua motocicleta.",
  },
];

const Home = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    arrows: true,
  };

  return (
    <Box sx={{ width: '100%', overflow: 'hidden' }}>
      <Slider {...settings}>
        {slides.map((slide, index) => (
          <Box key={index} sx={{ position: 'relative', height: '80vh' }}>
            <Box
              component="img"
              src={slide.src}
              alt={slide.alt}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: '10%',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '5px',
                textAlign: 'center',
              }}
            >
              <Typography variant="h5">{slide.title}</Typography>
              <Typography variant="body1">{slide.description}</Typography>
            </Box>
          </Box>
        ))}
      </Slider>
    </Box>
  );
};

export default Home;
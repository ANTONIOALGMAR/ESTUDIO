import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import logo from '../assets/images/logo2.png';

const Header = () => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isCustomerAuthenticated, setIsCustomerAuthenticated] = useState(false);
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const adminToken = localStorage.getItem('auth-token');
    const customerToken = localStorage.getItem('customer-auth-token');
    setIsAdminAuthenticated(!!adminToken);
    setIsCustomerAuthenticated(!!customerToken);
  }, [location]);

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleLogout = (userType: 'admin' | 'customer') => {
    const tokenKey = userType === 'admin' ? 'auth-token' : 'customer-auth-token';
    localStorage.removeItem(tokenKey);
    localStorage.removeItem('user'); // Limpa também os dados do usuário
    setIsAdminAuthenticated(false);
    setIsCustomerAuthenticated(false);
    handleCloseNavMenu();
    navigate('/');
  };

  const commonPages = [
    { name: 'Início', path: '/' },
    { name: 'Sobre', path: '/about' },
    { name: 'Serviços', path: '/services' },
    { name: 'Agendamento', path: '/booking' },
  ];

  const renderNavLinks = (isMobile: boolean) => {
    const links = [...commonPages];

    if (isAdminAuthenticated) {
      links.push({ name: 'Painel Admin', path: '/dashboard' });
    } else if (isCustomerAuthenticated) {
      links.push({ name: 'Painel Cliente', path: '/customer/dashboard' });
    }

    return links.map((page) => (
      isMobile ?
        <MenuItem key={page.name} component={Link} to={page.path} onClick={handleCloseNavMenu}>
          {page.name}
        </MenuItem>
      :
        <Button key={page.name} component={Link} to={page.path} sx={{ color: 'yellow', my: 2, display: 'block' }}>
          {page.name}
        </Button>
    ));
  };

  const renderAuthButtons = (isMobile: boolean) => {
    const Component = isMobile ? MenuItem : Button;
    const commonProps = isMobile ? { onClick: handleCloseNavMenu } : {};

    if (isAdminAuthenticated) {
      return <Component {...commonProps} onClick={() => handleLogout('admin')} sx={{ color: 'yellow' }}>Sair Admin</Component>;
    } else if (isCustomerAuthenticated) {
      return <Component {...commonProps} onClick={() => handleLogout('customer')} sx={{ color: 'yellow' }}>Sair Cliente</Component>;
    } else {
      return (
        <>
          <Component {...commonProps} component={Link} to="/login" sx={{ color: 'yellow' }}>Login</Component>
          <Component {...commonProps} component={Link} to="/customer/register" sx={{ color: 'yellow' }}>Cadastro Cliente</Component>
        </>
      );
    }
  };

  return (
    <AppBar position="static" sx={{ bgcolor: '#212529', borderBottom: '2px solid yellow' }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* --- Desktop Logo --- */}
          <Typography
            variant="h6"
            noWrap
            component={Link}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.1rem',
              color: 'yellow',
              textDecoration: 'none',
            }}
          >
            <img src={logo} height="40" alt="logo" style={{ marginRight: '10px' }} />
            Studio Carvalho
          </Typography>

          {/* --- Mobile Menu --- */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{ display: { xs: 'block', md: 'none' } }}
            >
              {renderNavLinks(true)}
              {renderAuthButtons(true)}
            </Menu>
          </Box>

          {/* --- Mobile Logo --- */}
          <Typography
            variant="h5"
            noWrap
            component={Link}
            to="/"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              alignItems: 'center',
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.1rem',
              color: 'yellow',
              textDecoration: 'none',
            }}
          >
            <img src={logo} height="30" alt="logo" style={{ marginRight: '8px' }} />
            Studio Carvalho
          </Typography>

          {/* --- Desktop Links --- */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'flex-end' }}>
            {renderNavLinks(false)}
            {renderAuthButtons(false)}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
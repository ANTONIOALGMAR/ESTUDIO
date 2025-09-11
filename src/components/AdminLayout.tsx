import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import './AdminLayout.css'; // Importando o CSS que acabamos de criar

const AdminLayout = () => {
  return (
    <div className="admin-layout">
      <nav className="admin-sidebar">
        <h3>Admin</h3>
        <ul>
          <li>
            <NavLink to="/admin/dashboard">Dashboard</NavLink>
          </li>
          <li>
            <NavLink to="/admin/services">Serviços</NavLink>
          </li>
          <li>
            <NavLink to="/admin/customers">Clientes</NavLink>
          </li>
          <li>
            <NavLink to="/admin/reports">Relatórios</NavLink>
          </li>
        </ul>
      </nav>
      <main className="admin-content">
        <Outlet /> {/* As páginas de admin (Dashboard, etc.) serão renderizadas aqui */}
      </main>
    </div>
  );
};

export default AdminLayout;

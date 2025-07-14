import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/contexts/AuthContext';
import AdminLogin from './components/pages/AdminLogin';
import Dashboard from './components/dashboard/Dashboard';
import CreateProducts from './components/dashboard/CreateProducts';
import CreateCategoria from './components/dashboard/CreateCategoria';
import AddStock from './components/dashboard/AddStock';
import Orders from './components/dashboard/Orders';
import AdminGuard from './components/guards/AdminGuard';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<AdminLogin />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/dashboard" element={
              <AdminGuard>
                <Dashboard />
              </AdminGuard>
            } />
            <Route path="/admin/dashboard" element={
              <AdminGuard>
                <Dashboard />
              </AdminGuard>
            } />
            <Route path="/crear-productos" element={
              <AdminGuard>
                <CreateProducts />
              </AdminGuard>
            } />
            <Route path="/gestionar-stock" element={
              <AdminGuard>
                <AddStock />
              </AdminGuard>
            } />
            <Route path="/pedidos" element={
              <AdminGuard>
                <Orders />
              </AdminGuard>
            } />
            <Route path="/crear-categoria" element={
              <AdminGuard>
                <CreateCategoria />
              </AdminGuard>
            } />
            {/* Agrega más rutas aquí según necesites */}
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
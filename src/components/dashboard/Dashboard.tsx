import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();
  const [cantidadBebidas, setCantidadBebidas] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Función para cargar la cantidad de "Bebidas"
  const fetchCantidadBebidas = async () => {
    try {
      // Comentar temporalmente hasta que tengas el endpoint correcto
      // const data = await apiService.get(API_CONFIG.ENDPOINTS.SHOP.GET_BY_ID('1'));
      // const bebidas = data.find((item: any) => item.tipo_nombre === "Limpieza");
      // setCantidadBebidas(bebidas ? bebidas.cantidad_total : null);
      
      // Simular datos por ahora
      setCantidadBebidas(150);
      setLoading(false);
    } catch (error) {
      console.error('Error cargando datos:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCantidadBebidas();
    // const interval = setInterval(fetchCantidadBebidas, 5000); // Actualiza cada 5 segundos
    // return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Botón de menú móvil */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-800 text-white rounded-md"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Overlay para cerrar menú en móviles */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Menú lateral */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-slate-800 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6">
          <h2 className="text-xl font-bold mb-6">Menú</h2>
          <ul className="space-y-3">
            <li>
              <button
                onClick={() => navigate("/")}
                className="w-full bg-slate-700 text-white py-3 px-4 rounded-lg font-medium hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-colors"
              >
                Regresar al login
              </button>
            </li>
            <li>
              <Link to="/dashboard" className="block py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors">
                Inicio
              </Link>
            </li>
            <li>
              <Link to="/crear-productos" className="block py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors">
                Crear producto
              </Link>
            </li>
            <li>
              <Link to="/crear-categoria" className="block py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors">
                Crear categoría
              </Link>
            </li>
            <li>
              <Link to="/gestionar-stock" className="block py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors">
                Gestionar stock
              </Link>
            </li>
            <li>
              <Link to="/pedidos" className="block py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors">
                Pedidos
              </Link>
            </li>
            <li>
              <Link to="/" className="block py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors">
                Cerrar sesión
              </Link>
            </li>
            
          </ul>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 text-gray-900">
          Bienvenido a DataSentinel
        </h1>
        <p className="text-gray-600 mb-6 lg:mb-8">Panel de control y estadísticas</p>

        {/* Tarjetas de estadísticas - responsivas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 lg:gap-6 mb-6 lg:mb-8">
          {/* Ventas del mes */}
          <div className="bg-emerald-500 rounded-xl shadow p-4 flex flex-col items-start">
            <span className="text-white text-sm font-medium">Ventas de los ultimos 30 días</span>
            <span className="text-xl sm:text-2xl font-bold text-white mt-1">
              {loading ? "Cargando..." : cantidadBebidas ?? "No disponible"}
            </span>
          </div>
          
          {/* Total Ventas Hoy */}
          <div className="bg-emerald-500 rounded-xl shadow p-4 flex flex-col items-start">
            <span className="text-white text-sm font-medium">Ventas de los ultimos 7 días</span>
            <span className="text-xl sm:text-2xl font-bold text-white mt-1">$642.39</span>
          </div>
          
          {/* Ventas de los últimos 7 días */}
          <div className="bg-emerald-500 rounded-xl shadow p-4 flex flex-col items-start">
            <span className="text-white text-sm font-medium">Ventas de hoy</span>
            <span className="text-xl sm:text-2xl font-bold text-white mt-1">$574.34</span>
          </div>
          
          {/* Gastos del mes */}
          <div className="bg-blue-500 rounded-xl shadow p-4 flex flex-col items-start">
            <span className="text-white text-sm font-medium">Clientes activos en la plataforma</span>
            <span className="text-xl sm:text-2xl font-bold text-white mt-1">$1,000</span>
          </div>
          
          {/* Total Proyectos */}
          <div className="bg-blue-500 rounded-xl shadow p-4 flex flex-col items-start">
            <span className="text-white text-sm font-medium">Total de clientes</span>
            <span className="text-xl sm:text-2xl font-bold text-white mt-1">2935</span>
          </div>
        </div>

        {/* Espacio para contenido adicional */}
        <div className="bg-white rounded-lg shadow p-4 lg:p-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900">
            Actividad Reciente
          </h2>
          <p className="text-gray-600">
            Aqui puedes ver las ultimas ventas, clientes activos, y más.
          </p>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;

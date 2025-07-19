import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';

// Datos de ejemplo - Reemplazar con datos reales de tu API
const dummyOrdersData = [
  { day: 'Lun', orders: 12 },
  { day: 'Mar', orders: 19 },
  { day: 'Mié', orders: 15 },
  { day: 'Jue', orders: 22 },
  { day: 'Vie', orders: 30 },
  { day: 'Sáb', orders: 28 },
  { day: 'Dom', orders: 25 },
];

const dummySalesData = [
  { day: 'Lun', sales: 420.50 },
  { day: 'Mar', sales: 580.25 },
  { day: 'Mié', sales: 350.75 },
  { day: 'Jue', sales: 690.30 },
  { day: 'Vie', sales: 820.45 },
  { day: 'Sáb', sales: 950.20 },
  { day: 'Dom', sales: 750.60 },
];

interface OrderData {
  day: string;
  orders: number;
}

interface SalesData {
  day: string;
  sales: number;
}

const Statistics = () => {
  const [ordersData] = useState<OrderData[]>(dummyOrdersData);
  const [salesData] = useState<SalesData[]>(dummySalesData);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Aquí puedes hacer la llamada a tu API para obtener los datos reales
    const fetchData = async () => {
      setLoading(true);
      try {
        // Ejemplo de llamada a API (comentado hasta tener el endpoint real)
        // const response = await fetch('tu-endpoint-api/pedidos');
        // const data = await response.json();
        // Procesar datos y actualizar el estado
        // setOrdersData(data.orders);
        // setSalesData(data.sales);
        
        // Por ahora usamos los datos de ejemplo
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar datos de estadísticas:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Cargando estadísticas...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* Gráfico de Cantidad de Pedidos */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Cantidad de Pedidos (Últimos 7 días)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={ordersData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="orders" name="Pedidos" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico de Ventas Totales */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Ventas Totales (Últimos 7 días)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={salesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip formatter={(value) => [`$${value}`, 'Ventas']} />
            <Legend />
            <Area type="monotone" dataKey="sales" name="Ventas ($)" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Statistics;
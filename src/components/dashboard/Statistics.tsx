import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import apiService from '../services/api';
import { API_CONFIG } from '../../config/api';

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

interface Order {
  orderId: number;
  rut: string;
  orderDate: string;
  totalAmount: string;
  status: string;
  shippingAddress: string;
  userId: number;
  customer: {
    rut: string;
    name: string;
    email: string | null;
  };
  orderDetails: Array<{
    orderDetailId: number;
    orderId: number;
    productId: number;
    quantity: number;
    unitPrice: string;
    subtotal: string;
    product: {
      productId: number;
      name: string;
      imageUrl: string;
      price: string;
    };
  }>;
}

const Statistics = () => {
  const [ordersData, setOrdersData] = useState<OrderData[]>(dummyOrdersData);
  const [salesData, setSalesData] = useState<SalesData[]>(dummySalesData);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Función para obtener los datos reales de la API
    const fetchData = async () => {
      setLoading(true);
      try {
        // Obtener los pedidos desde la API
        const response = await apiService.get<{orders: Order[]}>(API_CONFIG.ENDPOINTS.ORDERS.GET_ALL);
        const orders = response.orders || [];
        
        // Procesar los datos para los últimos 7 días
        const last7Days = getLastSevenDays();
        const processedOrdersData = processOrdersData(orders, last7Days);
        const processedSalesData = processSalesData(orders, last7Days);
        
        setOrdersData(processedOrdersData);
        setSalesData(processedSalesData);
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar datos de estadísticas:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Función para obtener los últimos 7 días
  const getLastSevenDays = () => {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const result = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayName = days[date.getDay()];
      result.push({
        date: date,
        dayName: dayName,
        formattedDate: date.toISOString().split('T')[0] // formato YYYY-MM-DD
      });
    }
    
    return result;
  };

  // Función para procesar los datos de cantidad de pedidos
  const processOrdersData = (orders: Order[], days: any[]): OrderData[] => {
    return days.map(day => {
      // Filtrar pedidos para este día
      const dayOrders = orders.filter(order => {
        const orderDate = new Date(order.orderDate).toISOString().split('T')[0];
        return orderDate === day.formattedDate;
      });
      
      return {
        day: day.dayName,
        orders: dayOrders.length
      };
    });
  };

  // Función para procesar los datos de ventas totales
  const processSalesData = (orders: Order[], days: any[]): SalesData[] => {
    return days.map(day => {
      // Filtrar pedidos para este día
      const dayOrders = orders.filter(order => {
        const orderDate = new Date(order.orderDate).toISOString().split('T')[0];
        return orderDate === day.formattedDate;
      });
      
      // Sumar los montos totales
      const totalSales = dayOrders.reduce((sum, order) => {
        return sum + parseFloat(order.totalAmount);
      }, 0);
      
      return {
        day: day.dayName,
        sales: parseFloat(totalSales.toFixed(2))
      };
    });
  };

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
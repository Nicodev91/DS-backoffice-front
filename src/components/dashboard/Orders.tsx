import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import apiService from "../services/api";
import { API_CONFIG } from "../../config/api";

interface Customer {
  rut: string;
  name: string;
  email: string | null;
}

interface Product {
  productId: number;
  name: string;
  imageUrl: string;
  price: string;
}

interface OrderDetail {
  orderDetailId: number;
  orderId: number;
  productId: number;
  quantity: number;
  unitPrice: string;
  subtotal: string;
  product: Product;
}

interface Order {
  orderId: number;
  rut: string;
  orderDate: string;
  totalAmount: string;
  status: string;
  shippingAddress: string;
  userId: number;
  customer: Customer;
  orderDetails: OrderDetail[];
}

function Orders() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showUpdateModal, setShowUpdateModal] = useState<boolean>(false);
  const [updatingStatus, setUpdatingStatus] = useState<boolean>(false);
  const [newStatus, setNewStatus] = useState<string>('');
  
  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Usar apiService para aprovechar el token de autenticación
      const data = await apiService.get(API_CONFIG.ENDPOINTS.ORDERS.GET_ALL);
      setOrders(data.orders || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      // Verificar si es un error de autorización
      if (err instanceof Error && err.message.includes('401')) {
        setError('No estás autorizado para acceder a esta información. Verifica tu sesión.');
      } else {
        setError(err instanceof Error ? err.message : 'Error desconocido al cargar pedidos');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);
  
  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) return;
    
    try {
      setUpdatingStatus(true);
      
      // Usar apiService para actualizar el estado del pedido
      await apiService.put(API_CONFIG.ENDPOINTS.ORDERS.UPDATE_STATUS(selectedOrder.orderId), {
        status: newStatus.toLowerCase()
      });
      
      // Actualizar localmente después de la actualización exitosa
      const updatedOrders = orders.map(order => 
        order.orderId === selectedOrder.orderId 
          ? { ...order, status: newStatus.toLowerCase() } 
          : order
      );
      
      setOrders(updatedOrders);
      setShowUpdateModal(false);
      setSelectedOrder(null);
      
      // Mostrar mensaje de éxito
      alert(`Estado del pedido #${selectedOrder.orderId} actualizado a ${newStatus}`);
      
    } catch (err) {
      console.error('Error updating order status:', err);
      
      // Verificar si es un error de autorización
      if (err instanceof Error && err.message.includes('401')) {
        alert('No estás autorizado para actualizar el estado del pedido. Verifica tu sesión.');
      } else {
        alert('Error al actualizar el estado del pedido');
      }
    } finally {
      setUpdatingStatus(false);
    }
  };

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
          Gestión de Pedidos
        </h1>
        <p className="text-gray-600 mb-6 lg:mb-8">Lista de pedidos realizados</p>

        {/* Tabla de pedidos */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando pedidos...</p>
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-500">
              <p>{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Reintentar
              </button>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <p>No hay pedidos disponibles</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dirección
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => {
                    // Formatear la fecha
                    const orderDate = new Date(order.orderDate);
                    const formattedDate = orderDate.toLocaleDateString('es-CL', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    });
                    
                    return (
                      <tr key={order.orderId}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{order.orderId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.customer.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formattedDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${parseInt(order.totalAmount).toLocaleString('es-CL')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            order.status === 'entregado' ? 'bg-green-100 text-green-800' :
                            order.status === 'en proceso' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.shippingAddress}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                           <button 
                             onClick={() => {
                               setSelectedOrder(order);
                               setShowModal(true);
                             }} 
                             className="text-indigo-600 hover:text-indigo-900 mr-3"
                           >
                             Ver detalles
                           </button>
                           <button 
                              onClick={() => {
                                setSelectedOrder(order);
                                setNewStatus(order.status.charAt(0).toUpperCase() + order.status.slice(1));
                                setShowUpdateModal(true);
                              }}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Actualizar
                            </button>
                         </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modal de detalles del pedido */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Detalles del Pedido #{selectedOrder.orderId}</h2>
                <button 
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Información del Cliente</h3>
                  <p><span className="font-medium">Nombre:</span> {selectedOrder.customer.name}</p>
                  <p><span className="font-medium">RUT:</span> {selectedOrder.customer.rut}</p>
                  <p><span className="font-medium">Email:</span> {selectedOrder.customer.email || 'No disponible'}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Información del Pedido</h3>
                  <p>
                    <span className="font-medium">Fecha:</span> {
                      new Date(selectedOrder.orderDate).toLocaleDateString('es-CL', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    }
                  </p>
                  <p><span className="font-medium">Estado:</span> 
                    <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      selectedOrder.status === 'entregado' ? 'bg-green-100 text-green-800' :
                      selectedOrder.status === 'en proceso' ? 'bg-blue-100 text-blue-800' :
                      selectedOrder.status === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                    </span>
                  </p>
                  <p><span className="font-medium">Dirección de envío:</span> {selectedOrder.shippingAddress}</p>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold mb-4">Productos</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Unitario</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedOrder.orderDetails.map((detail) => (
                      <tr key={detail.orderDetailId}>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img 
                                className="h-10 w-10 rounded-full object-cover" 
                                src={detail.product.imageUrl.trim()} 
                                alt={detail.product.name}
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = 'https://via.placeholder.com/40?text=N/A';
                                }}
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{detail.product.name}</div>
                              <div className="text-sm text-gray-500">ID: {detail.product.productId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${parseInt(detail.unitPrice).toLocaleString('es-CL')}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {detail.quantity}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${parseInt(detail.subtotal).toLocaleString('es-CL')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50">
                      <td colSpan={3} className="px-4 py-3 text-right text-sm font-medium text-gray-900">Total:</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-900">
                        ${parseInt(selectedOrder.totalAmount).toLocaleString('es-CL')}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para actualizar estado */}
      {showUpdateModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Actualizar Estado del Pedido #{selectedOrder.orderId}</h2>
                <button 
                  onClick={() => setShowUpdateModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                  disabled={updatingStatus}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-6">
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Estado del pedido
                </label>
                <select
                  id="status"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  disabled={updatingStatus}
                >
                  <option value="">Seleccionar estado</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="En proceso">En proceso</option>
                  <option value="Entregado">Entregado</option>
                  <option value="Cancelado">Cancelado</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowUpdateModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
                  disabled={updatingStatus}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpdateStatus}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={updatingStatus || !newStatus}
                >
                  {updatingStatus ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Actualizando...
                    </>
                  ) : 'Actualizar Estado'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Orders;
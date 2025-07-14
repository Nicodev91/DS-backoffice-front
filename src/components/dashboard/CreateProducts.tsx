import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import apiService from "../services/api";
import { API_CONFIG } from "../../config/api";

interface ProductFormData {
  nombre: string;
  precio: string;
  categoria: string;
  // Se eliminó categoriaId ya que no se necesita
  stock: string;
  descripcion: string;
  imagen: string;
}

interface ProductApiData {
  name: string;
  rutSupplier: string;
  price: number;
  stock: number;
  description: string;
  categoryId: number; // ID de categoría como número entero
  imageUrl: string;
  status: boolean;
}

function CreateProducts() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    nombre: "",
    precio: "",
    categoria: "bebidas", // Establecer un valor por defecto válido
    stock: "",
    descripcion: "",
    imagen: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState({ text: "", type: "" });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Validación para evitar valores negativos en campos numéricos
    if ((name === 'precio' || name === 'stock') && value !== '') {
      const numValue = parseFloat(value);
      if (numValue < 0) {
        // Si es negativo, establecer a 0 o mantener el valor anterior
        setFormData(prev => ({
          ...prev,
          [name]: '0'
        }));
        return;
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormMessage({ text: "Creando producto...", type: "info" });

    try {
      // Mapear los datos del formulario al formato esperado por la API
      // Asignar IDs numéricos a cada categoría
      const categoryIdMap: Record<string, number> = {
        bebidas: 1,
        limpieza: 2,
        alimentos: 3,
        hogar: 4,
        electronica: 5
      };

      // Obtener el ID de categoría del mapeo
      const categoryId = categoryIdMap[formData.categoria.toLowerCase()] || 1; // Valor por defecto 1 si no se encuentra
      
      const productData: ProductApiData = {
        name: formData.nombre,
        rutSupplier: "12345678-9", // RUT de proveedor por defecto
        price: parseFloat(formData.precio),
        stock: parseInt(formData.stock),
        description: formData.descripcion,
        categoryId: categoryId, // Incluir el ID de categoría como número
        imageUrl: formData.imagen,
        status: true
      };
      
      console.log("Categoría seleccionada:", formData.categoria);
      console.log("ID de categoría:", categoryId);
      
      console.log("Datos del producto a crear:", productData);
      
      // Usar el servicio de API para hacer la petición
      try {
        const data = await apiService.post(API_CONFIG.ENDPOINTS.PRODUCTS.CREATE, productData);
        console.log("Respuesta exitosa del servidor:", data);
      } catch (error) {
        console.error("Error detallado:", error);
        // Re-lanzar el error para que sea manejado por el catch exterior
        throw error;
      }
      
      setFormMessage({ 
        text: "Producto creado exitosamente", 
        type: "success" 
      });
      
      // Resetear el formulario
      setFormData({
        nombre: "",
        precio: "",
        categoria: "bebidas", // Valor por defecto para evitar categoría vacía
        stock: "",
        descripcion: "",
        imagen: ""
      });
    } catch (error) {
      console.error("Error al crear producto:", error);
      
      // Verificar si es un error de autorización
      if (error instanceof Error && error.message.includes('401')) {
        setFormMessage({ 
          text: "No está autorizado para crear productos. Por favor, inicie sesión nuevamente.", 
          type: "error" 
        });
        // Opcional: redirigir al login después de un tiempo
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setFormMessage({ 
          text: error instanceof Error ? error.message : "Error al crear el producto. Intente nuevamente.", 
          type: "error" 
        });
      }
    } finally {
      setIsSubmitting(false);
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
              <Link to="/crear-productos" className="block py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors bg-slate-700">
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
      <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-4xl mx-auto">
          {/* Formulario para crear productos */}
          <div className="form-container" style={{
              maxWidth: '90%',
              width: '100%',
              margin: '20px auto',
              padding: '50px',
              background: '#f4f7f8',
              borderRadius: '12px',
              fontFamily: 'Nunito, sans-serif',
              color: '#384047',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
            <style>
               {`
                 @media (max-width: 768px) {
                   .form-container {
  margin: 30px auto;

                     padding: 15px !important;
                     margin: 10px auto !important;
                   }
                   .form-title {
                     fontSize: '1.4rem' !important;
                   }
                   .form-input {
  height: 32px;
  border-radius: 12px;
  font-size: 1em;
  padding: 4px 10px;

                     padding: 12px !important;
                   }
                 }
               `}
             </style>
             <h1 className="form-title" style={{
               margin: '0 0 30px 0',
               textAlign: 'center',
               fontSize: '1.8rem',
               fontWeight: 'bold'
             }}>
               Crear nuevo producto
             </h1>
            
            {formMessage.text && (
              <div className={`p-3 mb-4 rounded-md ${
                formMessage.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}>
                {formMessage.text}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
              <fieldset style={{ marginBottom: '30px', border: 'none', flex: '1 1 300px', minWidth: '300px' }}>
    
                
                <label htmlFor="nombre" style={{ display: 'block', marginBottom: '8px' }}>
                  Nombre del Producto:
                </label>
                <input
                   type="text"
                   id="nombre"
                   name="nombre"
                   value={formData.nombre}
                   onChange={handleInputChange}
                   required
                   className="form-input"
                   style={{
                     background: 'rgba(255,255,255,0.1)',
                     border: 'none',
                     fontSize: '16px',
                     height: 'auto',
                     margin: '0',
                     outline: '0',
                     padding: '15px',
                     width: '100%',
                     backgroundColor: '#e8eeef',
                     color: '#8a97a0',
                     boxShadow: '0 1px 0 rgba(0,0,0,0.03) inset',
                     marginBottom: '30px',
                     borderRadius: '12px'
                   }}
                 />
                
                <label htmlFor="precio" style={{ display: 'block', marginBottom: '8px' }}>
                  Precio:
                </label>
                <input
                   type="number"
                   id="precio"
                   name="precio"
                   value={formData.precio}
                   onChange={handleInputChange}
                   required
                   min="0"
                   step="0.01"
                   className="form-input"
                   style={{
                     background: 'rgba(255,255,255,0.1)',
                     border: 'none',
                     fontSize: '16px',
                     height: 'auto',
                     margin: '0',
                     outline: '0',
                     padding: '15px',
                     width: '100%',
                     backgroundColor: '#e8eeef',
                     color: '#8a97a0',
                     boxShadow: '0 1px 0 rgba(0,0,0,0.03) inset',
                     marginBottom: '30px',
                     borderRadius: '12px'
                   }}
                 />
                
                <label htmlFor="categoria" style={{ display: 'block', marginBottom: '8px' }}>
                  Categoría:
                </label>
                <select
                   id="categoria"
                   name="categoria"
                   value={formData.categoria}
                   onChange={handleInputChange}
                   required
                   className="form-input"
                   style={{
                     background: 'rgba(255,255,255,0.1)',
                     border: 'none',
                     fontSize: '16px',
                     height: 'auto',
                     margin: '0',
                     outline: '0',
                     padding: '15px',
                     width: '100%',
                     backgroundColor: '#e8eeef',
                     color: '#8a97a0',
                     boxShadow: '0 1px 0 rgba(0,0,0,0.03) inset',
                     marginBottom: '15px',
                     borderRadius: '12px'
                   }}
                 >
                  <option value="bebidas">Bebidas</option>
                  <option value="limpieza">Limpieza</option>
                  <option value="alimentos">Alimentos</option>
                  <option value="hogar">Hogar</option>
                  <option value="electronica">Electrónica</option>
                </select>
                
                {/* Se eliminó el campo categoriaId ya que no se necesita */}
              </fieldset>
              
              <fieldset style={{ marginBottom: '30px', border: 'none', flex: '1 1 300px', minWidth: '300px' }}>
      
                
                <label htmlFor="stock" style={{ display: 'block', marginBottom: '8px' }}>
                  Stock:
                </label>
                <input
                   type="number"
                   id="stock"
                   name="stock"
                   value={formData.stock}
                   onChange={handleInputChange}
                   required
                   min="0"
                   className="form-input"
                   style={{
                     background: 'rgba(255,255,255,0.1)',
                     border: 'none',
                     fontSize: '16px',
                     height: 'auto',
                     margin: '0',
                     outline: '0',
                     padding: '15px',
                     width: '100%',
                     backgroundColor: '#e8eeef',
                     color: '#8a97a0',
                     boxShadow: '0 1px 0 rgba(0,0,0,0.03) inset',
                     marginBottom: '30px',
                     borderRadius: '12px'
                   }}
                 />
                
                <label htmlFor="imagen" style={{ display: 'block', marginBottom: '8px' }}>
                  URL de la imagen:
                </label>
                <input
                   type="url"
                   id="imagen"
                   name="imagen"
                   value={formData.imagen}
                   onChange={handleInputChange}
                   placeholder="https://ejemplo.com/imagen.jpg"
                   className="form-input"
                   style={{
                     background: 'rgba(255,255,255,0.1)',
                     border: 'none',
                     fontSize: '16px',
                     height: 'auto',
                     margin: '0',
                     outline: '0',
                     padding: '15px',
                     width: '100%',
                     backgroundColor: '#e8eeef',
                     color: '#8a97a0',
                     boxShadow: '0 1px 0 rgba(0,0,0,0.03) inset',
                     marginBottom: '30px',
                     borderRadius: '12px'
                   }}
                 />
              </fieldset>
              </div>
              
              <fieldset style={{ marginBottom: '30px', border: 'none', flex: '1 1 100%', width: '100%' }}>
    
                <label htmlFor="descripcion" style={{ display: 'block', marginBottom: '8px' }}>
                  Descripción del producto:
                </label>
                <textarea
                   id="descripcion"
                   name="descripcion"
                   value={formData.descripcion}
                   onChange={handleInputChange}
                   rows={4}
                   className="form-input"
                   style={{
                     background: 'rgba(255,255,255,0.1)',
                     border: 'none',
                     fontSize: '16px',
                     height: 'auto',
                     margin: '0',
                     outline: '0',
                     padding: '15px',
                     width: '100%',
                     backgroundColor: '#e8eeef',
                     color: '#8a97a0',
                     boxShadow: '0 1px 0 rgba(0,0,0,0.03) inset',
                     marginBottom: '30px',
                     borderRadius: '12px',
                     resize: 'vertical'
                   }}
                 />
              </fieldset>
              
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  padding: '19px 39px 18px 39px',
                  color: '#FFF',
                  backgroundColor: '#4bc970',
                  fontSize: '18px',
                  textAlign: 'center',
                  fontStyle: 'normal',
                  borderRadius: '5px',
                  width: '100%',
                  border: '1px solid #3ac162',
                  borderWidth: '1px 1px 3px',
                  boxShadow: '0 -1px 0 rgba(255,255,255,0.1) inset',
                  marginBottom: '10px',
                  opacity: isSubmitting ? 0.5 : 1,
                  cursor: isSubmitting ? 'not-allowed' : 'pointer'
                }}
              >
                {isSubmitting ? "Creando..." : "Crear Producto"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default CreateProducts;
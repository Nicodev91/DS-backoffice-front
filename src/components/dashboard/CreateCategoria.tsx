import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import apiService from "../services/api";
import { API_CONFIG } from "../../config/api";

interface CategoriaFormData {
  nombre: string;
  descripcion: string;
}

interface CategoriaApiData {
  name: string;
  description: string;
}

function CreateCategoria() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [formData, setFormData] = useState<CategoriaFormData>({
    nombre: "",
    descripcion: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState({ text: "", type: "" });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormMessage({ text: "Creando categoría...", type: "info" });

    try {
      // Mapear los datos del formulario al formato esperado por la API
      const categoriaData: CategoriaApiData = {
        name: formData.nombre,
        description: formData.descripcion,
      };
      
      console.log("Datos de la categoría a crear:", categoriaData);
      
      // Usar el servicio de API para hacer la petición
      const data = await apiService.post(API_CONFIG.ENDPOINTS.CATEGORIES.CREATE, categoriaData);
      console.log("Respuesta exitosa del servidor:", data);
      
      setFormMessage({ 
        text: "Categoría creada exitosamente", 
        type: "success" 
      });
      
      // Resetear el formulario
      setFormData({
        nombre: "",
        descripcion: "",
      });
    } catch (error) {
      console.error("Error al crear categoría:", error);
      
      // Verificar si es un error de autorización
      if (error instanceof Error && error.message.includes('401')) {
        setFormMessage({ 
          text: "No está autorizado para crear categorías. Por favor, inicie sesión nuevamente.", 
          type: "error" 
        });
        // Opcional: redirigir al login después de un tiempo
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } else {
        setFormMessage({ 
          text: error instanceof Error ? error.message : "Error al crear la categoría. Intente nuevamente.", 
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
              <Link to="/crear-productos" className="block py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors">
                Crear producto
              </Link>
            </li>
            <li>
              <Link to="/crear-categoria" className="block py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors bg-slate-700">
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
          {/* Formulario para crear categorías */}
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
                     padding: 15px !important;
                     margin: 10px auto !important;
                   }
                   .form-title {
                     font-size: 1.4rem !important;
                   }
                   .form-input {
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
               Crear nueva categoría
             </h1>
            
            {formMessage.text && (
              <div className={`p-3 mb-4 rounded-md ${
                formMessage.type === "success" ? "bg-green-100 text-green-700" : 
                formMessage.type === "error" ? "bg-red-100 text-red-700" : 
                "bg-blue-100 text-blue-700"
              }`}>
                {formMessage.text}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                <fieldset style={{ marginBottom: '30px', border: 'none', flex: '1 1 300px', minWidth: '300px' }}>
                  <label htmlFor="nombre" style={{ display: 'block', marginBottom: '8px' }}>
                    Nombre de la categoría:
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
                </fieldset>
              </div>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                <fieldset style={{ marginBottom: '30px', border: 'none', flex: '1 1 300px', minWidth: '300px' }}>
                  <label htmlFor="descripcion" style={{ display: 'block', marginBottom: '8px' }}>
                    Descripción:
                  </label>
                  <textarea
                    id="descripcion"
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    required
                    className="form-textarea"
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      border: 'none',
                      fontSize: '16px',
                      height: '120px',
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
              </div>
              
              <div style={{ textAlign: 'center' }}>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    backgroundColor: isSubmitting ? '#a0aec0' : '#384047',
                    color: 'white',
                    padding: '12px 39px',
                    borderRadius: '12px',
                    border: 'none',
                    fontSize: '18px',
                    fontWeight: '600',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    marginTop: '10px',
                    opacity: isSubmitting ? 0.7 : 1
                  }}
                  className="hover:bg-opacity-90"
                >
                  {isSubmitting ? 'Creando...' : 'Crear Categoría'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default CreateCategoria;
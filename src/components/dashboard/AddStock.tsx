import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import apiService from "../services/api";

interface Category {
  categoryId: number;
  name: string;
  description: string;
}

interface Product {
  productId: number;
  name: string;
  rutSupplier: string;
  price: string;
  stock: number;
  description: string;
  categoryId: number;
  imageUrl: string;
  status: boolean;
  supplier: {
    rut: string;
    name: string;
    address: string;
  };
  category: {
    categoryId: number;
    name: string;
    description: string;
  };
}

interface StockFormData {
  productoId: string; // Se mantiene como string para el formulario, pero se convierte a número al enviar
  cantidad: string;   // Se mantiene como string para el formulario, pero se convierte a número al enviar
  operacion: "agregar" | "restar";
  categoriaId: string; // Se mantiene como string para el formulario, pero se convierte a número al enviar
}

function AddStock() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [formData, setFormData] = useState<StockFormData>({
    productoId: "",
    cantidad: "",
    operacion: "agregar",
    categoriaId: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState({ text: "", type: "" });
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [categoryError, setCategoryError] = useState("");
  
  // Estados para productos
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [productError, setProductError] = useState("");
  
  // Cargar categorías al montar el componente
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      setCategoryError("");
      try {
        const response = await apiService.get("/categories");
        
        // Verificar que la respuesta sea un array
        if (Array.isArray(response)) {
          console.log("Categorías cargadas:", response);
          setCategories(response);
        } else {
          console.error("La respuesta de categorías no es un array:", response);
          setCategoryError("Formato de respuesta incorrecto");
          setCategories([]);
        }
      } catch (error) {
        console.error("Error al cargar categorías:", error);
        setCategoryError("No se pudieron cargar las categorías. Verifica tu conexión.");
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Cargar productos según la categoría seleccionada
  useEffect(() => {
    if (!formData.categoriaId) {
      setProducts([]);
      return;
    }
    
    const fetchProductsByCategory = async () => {
      setIsLoadingProducts(true);
      setProductError("");
      setFormData(prev => ({ ...prev, productoId: "" })); // Resetear selección de producto
      
      try {
        // Asegurarse de que el ID de categoría sea un número
        const categoryId = parseInt(formData.categoriaId, 10);
        if (isNaN(categoryId)) {
          throw new Error("El ID de categoría debe ser un número válido");
        }
        const response = await apiService.get(`/products/category/${categoryId}`);
        
        // Verificar que la respuesta sea un array
        if (Array.isArray(response)) {
          setProducts(response);
          console.log("Productos cargados:", response);
        } else {
          console.error("La respuesta no es un array:", response);
          setProductError("Formato de respuesta incorrecto");
          setProducts([]);
        }
      } catch (error) {
        console.error("Error al cargar productos:", error);
        setProductError("No se pudieron cargar los productos. Verifica tu conexión.");
        setProducts([]);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchProductsByCategory();
  }, [formData.categoriaId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Validación especial para el campo cantidad
    if (name === 'cantidad' && value !== '') {
      const numValue = parseFloat(value);
      
      // Si es negativo, establecer a 0
      if (numValue < 0) {
        setFormData(prev => ({
          ...prev,
          [name]: '0'
        }));
        return;
      }
    }
    
    // Para campos de ID, asegurarse de que sean valores numéricos válidos
    if ((name === 'productoId' || name === 'categoriaId') && value !== '') {
      // Verificar que sea un número válido
      const numValue = parseInt(value, 10);
      if (isNaN(numValue)) {
        console.warn(`Valor no numérico para ${name}:`, value);
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar que se haya seleccionado una categoría y un producto
    if (!formData.categoriaId) {
      setFormMessage({ text: "Debes seleccionar una categoría", type: "error" });
      return;
    }
    
    if (!formData.productoId) {
      setFormMessage({ text: "Debes seleccionar un producto", type: "error" });
      return;
    }
    
    // Verificar que los IDs sean valores numéricos válidos
    const productoIdNum = parseInt(formData.productoId, 10);
    const categoriaIdNum = parseInt(formData.categoriaId, 10);
    
    if (isNaN(productoIdNum) || isNaN(categoriaIdNum)) {
      setFormMessage({ text: "Los IDs de producto y categoría deben ser números válidos", type: "error" });
      return;
    }
    
    setIsSubmitting(true);
    setFormMessage({ text: "", type: "" });

    try {
      // Convertir cantidad a número (los IDs ya son números)
      const productoId = parseInt(formData.productoId, 10);
      const cantidad = parseInt(formData.cantidad, 10);
      const categoriaId = parseInt(formData.categoriaId, 10);
      
      // Validar que sean números válidos
      if (isNaN(productoId) || isNaN(cantidad) || isNaN(categoriaId)) {
        throw new Error("Los IDs y la cantidad deben ser números válidos");
      }
      
      // La validación de stock negativo se realiza después de obtener el producto actual
      
      // Preparar datos para enviar al backend
      const stockData = {
        productoId: productoId,  // Asegurarse de que se envíe como número
        cantidad: cantidad,      // Asegurarse de que se envíe como número
        categoriaId: categoriaId, // Asegurarse de que se envíe como número
        operacion: formData.operacion
      };
      
      console.log("Datos de actualización de stock:", stockData);
      
      // Llamada al API para actualizar el stock
      try {
        // Obtener el producto actual para conocer su stock
        const productoActual = await apiService.get(`/products/${productoId}`);
        console.log("Producto actual:", productoActual);
        
        // Calcular el nuevo stock según la operación
        let nuevoStock;
        if (formData.operacion === "agregar") {
          nuevoStock = cantidad;
        } else {
          // Validar que el stock no quede negativo
          if ((productoActual.stock || 0) < cantidad) {
            throw new Error("No hay suficiente stock para realizar esta operación");
          }
          nuevoStock = (productoActual.stock || 0) - cantidad;
        }
        
        // Actualizar el stock del producto usando el endpoint PATCH
        const response = await apiService.patch(`/products/${productoId}`, {
          stock: nuevoStock
        });
            console.log("Respuesta de actualización de stock:", response);
        
        // Mostrar mensaje de éxito con información del nuevo stock
        setFormMessage({ 
          text: `Stock ${formData.operacion === "agregar" ? "aumentado" : "reducido"} exitosamente. Nuevo stock: ${response.stock}`, 
          type: "success" 
        });
        setIsSubmitting(false);
        // Guardar la categoría actual antes de resetear el formulario
        const currentCategoryId = formData.categoriaId;
        
        // Resetear el formulario pero mantener la categoría seleccionada
        setFormData({
          productoId: "",
          cantidad: "",
          operacion: "agregar",
          categoriaId: currentCategoryId // Mantener la categoría seleccionada
        });
        
        // No limpiamos los productos para mantener el combo actualizado
        // Los productos se actualizarán automáticamente por el useEffect que depende de categoriaId
      } catch (error) {
        console.error("Error al actualizar stock:", error);
        let errorMessage = "Error al actualizar el stock. Intente nuevamente.";
        
        // Intentar extraer mensaje de error más específico
        if (error instanceof Error) {
          errorMessage = error.message;
        }
        
        setFormMessage({ text: errorMessage, type: "error" });
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Error general:", error);
      let errorMessage = "Error al procesar la solicitud. Intente nuevamente.";
      
      // Intentar extraer mensaje de error más específico
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setFormMessage({ text: errorMessage, type: "error" });
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
              <Link to="/crear-categoria" className="block py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors">
                Crear categoría
              </Link>
            </li>
            <li>
              <Link to="/gestionar-stock" className="block py-2 px-4 rounded-lg bg-slate-700 transition-colors">
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
          {/* Formulario para gestionar stock */}
          <div style={{
             maxWidth: '600px',
             margin: '20px auto',
             padding: '40px',
             background: '#f4f7f8',
             borderRadius: '12px',
             fontFamily: 'Nunito, sans-serif',
             color: '#384047',
             boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
           }}>
            <h1 style={{
              margin: '0 0 30px 0',
              textAlign: 'center',
              fontSize: '1.8rem',
              fontWeight: 'bold'
            }}>
              Gestionar stock de productos
            </h1>
            
            {formMessage.text && (
              <div className={`p-3 mb-4 rounded-md ${
                formMessage.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}>
                {formMessage.text}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <fieldset style={{ marginBottom: '30px', border: 'none' }}>
                <legend style={{ fontSize: '1.4em', marginBottom: '10px' }}>
                  <span style={{
                    backgroundColor: '#5fcf80',
                    color: '#fff',
                    height: '30px',
                    width: '30px',
                    display: 'inline-block',
                    fontSize: '0.8em',
                    marginRight: '4px',
                    lineHeight: '30px',
                    textAlign: 'center',
                    textShadow: '0 1px 0 rgba(255,255,255,0.2)',
                    borderRadius: '100%'
                  }}>1</span>
                  Selección de Categoría y Producto
                </legend>
                
                {/* Dropdown para categorías - PRIMER CAMPO */}
                <label htmlFor="categoriaId" style={{ display: 'block', marginBottom: '8px' }}>
                  Seleccionar Categoría:
                </label>
                <select
                  id="categoriaId"
                  name="categoriaId"
                  value={formData.categoriaId}
                  onChange={handleInputChange}
                  required
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
                  disabled={isLoadingCategories}
                >
                  <option value="">Seleccionar categoría</option>
                  {categories.map(category => (
                    <option key={category.categoryId} value={category.categoryId}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {categoryError && (
                  <div className="text-red-500 mb-4 text-sm">{categoryError}</div>
                )}
                {isLoadingCategories && (
                  <div className="text-blue-500 mb-4 text-sm">Cargando categorías...</div>
                )}
                
                {/* Dropdown para productos - SOLO SE MUESTRA SI HAY CATEGORÍA SELECCIONADA */}
                {formData.categoriaId && (
                  <>
                    <label htmlFor="productoId" style={{ display: 'block', marginBottom: '8px' }}>
                      Seleccionar Producto:
                    </label>
                    <select
                      id="productoId"
                      name="productoId"
                      value={formData.productoId}
                      onChange={handleInputChange}
                      required
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
                      disabled={isLoadingProducts}
                    >
                      <option value="">Seleccionar producto</option>
                      {products.map(product => (
                        <option key={product.productId} value={product.productId}>
                          {product.name} - Stock actual: {product.stock}
                        </option>
                      ))}
                    </select>
                    {productError && (
                      <div className="text-red-500 mb-4 text-sm">{productError}</div>
                    )}
                    {isLoadingProducts && (
                      <div className="text-blue-500 mb-4 text-sm">Cargando productos...</div>
                    )}
                    {!isLoadingProducts && products.length === 0 && !productError && (
                      <div className="text-amber-500 mb-4 text-sm">No hay productos disponibles para esta categoría</div>
                    )}
                  </>
                )}
              </fieldset>
              
              <fieldset style={{ marginBottom: '30px', border: 'none' }}>
                <legend style={{ fontSize: '1.4em', marginBottom: '10px' }}>
                  <span style={{
                    backgroundColor: '#5fcf80',
                    color: '#fff',
                    height: '30px',
                    width: '30px',
                    display: 'inline-block',
                    fontSize: '0.8em',
                    marginRight: '4px',
                    lineHeight: '30px',
                    textAlign: 'center',
                    textShadow: '0 1px 0 rgba(255,255,255,0.2)',
                    borderRadius: '100%'
                  }}>2</span>
                  Operación de Stock
                </legend>
                
                <label htmlFor="operacion" style={{ display: 'block', marginBottom: '8px' }}>
                  Tipo de Operación:
                </label>
                <select
                  id="operacion"
                  name="operacion"
                  value={formData.operacion}
                  onChange={handleInputChange}
                  required
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
                >
                  <option value="agregar">Agregar unidades</option>
                  <option value="restar">Restar unidades</option>
                </select>
                
                <label htmlFor="cantidad" style={{ display: 'block', marginBottom: '8px' }}>
                  Cantidad:
                </label>
                <input
                  type="number"
                  id="cantidad"
                  name="cantidad"
                  value={formData.cantidad}
                  onChange={handleInputChange}
                  required
                  min="0"
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
              
              <button
                type="submit"
                disabled={isSubmitting || !formData.categoriaId || !formData.productoId}
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
                  opacity: (isSubmitting || !formData.categoriaId || !formData.productoId) ? 0.5 : 1,
                  cursor: (isSubmitting || !formData.categoriaId || !formData.productoId) ? 'not-allowed' : 'pointer'
                }}
              >
                {isSubmitting ? "Procesando..." : "Actualizar Stock"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AddStock;
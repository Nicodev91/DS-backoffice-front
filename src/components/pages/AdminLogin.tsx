import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ButtonComponent from "../ui/button/Button";
import InputComponent from "../ui/input/Input";
import FormComponent from "../ui/form/form/Form";
import Toast from "../ui/toast/Toast";
import Utils from "../utils/Utils";
import { useAuth } from "../contexts/AuthContext";
import authService from "../auth-service/AuthLogin";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<'success' | 'error'>('success'); 
  const [isToastVisible, setIsToastVisible] = useState(false);  
  
  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState(""); 
  const [showPassword, setShowPassword] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(false); 

  const isLoginValid = Utils.validateLoginCredentials(email, password);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToastMessage(message);
    setToastType(type);
    setIsToastVisible(true);
  };

  const hideToast = () => {
    setIsToastVisible(false);
  };

  // En la función handleLogin, después del login exitoso:
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoginLoading(true);
  
    // Validación simple local
    if (!email || !password) {
      showToast("Por favor, ingresa tu correo y contraseña.", "error");
      setIsLoginLoading(false);
      return;
    }
  
    try {
      // Usar el servicio real de autenticación
      const response = await authService.login({ email, password });
      
      if (response.success && response.user) {
        // Login exitoso
        login(response.user);
        showToast(`Bienvenido ${response.user.name}`, "success");
        
        // Si el backend devolvió un usuario, significa que es válido
        // El backend ya validó que sea administrador
        navigate('/dashboard');
      } else {
        // Login fallido
        showToast(response.error || "Credenciales inválidas", "error");
      }
    } catch (error) {
      console.error('Error en login:', error);
      showToast("Error de conexión con el servidor", "error");
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={isToastVisible}
        onClose={hideToast}
        duration={5000}
      />
      
      <div className="h-screen w-screen flex overflow-hidden" style={{ margin: 0, padding: 0, maxWidth: 'none' }}>
        <div className="md:block w-1/2 h-full flex-shrink-0" style={{ margin: 0, padding: 0 }}>
          <img
            src="./MarketImage.jpg"
            alt="background-image"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="w-full md:w-1/2 flex items-center justify-center bg-white">
          <div className="w-full max-w-md px-8">
            
            <div className="text-center mb-8">
              <div className="inline-block mb-6">
                <span className="tracking-widest font-bold rounded-xl border-2 border-gray-300 px-6 py-2 text-sm">
                  Supermercado San Nicolás - Admin
                </span>
              </div>
              <h2 className="text-3xl font-bold mb-2">
                Acceso Administrativo
              </h2>
              <p className="text-gray-600 text-sm">
                Acceso exclusivo para administradores del sistema.
              </p>
            </div>
            
            <FormComponent onSubmit={handleLogin} className="w-full flex flex-col gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
                <InputComponent
                  type="email"
                  id="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="Ingrese su correo electrónico"
                  label=""
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                <InputComponent
                  type="password"
                  id="password"
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder="Ingrese su contraseña"
                  label=""
                  showPasswordToggle={true}
                  onPasswordToggle={togglePasswordVisibility}
                  showPassword={showPassword}
                  required
                />
              </div>

              <ButtonComponent 
                type="submit" 
                disabled={!isLoginValid || isLoginLoading}
                className={`${isLoginValid ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-500 hover:bg-gray-600'} text-white font-medium py-2 px-4 rounded mt-4`}
              >
                {isLoginLoading ? "Iniciando sesión..." : "Acceder como Admin"}
              </ButtonComponent>
              
              
            </FormComponent>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;

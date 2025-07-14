import apiService from "../services/api";
import { API_CONFIG } from "../../config/api";

export interface VerificationResponse {
  success: boolean;
  message?: string;
  error?: string;
  isValid?: boolean;
}

// Servicio para verificación de código OTP
class VerificationCodeService {
  async verifyOTP(email: string, code: string): Promise<VerificationResponse> {
    try {
      const response = await apiService.post(API_CONFIG.ENDPOINTS.OTP.VERIFY, { email, code });
      
      if (response.isValid) {
        return { 
          success: true, 
          message: 'Código verificado exitosamente',
          isValid: response.isValid
        };
      } else {
        return { 
          success: false, 
          error: response.message || 'Código inválido'
        };
      }
    } catch (error) {
      console.error('Error verificando OTP:', error);
      return { 
        success: false, 
        error: 'Error de conexión con el servidor'
      };
    }
  }

  // Función para validar formato del código (opcional)
  validateCodeFormat(code: string): boolean {
    return /^\d{4,6}$/.test(code);
  }
}

// Instancia singleton del servicio
const verificationService = new VerificationCodeService();

export default verificationService; 
import apiService from "../services/api";
import { API_CONFIG } from "../../config/api";

export interface ForgotPasswordResponse {
  success: boolean;
  message?: string;
  error?: string;
  email?: string;
  expiresIn?: number;
}

class ForgotPasswordService {
  async sendOTP(email: string): Promise<ForgotPasswordResponse> {
    try {
      const response = await apiService.post(API_CONFIG.ENDPOINTS.OTP.SEND, { email });
      
      if (response.success) {
        return { 
          success: true, 
          message: 'Código de verificación enviado exitosamente', 
          email: response.email || email,
          expiresIn: response.expiresIn || 300
        };
      } else {
        return { 
          success: false, 
          error: response.error || 'Error al enviar el código OTP'
        };
      }
    } catch (error) {
      console.error('Error enviando OTP:', error);
      return { 
        success: false, 
        error: 'Error de conexión con el servidor'
      };
    }
  }

  async verifyEmail(email: string): Promise<boolean> {
    try {
      const response = await this.sendOTP(email);
      return response.success;
    } catch (error) {
      console.error('Error verificando email:', error);
      return false;
    }
  }
}

// Instancia singleton del servicio
const forgotPasswordService = new ForgotPasswordService();

export default forgotPasswordService;
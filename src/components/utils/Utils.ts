function showToastUtil(
  setToastMessage: (msg: string) => void,
  setToastType: (type: 'success' | 'error') => void,
  setIsToastVisible: (visible: boolean) => void,
  message: string,
  type: 'success' | 'error'
) {
  setToastMessage(message);
  setToastType(type);
  setIsToastVisible(true);
}

function hideToastUtil(
  setIsToastVisible: (visible: boolean) => void
) {
  setIsToastVisible(false);
}

function validateVerificationCode(code: string): boolean {
  return code.length >= 4 && code.length <= 6 && /^\d+$/.test(code);
}

function validateEmail(email: string): boolean {
  return email.trim() !== "" && 
    email.includes("@") && 
    email.split("@")[0].length >= 3;
}

function validateLoginCredentials(email: string, password: string): boolean {
  return validateEmail(email) && 
    password.trim() !== "" &&  
    password.length >= 6;
}

export default { showToastUtil, hideToastUtil, validateVerificationCode, validateLoginCredentials, validateEmail }; 


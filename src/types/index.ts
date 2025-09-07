export interface ContactFormData {
  firstName: string;
  lastName?: string;
  email: string;
  message: string;
}

export interface EmailValidationResult {
  isValid: boolean;
  error?: string;
}

export interface ApiResponse {
  success?: boolean;
  error?: string;
  message: string;
}

export interface SanitizedContactData {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
}

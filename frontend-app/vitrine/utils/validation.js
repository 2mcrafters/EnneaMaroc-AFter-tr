import { useState } from 'react';
import { VALIDATION_MESSAGES } from './constants';

// Validation utility functions
export class Validator {
  // Email validation
  static email(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return { isValid: false, message: VALIDATION_MESSAGES.REQUIRED };
    }
    if (!emailRegex.test(email)) {
      return { isValid: false, message: VALIDATION_MESSAGES.EMAIL_INVALID };
    }
    return { isValid: true, message: null };
  }

  // Phone validation (Moroccan phone numbers)
  static phone(phone) {
    const phoneRegex = /^\+?212[0-9]{9}$|^0[0-9]{9}$/;
    if (!phone) {
      return { isValid: false, message: VALIDATION_MESSAGES.REQUIRED };
    }
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      return { isValid: false, message: VALIDATION_MESSAGES.PHONE_INVALID };
    }
    return { isValid: true, message: null };
  }

  // Required field validation
  static required(value) {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return { isValid: false, message: VALIDATION_MESSAGES.REQUIRED };
    }
    return { isValid: true, message: null };
  }

  // Password validation
  static password(password) {
    if (!password) {
      return { isValid: false, message: VALIDATION_MESSAGES.REQUIRED };
    }
    if (password.length < 8) {
      return { isValid: false, message: VALIDATION_MESSAGES.PASSWORD_MIN_LENGTH };
    }
    return { isValid: true, message: null };
  }

  // Confirm password validation
  static confirmPassword(password, confirmPassword) {
    if (!confirmPassword) {
      return { isValid: false, message: VALIDATION_MESSAGES.REQUIRED };
    }
    if (password !== confirmPassword) {
      return { isValid: false, message: VALIDATION_MESSAGES.PASSWORDS_NOT_MATCH };
    }
    return { isValid: true, message: null };
  }

  // Min length validation
  static minLength(value, min) {
    if (!value) {
      return { isValid: false, message: VALIDATION_MESSAGES.REQUIRED };
    }
    if (value.length < min) {
      return { isValid: false, message: `Minimum ${min} caractères requis` };
    }
    return { isValid: true, message: null };
  }

  // Max length validation
  static maxLength(value, max) {
    if (value && value.length > max) {
      return { isValid: false, message: `Maximum ${max} caractères autorisés` };
    }
    return { isValid: true, message: null };
  }

  // URL validation
  static url(url) {
    try {
      new URL(url);
      return { isValid: true, message: null };
    } catch {
      return { isValid: false, message: 'URL invalide' };
    }
  }

  // Date validation
  static date(date) {
    if (!date) {
      return { isValid: false, message: VALIDATION_MESSAGES.REQUIRED };
    }
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return { isValid: false, message: 'Date invalide' };
    }
    return { isValid: true, message: null };
  }

  // Number validation
  static number(value, min = null, max = null) {
    if (!value && value !== 0) {
      return { isValid: false, message: VALIDATION_MESSAGES.REQUIRED };
    }
    const num = Number(value);
    if (isNaN(num)) {
      return { isValid: false, message: 'Valeur numérique invalide' };
    }
    if (min !== null && num < min) {
      return { isValid: false, message: `Valeur minimum: ${min}` };
    }
    if (max !== null && num > max) {
      return { isValid: false, message: `Valeur maximum: ${max}` };
    }
    return { isValid: true, message: null };
  }

  // Validate multiple fields
  static validateForm(fields, rules) {
    const errors = {};
    let isFormValid = true;

    Object.keys(rules).forEach(fieldName => {
      const fieldValue = fields[fieldName];
      const fieldRules = rules[fieldName];

      for (const rule of fieldRules) {
        const result = rule(fieldValue);
        if (!result.isValid) {
          errors[fieldName] = result.message;
          isFormValid = false;
          break; // Stop at first validation error for this field
        }
      }
    });

    return { isValid: isFormValid, errors };
  }
}

// Common validation rule combinations
export const ValidationRules = {
  email: [Validator.email],
  phone: [Validator.phone],
  required: [Validator.required],
  password: [Validator.password],
  requiredEmail: [Validator.required, Validator.email],
  requiredPhone: [Validator.required, Validator.phone],
  
  // Custom rule builders
  requiredMinLength: (min) => [Validator.required, (value) => Validator.minLength(value, min)],
  requiredMaxLength: (max) => [Validator.required, (value) => Validator.maxLength(value, max)],
  requiredNumber: (min = null, max = null) => [Validator.required, (value) => Validator.number(value, min, max)]
};

// Utility function for real-time validation
export const useFormValidation = (initialState, validationRules) => {
  const [values, setValues] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [isValid, setIsValid] = useState(false);

  const validateField = (name, value) => {
    if (validationRules[name]) {
      for (const rule of validationRules[name]) {
        const result = rule(value);
        if (!result.isValid) {
          setErrors(prev => ({ ...prev, [name]: result.message }));
          return false;
        }
      }
      setErrors(prev => ({ ...prev, [name]: null }));
      return true;
    }
    return true;
  };

  const setValue = (name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const validateAll = () => {
    const result = Validator.validateForm(values, validationRules);
    setErrors(result.errors);
    setIsValid(result.isValid);
    return result.isValid;
  };

  return {
    values,
    errors,
    isValid,
    setValue,
    validateAll,
    setValues,
    setErrors
  };
};

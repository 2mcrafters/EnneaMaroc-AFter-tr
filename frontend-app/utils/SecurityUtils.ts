// Utilitaires de validation et sanitisation pour la sécurité
export class SecurityUtils {
  
  /**
   * Sanitise une chaîne pour prévenir les injections XSS
   */
  static sanitizeString(input: string): string {
    if (!input) return '';
    
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .trim();
  }

  /**
   * Valide un email
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valide un mot de passe fort
   */
  static isValidPassword(password: string): { valid: boolean; message: string } {
    if (password.length < 8) {
      return { valid: false, message: 'Le mot de passe doit contenir au moins 8 caractères' };
    }
    
    if (!/[A-Z]/.test(password)) {
      return { valid: false, message: 'Le mot de passe doit contenir au moins une lettre majuscule' };
    }
    
    if (!/[a-z]/.test(password)) {
      return { valid: false, message: 'Le mot de passe doit contenir au moins une lettre minuscule' };
    }
    
    if (!/\d/.test(password)) {
      return { valid: false, message: 'Le mot de passe doit contenir au moins un chiffre' };
    }
    
    return { valid: true, message: 'Le mot de passe est valide' };
  }

  /**
   * Valide un numéro de téléphone avec des patterns internationaux
   */
  static isValidPhone(phone: string): boolean {
    if (!phone) return true; // Optionnel
    
    // Nettoyer le numéro (supprimer espaces, tirets, parenthèses)
    const cleanPhone = phone.replace(/[\s\-().]/g, '');
    
    // Patterns pour différents formats:
    // - International: +33123456789 (8-15 chiffres après le +)
    // - National: 0123456789 (8-12 chiffres)
    // - Avec indicatif: 33123456789 (8-15 chiffres)
    const patterns = [
      /^\+[1-9]\d{7,14}$/,        // Format international: +33123456789
      /^0[1-9]\d{7,11}$/,         // Format national: 0123456789
      /^[1-9]\d{7,14}$/,          // Sans préfixe: 33123456789
    ];
    
    return patterns.some(pattern => pattern.test(cleanPhone));
  }



  /**
   * Nettoie les données d'entrée utilisateur
   */
  static sanitizeUserData(data: any): any {
    const sanitized: any = {};
    
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeString(value);
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }

  /**
   * Valide les données utilisateur avant soumission
   */
  static validateUserData(data: any, isEditing: boolean = false): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validation du nom et prénom
    if (!data.firstName || data.firstName.trim().length < 2) {
      errors.push('Le prénom doit contenir au moins 2 caractères');
    }
    
    if (!data.lastName || data.lastName.trim().length < 2) {
      errors.push('Le nom doit contenir au moins 2 caractères');
    }

    // Validation de l'email
    if (!data.email || !this.isValidEmail(data.email)) {
      errors.push('Veuillez fournir une adresse e-mail valide');
    }

    // Validation du mot de passe (obligatoire pour création)
    if (!isEditing && !data.password) {
      errors.push('Le mot de passe est requis');
    }
    
    if (data.password && !this.isValidPassword(data.password).valid) {
      errors.push(this.isValidPassword(data.password).message);
    }

    // Validation du téléphone (optionnel mais doit être valide si fourni)
    if (data.phone && !this.isValidPhone(data.phone)) {
      errors.push('Veuillez fournir un numéro de téléphone valide (ex: +33123456789, 0123456789)');
    }



    // Validation de la date de naissance
    if (data.dob) {
      const birthDate = new Date(data.dob);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age < 13 || age > 120) {
        errors.push('Veuillez fournir une date de naissance valide (âge entre 13 et 120 ans)');
      }
    }

    return { valid: errors.length === 0, errors };
  }
}
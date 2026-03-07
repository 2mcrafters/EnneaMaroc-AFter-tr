import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { updatePasswordAsync } from '../store/slices/userSlice';
import InputField from './InputField';

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
    const dispatch = useAppDispatch();
    const { isLoading, error } = useAppSelector(state => state.user);
    
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        if (!formData.currentPassword.trim()) {
            newErrors.currentPassword = 'Le mot de passe actuel est requis';
        }

        if (!formData.newPassword.trim()) {
            newErrors.newPassword = 'Le nouveau mot de passe est requis';
        } else if (formData.newPassword.length < 8) {
            newErrors.newPassword = 'Le mot de passe doit contenir au moins 8 caractères';
        }

        if (!formData.confirmPassword.trim()) {
            newErrors.confirmPassword = 'Veuillez confirmer votre nouveau mot de passe';
        } else if (formData.newPassword !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        try {
            await dispatch(updatePasswordAsync({
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword,
                newPasswordConfirmation: formData.confirmPassword
            })).unwrap();

            // Reset form and close modal
            setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setErrors({});
            onClose();
        } catch (error) {
            // L'erreur sera gérée par Redux
            console.error('Échec de la mise à jour du mot de passe:', error);
        }
    };

    const handleClose = () => {
        setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setErrors({});
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-800">Changer le Mot de Passe</h2>
                    <button
                        onClick={handleClose}
                        className="text-slate-400 hover:text-slate-600 text-xl"
                        disabled={isLoading}
                    >
                        ×
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <InputField
                            id="currentPassword"
                            label="Mot de Passe Actuel"
                            type="password"
                            value={formData.currentPassword}
                            onChange={handleInputChange}
                            required
                            disabled={isLoading}
                        />
                        {errors.currentPassword && (
                            <p className="text-red-500 text-sm mt-1">{errors.currentPassword}</p>
                        )}
                    </div>

                    <div>
                        <InputField
                            id="newPassword"
                            label="Nouveau Mot de Passe"
                            type="password"
                            value={formData.newPassword}
                            onChange={handleInputChange}
                            required
                            disabled={isLoading}
                        />
                        {errors.newPassword && (
                            <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>
                        )}
                    </div>

                    <div>
                        <InputField
                            id="confirmPassword"
                            label="Confirmer le Nouveau Mot de Passe"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            required
                            disabled={isLoading}
                        />
                        {errors.confirmPassword && (
                            <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                        )}
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-full hover:bg-slate-200"
                            disabled={isLoading}
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-pistachio-dark rounded-full hover:bg-lime-900 disabled:opacity-50"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Mise à jour...' : 'Mettre à Jour le Mot de Passe'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChangePasswordModal;
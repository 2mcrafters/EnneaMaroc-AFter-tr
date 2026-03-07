import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { updateEmailAsync } from '../store/slices/userSlice';
import { setUser } from '../store/slices/simpleAuthSlice';
import InputField from './InputField';

interface ChangeEmailModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ChangeEmailModal: React.FC<ChangeEmailModalProps> = ({ isOpen, onClose }) => {
    const dispatch = useAppDispatch();
    const { isUpdatingProfile, profileError } = useAppSelector(state => state.user);
    
    const [formData, setFormData] = useState({
        currentPassword: '',
        newEmail: '',
        confirmEmail: ''
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

        if (!formData.newEmail.trim()) {
            newErrors.newEmail = 'Le nouvel email est requis';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.newEmail)) {
            newErrors.newEmail = 'Veuillez saisir une adresse email valide';
        }

        if (formData.newEmail !== formData.confirmEmail) {
            newErrors.confirmEmail = 'Les adresses email ne correspondent pas';
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
            const result = await dispatch(updateEmailAsync({
                currentPassword: formData.currentPassword,
                newEmail: formData.newEmail
            })).unwrap();

            // Mettre à jour l'utilisateur dans l'auth slice aussi
            const normalizedUser = {
                ...result.user,
                name: result.user.firstName || result.user.email || 'User'
            };
            dispatch(setUser(normalizedUser));

            // Reset form and close modal
            setFormData({ currentPassword: '', newEmail: '', confirmEmail: '' });
            setErrors({});
            onClose();
        } catch (error) {
            // L'erreur sera gérée par Redux
            console.error('Échec de la mise à jour de l\'email:', error);
        }
    };

    const handleClose = () => {
        setFormData({ currentPassword: '', newEmail: '', confirmEmail: '' });
        setErrors({});
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-800">Changer l'Adresse Email</h2>
                    <button
                        onClick={handleClose}
                        className="text-slate-400 hover:text-slate-600 text-xl"
                        disabled={isUpdatingProfile}
                    >
                        ×
                    </button>
                </div>

                {profileError && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {profileError}
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
                            disabled={isUpdatingProfile}
                        />
                        {errors.currentPassword && (
                            <p className="text-red-500 text-sm mt-1">{errors.currentPassword}</p>
                        )}
                    </div>

                    <div>
                        <InputField
                            id="newEmail"
                            label="Nouvelle Adresse Email"
                            type="email"
                            value={formData.newEmail}
                            onChange={handleInputChange}
                            required
                            disabled={isUpdatingProfile}
                        />
                        {errors.newEmail && (
                            <p className="text-red-500 text-sm mt-1">{errors.newEmail}</p>
                        )}
                    </div>

                    <div>
                        <InputField
                            id="confirmEmail"
                            label="Confirmer le Nouvel Email"
                            type="email"
                            value={formData.confirmEmail}
                            onChange={handleInputChange}
                            required
                            disabled={isUpdatingProfile}
                        />
                        {errors.confirmEmail && (
                            <p className="text-red-500 text-sm mt-1">{errors.confirmEmail}</p>
                        )}
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-full hover:bg-slate-200"
                            disabled={isUpdatingProfile}
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-pistachio-dark rounded-full hover:bg-lime-900 disabled:opacity-50"
                            disabled={isUpdatingProfile}
                        >
                            {isUpdatingProfile ? 'Mise à jour...' : 'Mettre à Jour l\'Email'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChangeEmailModal;
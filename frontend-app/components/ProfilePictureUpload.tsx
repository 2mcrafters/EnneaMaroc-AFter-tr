import React, { useState, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { updateProfilePictureAsync } from '../store/slices/userSlice';

interface ProfilePictureUploadProps {
    isOpen: boolean;
    onClose: () => void;
    currentProfilePicture?: string;
}

const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({ 
    isOpen, 
    onClose, 
    currentProfilePicture 
}) => {
    const dispatch = useAppDispatch();
    const { isUpdatingProfile, profileError } = useAppSelector(state => state.user);
    
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [error, setError] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Veuillez sélectionner un fichier image');
            return;
        }

        // Validate file size (2MB max)
        if (file.size > 2 * 1024 * 1024) {
            setError('La taille du fichier doit être inférieure à 2MB');
            return;
        }

        setError('');
        setSelectedFile(file);

        // Create preview URL
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreviewUrl(e.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError('Veuillez d\'abord sélectionner un fichier');
            return;
        }

        try {
            await dispatch(updateProfilePictureAsync(selectedFile)).unwrap();

            // La synchronisation entre auth et user slices se fait automatiquement dans le thunk
            // Reset form and close modal
            setSelectedFile(null);
            setPreviewUrl('');
            setError('');
            onClose();
        } catch (error) {
            // L'erreur sera gérée par Redux
            console.error('Failed to update profile picture:', error);
        }
    };

    const handleClose = () => {
        setSelectedFile(null);
        setPreviewUrl('');
        setError('');
        onClose();
    };

    const handleRemoveSelection = () => {
        setSelectedFile(null);
        setPreviewUrl('');
        setError('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-800">Mettre à jour la Photo de Profil</h2>
                    <button
                        onClick={handleClose}
                        className="text-slate-400 hover:text-slate-600 text-xl"
                        disabled={isUpdatingProfile}
                    >
                        ×
                    </button>
                </div>

                {(profileError || error) && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {profileError || error}
                    </div>
                )}

                <div className="space-y-4">
                    {/* Current Profile Picture */}
                    <div className="text-center">
                        <p className="text-sm text-slate-600 mb-3">Photo de Profil Actuelle</p>
                        <img
                            src={currentProfilePicture}
                            alt="Profil actuel"
                            className="w-20 h-20 rounded-full object-cover mx-auto border-2 border-slate-200"
                        />
                    </div>

                    {/* File Input */}
                    <div>
                        <label htmlFor="profilePictureInput" className="block text-sm font-medium text-slate-700 mb-2">
                            Sélectionner une Nouvelle Photo
                        </label>
                        <input
                            id="profilePictureInput"
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100"
                            disabled={isUpdatingProfile}
                        />
                        <p className="text-xs text-slate-500 mt-1">
                            Taille max : 2MB. Formats supportés : JPG, PNG, GIF
                        </p>
                    </div>

                    {/* Preview */}
                    {previewUrl && (
                        <div className="text-center">
                            <p className="text-sm text-slate-600 mb-3">Aperçu</p>
                            <img
                                src={previewUrl}
                                alt="Aperçu"
                                className="w-20 h-20 rounded-full object-cover mx-auto border-2 border-pistachio-light"
                            />
                            <button
                                onClick={handleRemoveSelection}
                                className="text-xs text-red-600 hover:text-red-800 mt-2"
                                disabled={isUpdatingProfile}
                            >
                                Supprimer la Sélection
                            </button>
                        </div>
                    )}

                    {/* Action Buttons */}
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
                            onClick={handleUpload}
                            className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-pistachio-dark rounded-full hover:bg-lime-900 disabled:opacity-50"
                            disabled={isUpdatingProfile || !selectedFile}
                        >
                            {isUpdatingProfile ? 'Téléchargement...' : 'Mettre à Jour la Photo'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePictureUpload;
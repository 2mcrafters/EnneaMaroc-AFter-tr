import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchParcoursBySlug, updateParcours, clearCurrentParcours } from '../store/slices/parcoursSlice';
import { showSuccess, showInfo } from '../store/slices/uiSlice';
import AdminLayout from '../components/admin/AdminLayout';
import { FaSave, FaArrowLeft, FaPlus, FaTrash, FaEdit, FaTimes } from 'react-icons/fa';
import { Parcours, ParcoursModule } from '../services/parcoursService';
import ConfirmationModal from '../components/ConfirmationModal';
import StatusModal from '../components/StatusModal';
import { fileService } from '../services/fileService';
import { getCourseImageUrl } from '../services/baseApi';

const AVAILABLE_ICONS = [
  'FaCompass',
  'FaBook',
  'FaChalkboardTeacher',
  'FaCertificate',
  'FaUsers',
  'FaClock',
  'FaMapMarkerAlt',
  'FaStar',
  'FaLightbulb',
  'FaBrain',
  'FaLaptop',
  'FaGlobe',
  'FaHandshake',
  'FaMoneyBill',
  'FaQuestionCircle',
  'FaCheck',
  'FaArrowRight'
];

const AdminParcoursEditPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentItem, loading, error } = useAppSelector((state) => state.parcours);
  const [formData, setFormData] = useState<Partial<Parcours>>({});
  const [modules, setModules] = useState<ParcoursModule[]>([]);
  const [expandedModuleIndex, setExpandedModuleIndex] = useState<number | null>(null);
  const [moduleToDelete, setModuleToDelete] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean;
    type: 'success' | 'error';
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get slug from hash
  const slug = window.location.hash.split('/').pop();

  useEffect(() => {
    if (slug) {
      dispatch(fetchParcoursBySlug(slug));
    }
    return () => {
      dispatch(clearCurrentParcours());
    };
  }, [dispatch, slug]);

  useEffect(() => {
    if (currentItem) {
      setFormData({
        title: currentItem.title,
        slug: currentItem.slug,
        description: currentItem.description,
        photo: currentItem.photo,
        lieu: currentItem.lieu || "Ferme J'nan Lemonie — Sidi Yamani",
        horaires: currentItem.horaires,
        price: currentItem.price,
        price_ht: currentItem.price_ht,
        cta_link: currentItem.cta_link,
      });
      setModules(currentItem.modules || []);
    }
  }, [currentItem]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleModuleChange = (index: number, field: keyof ParcoursModule, value: string) => {
    const newModules = [...modules];
    newModules[index] = { ...newModules[index], [field]: value };
    setModules(newModules);
  };

  const addModule = () => {
    setModules([
      {
        title: 'Nouveau Module',
        duration: '2 JOURS',
        subtitle: '',
        description: '',
        details: '',
        icon: 'FaCompass',
        order: 0,
      },
      ...modules,
    ]);
    setExpandedModuleIndex(0); // Automatically expand the new module
    dispatch(showSuccess({ title: 'Ajouté', message: 'Nouveau module ajouté ✨' }));
  };

  const confirmDeleteModule = (index: number) => {
    setModuleToDelete(index);
  };

  const handleDeleteModule = () => {
    if (moduleToDelete !== null) {
      const newModules = modules.filter((_, i) => i !== moduleToDelete);
      setModules(newModules);
      if (expandedModuleIndex === moduleToDelete) {
        setExpandedModuleIndex(null);
      } else if (expandedModuleIndex !== null && expandedModuleIndex > moduleToDelete) {
        setExpandedModuleIndex(expandedModuleIndex - 1);
      }
      setModuleToDelete(null);
      dispatch(showInfo({ title: 'Supprimé', message: 'Le module a été supprimé 🗑️' }));
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      dispatch(showInfo({ title: 'Erreur', message: 'L\'image doit être inférieure à 5MB' }));
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      dispatch(showInfo({ title: 'Erreur', message: 'Veuillez sélectionner une image valide' }));
      return;
    }

    // Store the file and create preview
    setSelectedImage(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    dispatch(showInfo({ title: 'Image sélectionnée', message: 'Cliquez sur Enregistrer pour uploader l\'image' }));
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setFormData(prev => ({ ...prev, photo: '' }));
    dispatch(showInfo({ title: 'Image supprimée', message: 'L\'image sera supprimée lors de l\'enregistrement' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentItem) {
      setStatusModal({
        isOpen: true,
        type: 'error',
        title: 'Erreur',
        message: 'Aucun parcours à mettre à jour',
      });
      return;
    }

    setIsSubmitting(true);
    setIsUploading(true);

    try {
      let updatedPhoto = formData.photo;

      // Upload image if a new one was selected
      if (selectedImage) {
        try {
          const uploadResponse = await fileService.uploadImage(selectedImage, 'parcours');
          if (uploadResponse.success && uploadResponse.path) {
            updatedPhoto = uploadResponse.path;
            dispatch(showInfo({ title: 'Image uploadée', message: 'Image téléchargée avec succès ✓' }));
          }
        } catch (uploadError: any) {
          console.error('Upload error:', uploadError);
          setStatusModal({
            isOpen: true,
            type: 'error',
            title: 'Erreur d\'upload',
            message: uploadError?.message || 'Échec du téléchargement de l\'image',
          });
          setIsSubmitting(false);
          setIsUploading(false);
          return;
        }
      }

      // Make PUT request to update parcours
      await dispatch(updateParcours({
        id: currentItem.id,
        data: { ...formData, photo: updatedPhoto, modules },
      })).unwrap();
      
      // Clear image selection and preview
      setSelectedImage(null);
      setPreviewUrl(null);
      
      // Show success modal
      setStatusModal({
        isOpen: true,
        type: 'success',
        title: 'Succès',
        message: 'Module mis à jour avec succès! 🎉',
      });
      
      // Also dispatch Redux notification
      dispatch(showSuccess({ title: 'Enregistré', message: 'Module mis à jour avec succès 💾' }));
      
    } catch (error: any) {
      console.error('Error updating parcours:', error);
      
      // Show error modal
      setStatusModal({
        isOpen: true,
        type: 'error',
        title: 'Erreur',
        message: error?.message || 'Une erreur est survenue lors de la mise à jour du module',
      });
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  const handleStatusModalClose = () => {
    setStatusModal({ ...statusModal, isOpen: false });
    
    // If it was a success, navigate back after closing the modal
    if (statusModal.type === 'success') {
      setTimeout(() => {
        window.history.back();
      }, 300);
    }
  };

  if (loading && !currentItem) return <AdminLayout><p>Chargement...</p></AdminLayout>;
  if (error) return <AdminLayout><p className="text-red-500">{error}</p></AdminLayout>;

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => window.history.back()} className="text-slate-500 hover:text-slate-700">
            <FaArrowLeft />
          </button>
          <h1 className="text-2xl font-bold text-slate-800">Modifier {currentItem?.title}</h1>
        </div>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            isSubmitting
              ? 'bg-slate-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
          } text-white`}
        >
          <FaSave /> {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* General Info */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100">
          <h2 className="text-lg font-semibold mb-4">Informations Générales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Titre</label>
              <input
                type="text"
                name="title"
                value={formData.title || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a83ca]"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Image du Module</label>
              <div className="space-y-3">
                {/* Image Preview */}
                {(previewUrl || formData.photo) && (
                  <div className="relative w-full h-64 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl overflow-hidden border-2 border-slate-200 shadow-md group">
                    <img 
                      src={previewUrl || getCourseImageUrl(formData.photo!, formData.slug)} 
                      alt="Aperçu du module" 
                      onError={(e) => { 
                        const target = e.currentTarget as HTMLImageElement;
                        target.onerror = null;
                        target.src = getCourseImageUrl(null, formData.slug); 
                      }}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="opacity-0 group-hover:opacity-100 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all duration-300 flex items-center gap-2 shadow-lg transform scale-90 group-hover:scale-100"
                        title="Supprimer l'image"
                      >
                        <FaTrash /> Supprimer l'image
                      </button>
                    </div>
                    {selectedImage && (
                      <div className="absolute top-3 left-3 bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        Nouvelle image - Cliquez sur Enregistrer
                      </div>
                    )}
                  </div>
                )}

                {/* Upload Button */}
                {!(previewUrl || formData.photo) && (
                  <div className="w-full h-64 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors">
                    <svg className="w-16 h-16 text-slate-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-slate-600 font-medium mb-1">Aucune image</p>
                    <p className="text-slate-400 text-sm">Choisissez une image ci-dessous</p>
                  </div>
                )}

                {/* File Input */}
                <div className="flex items-center gap-3">
                  <label className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 border-2 border-blue-200 text-blue-700 rounded-lg hover:bg-blue-100 hover:border-blue-300 transition-all font-medium">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      {selectedImage ? 'Changer l\'image' : (formData.photo ? 'Remplacer l\'image' : 'Choisir une image')}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      disabled={isUploading}
                      className="hidden"
                    />
                  </label>
                  {isUploading && (
                    <div className="flex items-center gap-2 text-blue-600">
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-sm font-medium">Téléchargement...</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-start gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-lg">
                  <svg className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p><strong>Formats acceptés:</strong> JPG, PNG, WEBP, GIF</p>
                    <p><strong>Taille maximale:</strong> 5 MB</p>
                    <p className="text-amber-600 font-medium mt-1">💡 L'image sera uploadée après avoir cliqué sur "Enregistrer"</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Lieu</label>
              <input
                type="text"
                name="lieu"
                value={formData.lieu || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a83ca]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Horaires</label>
              <input
                type="text"
                name="horaires"
                value={formData.horaires || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a83ca]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Prix Entreprises (HTVA)</label>
              <input
                type="text"
                name="price_ht"
                value={formData.price_ht || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a83ca]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Prix Particuliers (TTC)</label>
              <input
                type="text"
                name="price"
                value={formData.price || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a83ca]"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a83ca]"
              />
            </div>

          </div>
        </div>

        {/* Modules */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Sessions</h2>
            <button
              type="button"
              onClick={addModule}
              className="flex items-center gap-2 px-3 py-1 bg-[#0a83ca]/10 text-[#0a83ca] rounded-lg hover:bg-[#0a83ca]/20 transition-colors text-sm font-medium"
            >
              <FaPlus /> Ajouter une session
            </button>
          </div>

          <div className="space-y-4">
            {modules.map((module, index) => (
              <div key={index} className="border border-slate-200 rounded-lg bg-slate-50 overflow-hidden">
                {expandedModuleIndex === index ? (
                  // Expanded View (Edit Form)
                  <div className="p-4 relative">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium text-slate-700">Modifier la session</h3>
                      <button
                        type="button"
                        onClick={() => setExpandedModuleIndex(null)}
                        className="text-slate-400 hover:text-slate-600"
                        title="Fermer"
                      >
                        <FaTimes />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Titre de la session</label>
                        <input
                          type="text"
                          value={module.title}
                          onChange={(e) => handleModuleChange(index, 'title', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a83ca] text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Durée</label>
                        <input
                          type="text"
                          value={module.duration || ''}
                          onChange={(e) => handleModuleChange(index, 'duration', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a83ca] text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Horaires</label>
                        <input
                          type="text"
                          value={module.horaires || ''}
                          onChange={(e) => handleModuleChange(index, 'horaires', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a83ca] text-sm"
                          placeholder="Ex: 9h-17h"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Prérequis</label>
                        <input
                          type="text"
                          value={module.prerequis || ''}
                          onChange={(e) => handleModuleChange(index, 'prerequis', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a83ca] text-sm"
                          placeholder="Ex: D1 - D2"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Prix</label>
                        <input
                          type="text"
                          value={module.price || ''}
                          onChange={(e) => handleModuleChange(index, 'price', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a83ca] text-sm"
                          placeholder="Ex: 3000 DH"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Lieu</label>
                        <input
                          type="text"
                          value={module.place || ''}
                          onChange={(e) => handleModuleChange(index, 'place', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a83ca] text-sm"
                          placeholder="Ex: Casablanca"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-slate-500 mb-1">Sous-titre</label>
                        <input
                          type="text"
                          value={module.subtitle || ''}
                          onChange={(e) => handleModuleChange(index, 'subtitle', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a83ca] text-sm"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-slate-500 mb-1">Description</label>
                        <textarea
                          value={module.description || ''}
                          onChange={(e) => handleModuleChange(index, 'description', e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a83ca] text-sm"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-slate-500 mb-1">Détails</label>
                        <textarea
                          value={module.details || ''}
                          onChange={(e) => handleModuleChange(index, 'details', e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a83ca] text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Icone (Nom React-Icon)</label>
                        <select
                          value={module.icon || ''}
                          onChange={(e) => handleModuleChange(index, 'icon', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a83ca] text-sm"
                        >
                          <option value="">Sélectionner une icône</option>
                          {AVAILABLE_ICONS.map((iconName) => (
                            <option key={iconName} value={iconName}>
                              {iconName}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                       <button
                        type="button"
                        onClick={() => {
                          setExpandedModuleIndex(null);
                          dispatch(showSuccess({ title: 'Modifié', message: 'Modifications enregistrées localement ✅' }));
                        }}
                        className="px-4 py-2 bg-[#0a83ca] text-white rounded hover:bg-[#0869a1] text-sm"
                      >
                        Terminer l'édition
                      </button>
                    </div>
                  </div>
                ) : (
                  // Collapsed View (Summary Card)
                  <div className="p-4 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors">
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-800">{`Module ${index + 1}: ${module.title || 'Sans titre'}`}</h3>
                      <p className="text-sm text-slate-500">{module.duration || 'Durée non spécifiée'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setExpandedModuleIndex(index)}
                        className="p-2 text-[#0a83ca] hover:bg-[#0a83ca]/10 rounded-full transition-colors"
                        title="Modifier"
                      >
                        <FaEdit />
                      </button>
                      <button
                        type="button"
                        onClick={() => confirmDeleteModule(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        title="Supprimer"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </form>

      <ConfirmationModal
        isOpen={moduleToDelete !== null}
        onClose={() => setModuleToDelete(null)}
        onConfirm={handleDeleteModule}
        title="Supprimer la session"
        message="Êtes-vous sûr de vouloir supprimer cette session ? Cette action est irréversible."
        confirmText="Supprimer"
        cancelText="Annuler"
        type="danger"
      />

      <StatusModal
        isOpen={statusModal.isOpen}
        onClose={handleStatusModalClose}
        type={statusModal.type}
        title={statusModal.title}
        message={statusModal.message}
      />
    </AdminLayout>
  );
};

export default AdminParcoursEditPage;

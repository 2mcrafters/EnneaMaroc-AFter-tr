import React, { useState } from 'react';
import { useAppDispatch } from '../store';
import { createParcours } from '../store/slices/parcoursSlice';
import { showSuccess } from '../store/slices/uiSlice';
import AdminLayout from '../components/admin/AdminLayout';
import { FaSave, FaArrowLeft, FaPlus, FaTrash, FaTimes } from 'react-icons/fa';
import { ParcoursModule } from '../services/parcoursService';
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

const AdminParcoursCreatePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [isUploading, setIsUploading] = useState(false);
  const [expandedModuleIndex, setExpandedModuleIndex] = useState<number | null>(null);
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
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    photo: '',
    lieu: "Ferme J'nan Lemonie — Sidi Yamani",
    horaires: '',
    price: '',
    price_ht: '',
    cta_link: '',
  });

  const [modules, setModules] = useState<ParcoursModule[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Auto-generate slug from title
    if (name === 'title') {
      const slug = value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData((prev) => ({ ...prev, [name]: value, slug }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleModuleChange = (index: number, field: keyof ParcoursModule, value: string) => {
    const newModules = [...modules];
    newModules[index] = { ...newModules[index], [field]: value };
    setModules(newModules);
  };

  const addModule = () => {
    setModules([
      ...modules,
      {
        title: 'Nouvelle Session',
        duration: '2 JOURS',
        subtitle: '',
        description: '',
        details: '',
        icon: 'FaCompass',
        order: modules.length,
      },
    ]);
    setExpandedModuleIndex(modules.length);
    dispatch(showSuccess({ title: 'Ajouté', message: 'Nouvelle session ajoutée ✨' }));
  };

  const removeModule = (index: number) => {
    const newModules = modules.filter((_, i) => i !== index);
    setModules(newModules);
    if (expandedModuleIndex === index) {
      setExpandedModuleIndex(null);
    }
    dispatch(showSuccess({ title: 'Supprimé', message: 'Module supprimé' }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const response = await fileService.uploadImage(file, 'parcours');
      if (response.success && response.path) {
        setFormData(prev => ({ ...prev, photo: response.path }));
        dispatch(showSuccess({ title: 'Succès', message: 'Image téléchargée avec succès' }));
      }
    } catch (error) {
      console.error('Upload error:', error);
      setStatusModal({
        isOpen: true,
        type: 'error',
        title: 'Erreur',
        message: 'Échec du téléchargement de l\'image',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title || !formData.slug) {
      setStatusModal({
        isOpen: true,
        type: 'error',
        title: 'Erreur',
        message: 'Le titre est obligatoire',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create parcours with modules
      await dispatch(createParcours({
        ...formData,
        modules,
      })).unwrap();
      
      // Show success modal
      setStatusModal({
        isOpen: true,
        type: 'success',
        title: 'Succès',
        message: 'Nouveau parcours créé avec succès! 🎉',
      });
      
      // Also dispatch Redux notification
      dispatch(showSuccess({ title: 'Créé', message: 'Parcours créé avec succès 💾' }));
      
    } catch (error: any) {
      console.error('Error creating parcours:', error);
      
      // Show error modal
      setStatusModal({
        isOpen: true,
        type: 'error',
        title: 'Erreur',
        message: error?.message || 'Une erreur est survenue lors de la création du parcours',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusModalClose = () => {
    setStatusModal({ ...statusModal, isOpen: false });
    
    // If it was a success, navigate back after closing the modal
    if (statusModal.type === 'success') {
      setTimeout(() => {
        window.location.hash = '#/admin/parcours';
      }, 300);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => window.history.back()} className="text-slate-500 hover:text-slate-700" title="Retour">
            <FaArrowLeft />
          </button>
          <h1 className="text-2xl font-bold text-slate-800">Créer un Nouveau Module</h1>
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
          <FaSave /> {isSubmitting ? 'Création...' : 'Créer le Module'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* General Info */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100">
          <h2 className="text-lg font-semibold mb-4">Informations Générales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Titre *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a83ca]"
                placeholder="Ex: Découvrir"
              />
            </div>
            {/* Slug field hidden - auto-generated from title */}
            <input
              type="hidden"
              name="slug"
              value={formData.slug}
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Photo</label>
              <div className="space-y-2">
                {formData.photo && (
                  <div className="relative w-full h-48 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                    <img 
                      src={getCourseImageUrl(formData.photo, formData.slug)} 
                      alt="Aperçu" 
                      onError={(e) => { 
                        const target = e.currentTarget as HTMLImageElement;
                        target.onerror = null;
                        target.src = getCourseImageUrl(null, formData.slug); 
                      }}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, photo: '' }))}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                      title="Supprimer l'image"
                    >
                      <FaTimes />
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                    className="block w-full text-sm text-slate-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-full file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100
                    "
                  />
                  {isUploading && <span className="text-sm text-slate-500">Téléchargement...</span>}
                </div>
                <p className="text-xs text-slate-500">Formats acceptés: JPG, PNG, WEBP. Max 5MB.</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Lieu</label>
              <input
                type="text"
                name="lieu"
                value={formData.lieu}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a83ca]"
                placeholder="Ex: Jnan Lemonie"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Horaires</label>
              <input
                type="text"
                name="horaires"
                value={formData.horaires}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a83ca]"
                placeholder="Ex: 9h-17h"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Prix Entreprises (HTVA)</label>
              <input
                type="text"
                name="price_ht"
                value={formData.price_ht}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a83ca]"
                placeholder="Ex: 4000 DH"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Prix Particuliers (TTC)</label>
              <input
                type="text"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a83ca]"
                placeholder="Ex: 2000 DH"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Lien CTA (Call to Action)</label>
              <input
                type="text"
                name="cta_link"
                value={formData.cta_link}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a83ca]"
                placeholder="Ex: /inscription"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0a83ca]"
                placeholder="Description du module..."
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

          {modules.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <p>Aucune session ajoutée. Cliquez sur "Ajouter une session" pour commencer.</p>
            </div>
          ) : (
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
                          onClick={() => setExpandedModuleIndex(null)}
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
                          <FaPlus />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeModule(index)}
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
          )}
        </div>
      </form>

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

export default AdminParcoursCreatePage;

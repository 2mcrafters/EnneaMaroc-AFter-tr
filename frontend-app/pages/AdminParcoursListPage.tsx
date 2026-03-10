import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchAllParcours, deleteParcours } from '../store/slices/parcoursSlice';
import { showSuccess, showError } from '../store/slices/uiSlice';
import AdminLayout from '../components/admin/AdminLayout';
import { FaEdit, FaPlus, FaTrash } from 'react-icons/fa';
import ConfirmationModal from '../components/ConfirmationModal';
import StatusModal from '../components/StatusModal';
import { getCourseImageUrl } from '../services/baseApi';
import { getParcoursColorBySlug } from '../utils/parcoursColors';

const AdminParcoursListPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector((state) => state.parcours);
  const [parcoursToDelete, setParcoursToDelete] = useState<{ id: number; title: string } | null>(null);
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

  useEffect(() => {
    dispatch(fetchAllParcours());
  }, [dispatch]);

  // Debug: log first few parcours to inspect photo paths
  useEffect(() => {
    if (items && items.length > 0) {
      console.log('🔍 Parcours sample for image debug:', items.slice(0,3).map(i => ({ id: i.id, title: i.title, photo: i.photo }))); 
    }
  }, [items]);

  const handleEdit = (slug: string) => {
    window.location.hash = `#/admin/parcours/${slug}`;
  };

  const handleCreate = () => {
    window.location.hash = '#/admin/parcours/create';
  };

  const confirmDelete = (id: number, title: string) => {
    setParcoursToDelete({ id, title });
  };

  const handleDelete = async () => {
    if (!parcoursToDelete) return;

    try {
      await dispatch(deleteParcours(parcoursToDelete.id)).unwrap();
      
      setStatusModal({
        isOpen: true,
        type: 'success',
        title: 'Succès',
        message: `Le module "${parcoursToDelete.title}" a été supprimé avec succès! 🗑️`,
      });
      
      dispatch(showSuccess({ title: 'Supprimé', message: 'Module supprimé avec succès' }));
    } catch (error: any) {
      setStatusModal({
        isOpen: true,
        type: 'error',
        title: 'Erreur',
        message: error?.message || 'Une erreur est survenue lors de la suppression',
      });
      
      dispatch(showError({ title: 'Erreur', message: 'Échec de la suppression' }));
    } finally {
      setParcoursToDelete(null);
    }
  };

  const handleStatusModalClose = () => {
    setStatusModal({ ...statusModal, isOpen: false });
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gestion des Modules</h1>
          <p className="text-slate-600">Modifiez les informations des modules (Découvrir, Approfondir, Transmettre)</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <FaPlus /> Créer un Nouveau Module
        </button>
      </div>

      {loading && <p>Chargement...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((parcours) => {
          const pc = getParcoursColorBySlug(parcours.slug);
          return (
          <div key={parcours.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-100 hover:shadow-lg transition-shadow">
            {/* colored top stripe */}
            <div className="h-1.5" style={{ background: pc.gradient }} />
            <div className="h-48 overflow-hidden bg-slate-200 flex items-center justify-center">
              {parcours.photo ? (
                <img 
                  src={getCourseImageUrl(parcours.photo, parcours.slug)} 
                  alt={parcours.title} 
                  onError={(e) => { 
                    const target = e.currentTarget as HTMLImageElement;
                    target.onerror = null; // Prevent infinite loop
                    target.src = getCourseImageUrl(null, parcours.slug); 
                  }} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="text-slate-400 text-center">
                  <svg className="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm">Aucune image</p>
                </div>
              )}
            </div>
            <div className="p-6">
              <h2 className="text-xl font-bold mb-2" style={{ color: pc.primary }}>{parcours.title}</h2>
              <p className="text-sm text-slate-500 mb-4">{parcours.description}</p>
              
              <div className="space-y-2 mb-6">
                <div className="flex items-center text-sm text-slate-600">
                  <span className="font-semibold w-20">Lieu:</span>
                  <span>{parcours.lieu || '-'}</span>
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <span className="font-semibold w-20">Horaires:</span>
                  <span>{parcours.horaires || '-'}</span>
                </div>
                <div className="flex items-center text-sm text-slate-600">
                  <span className="font-semibold w-20">Prix:</span>
                  <span>{parcours.price || '-'}</span>
                </div>
              </div>

              <button
                onClick={() => handleEdit(parcours.slug)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-white rounded-lg transition-colors mb-2"
                style={{ backgroundColor: pc.primary }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = pc.primaryDark)}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = pc.primary)}
              >
                <FaEdit /> Modifier
              </button>
              
              <button
                onClick={() => confirmDelete(parcours.id, parcours.title)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <FaTrash /> Supprimer
              </button>
            </div>
          </div>
          );
        })}
      </div>

      <ConfirmationModal
        isOpen={parcoursToDelete !== null}
        onClose={() => setParcoursToDelete(null)}
        onConfirm={handleDelete}
        title="Supprimer le module"
        message={`Êtes-vous sûr de vouloir supprimer le module "${parcoursToDelete?.title}" ? Cette action est irréversible.`}
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

export default AdminParcoursListPage;

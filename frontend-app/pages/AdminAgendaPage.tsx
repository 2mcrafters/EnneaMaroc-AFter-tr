import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchSessions, createSession, updateSession, deleteSession } from '../store/slices/agendaSlice';
import { fetchAllParcours, updateParcours } from '../store/slices/parcoursSlice';
import AdminLayout from '../components/admin/AdminLayout';
import { FaPlus, FaCheck, FaTimes, FaEdit, FaTrash, FaChevronLeft, FaChevronRight, FaCalendarAlt, FaFileExcel } from 'react-icons/fa';
import { ParcoursSession } from '../services/agendaService';
import { ParcoursModule } from '../services/parcoursService';
import ConfirmationModal from '../components/ConfirmationModal';
import { showSuccess } from '../store/slices/uiSlice';
import * as XLSX from 'xlsx';
import { formatPrice } from '../utils/formatPrice';

const AdminAgendaPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { sessions, loading } = useAppSelector((state) => state.agenda);
  const { items: parcoursList } = useAppSelector((state) => state.parcours);
  
  const [monthHeaders, setMonthHeaders] = useState<{key: string, label: string, date: Date}[]>([]);
  const [viewStartDate, setViewStartDate] = useState(new Date());
  const [selectedParcoursId, setSelectedParcoursId] = useState<number | null>(null);
  
  const [editingHeaderIndex, setEditingHeaderIndex] = useState<number | null>(null);

  // Session Modal State
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<ParcoursSession | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Module Edit Modal State
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [isDeleteModuleConfirmOpen, setIsDeleteModuleConfirmOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<ParcoursModule | null>(null);
  const [editingParcoursId, setEditingParcoursId] = useState<number | null>(null);

  // Session Form Data
  const [sessionFormData, setSessionFormData] = useState({
    parcours_module_id: '',
    start_date: '',
    start_time: '09:00',
    end_date: '',
    end_time: '17:00',
    location: 'Jnan Lemonie',
    max_participants: 20,
    notes: ''
  });

  // Module Form Data
  const [moduleFormData, setModuleFormData] = useState({
    title: '',
    subtitle: '',
    duration: '',
    horaires: '',
    prerequis: '',
    price: ''
  });

  useEffect(() => {
    dispatch(fetchAllParcours());
  }, [dispatch]);

  useEffect(() => {
    // Generate 14 months headers based on viewStartDate
    const headers = [];
    const months = ['janv', 'fév', 'mars', 'avr', 'mai', 'juin', 'juil', 'août', 'sept', 'oct', 'nov', 'déc'];

    for (let i = 0; i < 14; i++) {
      const d = new Date(viewStartDate.getFullYear(), viewStartDate.getMonth() + i, 1);
      const monthName = months[d.getMonth()];
      const yearShort = d.getFullYear().toString().slice(2);
      headers.push({
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        label: `${monthName}-${yearShort}`,
        date: d
      });
    }
    setMonthHeaders(headers);
  }, [viewStartDate]);

  useEffect(() => {
    if (monthHeaders.length === 0) return;
    
    // Find min and max date from headers
    let minDate = monthHeaders[0].date;
    let maxDate = monthHeaders[monthHeaders.length - 1].date;
    
    monthHeaders.forEach(h => {
      if (h.date < minDate) minDate = h.date;
      if (h.date > maxDate) maxDate = h.date;
    });
    
    // Add buffer to end date (end of month)
    const end = new Date(maxDate.getFullYear(), maxDate.getMonth() + 1, 0);
    
    dispatch(fetchSessions({ 
      startDate: minDate.toISOString().split('T')[0], 
      endDate: end.toISOString().split('T')[0] 
    }));
  }, [dispatch, monthHeaders]);

  const handleHeaderDateChange = (index: number, dateValue: string) => {
    if (!dateValue) return;
    const [year, month] = dateValue.split('-').map(Number);
    const newDate = new Date(year, month - 1, 1);
    
    const months = ['janv', 'fév', 'mars', 'avr', 'mai', 'juin', 'juil', 'août', 'sept', 'oct', 'nov', 'déc'];
    const monthName = months[newDate.getMonth()];
    const yearShort = newDate.getFullYear().toString().slice(2);
    
    const newHeaders = [...monthHeaders];
    newHeaders[index] = {
      key: `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}`,
      label: `${monthName}-${yearShort}`,
      date: newDate
    };
    
    setMonthHeaders(newHeaders);
    setEditingHeaderIndex(null);
  };

  const handlePrevDate = () => {
    const newDate = new Date(viewStartDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setViewStartDate(newDate);
  };

  const handleNextDate = () => {
    const newDate = new Date(viewStartDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setViewStartDate(newDate);
  };

  const getSession = (moduleId: number, monthKey: string) => {
    // If there are multiple sessions in the same month for a module, pick the one
    // that starts closest to the first day of the month. This prevents CRUD actions
    // from targeting a different session than the one the user expects.
    const [yStr, mStr] = monthKey.split('-');
    const monthStart = new Date(Number(yStr), Number(mStr) - 1, 1);

    const monthSessions = sessions.filter((session) => {
      if (session.parcours_module_id !== moduleId) return false;
      const sessionDate = new Date(session.start_date);
      const sessionKey = `${sessionDate.getFullYear()}-${String(sessionDate.getMonth() + 1).padStart(2, '0')}`;
      return sessionKey === monthKey;
    });

    if (monthSessions.length === 0) return undefined;
    if (monthSessions.length === 1) return monthSessions[0];

    return monthSessions
      .map((s) => ({ s, diff: Math.abs(new Date(s.start_date).getTime() - monthStart.getTime()) }))
      .sort((a, b) => a.diff - b.diff)[0].s;
  };

  // --- Session Handling ---

  const handleCellClick = (moduleId: number, monthHeader: {key: string, date: Date}) => {
    const existingSession = getSession(moduleId, monthHeader.key);
    
    if (existingSession) {
      setEditingSession(existingSession);
      setSessionFormData({
        parcours_module_id: existingSession.parcours_module_id.toString(),
        start_date: existingSession.start_date.split('T')[0],
        start_time: existingSession.start_date.split('T')[1]?.substring(0, 5) || '09:00',
        end_date: existingSession.end_date.split('T')[0],
        end_time: existingSession.end_date.split('T')[1]?.substring(0, 5) || '17:00',
        location: existingSession.location || '',
        max_participants: existingSession.max_participants,
        notes: existingSession.notes || ''
      });
    } else {
      setEditingSession(null);
      const defaultDate = new Date(monthHeader.date);
      const dateStr = defaultDate.toLocaleDateString('en-CA');
      
      setSessionFormData({
        parcours_module_id: moduleId.toString(),
        start_date: dateStr,
        start_time: '09:00',
        end_date: dateStr,
        end_time: '17:00',
        location: 'Jnan Lemonie',
        max_participants: 20,
        notes: ''
      });
    }
    setIsSessionModalOpen(true);
  };

  const handleSessionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const startDateTime = `${sessionFormData.start_date}T${sessionFormData.start_time}:00`;
    const endDateTime = `${sessionFormData.end_date}T${sessionFormData.end_time}:00`;

    const sessionData = {
      parcours_module_id: parseInt(sessionFormData.parcours_module_id),
      start_date: startDateTime,
      end_date: endDateTime,
      location: sessionFormData.location,
      max_participants: sessionFormData.max_participants,
      notes: sessionFormData.notes
    };

    try {
      // Prevent accidental duplicates: if user clicks an empty cell, we expect to create
      // ONE session for that module+month. If one already exists, force edit instead.
      // (If later you want multi-sessions-per-month, we can add a sessions list UI.)
      if (!editingSession) {
        const monthKey = `${sessionFormData.start_date.slice(0, 7)}`; // YYYY-MM
        const existingInMonth = getSession(parseInt(sessionFormData.parcours_module_id), monthKey);
        if (existingInMonth) {
          setEditingSession(existingInMonth);
          setSessionFormData({
            parcours_module_id: existingInMonth.parcours_module_id.toString(),
            start_date: existingInMonth.start_date.split('T')[0],
            start_time: existingInMonth.start_date.split('T')[1]?.substring(0, 5) || '09:00',
            end_date: existingInMonth.end_date.split('T')[0],
            end_time: existingInMonth.end_date.split('T')[1]?.substring(0, 5) || '17:00',
            location: existingInMonth.location || '',
            max_participants: existingInMonth.max_participants,
            notes: existingInMonth.notes || '',
          });
          alert('Une session existe déjà pour ce module et ce mois. Modification de la session existante.');
          return;
        }
      }

      if (editingSession) {
        await dispatch(updateSession({ id: editingSession.id, data: sessionData })).unwrap();
        dispatch(showSuccess({ title: 'Succès', message: 'Session modifiée avec succès' }));
      } else {
        await dispatch(createSession(sessionData)).unwrap();
        dispatch(showSuccess({ title: 'Succès', message: 'Session créée avec succès' }));
      }

      setIsSessionModalOpen(false);
    } catch (err: any) {
      // Avoid fake success when backend rejects (401/422/500, etc.)
      alert(err?.message || 'Erreur lors de l\'enregistrement de la session');
    }
  };

  const handleDeleteSession = async () => {
    if (deleteId) {
      await dispatch(deleteSession(deleteId)).unwrap();
      dispatch(showSuccess({ title: 'Succès', message: 'Session supprimée' }));
      setDeleteId(null);
      setIsSessionModalOpen(false);
    }
  };

  // --- Module Handling ---

  const handleModuleClick = (parcoursId: number, module: ParcoursModule) => {
    setEditingParcoursId(parcoursId);
    setEditingModule(module);
    setModuleFormData({
      title: module.title,
      subtitle: module.subtitle || '',
      duration: module.duration || '',
      horaires: module.horaires || '',
      prerequis: module.prerequis || '',
      price: module.price || ''
    });
    setIsModuleModalOpen(true);
  };

  const handleAddModule = (parcoursId: number) => {
    setEditingParcoursId(parcoursId);
    setEditingModule(null);
    setModuleFormData({
      title: '',
      subtitle: '',
      duration: '',
      horaires: '',
      prerequis: '',
      price: ''
    });
    setIsModuleModalOpen(true);
  };

  const handleDeleteModule = () => {
    setIsDeleteModuleConfirmOpen(true);
  };

  const confirmDeleteModule = async () => {
    if (!editingParcoursId || !editingModule) return;
    
    const parcours = parcoursList.find(p => p.id === editingParcoursId);
    if (!parcours) return;

    const updatedModules = parcours.modules.filter(m => m.id !== editingModule.id);
    
    await dispatch(updateParcours({ 
      id: editingParcoursId, 
      data: { 
        ...parcours,
        modules: updatedModules 
      } 
    }));
    
    dispatch(showSuccess({ title: 'Succès', message: 'Module supprimé avec succès' }));
    setIsModuleModalOpen(false);
    setIsDeleteModuleConfirmOpen(false);
    dispatch(fetchAllParcours());
  };

  const handleModuleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingParcoursId) return;

    const parcours = parcoursList.find(p => p.id === editingParcoursId);
    if (!parcours) return;

    let updatedModules: any[];

    if (editingModule) {
      updatedModules = parcours.modules.map((m) => {
        if (m.id === editingModule.id) {
          return {
            ...m,
            title: moduleFormData.title,
            subtitle: moduleFormData.subtitle,
            duration: moduleFormData.duration,
            horaires: moduleFormData.horaires,
            prerequis: moduleFormData.prerequis,
            price: moduleFormData.price,
          };
        }
        return m;
      });
    } else {
      const newModule: any = {
        title: moduleFormData.title,
        subtitle: moduleFormData.subtitle,
        duration: moduleFormData.duration,
        horaires: moduleFormData.horaires,
        prerequis: moduleFormData.prerequis,
        price: moduleFormData.price,
        parcours_id: parcours.id,
      };
      updatedModules = [...parcours.modules, newModule];
    }

    await dispatch(updateParcours({ 
      id: editingParcoursId, 
      data: { 
        ...parcours,
        modules: updatedModules 
      } 
    }));
    
    dispatch(showSuccess({ title: 'Succès', message: editingModule ? 'Module mis à jour avec succès' : 'Module créé avec succès' }));
    setIsModuleModalOpen(false);
    dispatch(fetchAllParcours());
  };

  const handleExportExcel = () => {
    const dataToExport = sessions.map(session => {
      let moduleTitle = 'Unknown Module';
      let parcoursTitle = 'Unknown Parcours';
      
      for (const p of parcoursList) {
        const mod = p.modules.find(m => m.id === session.parcours_module_id);
        if (mod) {
          moduleTitle = mod.title;
          parcoursTitle = p.title;
          break;
        }
      }

      return {
        'ID Session': session.id,
        'Parcours': parcoursTitle,
        'Module': moduleTitle,
        'Date Début': new Date(session.start_date).toLocaleDateString(),
        'Heure Début': new Date(session.start_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        'Date Fin': new Date(session.end_date).toLocaleDateString(),
        'Heure Fin': new Date(session.end_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        'Lieu': session.location,
        'Participants Max': session.max_participants,
        'Notes': session.notes || ''
      };
    });

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Agenda");
    XLSX.writeFile(wb, "agenda_export.xlsx");
  };

  // Filter displayed parcours
  const displayedParcours = selectedParcoursId 
    ? parcoursList.filter(p => p.id === selectedParcoursId)
    : [];

  return (
    <AdminLayout title="Calendrier des Modules">
      
      {/* Parcours Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {parcoursList.map((parcours) => (
          <div 
            key={parcours.id}
            onClick={() => setSelectedParcoursId(selectedParcoursId === parcours.id ? null : parcours.id)}
            className={`
              cursor-pointer rounded-xl p-6 transition-all duration-200 border-2
              ${selectedParcoursId === parcours.id 
                ? 'border-[#0a83ca] bg-[#f0f9ff] shadow-md transform scale-[1.02]' 
                : 'border-transparent bg-white shadow-sm hover:shadow-md hover:border-slate-200'
              }
            `}
          >
            <h3 className={`text-xl font-bold mb-2 ${selectedParcoursId === parcours.id ? 'text-[#0a83ca]' : 'text-slate-800'}`}>
              {parcours.title}
            </h3>
            <p className="text-slate-500 text-sm mb-4 line-clamp-2">
              {parcours.description || 'Aucune description'}
            </p>
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium text-slate-600">{parcours.modules?.length || 0} sessions</span>
              <span className={`
                px-3 py-1 rounded-full text-xs font-bold uppercase
                ${selectedParcoursId === parcours.id ? 'bg-[#0a83ca] text-white' : 'bg-slate-100 text-slate-500'}
              `}>
                {selectedParcoursId === parcours.id ? 'Sélectionné' : 'Voir le calendrier'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Calendar View */}
      {displayedParcours.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-6 overflow-x-auto animate-fadeIn">
          <div className="mb-6 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button 
                onClick={handlePrevDate}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors"
                title="Mois précédent"
              >
                <FaChevronLeft />
              </button>
              <h2 className="text-xl font-bold text-slate-800">
                {monthHeaders[0]?.label} - {monthHeaders[monthHeaders.length-1]?.label}
              </h2>
              <button 
                onClick={handleNextDate}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors"
                title="Mois suivant"
              >
                <FaChevronRight />
              </button>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-slate-500 hidden lg:block">
                Cliquez sur une cellule pour gérer les sessions, ou sur les détails de la session pour les modifier
              </div>
              <button
                onClick={handleExportExcel}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm text-sm font-medium"
              >
                <FaFileExcel /> Exporter Excel
              </button>
            </div>
          </div>

          {displayedParcours.map((parcours) => (
            <div key={parcours.id} className="mb-12">
              <div className="bg-[#0a83ca] text-white px-6 py-3 rounded-t-xl flex justify-between items-center">
                <h3 className="font-bold text-lg">{parcours.title}</h3>
              </div>
              
              <div className="overflow-x-auto border border-slate-200 rounded-b-xl">
                <table className="w-full border-collapse min-w-[1000px]">
                  <thead>
                    <tr>
                      <th className="text-left p-4 min-w-[250px] bg-[#0a83ca] text-white border-r border-white/20">SESSION</th>
                      <th className="p-3 bg-[#e8f4fd] text-[#0776bb] text-xs font-bold uppercase border border-[#dde7f1]">JOURS</th>
                      <th className="p-3 bg-[#e8f4fd] text-[#0776bb] text-xs font-bold uppercase border border-[#dde7f1]">HORAIRES</th>
                      <th className="p-3 bg-[#e8f4fd] text-[#0776bb] text-xs font-bold uppercase border border-[#dde7f1] min-w-[180px]">PRÉREQUIS</th>
                      <th className="p-3 bg-[#e8f4fd] text-[#0776bb] text-xs font-bold uppercase border border-[#dde7f1] min-w-[180px]">TARIF</th>
                      {monthHeaders.map((header, index) => (
                        <th key={index} className="p-3 min-w-[80px] bg-[#f5fbff] text-[#0776bb] text-xs font-bold uppercase border border-[#dde7f1]">
                          {editingHeaderIndex === index ? (
                            <input
                              type="month"
                              className="w-full text-xs p-1 border rounded"
                              value={`${header.date.getFullYear()}-${String(header.date.getMonth() + 1).padStart(2, '0')}`}
                              onChange={(e) => handleHeaderDateChange(index, e.target.value)}
                              onBlur={() => setEditingHeaderIndex(null)}
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <span 
                              onClick={() => setEditingHeaderIndex(index)}
                              className="cursor-pointer hover:text-[#0a83ca] hover:underline block w-full h-full"
                              title="Cliquez pour changer le mois"
                            >
                              {header.label}
                            </span>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parcours.modules?.map((module, idx) => (
                      <tr key={module.id} className="hover:bg-slate-50">
                        <td 
                          className="p-4 border border-[#dde7f1] cursor-pointer hover:bg-blue-50 transition-colors group relative"
                          onClick={() => handleModuleClick(parcours.id, module)}
                        >
                          <div className="text-xs font-bold text-[#0a83ca] mb-1">
                            {`Module ${idx + 1}`} {module.subtitle ? ` • ${module.subtitle}` : ''}
                          </div>
                          <div className="font-bold text-slate-800 text-sm">
                            {module.title}
                          </div>
                          <FaEdit className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 text-[#0a83ca]" />
                        </td>
                        <td 
                          className="p-3 text-center border border-[#dde7f1] text-sm cursor-pointer hover:bg-blue-50"
                          onClick={() => handleModuleClick(parcours.id, module)}
                        >
                          {module.duration || '-'}
                        </td>
                        <td 
                          className="p-3 text-center border border-[#dde7f1] text-sm cursor-pointer hover:bg-blue-50"
                          onClick={() => handleModuleClick(parcours.id, module)}
                        >
                          {module.horaires || '-'}
                        </td>
                        <td 
                          className="p-3 text-center border border-[#dde7f1] text-sm cursor-pointer hover:bg-blue-50 min-w-[180px]"
                          onClick={() => handleModuleClick(parcours.id, module)}
                        >
                          {module.prerequis || '-'}
                        </td>
                        <td 
                          className="p-3 text-center border border-[#dde7f1] text-sm font-bold text-slate-700 cursor-pointer hover:bg-blue-50 min-w-[180px]"
                          onClick={() => handleModuleClick(parcours.id, module)}
                        >
                          {formatPrice(module.price, '-')}
                        </td>
                        {monthHeaders.map((header) => {
                          const session = getSession(module.id!, header.key);

                          return (
                            <td
                              key={header.key}
                              onClick={() => handleCellClick(module.id!, header)}
                              className={`border border-[#dde7f1] cursor-pointer transition-colors text-center text-xs font-bold ${
                                session
                                  ? 'bg-[#fff4b8] hover:bg-[#ffe88a] text-slate-900'
                                  : 'hover:bg-slate-100'
                              }`}
                            >
                              {session ? (
                                <div className="flex justify-center items-center h-full py-2">
                                  <FaCheck />
                                </div>
                              ) : null}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                    <tr>
                      <td colSpan={5 + monthHeaders.length} className="p-2 border border-[#dde7f1]">
                        <button
                          onClick={() => handleAddModule(parcours.id)}
                          className="flex items-center gap-2 text-[#0a83ca] hover:text-[#086ba6] font-medium text-sm px-2 py-1 rounded hover:bg-blue-50 w-full justify-center"
                        >
                          <FaPlus /> Ajouter une session
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="text-slate-400 mb-4">
            <FaCalendarAlt className="w-12 h-12 mx-auto opacity-50" />
          </div>
          <h3 className="text-lg font-medium text-slate-800 mb-2">Sélectionnez un module</h3>
          <p className="text-slate-500">
            Cliquez sur l'une des cartes ci-dessus pour afficher et gérer son calendrier
          </p>
        </div>
      )}

      {/* Session Modal */}
      {isSessionModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100 animate-fadeIn">
            <div className="bg-gradient-to-r from-[#0a83ca] to-[#005f9e] px-8 py-6 flex justify-between items-center">
              <h3 className="text-white font-bold text-xl tracking-wide">
                {editingSession ? 'Modifier la session' : 'Nouvelle session'}
              </h3>
              <button 
                onClick={() => setIsSessionModalOpen(false)} 
                className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
                title="Fermer"
              >
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleSessionSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">Date début</label>
                  <input
                    type="date"
                    required
                    value={sessionFormData.start_date}
                    onChange={e => setSessionFormData({...sessionFormData, start_date: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0a83ca] focus:border-transparent transition-all outline-none"
                  />
              </div>

              <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">Date fin</label>
                  <input
                    type="date"
                    required
                    value={sessionFormData.end_date}
                    onChange={e => setSessionFormData({...sessionFormData, end_date: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0a83ca] focus:border-transparent transition-all outline-none"
                  />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Lieu</label>
                <input
                  type="text"
                  value={sessionFormData.location}
                  onChange={e => setSessionFormData({...sessionFormData, location: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0a83ca] focus:border-transparent transition-all outline-none"
                  placeholder="Ex: Salle de conférence A"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Places max</label>
                <input
                  type="number"
                  required
                  value={sessionFormData.max_participants}
                  onChange={e => setSessionFormData({...sessionFormData, max_participants: parseInt(e.target.value)})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0a83ca] focus:border-transparent transition-all outline-none"
                />
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t border-slate-100">
                {editingSession && (
                  <button
                    type="button"
                    onClick={() => setDeleteId(editingSession.id)}
                    className="px-5 py-2.5 text-red-600 hover:bg-red-50 rounded-xl font-semibold mr-auto transition-colors flex items-center gap-2"
                  >
                    <FaTrash className="text-sm" /> Supprimer
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsSessionModalOpen(false)}
                  className="px-6 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-8 py-2.5 bg-gradient-to-r from-[#0a83ca] to-[#005f9e] text-white rounded-xl font-bold hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Module Edit Modal */}
      {isModuleModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100 animate-fadeIn">
            <div className="bg-gradient-to-r from-[#0a83ca] to-[#005f9e] px-8 py-6 flex justify-between items-center">
              <h3 className="text-white font-bold text-xl tracking-wide">Modifier la session</h3>
              <button 
                onClick={() => setIsModuleModalOpen(false)} 
                className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
                title="Fermer"
              >
                <FaTimes />
              </button>
            </div>
            
            <form onSubmit={handleModuleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Titre</label>
                <input
                  type="text"
                  required
                  value={moduleFormData.title}
                  onChange={e => setModuleFormData({...moduleFormData, title: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0a83ca] focus:border-transparent transition-all outline-none"
                  placeholder="Titre de la session"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Sous-titre</label>
                <input
                  type="text"
                  value={moduleFormData.subtitle}
                  onChange={e => setModuleFormData({...moduleFormData, subtitle: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0a83ca] focus:border-transparent transition-all outline-none"
                  placeholder="Sous-titre optionnel"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">Durée (Jours)</label>
                  <input
                    type="text"
                    value={moduleFormData.duration}
                    onChange={e => setModuleFormData({...moduleFormData, duration: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0a83ca] focus:border-transparent transition-all outline-none"
                    placeholder="Ex: 2 jours"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">Tarif</label>
                  <input
                    type="text"
                    value={moduleFormData.price}
                    onChange={e => setModuleFormData({...moduleFormData, price: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0a83ca] focus:border-transparent transition-all outline-none"
                    placeholder="Ex: 250"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Horaires</label>
                <input
                  type="text"
                  value={moduleFormData.horaires}
                  onChange={e => setModuleFormData({...moduleFormData, horaires: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0a83ca] focus:border-transparent transition-all outline-none"
                  placeholder="Ex: 9h00 - 17h30"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Prérequis</label>
                <textarea
                  value={moduleFormData.prerequis}
                  onChange={e => setModuleFormData({...moduleFormData, prerequis: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0a83ca] focus:border-transparent transition-all outline-none"
                  rows={3}
                  placeholder="Prérequis pour cette session..."
                />
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t border-slate-100">
                {editingModule && (
                  <button
                    type="button"
                    onClick={handleDeleteModule}
                    className="px-5 py-2.5 text-red-600 hover:bg-red-50 rounded-xl font-semibold mr-auto transition-colors flex items-center gap-2"
                  >
                    <FaTrash className="text-sm" /> Supprimer
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsModuleModalOpen(false)}
                  className="px-6 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-8 py-2.5 bg-gradient-to-r from-[#0a83ca] to-[#005f9e] text-white rounded-xl font-bold hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteSession}
        title="Supprimer la session"
        message="Êtes-vous sûr de vouloir supprimer cette session ? Cette action est irréversible."
        type="danger"
        confirmText="Supprimer"
      />

      <ConfirmationModal
        isOpen={isDeleteModuleConfirmOpen}
        onClose={() => setIsDeleteModuleConfirmOpen(false)}
        onConfirm={confirmDeleteModule}
        title="Supprimer la session"
        message="Êtes-vous sûr de vouloir supprimer cette session ? Cette action est irréversible."
        type="danger"
        confirmText="Supprimer"
      />
    </AdminLayout>
  );
};

export default AdminAgendaPage;

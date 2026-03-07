import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { updateProfileAsync } from '../store/slices/userSlice';
import { selectCurrentUser, logoutAsync } from '../store/slices/simpleAuthSlice';
import { showSuccess, showError } from '../store/slices/uiSlice';
import { getProfileImageUrl } from '../services/baseApi';
import InputField from '../components/InputField';
import ChangeEmailModal from '../components/ChangeEmailModal';
import ChangePasswordModal from '../components/ChangePasswordModal';
import { CreditCardIcon } from '../components/icons/CreditCardIcon';
import { LogoutIcon } from '../components/icons/LogoutIcon';
import { fetchUserPayments, selectUserPayments } from '../store/slices/paymentsSlice';

interface UserFormData {
    firstName: string;
    lastName: string;
    dob: string;
    city: string;
    email: string;
    phone: string;
}

const ProfilePage: React.FC = () => {
    const dispatch = useAppDispatch();
    const currentUser = useAppSelector(selectCurrentUser);
    const isUpdating = useAppSelector(state => state.user.isUpdatingProfile);
    const profileError = useAppSelector(state => state.user.profileError);
    const userPayments = useAppSelector(state => currentUser ? selectUserPayments(state as any, currentUser.id) : []);
    
    // Previous: only confirmed payments. Now include pending + confirmed.
    const confirmedPayments = (userPayments || []).filter(p => p.status === 'confirmed');
    const pendingPayments = (userPayments || []).filter(p => p.status === 'pending');
    const recentDisplayPayments = [...confirmedPayments, ...pendingPayments]
        .sort((a: any, b: any) => new Date(b.created_at || b.payment_date || b.date).getTime() - new Date(a.created_at || a.payment_date || a.date).getTime())
        .slice(0, 10); // show up to 10 mixed payments
    
    const [isEditing, setIsEditing] = useState(false);
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [formData, setFormData] = useState<UserFormData>({
        firstName: '',
        lastName: '',
        dob: '',
        city: '',
        email: '',
        phone: '',
    });

    useEffect(() => {
        if (!currentUser) {
            window.location.hash = '#/login';
            return;
        }
        setFormData({
            firstName: currentUser.firstName || '',
            lastName: currentUser.lastName || '',
            dob: currentUser.dob || '',
            city: currentUser.city || '',
            email: currentUser.email || '',
            phone: currentUser.phone || '',
        });
        if (currentUser.id) {
            dispatch(fetchUserPayments(currentUser.id));
        }
    }, [currentUser, dispatch]);

    useEffect(() => {
        if (profileError) {
            dispatch(showError({
                title: 'Erreur de profil',
                message: profileError
            }));
        }
    }, [profileError, dispatch]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ 
            ...formData, 
            [e.target.name]: e.target.value 
        });
    };

    const handleSave = async () => {
        try {
            const updateData = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                dob: formData.dob,
                city: formData.city,
                phone: formData.phone,
            };
            
            await dispatch(updateProfileAsync(updateData)).unwrap();
            
            dispatch(showSuccess({
                title: 'Profil mis à jour',
                message: 'Vos informations ont été sauvegardées avec succès.'
            }));
            
            setIsEditing(false);
        } catch (error: any) {
            dispatch(showError({
                title: 'Erreur de sauvegarde',
                message: error.message || 'Une erreur est survenue lors de la sauvegarde.'
            }));
        }
    };
    
    const handleLogout = async () => {
        try {
            await dispatch(logoutAsync()).unwrap();
            window.location.hash = '#/login';
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
            window.location.hash = '#/login';
        }
    };

    const handleCancel = () => {
        if (currentUser) {
            setFormData({
                firstName: currentUser.firstName || '',
                lastName: currentUser.lastName || '',
                dob: currentUser.dob || '',
                city: currentUser.city || '',
                email: currentUser.email || '',
                phone: currentUser.phone || '',
            });
        }
        setIsEditing(false);
    };
    
    const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
        e.preventDefault();
        window.location.hash = path;
    };

    if (!currentUser) {
        return <div className="text-center py-20">Chargement du profil...</div>;
    }

    return (
        <div className="container mx-auto px-6 pt-32 pb-12">
            <div className="flex flex-col sm:flex-row items-center sm:items-start sm:space-x-8 mb-12 max-w-5xl mx-auto">
                <div className="relative">
                    <img 
                        src={getProfileImageUrl(currentUser.profilePicture)} 
                        alt="Profil" 
                        className="w-32 h-32 rounded-full object-cover mb-4 sm:mb-0 border-4 border-[#e13734] shadow-md" 
                    />
                </div>
                <div className="text-center sm:text-left flex-grow">
                    <h1 className="text-4xl font-bold text-slate-900">Bon retour, {currentUser.firstName}!</h1>
                    <p className="text-slate-600 mt-1">Voici votre tableau de bord personnel.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {/* Left Column: Profile Info */}
                <div className="lg:col-span-1">
                     <div className="bg-white rounded-xl shadow-lg p-8 h-full flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                           <h2 className="text-2xl font-bold text-slate-800">Informations Personnelles</h2>
                           {!isEditing && (
                                <button 
                                    onClick={() => setIsEditing(true)} 
                                    className="text-sm font-semibold text-[#e13734] hover:text-[#c42e2b]"
                                    disabled={isUpdating}
                                >
                                    Modifier
                                </button>
                            )}
                        </div>
                        <div className="space-y-4 flex-grow">
                            <InputField 
                                id="firstName" 
                                label="Prénom" 
                                type="text" 
                                value={formData.firstName} 
                                onChange={handleInputChange} 
                                required 
                                disabled={!isEditing || isUpdating} 
                            />
                            <InputField 
                                id="lastName" 
                                label="Nom de Famille" 
                                type="text" 
                                value={formData.lastName} 
                                onChange={handleInputChange} 
                                required 
                                disabled={!isEditing || isUpdating} 
                            />
                            <InputField 
                                id="dob" 
                                label="Date de Naissance" 
                                type="date" 
                                value={formData.dob} 
                                onChange={handleInputChange} 
                                required 
                                disabled={!isEditing || isUpdating} 
                            />
                            <InputField 
                                id="city" 
                                label="Ville" 
                                type="text" 
                                value={formData.city} 
                                onChange={handleInputChange} 
                                required 
                                disabled={!isEditing || isUpdating} 
                            />
                            <InputField 
                                id="phone" 
                                label="Téléphone" 
                                type="tel" 
                                value={formData.phone} 
                                onChange={handleInputChange} 
                                required 
                                disabled={!isEditing || isUpdating} 
                            />
                            <InputField 
                                id="email" 
                                label="E-mail" 
                                type="email" 
                                value={formData.email} 
                                onChange={handleInputChange} 
                                required 
                                disabled={true} // Email n'est jamais modifiable ici
                            />

                            {/* Boutons pour actions sécurisées */}
                            {!isEditing && (
                                <div className="space-y-2 pt-4">
                                    <button
                                        onClick={() => setIsEmailModalOpen(true)}
                                        className="w-full text-left px-3 py-2 text-sm text-[#e13734] hover:bg-red-50 rounded-lg transition-colors"
                                        disabled={isUpdating}
                                    >
                                        🔧 Changer l'Adresse E-mail
                                    </button>
                                    <button
                                        onClick={() => setIsPasswordModalOpen(true)}
                                        className="w-full text-left px-3 py-2 text-sm text-[#e13734] hover:bg-red-50 rounded-lg transition-colors"
                                        disabled={isUpdating}
                                    >
                                        🔒 Changer le Mot de Passe
                                    </button>
                                </div>
                            )}

                            {isEditing && (
                                 <div className="flex justify-end gap-2 pt-4">
                                     <button 
                                         onClick={handleCancel} 
                                         className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-full hover:bg-slate-200"
                                         disabled={isUpdating}
                                     >
                                         Annuler
                                     </button>
                                     <button 
                                         onClick={handleSave} 
                                         className="px-4 py-2 text-sm font-semibold text-white bg-[#e13734] rounded-full hover:bg-[#c42e2b] disabled:opacity-50"
                                         disabled={isUpdating}
                                     >
                                         {isUpdating ? 'Sauvegarde...' : 'Enregistrer'}
                                     </button>
                                 </div>
                            )}
                        </div>
                         <div className="mt-6 pt-6 border-t border-slate-200">
                           <button 
                               onClick={handleLogout}
                               className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-red-700 bg-red-100 rounded-full hover:bg-red-200 transition-colors"
                               disabled={isUpdating}
                           >
                               <LogoutIcon className="w-5 h-5" />
                               <span>Se déconnecter</span>
                           </button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Dashboard Widgets */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-xl shadow-lg p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <CreditCardIcon className="w-6 h-6 text-slate-500" />
                            <h2 className="text-2xl font-bold text-slate-800">Historique des Paiements</h2>
                            <span className="ml-auto text-xs font-medium text-slate-500">{confirmedPayments.length} confirmés · {pendingPayments.length} en attente</span>
                        </div>
                        {recentDisplayPayments.length > 0 ? (
                            <div className="space-y-4">
                                {recentDisplayPayments.map((payment: any, index: number) => {
                                    const dateStr = new Date(payment.payment_date || payment.created_at || payment.date).toLocaleDateString();
                                    const isConfirmed = payment.status === 'confirmed';
                                    const statusClasses = isConfirmed
                                        ? 'bg-green-100 text-green-700'
                                        : payment.status === 'pending'
                                            ? 'bg-yellow-100 text-yellow-700'
                                            : 'bg-slate-200 text-slate-600';
                                    const statusLabel = payment.status?.toUpperCase();
                                    const enrollment = payment.enrollment || {};
                                    const isCourse = !!enrollment.course_id && enrollment.course;
                                    const sessionLabel = isCourse
                                        ? `Module: ${enrollment.course?.title || 'N/D'}`
                                        : 'Inscription';
                                    return (
                                        <div key={`payment-${payment.id || index}`} className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                                            <div className="flex flex-col">
                                                <p className="font-semibold text-slate-800 flex items-center gap-2">
                                                    {payment.month ? `Mois ${payment.month}` : `Paiement #${index + 1}`}
                                                    <span className="text-xs font-medium text-slate-500">{sessionLabel}</span>
                                                </p>
                                                <p className="text-sm text-slate-500">{dateStr}</p>
                                                <div className="mt-1 flex items-center gap-2">
                                                    <span className={`inline-block px-2 py-0.5 text-xs rounded-full font-medium ${statusClasses}`}>{statusLabel}</span>
                                                    {enrollment.group_data && (
                                                        <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-slate-100 text-slate-600">
                                                            {enrollment.group_data?.type || enrollment.group_data?.modality_type || 'Groupe'}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-green-600">{Number(payment.amount).toLocaleString('de-DE')} MAD</p>
                                                {payment.month && (
                                                    <p className="text-[11px] text-slate-500 mt-1">{isCourse ? 'Module' : ''}</p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-center text-slate-500 py-4">Aucun paiement trouvé.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            <ChangeEmailModal 
                isOpen={isEmailModalOpen} 
                onClose={() => setIsEmailModalOpen(false)} 
            />
            <ChangePasswordModal 
                isOpen={isPasswordModalOpen} 
                onClose={() => setIsPasswordModalOpen(false)} 
            />
        </div>
    );
};

export default ProfilePage;
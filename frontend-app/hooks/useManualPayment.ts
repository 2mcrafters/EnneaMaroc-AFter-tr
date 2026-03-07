import { useState } from 'react';
import { useAppDispatch } from '../store';
import { PaymentFormData } from '../components/ManualPaymentModal';

interface UseManualPaymentProps {
    student: any;
    enrollments: any[];
    onPaymentSuccess?: (paymentData: PaymentFormData) => void;
    registrationFee?: number;
}

/**
 * Hook personnalisé pour gérer les paiements manuels
 * Peut être utilisé dans n'importe quelle page qui a besoin de cette fonctionnalité
 */
export const useManualPayment = ({
    student,
    enrollments,
    onPaymentSuccess,
    registrationFee = 250
}: UseManualPaymentProps) => {
    const dispatch = useAppDispatch();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const openPaymentModal = (enrollmentId: string) => {
        setSelectedEnrollmentId(enrollmentId);
        setIsModalOpen(true);
    };

    const closePaymentModal = () => {
        setIsModalOpen(false);
        setSelectedEnrollmentId(null);
    };

    const processPayment = async (paymentData: PaymentFormData) => {
        setIsProcessing(true);
        
        try {
            // Récupérer l'inscription
            const enrollment = enrollments.find(e => e.id === paymentData.enrollmentId);
            if (!enrollment) {
                throw new Error('Enrollment not found');
            }

            // Vérifier si l'étudiant a déjà payé les frais d'inscription
            const requiresFee = !(student?.hasPaidRegistrationFee === true || student?.has_paid_registration_fee === true) && paymentData.month === 1;

            // Créer l'objet de données pour Redux
            const paymentDataForRedux = {
                enrollment_id: parseInt(paymentData.enrollmentId),
                user_id: parseInt(student.id || student.user_id),
                amount: paymentData.amount,
                month: paymentData.month,
                course_price: enrollment.group?.price || enrollment.basePrice || 0,
                registration_fee: requiresFee ? Math.min(paymentData.amount - (enrollment.group?.price || enrollment.basePrice || 0), registrationFee) : 0,
                created_at: new Date().toISOString(),
                payment_method: paymentData.paymentMethod,
                payment_proof: paymentData.paymentProof,
                status: 'confirmed'
            };

            // Dispatch vers Redux
            dispatch({ 
                type: 'payments/createPayment', 
                payload: paymentDataForRedux 
            });

            // Mettre à jour le statut de l'inscription si nécessaire
            if ((enrollment.status === 'pending_payment' || enrollment.status === 'pending_confirmation') && paymentData.month === 1) {
                dispatch({
                    type: 'enrollments/updateEnrollmentStatus',
                    payload: {
                        id: parseInt(paymentData.enrollmentId),
                        status: 'active'
                    }
                });
            }

            // Mettre à jour le statut des frais d'inscription si nécessaire
            if (requiresFee && paymentData.amount >= (enrollment.group?.price || enrollment.basePrice || 0) + registrationFee) {
                dispatch({
                    type: 'users/updateRegistrationFeeStatus',
                    payload: {
                        id: parseInt(student.id || student.user_id),
                        has_paid_registration_fee: true
                    }
                });
            }

            // Callback de succès
            if (onPaymentSuccess) {
                onPaymentSuccess(paymentData);
            }

            closePaymentModal();
            
            return { success: true, data: paymentDataForRedux };
        } catch (error) {
            console.error('Error processing payment:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        } finally {
            setIsProcessing(false);
        }
    };

    const getEnrollmentModalData = (enrollmentId: string) => {
        const enrollment = enrollments.find(e => e.id === enrollmentId);
        if (!enrollment) return null;

        const requiresRegistrationFee = !(student?.hasPaidRegistrationFee === true || student?.has_paid_registration_fee === true);

        // Adapter les différents formats de données d'inscription
        const title = enrollment.title || enrollment.itemTitle || 'Unknown';
        const durationMonths = enrollment.durationMonths || enrollment.duration_months || 1;
        const basePrice = enrollment.group?.price || enrollment.basePrice || enrollment.price || 0;
        const existingPayments = enrollment.payments?.map((p: any) => ({ 
            month: p.month, 
            status: p.status === 'confirmed' ? 'Confirmed' : p.status 
        })) || [];

        return {
            id: enrollment.id,
            title,
            durationMonths,
            basePrice,
            requiresRegistrationFee,
            registrationFee,
            existingPayments
        };
    };

    return {
        isModalOpen,
        selectedEnrollmentId,
        isProcessing,
        openPaymentModal,
        closePaymentModal,
        processPayment,
        getEnrollmentModalData
    };
};

/**
 * Exemple d'utilisation :
 * 
 * ```tsx
 * import { useManualPayment } from '../hooks/useManualPayment';
 * import ManualPaymentModal from '../components/ManualPaymentModal';
 * 
 * const MyComponent = () => {
 *     const {
 *         isModalOpen,
 *         selectedEnrollmentId,
 *         isProcessing,
 *         openPaymentModal,
 *         closePaymentModal,
 *         processPayment,
 *         getEnrollmentModalData
 *     } = useManualPayment({
 *         student: myStudent,
 *         enrollments: myEnrollments,
 *         onPaymentSuccess: (paymentData) => {
 *             console.log('Payment added:', paymentData);
 *             // Refresh data or update UI
 *         }
 *     });
 * 
 *     return (
 *         <div>
 *             <button onClick={() => openPaymentModal('enrollment-id')}>
 *                 Add Payment
 *             </button>
 * 
 *             <ManualPaymentModal
 *                 isOpen={isModalOpen}
 *                 onClose={closePaymentModal}
 *                 onSubmit={processPayment}
 *                 enrollmentData={selectedEnrollmentId ? getEnrollmentModalData(selectedEnrollmentId) : null}
 *             />
 *         </div>
 *     );
 * };
 * ```
 */
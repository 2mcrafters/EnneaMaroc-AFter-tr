import React, { useState } from 'react';
import ManualPaymentModal, { PaymentFormData } from './ManualPaymentModal';

interface PaymentManagerProps {
    enrollments: Array<{
        id: string;
        title: string;
        durationMonths: number;
        basePrice: number;
        existingPayments: Array<{ month: number; status: string }>;
    }>;
    student: {
        id: string;
        hasPaidRegistrationFee: boolean;
    };
    onPaymentAdded: (paymentData: PaymentFormData) => void;
}

/**
 * Composant réutilisable pour gérer les paiements manuels
 * Peut être utilisé dans n'importe quelle page qui a besoin d'ajouter des paiements manuels
 */
const PaymentManager: React.FC<PaymentManagerProps> = ({
    enrollments,
    student,
    onPaymentAdded
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<string | null>(null);

    const REGISTRATION_FEE = 250;

    const handleOpenModal = (enrollmentId: string) => {
        setSelectedEnrollmentId(enrollmentId);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedEnrollmentId(null);
    };

    const handleSubmitPayment = (paymentData: PaymentFormData) => {
        onPaymentAdded(paymentData);
        handleCloseModal();
    };

    const getEnrollmentModalData = (enrollmentId: string) => {
        const enrollment = enrollments.find(e => e.id === enrollmentId);
        if (!enrollment) return null;

        return {
            id: enrollment.id,
            title: enrollment.title,
            durationMonths: enrollment.durationMonths,
            basePrice: enrollment.basePrice,
            requiresRegistrationFee: !student.hasPaidRegistrationFee,
            registrationFee: REGISTRATION_FEE,
            existingPayments: enrollment.existingPayments
        };
    };

    return (
        <div>
            {/* Liste des inscriptions avec boutons pour ajouter des paiements */}
            <div className="space-y-4">
                {enrollments.map(enrollment => (
                    <div key={enrollment.id} className="bg-white p-4 rounded-lg shadow border border-slate-200">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="font-semibold text-slate-800">{enrollment.title}</h3>
                                <p className="text-sm text-slate-500">
                                    Price: {enrollment.basePrice} MAD - Duration: {enrollment.durationMonths} months
                                </p>
                                <p className="text-xs text-slate-400">
                                    Paiements: {enrollment.existingPayments.filter(p => p.status === 'Confirmed').length}/{enrollment.durationMonths}
                                </p>
                            </div>
                            <button
                                onClick={() => handleOpenModal(enrollment.id)}
                                className="px-4 py-2 bg-pistachio-dark text-white rounded-lg hover:bg-pistachio-darker transition-colors"
                            >
                                Add Payment
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal pour ajouter un paiement */}
            <ManualPaymentModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleSubmitPayment}
                enrollmentData={selectedEnrollmentId ? getEnrollmentModalData(selectedEnrollmentId) : null}
            />
        </div>
    );
};

export default PaymentManager;

/**
 * Exemple d'utilisation dans une autre page :
 * 
 * ```tsx
 * import PaymentManager from '../components/PaymentManager';
 * 
 * const MyPage = () => {
 *     const enrollments = [
 *         {
 *             id: "1",
 *             title: "Math Course",
 *             durationMonths: 6,
 *             basePrice: 500,
 *             existingPayments: [
 *                 { month: 1, status: 'Confirmed' },
 *                 { month: 2, status: 'Pending Confirmation' }
 *             ]
 *         }
 *     ];
 * 
 *     const student = {
 *         id: "student1",
 *         hasPaidRegistrationFee: false
 *     };
 * 
 *     const handlePaymentAdded = (paymentData) => {
 *         console.log('New payment:', paymentData);
 *         // Ici vous pouvez dispatch vers Redux ou faire un appel API
 *     };
 * 
 *     return (
 *         <div>
 *             <h1>Student Payments</h1>
 *             <PaymentManager
 *                 enrollments={enrollments}
 *                 student={student}
 *                 onPaymentAdded={handlePaymentAdded}
 *             />
 *         </div>
 *     );
 * };
 * ```
 */
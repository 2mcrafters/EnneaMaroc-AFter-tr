import React, { useState, useEffect } from 'react';

interface ManualPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (paymentData: PaymentFormData) => void;
    enrollmentData: {
        id: string;
        title: string;
        durationMonths: number;
        basePrice: number;
        requiresRegistrationFee: boolean;
        registrationFee: number;
        existingPayments: { month: number; status: string }[];
    } | null;
}

export interface PaymentFormData {
    enrollmentId: string;
    month: number;
    amount: number;
    paymentMethod: string;
    paymentProof: string;
}

interface FormErrors {
    enrollmentId?: string;
    month?: string;
    amount?: string;
    paymentMethod?: string;
    paymentProof?: string;
}

const ManualPaymentModal: React.FC<ManualPaymentModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    enrollmentData
}) => {
    const [formData, setFormData] = useState<PaymentFormData>({
        enrollmentId: '',
        month: 1,
        amount: 0,
        paymentMethod: '',
        paymentProof: ''
    });

    const [errors, setErrors] = useState<FormErrors>({});

    useEffect(() => {
        if (enrollmentData) {
            const defaultMonth = getNextDueMonth();
            const defaultAmount = calculateDefaultAmount(defaultMonth);
            
            setFormData({
                enrollmentId: enrollmentData.id,
                month: defaultMonth,
                amount: defaultAmount,
                paymentMethod: 'Espèces',
                paymentProof: 'Saisie Manuelle Administrateur'
            });
        }
    }, [enrollmentData]);

    const getNextDueMonth = (): number => {
        if (!enrollmentData) return 1;
        
        const paidMonths = enrollmentData.existingPayments
            .filter(p => p.status === 'Confirmed')
            .map(p => p.month);
        
        for (let month = 1; month <= enrollmentData.durationMonths; month++) {
            if (!paidMonths.includes(month)) {
                return month;
            }
        }
        return 1;
    };

    const calculateDefaultAmount = (month: number): number => {
        if (!enrollmentData) return 0;
        
        const requiresFee = enrollmentData.requiresRegistrationFee && month === 1;
        return enrollmentData.basePrice + (requiresFee ? enrollmentData.registrationFee : 0);
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.month || formData.month < 1 || formData.month > (enrollmentData?.durationMonths || 12)) {
            newErrors.month = `Month must be between 1 and ${enrollmentData?.durationMonths || 12}`;
        }

        if (!formData.amount || formData.amount <= 0) {
            newErrors.amount = 'Amount must be greater than 0';
        }

        if (!formData.paymentMethod.trim()) {
            newErrors.paymentMethod = 'La méthode de paiement est requise';
        }

        // Check if payment already exists for this month
        const existingPayment = enrollmentData?.existingPayments.find(p => p.month === formData.month);
        if (existingPayment && existingPayment.status === 'Confirmed') {
            newErrors.month = `Month ${formData.month} is already paid`;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        onSubmit(formData);
        handleClose();
    };

    const handleClose = () => {
        setFormData({
            enrollmentId: '',
            month: 1,
            amount: 0,
            paymentMethod: 'Espèces',
            paymentProof: ''
        });
        setErrors({});
        onClose();
    };

    const handleMonthChange = (month: number) => {
        setFormData(prev => ({
            ...prev,
            month,
            amount: calculateDefaultAmount(month)
        }));
    };

    if (!isOpen || !enrollmentData) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-slate-800">Ajouter un Paiement Manuel</h2>
                        <button
                            onClick={handleClose}
                            className="text-slate-400 hover:text-slate-600 text-2xl font-bold"
                        >
                            ×
                        </button>
                    </div>

                    <div className="mb-4 p-4 bg-slate-50 rounded-lg">
                        <h3 className="font-semibold text-slate-700 mb-2">{enrollmentData.title}</h3>
                        <div className="text-sm text-slate-600">
                            <p>Prix de Base: {enrollmentData.basePrice} MAD</p>
                            {enrollmentData.requiresRegistrationFee && (
                                <p>Frais d'Inscription: {enrollmentData.registrationFee} MAD</p>
                            )}
                            <p>Durée: {enrollmentData.durationMonths} mois</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Mois
                            </label>
                            <select
                                value={formData.month}
                                onChange={(e) => handleMonthChange(parseInt(e.target.value))}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pistachio-dark focus:border-transparent"
                            >
                                {Array.from({ length: enrollmentData.durationMonths }, (_, i) => i + 1).map(month => {
                                    const isPaid = enrollmentData.existingPayments.some(p => p.month === month && p.status === 'Confirmed');
                                    return (
                                        <option key={month} value={month} disabled={isPaid}>
                                            Mois {month} {isPaid ? '(Déjà Payé)' : ''}
                                        </option>
                                    );
                                })}
                            </select>
                            {errors.month && <p className="text-red-500 text-sm mt-1">{errors.month}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Montant (MAD)
                            </label>
                            <input
                                type="number"
                                value={formData.amount}
                                onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pistachio-dark focus:border-transparent"
                                placeholder="Saisir le montant"
                                min="0"
                                step="0.01"
                            />
                            {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
                            <p className="text-xs text-slate-500 mt-1">
                                Suggéré: {calculateDefaultAmount(formData.month)} MAD
                                {enrollmentData.requiresRegistrationFee && formData.month === 1 && 
                                    ` (${enrollmentData.basePrice} + ${enrollmentData.registrationFee} frais d'inscription)`
                                }
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Méthode de Paiement
                            </label>
                            <select
                                value={formData.paymentMethod}
                                onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pistachio-dark focus:border-transparent"
                            >
                                <option value="Espèces">Espèces</option>
                                <option value="Virement Bancaire">Virement Bancaire</option>
                                <option value="Chèque">Chèque</option>
                                <option value="Paiement par Carte">Paiement par Carte</option>
                                <option value="Paiement Mobile">Paiement Mobile</option>
                                <option value="Autre">Autre</option>
                            </select>
                            {errors.paymentMethod && <p className="text-red-500 text-sm mt-1">{errors.paymentMethod}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Preuve/Référence de Paiement
                            </label>
                            <input
                                type="text"
                                value={formData.paymentProof}
                                onChange={(e) => setFormData(prev => ({ ...prev, paymentProof: e.target.value }))}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pistachio-dark focus:border-transparent"
                                placeholder="Saisir numéro de référence, ID de reçu, etc."
                            />
                            <p className="text-xs text-slate-500 mt-1">
                                Optionnel: Ajouter un numéro de référence ou des notes sur ce paiement
                            </p>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="flex-1 px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg font-semibold transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-4 py-2 text-white bg-pistachio-dark hover:bg-pistachio-darker rounded-lg font-semibold transition-colors"
                            >
                                Ajouter Paiement
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ManualPaymentModal;
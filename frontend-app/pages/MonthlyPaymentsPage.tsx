import React, { useState, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from "../store";

import { CheckCircleIcon } from "../components/icons/CheckCircleIcon";
import { ClockIcon } from "../components/icons/ClockIcon";
import { PaperclipIcon } from "../components/icons/PaperclipIcon";
import { LockIcon } from "../components/icons/LockIcon";
import RefreshButton from "../components/RefreshButton";
import ConfirmationModal from "../components/ConfirmationModal";
import { fetchAllParcours } from "../store/slices/parcoursSlice";
import {
  fetchUserEnrollments,
  selectUserEnrollments,
} from "../store/enrollmentsSlice";
import {
  fetchUserPayments,
  selectUserPayments,
} from "../store/slices/paymentsSlice";
import { selectUsers } from "../store/slices/userSlice";
import { getCourseImageUrl } from "../services/baseApi";
import paymentService from "../services/paymentService";
import { refreshUserData } from "../utils/dataPreloader";

const MonthlyPaymentsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const authUser = useAppSelector((state) => state.auth.user);
  const userEnrollments = useAppSelector((state) =>
    selectUserEnrollments(state, authUser?.id || 0)
  );
  const courses = useAppSelector((state) => state.parcours.items);
  const userPayments = useAppSelector((state) =>
    selectUserPayments(state, authUser?.id || 0)
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedEnrollmentForPayment, setSelectedEnrollmentForPayment] =
    useState<{ id: number; month: number } | null>(null);
  const [confirmationModal, setConfirmationModal] = useState<{
    show: boolean;
    type: "success" | "danger";
    title: string;
    message: string;
  }>({
    show: false,
    type: "success",
    title: "",
    message: "",
  });

  console.log("Debug MonthlyPayments:", {
    authUserId: authUser?.id,
    userEnrollments: userEnrollments,
    userPayments: userPayments,
    enrollmentStatuses: userEnrollments.map((e) => ({
      id: e.id,
      status: e.status,
    })),
  });

  // Filter only active enrollments for monthly payments page
  const activeEnrollments = userEnrollments.filter(
    (e) => e.status === "active" || e.status === "pending_confirmation"
  );

  const loadData = async () => {
    if (authUser) {
      await refreshUserData(dispatch, authUser.id);
    }
  };

  useEffect(() => {
    loadData();
  }, [authUser]);

  const getItemDetails = (enrollment: any) => {
    if (enrollment.course_id) {
      return {
        item: courses.find((c) => c.id === enrollment.course_id),
        itemType: "course" as const,
      };
    }
    return null;
  };

  const handleUploadClick = (enrollmentId: number, month: number) => {
    setSelectedEnrollmentForPayment({ id: enrollmentId, month });
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (
      e.target.files &&
      e.target.files[0] &&
      selectedEnrollmentForPayment &&
      authUser
    ) {
      const file = e.target.files[0];
      const { id: enrollmentId, month } = selectedEnrollmentForPayment;

      try {
        // Find the enrollment to get the price
        const enrollment = activeEnrollments.find((e) => e.id === enrollmentId);
        if (!enrollment) return;

        const amount = enrollment.group_data?.price || 0;

        // First create the payment without file
        const newPayment = await paymentService.createPayment({
          enrollment_id: enrollmentId,
          amount: amount,
          month: month,
        });

        // Then upload the proof file
        await paymentService.uploadPaymentProof(newPayment.id, file);

        setConfirmationModal({
          show: true,
          type: "success",
          title: "Preuve de Paiement Soumise",
          message: `Preuve "${file.name}" pour le mois ${month} soumise avec succès ! Votre paiement est maintenant en attente de confirmation.`,
        });

        // Refresh data
        await loadData();
        setSelectedEnrollmentForPayment(null);
      } catch (error) {
        console.error("Error creating payment:", error);
        setConfirmationModal({
          show: true,
          type: "danger",
          title: "Échec de Soumission du Paiement",
          message:
            "Erreur lors de la soumission de la preuve de paiement. Veuillez réessayer.",
        });
      }
    }
  };

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 text-center flex-grow">
          Gérer les Paiements Mensuels
        </h1>
        <RefreshButton onRefreshComplete={() => loadData()} />
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*,.pdf"
      />

      {activeEnrollments.length > 0 ? (
        <div className="max-w-4xl mx-auto space-y-8">
          {activeEnrollments.map((enrollment) => {
            const itemInfo = getItemDetails(enrollment);
            if (!itemInfo || !itemInfo.item) return null;

            const { item, itemType } = itemInfo;

            // Get payments for this enrollment
            const enrollmentPayments = userPayments.filter(
              (p) => p.enrollment_id === enrollment.id
            );
            const durationMonths = enrollment.group_data?.durationMonths || 12;

            return (
              <div
                key={enrollment.id}
                className="bg-white p-6 rounded-xl shadow-lg border border-slate-200"
              >
                <div className="flex flex-col sm:flex-row gap-6 mb-6">
                  <img
                    src={getCourseImageUrl(
                      (item as any)?.image_url,
                      (item as any)?.slug
                    )}
                    alt={item.title}
                    className="w-full sm:w-32 h-32 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-grow">
                    <h2 className="text-2xl font-bold text-slate-800">
                      {item.title}
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      Actif depuis :{" "}
                      {new Date(
                        enrollment.created_at || enrollment.updated_at
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {Array.from({ length: durationMonths }, (_, i) => i + 1).map(
                    (month) => {
                      let monthStatus: "paid" | "pending" | "due" | "locked" =
                        "locked";
                      const payment = enrollmentPayments.find(
                        (p) => p.month === month
                      );

                      if (payment) {
                        monthStatus =
                          payment.status === "confirmed" ? "paid" : "pending";
                      } else {
                        const confirmedPayments = enrollmentPayments.filter(
                          (p) => p.status === "confirmed"
                        );
                        const nextDueMonth = confirmedPayments.length + 1;
                        if (month === nextDueMonth) {
                          monthStatus = "due";
                        }
                      }

                      return (
                        <div
                          key={month}
                          className={`p-3 rounded-lg text-center border ${
                            {
                              paid: "bg-green-50 border-green-200",
                              pending: "bg-blue-50 border-blue-200",
                              due: "bg-yellow-50 border-yellow-300",
                              locked: "bg-slate-50 border-slate-200",
                            }[monthStatus]
                          }`}
                        >
                          <p className="font-bold text-sm text-slate-800">
                            Mois {month}
                          </p>
                          <div className="my-2 flex justify-center">
                            {monthStatus === "paid" && (
                              <CheckCircleIcon className="w-6 h-6 text-green-500" />
                            )}
                            {monthStatus === "pending" && (
                              <ClockIcon className="w-6 h-6 text-blue-500" />
                            )}
                            {monthStatus === "due" && (
                              <PaperclipIcon className="w-6 h-6 text-yellow-600" />
                            )}
                            {monthStatus === "locked" && (
                              <LockIcon className="w-6 h-6 text-slate-400" />
                            )}
                          </div>
                          {monthStatus === "due" ? (
                            <button
                              onClick={() =>
                                handleUploadClick(enrollment.id, month)
                              }
                              className="w-full text-xs font-semibold text-yellow-900 bg-yellow-300 hover:bg-yellow-400 rounded-full py-1 transition-colors"
                            >
                              Payer Maintenant
                            </button>
                          ) : (
                            <p className="text-xs text-slate-500 capitalize">
                              {monthStatus === "paid"
                                ? "payé"
                                : monthStatus === "pending"
                                ? "en attente"
                                : monthStatus === "locked"
                                ? "verrouillé"
                                : "dû"}
                            </p>
                          )}
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-center text-slate-600 mt-8">
          Vous n'avez aucune inscription active avec des paiements récurrents.
        </p>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.show}
        onConfirm={() =>
          setConfirmationModal((prev) => ({ ...prev, show: false }))
        }
        onClose={() =>
          setConfirmationModal((prev) => ({ ...prev, show: false }))
        }
        title={confirmationModal.title}
        message={confirmationModal.message}
        confirmText="OK"
        type={confirmationModal.type}
      />
    </div>
  );
};

export default MonthlyPaymentsPage;
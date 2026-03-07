import React, { useState, useEffect } from 'react';
import { useAppDispatch } from "../../store";
import { showSuccess, showError } from "../../store/slices/uiSlice";
import { apiService } from "../../services/api";
import { useReduxDataReadOnly } from "../../hooks/useReduxData";
import { CheckCircleIcon } from "../icons/CheckCircleIcon";
import { ClockIcon } from "../icons/ClockIcon";
import { LockIcon } from "../icons/LockIcon";
import { PaperclipIcon } from "../icons/PaperclipIcon";
import { ChevronDownIcon } from "../icons/ChevronDownIcon";
import ConfirmationModal from "../ConfirmationModal";
import ProfileImage from "../ProfileImage";

interface Payment {
  id?: number;
  date: string;
  amount: number;
  proof: string | null;
  status: "Confirmed" | "Pending Confirmation";
  month: number;
}
interface Enrollment {
  id: string;
  itemId: string;
  itemType: "course";
  itemTitle: string;
  itemSubtitle?: string;
  group: { price: number };
  status: "Pending Payment" | "Pending Confirmation" | "Active" | "Cancelled";
  enrolledDate: string;
  userId: string;
  payments?: Payment[];
  durationMonths: number;
  imageUrl?: string;
}

interface SimplifiedItem {
  id: string;
  title: string;
  imageUrl: string;
  shortDescription?: string;
}

type Course = SimplifiedItem;
type ActiveTab = "info" | "courses" | "payments";

const TabButton: React.FC<{
  tab: ActiveTab;
  activeTab: ActiveTab;
  setTab: (tab: ActiveTab) => void;
  children: React.ReactNode;
}> = ({ tab, activeTab, setTab, children }) => (
  <button
    onClick={() => setTab(tab)}
    className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors focus:outline-none ${
      activeTab === tab
        ? "bg-white border-slate-200 border-t border-l border-r text-pistachio-dark"
        : "bg-slate-50 text-slate-500 hover:bg-slate-100"
    }`}
  >
    {children}
  </button>
);

const EnrollmentCard: React.FC<{
  enrollment: Enrollment;
  item: Course | undefined;
  isExpanded: boolean;
  onToggle: () => void;
  onMarkPaid: (enrollmentId: string, month: number) => void;
}> = ({ enrollment, item, isExpanded, onToggle, onMarkPaid }) => {
  // Fallback to item if enrollment doesn't have specific title/image
  const displayTitle = enrollment.itemTitle || item?.title || "Unknown Module";
  const displayImage = enrollment.imageUrl || item?.imageUrl || "";

  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
      <div className="p-4 flex flex-col sm:flex-row gap-4">
        {displayImage && (
          <img
            src={displayImage}
            alt={displayTitle}
            className="w-full sm:w-24 h-24 object-cover rounded-md flex-shrink-0"
          />
        )}
        <div className="flex-grow">
          <h4 className="font-bold text-slate-800">{displayTitle}</h4>
          {enrollment.itemSubtitle && (
            <p className="text-xs text-slate-500 mt-1">{enrollment.itemSubtitle}</p>
          )}
          <p className="text-sm text-slate-500 mt-1">
            Enrolled: {new Date(enrollment.enrolledDate).toLocaleDateString()}
          </p>
          <span
            className={`mt-2 inline-block px-2 py-1 text-xs font-semibold rounded-full ${
              enrollment.status === "Active"
                ? "bg-green-100 text-green-800"
                : enrollment.status === "Cancelled"
                ? "bg-red-100 text-red-800"
                : enrollment.status === "Pending Confirmation"
                ? "bg-blue-100 text-blue-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {enrollment.status}
          </span>
        </div>
        <div className="flex-shrink-0 flex items-center">
          <button
            onClick={onToggle}
            className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
          >
            <span>Voir Statut Paiement</span>
            <ChevronDownIcon
              className={`w-4 h-4 transition-transform ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>
      </div>
      {isExpanded && (
        <div className="p-4 bg-slate-50 border-t border-slate-200">
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {Array.from(
              { length: enrollment.durationMonths },
              (_, i) => i + 1
            ).map((month) => {
              let monthStatus: "paid" | "pending" | "due" | "locked" = "locked";
              const payment = enrollment.payments?.find(
                (p) => p.month === month
              );

              if (enrollment.status === "Pending Payment" && month === 1) {
                monthStatus = "due";
              } else if (
                enrollment.status === "Pending Confirmation" &&
                month === 1
              ) {
                monthStatus = "pending";
              } else if (payment) {
                monthStatus =
                  payment.status === "Confirmed" ? "paid" : "pending";
              } else if (enrollment.status === "Active") {
                const totalPaymentsMade = enrollment.payments?.length || 0;
                const nextDueMonth = totalPaymentsMade + 1;
                if (month === nextDueMonth) {
                  monthStatus = "due";
                }
              }

              const canMarkPaid = !payment || payment.status !== "Confirmed";

              return (
                <div
                  key={month}
                  className={`p-3 rounded-lg text-center border flex flex-col justify-between ${
                    {
                      paid: "bg-green-50 border-green-200",
                      pending: "bg-blue-50 border-blue-200",
                      due: "bg-yellow-50 border-yellow-300",
                      locked: "bg-slate-100 border-slate-200",
                    }[monthStatus]
                  }`}
                >
                  <div>
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
                    <p className="text-xs text-slate-500 capitalize">
                      {monthStatus}
                    </p>
                  </div>
                  {canMarkPaid && (
                    <button
                      onClick={() => onMarkPaid(enrollment.id, month)}
                      className="mt-2 w-full text-xs font-semibold text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-full py-1 transition-colors"
                    >
                      Confirm Payment
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

interface StudentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: any;
}

const StudentDetailModal: React.FC<StudentDetailModalProps> = ({ isOpen, onClose, student }) => {
  const dispatch = useAppDispatch();

  const {
    coursesState: courses,
    enrollmentsState: enrollments,
    paymentsState: payments,
    isDataAvailable,
  } = useReduxDataReadOnly();

  const [studentEnrollments, setStudentEnrollments] = useState<Enrollment[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>("info");
  const [expandedEnrollmentId, setExpandedEnrollmentId] = useState<string | null>(null);
  const [confirmModalData, setConfirmModalData] = useState<{
    isOpen: boolean;
    enrollmentId: string;
    month: number;
    title: string;
    message: string;
  }>({
    isOpen: false,
    enrollmentId: "",
    month: 0,
    title: "",
    message: "",
  });
  const REGISTRATION_FEE = 250;

  const loadData = () => {
    if (!student || !isDataAvailable) return;

    // Filtrer les inscriptions pour cet étudiant
    const studentEnrollmentsData = enrollments.filter(
      (e) =>
        e.user_id === student.id ||
        e.user_id.toString() === student.id.toString()
    );

    // Adapter les données d'inscription
    const adaptedEnrollments = studentEnrollmentsData.map((e) =>
      adaptEnrollmentData(e)
    );
    setStudentEnrollments(adaptedEnrollments);
  };

  useEffect(() => {
    if (isOpen) {
        loadData();
    }
  }, [isOpen, student, isDataAvailable, enrollments, payments]);

  const adaptEnrollmentData = (enrollment: any): Enrollment => {
    const enrollmentPayments = payments.filter(
      (p) => p.enrollment_id === enrollment.id
    );

    const itemType = "course";
    const itemId = enrollment.course_id;

    const adaptedPayments = enrollmentPayments.map((p) => ({
      id: p.id,
      date: p.created_at,
      amount: p.amount,
      proof: p.payment_proof || null,
      status:
        p.status === "confirmed"
          ? ("Confirmed" as const)
          : ("Pending Confirmation" as const),
      month: p.month,
    }));

    // Logic to extract detailed session info
    let itemTitle = "";
    let itemSubtitle = "";
    let imageUrl = "/placeholder-course.jpg";
    let price = 0;

    // Try to extract detailed session info first
    if (enrollment?.session?.module) {
      const mod = enrollment.session.module;
      const parc = mod.parcours || enrollment.course;
      const sessionDate = enrollment.session.start_date
        ? new Date(enrollment.session.start_date).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : "";

      itemTitle = mod.title; // "Initiation et Découverte"

      const parts = [];
      if (parc?.title) parts.push(`Parcours: ${parc.title}`);
      if (sessionDate) parts.push(`Session: ${sessionDate}`);
      if (mod.price) {
        parts.push(`Montant: ${mod.price} MAD`);
        price = Number(mod.price);
      }

      itemSubtitle = parts.join(" | ");
      
      if (parc?.photo) {
         // Assuming photo path needs prefix if not absolute
         imageUrl = parc.photo.startsWith('http') ? parc.photo : `${(import.meta as any).env.VITE_BACKEND_URL || 'http://localhost:8000'}/storage/${parc.photo}`;
      }
    } else {
      // Fallback to Parcours info
      const course = courses.find((c) => c.id === itemId);
      itemTitle = course?.title || enrollment?.course?.title || "Unknown Module";
      
      if (course?.price) {
         itemSubtitle = `Prix module: ${course.price} MAD`;
         price = Number(course.price);
      }
      
      if (course?.photo) {
         imageUrl = course.photo.startsWith('http') ? course.photo : `${(import.meta as any).env.VITE_BACKEND_URL || 'http://localhost:8000'}/storage/${course.photo}`;
      }
    }

    let status:
      | "Pending Payment"
      | "Pending Confirmation"
      | "Active"
      | "Cancelled";
    switch (enrollment.status) {
      case "pending_payment":
        status = "Pending Payment";
        break;
      case "pending_confirmation":
        status = "Pending Confirmation";
        break;
      case "cancelled":
        status = "Cancelled";
        break;
      default:
        status = "Active";
    }

    // Default duration if not found
    const durationMonths = 3; 

    return {
      id: enrollment.id.toString(),
      itemId: itemId ? itemId.toString() : "0",
      itemType,
      itemTitle,
      itemSubtitle,
      imageUrl,
      group: { price },
      status,
      enrolledDate: enrollment.created_at,
      userId: enrollment.user_id.toString(),
      payments: adaptedPayments,
      durationMonths,
    };
  };

  const getItemDetails = (
    itemId: string,
    itemType: "course"
  ): Course | undefined => {
    if (itemType === "course") {
      const course = courses.find((c) => c.id.toString() === itemId);
      if (!course) return undefined;

      const photoUrl = course.photo 
        ? (course.photo.startsWith('http') ? course.photo : `${(import.meta as any).env.VITE_BACKEND_URL || 'http://localhost:8000'}/storage/${course.photo}`)
        : "/placeholder-course.jpg";

      return {
        id: course.id.toString(),
        title: course.title,
        imageUrl: photoUrl,
        shortDescription: course.description || "",
      };
    }
    return undefined;
  };

  const handleToggleExpand = (enrollmentId: string) => {
    setExpandedEnrollmentId((prevId) =>
      prevId === enrollmentId ? null : enrollmentId
    );
  };

  const handleMarkPaid = async (enrollmentId: string, month: number) => {
    const enrollmentToUpdate = studentEnrollments.find(
      (e) => e.id === enrollmentId
    );
    const existingPayment = enrollmentToUpdate?.payments?.find(
      (p) => p.month === month
    );

    let message = "";
    if (existingPayment && existingPayment.status === "Pending Confirmation") {
      message = `Are you sure you want to confirm the pending payment for month ${month}?`;
    } else if (existingPayment && existingPayment.status === "Confirmed") {
      message = `Payment for month ${month} is already confirmed.`;
    } else {
      message = `Are you sure you want to create and confirm a payment for month ${month}?`;
    }

    setConfirmModalData({
      isOpen: true,
      enrollmentId,
      month,
      title: "Confirm Payment",
      message: message,
    });
  };

  const processMarkPaid = async (enrollmentId: string, month: number) => {
    setConfirmModalData((prev) => ({ ...prev, isOpen: false }));

    const enrollmentToUpdate = studentEnrollments.find(
      (e) => e.id === enrollmentId
    );
    
    if (!enrollmentToUpdate || !student) {
      dispatch(showError({ title: "Erreur", message: "Data not found." }));
      return;
    }

    const existingPayment = enrollmentToUpdate.payments?.find(
      (p) => p.month === month
    );

    if (existingPayment) {
      if (existingPayment.status === "Confirmed") {
        dispatch(showError({ title: "Already Confirmed", message: "Payment already confirmed." }));
        return;
      }

      if (existingPayment.id) {
        try {
          await apiService.confirmPayment(existingPayment.id);
          dispatch({ type: "payments/confirmPayment", payload: { id: existingPayment.id } });
          
          // Update local state
          const updatedPayments = (enrollmentToUpdate.payments || []).map((p) =>
            p.month === month ? { ...p, status: "Confirmed" as const } : p
          );
          
          let newStatus = enrollmentToUpdate.status;
          if (newStatus === "Pending Confirmation" && month === 1) {
             newStatus = "Active";
             await apiService.updateEnrollmentStatus(parseInt(enrollmentId), "active");
             dispatch({ type: "enrollments/updateEnrollmentStatus", payload: { id: parseInt(enrollmentId), status: "active" } });
          }

          const updatedEnrollments = studentEnrollments.map((en) =>
            en.id === enrollmentId ? { ...en, payments: updatedPayments, status: newStatus } : en
          );
          setStudentEnrollments(updatedEnrollments);
          dispatch(showSuccess({ title: "Success", message: "Payment confirmed." }));
        } catch (error: any) {
          dispatch(showError({ title: "Error", message: error.message }));
        }
        return;
      }
    }

    // Create new payment
    const requiresFee = !(student.hasPaidRegistrationFee || student.has_paid_registration_fee) && month === 1;
    const paymentAmount = enrollmentToUpdate.group.price + (requiresFee ? REGISTRATION_FEE : 0);

    const paymentData = {
      enrollment_id: parseInt(enrollmentId),
      user_id: parseInt(student.id),
      amount: paymentAmount,
      month: month,
      course_price: enrollmentToUpdate.group.price,
      registration_fee: requiresFee ? REGISTRATION_FEE : 0,
      payment_method: "Manual Admin Confirmation",
      payment_proof: "Manually Confirmed by Admin",
      payment_date: new Date().toISOString().split("T")[0],
      status: "confirmed",
    };

    try {
      const apiResponse = await apiService.createPayment(paymentData);
      dispatch({ type: "payments/createPayment", payload: { ...paymentData, id: apiResponse.id || Date.now() } });

      if (enrollmentToUpdate.status === "Pending Payment" && month === 1) {
        await apiService.updateEnrollmentStatus(parseInt(enrollmentId), "active");
        dispatch({ type: "enrollments/updateEnrollmentStatus", payload: { id: parseInt(enrollmentId), status: "active" } });
      }

      if (requiresFee) {
        await apiService.updateRegistrationFeeStatus(parseInt(student.id), true);
        dispatch({ type: "users/updateRegistrationFeeStatus", payload: { id: parseInt(student.id), has_paid_registration_fee: true } });
        // Note: We can't easily update the parent student object here without a callback, but Redux should handle it if we re-select
      }

      const newPayment: Payment = {
        id: apiResponse.id,
        date: new Date().toISOString(),
        amount: paymentAmount,
        proof: "Manually Confirmed by Admin",
        status: "Confirmed",
        month,
      };

      const updatedPayments = [...(enrollmentToUpdate.payments || []), newPayment].sort((a, b) => a.month - b.month);
      const newStatus = enrollmentToUpdate.status === "Pending Payment" && month === 1 ? "Active" : enrollmentToUpdate.status;

      const updatedEnrollments = studentEnrollments.map((en) =>
        en.id === enrollmentId ? { ...en, payments: updatedPayments, status: newStatus } : en
      );
      setStudentEnrollments(updatedEnrollments);
      dispatch(showSuccess({ title: "Success", message: "Payment created and confirmed." }));

    } catch (error: any) {
      dispatch(showError({ title: "Error", message: error.message }));
    }
  };

  if (!isOpen || !student) return null;

  const courseEnrollments = studentEnrollments.filter((e) => e.itemType === "course");
  const allPayments = studentEnrollments.flatMap((e) => e.payments?.map((p) => ({ ...p, enrollment: e })) || []);

  const InfoSection = () => (
    <div className="bg-white p-4 rounded-xl">
      <h3 className="text-xl font-bold text-slate-800 mb-4">Informations Personnelles</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-700">
        <div><strong className="font-semibold text-slate-500 block">Ville :</strong> {student.city}</div>
        <div><strong className="font-semibold text-slate-500 block">Téléphone :</strong> {student.phone}</div>
        <div><strong className="font-semibold text-slate-500 block">Date de Naissance :</strong> {student.dob || student.date_of_birth}</div>
      </div>
    </div>
  );

  const CoursesSection = () => (
    <div className="bg-white p-4 rounded-xl">
      <h3 className="text-xl font-bold text-slate-800 mb-4">Course Enrollments</h3>
      {courseEnrollments.length > 0 ? (
        <div className="space-y-4">
          {courseEnrollments.map((e) => (
            <EnrollmentCard
              key={e.id}
              enrollment={e}
              item={getItemDetails(e.itemId, "course")}
              isExpanded={expandedEnrollmentId === e.id}
              onToggle={() => handleToggleExpand(e.id)}
              onMarkPaid={handleMarkPaid}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-slate-500 py-4">No course enrollments.</p>
      )}
    </div>
  );

  const PaymentsSection = () => (
    <div className="bg-white p-4 rounded-xl">
      <h3 className="text-xl font-bold text-slate-800 mb-4">Payment History</h3>
      {allPayments.length > 0 ? (
        <div className="space-y-4">
          {allPayments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((payment, index) => {
            const item = getItemDetails(payment.enrollment.itemId, "course");
            return (
              <div key={`${payment.enrollment.id}-${payment.month}-${index}`} className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-semibold text-slate-800">{item?.title} (Month {payment.month})</p>
                  <p className="text-sm text-slate-500">Date: {new Date(payment.date).toLocaleDateString()} - Status: {payment.status}</p>
                </div>
                <p className={`font-bold ${payment.status === "Confirmed" ? "text-green-600" : "text-blue-600"}`}>
                  {payment.amount.toLocaleString("de-DE")} MAD
                </p>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-center text-slate-500 py-4">No payment history found.</p>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          
          {/* Header */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 border-b border-slate-100">
            <div className="flex justify-between items-start">
                <div className="flex items-center space-x-4">
                    <ProfileImage
                        profilePicture={student.profilePicture || student.profile_picture}
                        alt="Profile"
                        className="w-16 h-16 rounded-full object-cover border-2 border-slate-100"
                        fallbackName={`${student.first_name || student.firstName} ${student.last_name || student.lastName}`}
                        size={64}
                    />
                    <div>
                        <h3 className="text-2xl font-bold text-slate-900" id="modal-title">
                            {student.first_name || student.firstName} {student.last_name || student.lastName}
                        </h3>
                        <p className="text-slate-500">{student.email}</p>
                    </div>
                </div>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-500">
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
          </div>

          {/* Content */}
          <div className="bg-slate-50 px-4 py-4 sm:p-6">
             {/* Tabs */}
             <div className="flex space-x-2 mb-4 border-b border-slate-200">
                <TabButton tab="info" activeTab={activeTab} setTab={setActiveTab}>Infos</TabButton>
                <TabButton tab="courses" activeTab={activeTab} setTab={setActiveTab}>Modules</TabButton>
                <TabButton tab="payments" activeTab={activeTab} setTab={setActiveTab}>Paiements</TabButton>
             </div>

             <div className="bg-white rounded-xl shadow-sm min-h-[300px]">
                {activeTab === "info" && <InfoSection />}
                {activeTab === "courses" && <CoursesSection />}
                {activeTab === "payments" && <PaymentsSection />}
             </div>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={confirmModalData.isOpen}
        onClose={() => setConfirmModalData((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={() => processMarkPaid(confirmModalData.enrollmentId, confirmModalData.month)}
        title={confirmModalData.title}
        message={confirmModalData.message}
        confirmText="Confirm Payment"
        cancelText="Cancel"
        type="success"
      />
    </div>
  );
};

export default StudentDetailModal;

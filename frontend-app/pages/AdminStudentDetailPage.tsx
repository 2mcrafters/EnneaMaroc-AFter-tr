import React, { useState, useEffect } from 'react';
import { useAppDispatch } from "../store";
import { showSuccess, showError } from "../store/slices/uiSlice";
import { getProfileImageUrl } from "../services/baseApi";
import { apiService } from "../services/api";
import AdminLayout from "../components/admin/AdminLayout";
import { useReduxDataReadOnly } from "../hooks/useReduxData";
// On utilise uniquement les données du store Redux, pas besoin de fetch car les données sont déjà chargées
// On définit nos propres interfaces simplifiées au lieu d'utiliser celles des modules
import BackArrowIcon from "../components/icons/BackArrowIcon";
import { CheckCircleIcon } from "../components/icons/CheckCircleIcon";
import { ClockIcon } from "../components/icons/ClockIcon";
import { LockIcon } from "../components/icons/LockIcon";
import { PaperclipIcon } from "../components/icons/PaperclipIcon";
import { ChevronDownIcon } from "../components/icons/ChevronDownIcon";
import ConfirmationModal from "../components/ConfirmationModal";
import ProfileImage from "../components/ProfileImage";

interface UserData {
  firstName: string;
  lastName: string;
  dob: string;
  nationalId: string;
  city: string;
  email: string;
  phone: string;
  profilePicture: string;
  hasPaidRegistrationFee?: boolean;
}
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
  group: { price: number };
  status: "Pending Payment" | "Pending Confirmation" | "Active" | "Cancelled";
  enrolledDate: string;
  userId: string;
  payments?: Payment[];
  durationMonths: number;
}

// Interface pour les données adaptées au format Redux
// Interface pour les données adaptées au format Redux
interface AdaptedCourse {
  id: number;
  title: string;
  imageUrl: string;
  price: number;
  duration_months: number;
  groups: any[];
}

// Interfaces simplifiées pour l'affichage des cours
interface SimplifiedItem {
  id: string;
  title: string;
  imageUrl: string;
  shortDescription?: string;
}

// Types utilisés pour la vue
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
  if (!item) return null;

  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
      <div className="p-4 flex flex-col sm:flex-row gap-4">
        <img
          src={item.imageUrl}
          alt={item.title}
          className="w-full sm:w-24 h-24 object-cover rounded-md flex-shrink-0"
        />
        <div className="flex-grow">
          <h4 className="font-bold text-slate-800">{item.title}</h4>
          <p className="text-sm text-slate-500">
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

const AdminStudentDetailPage: React.FC = () => {
  const dispatch = useAppDispatch();

  // Utiliser le hook useReduxDataReadOnly pour récupérer les données déjà chargées
  const {
    usersState: users,
    coursesState: courses,
    enrollmentsState: enrollments,
    paymentsState: payments,
    isDataAvailable,
  } = useReduxDataReadOnly();

  const userId = decodeURIComponent(
    window.location.hash.split("/").pop() || ""
  );
  const [student, setStudent] = useState<any>(null);
  const [studentEnrollments, setStudentEnrollments] = useState<Enrollment[]>(
    []
  );
  const [activeTab, setActiveTab] = useState<ActiveTab>("info");
  const [expandedEnrollmentId, setExpandedEnrollmentId] = useState<
    string | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
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
    if (!userId || !isDataAvailable) {
      setIsLoading(true);
      return;
    }

    // Utiliser directement les données Redux (pas de fetch)
    // Trouver l'étudiant par son email (userId)
    const foundStudent = users.find(
      (u) => u.email === userId && u.role === "student"
    );
    setStudent(foundStudent || null);

    // Filtrer les inscriptions pour cet étudiant en utilisant les données Redux existantes
    const studentEnrollmentsData = enrollments.filter(
      (e) =>
        e.user_id.toString() === userId ||
        (foundStudent && e.user_id === foundStudent.id)
    );

    // Adapter les données d'inscription au format attendu par nos composants
    const adaptedEnrollments = studentEnrollmentsData.map((e) =>
      adaptEnrollmentData(e)
    );
    setStudentEnrollments(adaptedEnrollments);

    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [userId, isDataAvailable, users, enrollments]);

  // Fonction pour adapter les données Redux au format attendu par notre composant
  const adaptEnrollmentData = (enrollment: any): Enrollment => {
    // Trouver les paiements associés à cette inscription
    const enrollmentPayments = payments.filter(
      (p) => p.enrollment_id === enrollment.id
    );

    // Déterminer le type d'élément (cours seulement)
    const itemType = "course";
    const itemId = enrollment.course_id;

    // Adapter les paiements au format attendu
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

    // Trouver l'élément concerné pour obtenir les détails du groupe/prix
    let groupInfo = { price: 0 };
    const course = courses.find((c) => c.id === itemId);
    console.log(`🔍 Course found for itemId ${itemId}:`, course);
    console.log(
      `🔍 Looking for group_id ${enrollment.group_id} in course groups:`,
      course?.groups
    );

    const group = course?.groups.find((g) => g.id === enrollment.group_id);
    if (group) {
      groupInfo = { price: group.price || 0 };
      console.log(`💰 Course group found with price: ${group.price}`);
    } else if (course?.groups && course.groups.length > 0) {
      // Fallback: use first group price if no specific group found
      groupInfo = { price: course.groups[0].price || 0 };
      console.log(
        `💰 No specific group found, using first group price: ${
          course.groups[0].price || 0
        }`
      );
    }

    // Transformer le statut
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

    // Déterminer la durée en mois
    const durationMonths = course?.duration_months || 3;

    return {
      id: enrollment.id.toString(),
      itemId: itemId.toString(),
      itemType,
      group: groupInfo,
      status,
      enrolledDate: enrollment.created_at,
      userId: enrollment.user_id.toString(),
      payments: adaptedPayments,
      durationMonths,
    };
  };

  // Cette fonction récupère les détails d'un cours et les renvoie dans le format simplifié
  const getItemDetails = (
    itemId: string,
    itemType: "course"
  ): Course | undefined => {
    if (itemType === "course") {
      const course = courses.find((c) => c.id.toString() === itemId);
      if (!course) return undefined;

      // Créer un objet simplifié pour l'affichage
      const simplifiedCourse: Course = {
        id: course.id.toString(),
        title: course.title,
        imageUrl: course.image_url || "/placeholder-course.jpg",
        shortDescription: course.description || "",
      };
      return simplifiedCourse;
    }
    return undefined;
  };

  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    window.location.hash = path;
  };

  const handleToggleExpand = (enrollmentId: string) => {
    setExpandedEnrollmentId((prevId) =>
      prevId === enrollmentId ? null : enrollmentId
    );
  };

  const handleMarkPaid = async (enrollmentId: string, month: number) => {
    // Check if payment already exists to show appropriate message
    const enrollmentToUpdate = studentEnrollments.find(
      (e) => e.id === enrollmentId
    );
    const existingPayment = enrollmentToUpdate?.payments?.find(
      (p) => p.month === month
    );

    let message = "";
    if (existingPayment && existingPayment.status === "Pending Confirmation") {
      message = `Are you sure you want to confirm the pending payment for month ${month}? This will mark the payment as "Confirmed" and activate the enrollment if it's the first payment.`;
    } else if (existingPayment && existingPayment.status === "Confirmed") {
      message = `Payment for month ${month} is already confirmed.`;
    } else {
      message = `Are you sure you want to create and confirm a payment for month ${month}? This will create a new payment record with "Confirmed" status.`;
    }

    // Show custom confirmation modal
    setConfirmModalData({
      isOpen: true,
      enrollmentId,
      month,
      title: "Confirm Payment",
      message: message,
    });
  };

  const processMarkPaid = async (enrollmentId: string, month: number) => {
    // Close modal first to avoid any UI conflicts
    setConfirmModalData((prev) => ({ ...prev, isOpen: false }));

    // Récupérer l'inscription directement depuis Redux
    const enrollmentToUpdate = studentEnrollments.find(
      (e) => e.id === enrollmentId
    );
    const studentForEnrollment = student;

    if (!enrollmentToUpdate || !studentForEnrollment) {
      dispatch(
        showError({
          title: "Erreur",
          message: "Could not find enrollment or student data.",
        })
      );
      return;
    }

    const existingPayment = enrollmentToUpdate.payments?.find(
      (p) => p.month === month
    );

    if (existingPayment) {
      if (existingPayment.status === "Confirmed") {
        dispatch(
          showError({
            title: "Payment Already Confirmed",
            message: `Month ${month} is already marked as confirmed.`,
          })
        );
        return;
      }

      // Si le paiement existe et est en 'Pending Confirmation', on le confirme
      if (existingPayment.id) {
        try {
          console.log(
            "🔄 Confirming existing payment with ID:",
            existingPayment.id
          );
          await apiService.confirmPayment(existingPayment.id);
          console.log("✅ Payment confirmed successfully");

          // Mettre à jour Redux
          dispatch({
            type: "payments/confirmPayment",
            payload: { id: existingPayment.id },
          });

          // Mettre à jour l'état local
          const updatedPayments = (enrollmentToUpdate.payments || []).map((p) =>
            p.month === month ? { ...p, status: "Confirmed" as const } : p
          );

          let newStatus = enrollmentToUpdate.status;
          if (newStatus === "Pending Confirmation" && month === 1) {
            newStatus = "Active";
            // Mettre à jour le statut de l'inscription
            await apiService.updateEnrollmentStatus(
              parseInt(enrollmentId),
              "active"
            );
            dispatch({
              type: "enrollments/updateEnrollmentStatus",
              payload: {
                id: parseInt(enrollmentId),
                status: "active",
              },
            });
          }

          const updatedEnrollments = studentEnrollments.map((en) =>
            en.id === enrollmentId
              ? { ...en, payments: updatedPayments, status: newStatus }
              : en
          );

          setStudentEnrollments(updatedEnrollments);

          dispatch(
            showSuccess({
              title: "Payment Confirmed",
              message: `Payment for month ${month} has been confirmed successfully.`,
            })
          );
        } catch (error) {
          console.error("❌ Error confirming payment:", error);
          dispatch(
            showError({
              title: "Erreur de Confirmation",
              message: `Failed to confirm payment: ${
                error.message || "Erreur inconnue"
              }`,
            })
          );
        }
        return;
      }
    }

    // Si aucun paiement n'existe, créer un nouveau paiement directement confirmé
    console.log("💰 Creating new confirmed payment for month", month);

    // Vérifier si l'étudiant a déjà payé les frais d'inscription
    const requiresFee =
      !(
        studentForEnrollment.hasPaidRegistrationFee === true ||
        studentForEnrollment.has_paid_registration_fee === true
      ) && month === 1;
    const paymentAmount =
      enrollmentToUpdate.group.price + (requiresFee ? REGISTRATION_FEE : 0);

    const paymentData = {
      enrollment_id: parseInt(enrollmentId),
      user_id: parseInt(
        studentForEnrollment.id || studentForEnrollment.user_id
      ),
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
      console.log("🌐 Creating new confirmed payment...");
      const apiResponse = await apiService.createPayment(paymentData);
      console.log(
        "✅ Payment created and confirmed successfully:",
        apiResponse
      );

      // Mettre à jour Redux
      dispatch({
        type: "payments/createPayment",
        payload: { ...paymentData, id: apiResponse.id || Date.now() },
      });

      // Mettre à jour les statuts si nécessaire
      if (enrollmentToUpdate.status === "Pending Payment" && month === 1) {
        await apiService.updateEnrollmentStatus(
          parseInt(enrollmentId),
          "active"
        );
        dispatch({
          type: "enrollments/updateEnrollmentStatus",
          payload: {
            id: parseInt(enrollmentId),
            status: "active",
          },
        });
      }

      if (requiresFee) {
        await apiService.updateRegistrationFeeStatus(
          parseInt(studentForEnrollment.id || studentForEnrollment.user_id),
          true
        );
        dispatch({
          type: "users/updateRegistrationFeeStatus",
          payload: {
            id: parseInt(
              studentForEnrollment.id || studentForEnrollment.user_id
            ),
            has_paid_registration_fee: true,
          },
        });

        setStudent((prevStudent) =>
          prevStudent
            ? {
                ...prevStudent,
                hasPaidRegistrationFee: true,
                has_paid_registration_fee: true,
              }
            : null
        );
      }

      // Mettre à jour l'état local
      const newPayment: Payment = {
        id: apiResponse.id,
        date: new Date().toISOString(),
        amount: paymentAmount,
        proof: "Manually Confirmed by Admin",
        status: "Confirmed",
        month,
      };

      const updatedPayments = [
        ...(enrollmentToUpdate.payments || []),
        newPayment,
      ].sort((a, b) => a.month - b.month);
      const newStatus =
        enrollmentToUpdate.status === "Pending Payment" && month === 1
          ? "Active"
          : enrollmentToUpdate.status;

      const updatedEnrollments = studentEnrollments.map((en) =>
        en.id === enrollmentId
          ? { ...en, payments: updatedPayments, status: newStatus }
          : en
      );

      setStudentEnrollments(updatedEnrollments);

      dispatch(
        showSuccess({
          title: "Payment Confirmed",
          message: `Payment of ${paymentAmount} MAD for month ${month} has been confirmed successfully.`,
        })
      );
    } catch (error) {
      console.error("❌ Error creating payment:", error);
      dispatch(
        showError({
          title: "Payment Error",
          message: `Failed to create payment: ${
            error.message || "Unknown error"
          }`,
        })
      );
    }
  };

  if (!student) {
    return (
      <AdminLayout>
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <p className="text-slate-600">Student not found.</p>
          <a
            href="#/admin/students"
            onClick={(e) => handleNav(e, "#/admin/students")}
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-pistachio-dark"
          >
            <BackArrowIcon className="w-5 h-5" />
            Back to Students List
          </a>
        </div>
      </AdminLayout>
    );
  }

  const courseEnrollments = studentEnrollments.filter(
    (e) => e.itemType === "course"
  );
  const allPayments = studentEnrollments.flatMap(
    (e) => e.payments?.map((p) => ({ ...p, enrollment: e })) || []
  );

  const InfoSection = () => (
    <div className="bg-white p-8 rounded-xl shadow-lg md:shadow-none md:p-0">
      <h3 className="text-2xl font-bold text-slate-800 mb-6">
        Informations Personnelles
      </h3>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm text-slate-700">
        <div>
          <strong className="font-semibold text-slate-500 block">
            Ville :
          </strong>{" "}
          {student?.city}
        </div>
        <div>
          <strong className="font-semibold text-slate-500 block">
            Téléphone :
          </strong>{" "}
          {student?.phone}
        </div>
        <div>
          <strong className="font-semibold text-slate-500 block">
            Date de Naissance :
          </strong>{" "}
          {student?.dob || student?.date_of_birth}
        </div>
      </div>
    </div>
  );

  const CoursesSection = () => (
    <div className="bg-white p-8 rounded-xl shadow-lg md:shadow-none md:p-0">
      <h3 className="text-2xl font-bold text-slate-800 mb-6">
        Course Enrollments
      </h3>
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
        <p className="text-center text-slate-500 py-4">
          This student has no course enrollments.
        </p>
      )}
    </div>
  );

  const PaymentsSection = () => (
    <div className="bg-white p-8 rounded-xl shadow-lg md:shadow-none md:p-0">
      <h3 className="text-2xl font-bold text-slate-800 mb-6">
        Consolidated Payment History
      </h3>
      {allPayments.length > 0 ? (
        <div className="space-y-4">
          {allPayments
            .sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            )
            .map((payment, index) => {
              const item = getItemDetails(payment.enrollment.itemId, "course");
              return (
                <div
                  key={`${payment.enrollment.id}-${payment.month}-${index}`}
                  className="flex justify-between items-center p-4 bg-slate-50 rounded-lg"
                >
                  <div>
                    <p className="font-semibold text-slate-800">
                      {item?.title} (Month {payment.month})
                    </p>
                    <p className="text-sm text-slate-500">
                      Date: {new Date(payment.date).toLocaleDateString()} -
                      Status: {payment.status}
                    </p>
                    {payment.proof === "Manually Confirmed by Admin" && (
                      <p className="text-xs text-slate-400 italic">
                        Manually Confirmed by Admin
                      </p>
                    )}
                  </div>
                  <p
                    className={`font-bold ${
                      payment.status === "Confirmed"
                        ? "text-green-600"
                        : "text-blue-600"
                    }`}
                  >
                    {payment.amount.toLocaleString("de-DE")} MAD
                  </p>
                </div>
              );
            })}
        </div>
      ) : (
        <p className="text-center text-slate-500 py-4">
          No payment history found.
        </p>
      )}
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-8">
        <a
          href="#/admin/students"
          onClick={(e) => handleNav(e, "#/admin/students")}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 mb-4 transition-colors"
        >
          <BackArrowIcon className="w-5 h-5" />
          Retour à Tous les Étudiants
        </a>

        {/* Student Info Header */}
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <div className="flex flex-col sm:flex-row items-center sm:items-start sm:space-x-8">
            <ProfileImage
              profilePicture={
                student?.profilePicture || student?.profile_picture
              }
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover mb-4 sm:mb-0 border-4 border-slate-100"
              fallbackName={`${student?.first_name || student?.firstName} ${
                student?.last_name || student?.lastName
              }`}
              size={96}
            />
            <div className="text-center sm:text-left flex-grow">
              <h2 className="text-3xl font-bold text-slate-900">
                {student?.first_name || student?.firstName}{" "}
                {student?.last_name || student?.lastName}
              </h2>
              <p className="text-slate-500">{student?.email}</p>
              <div className="mt-2">
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    student?.hasPaidRegistrationFee ||
                    student?.has_paid_registration_fee
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  Frais d'Inscription :{" "}
                  {student?.hasPaidRegistrationFee ||
                  student?.has_paid_registration_fee
                    ? "Payé"
                    : "Non Payé"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Stacked Layout */}
        <div className="md:hidden space-y-8">
          <InfoSection />
          <CoursesSection />
          <PaymentsSection />
        </div>

        {/* Desktop Tabs */}
        <div className="hidden md:block">
          <div className="border-b border-slate-200">
            <div className="flex space-x-2">
              <TabButton tab="info" activeTab={activeTab} setTab={setActiveTab}>
                Informations Personnelles
              </TabButton>
              <TabButton
                tab="courses"
                activeTab={activeTab}
                setTab={setActiveTab}
              >
                Cours
              </TabButton>
              <TabButton
                tab="payments"
                activeTab={activeTab}
                setTab={setActiveTab}
              >
                Historique des Paiements
              </TabButton>
            </div>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg -mt-px border-t-0 border rounded-b-xl">
            {activeTab === "info" && <InfoSection />}
            {activeTab === "courses" && <CoursesSection />}
            {activeTab === "payments" && <PaymentsSection />}
          </div>
        </div>
      </div>

      {/* Custom Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModalData.isOpen}
        onClose={() =>
          setConfirmModalData((prev) => ({ ...prev, isOpen: false }))
        }
        onConfirm={() =>
          processMarkPaid(confirmModalData.enrollmentId, confirmModalData.month)
        }
        title={confirmModalData.title}
        message={confirmModalData.message}
        confirmText="Confirm Payment"
        cancelText="Cancel"
        type="success"
      />
    </AdminLayout>
  );
};

export default AdminStudentDetailPage;
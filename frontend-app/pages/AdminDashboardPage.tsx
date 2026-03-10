import React, { useState, useEffect, useCallback } from "react";
import { API_BASE_URL } from "../services/baseApi";
import { useReduxDataReadOnly } from "../hooks/useReduxData";

import { CheckCircleIcon } from "../components/icons/CheckCircleIcon";
import { XCircleIcon } from "../components/icons/XCircleIcon";
import { SearchIcon } from "../components/icons/SearchIcon";
import AdminLayout from "../components/admin/AdminLayout";
import StatCard from "../components/admin/StatCard";
import { UsersIcon } from "../components/icons/UsersIcon";
import { AcademicCapIcon } from "../components/icons/AcademicCapIcon";
import { ClipboardListIcon } from "../components/icons/ClipboardListIcon";
import { ClockIcon } from "../components/icons/ClockIcon";
import BarChart from "../components/admin/BarChart";
import { ChartBarIcon } from "../components/icons/ChartBarIcon";
import { useAppDispatch } from "../store";
import { confirmPayment, rejectPayment } from "../store/slices/paymentsSlice";
import {
  fetchSessionCancellations,
  deleteSessionCancellation,
} from "../store/slices/sessionCancellationsSlice";
import {
  refreshCriticalData,
  preloadAllDataOnce,
  forceRefreshAllData,
} from "../utils/dataPreloader";
import DebugUsersComponent from "../components/DebugUsersComponent";
import { useAppSelector } from "../store";
import { selectCurrentUser } from "../store/slices/authSlice";
import { ArrowPathIcon } from "../components/icons/ArrowPathIcon";
import RefreshButton from "../components/RefreshButton";
import StudentDetailModal from "../components/admin/StudentDetailModal";

// Interfaces
interface ApprovalItem {
  paymentId: number;
  enrollmentId: number;
  userId: number;
  userName: string;
  userEmail?: string;
  itemTitle: string;
  itemSubtitle?: string;
  proof: string;
  month: number;
  isInitial: boolean;
  amount: number;
  enrolledDate: string;
  paymentDate: string;
}

interface CancelledSessionSummary {
  title: string;
  type: string;
  day: string;
  time: string;
  sessionDate: string;
  instructorName?: string;
  item_type: "course";
}

interface ChartData {
  labels: string[];
  values: number[];
}

// Time parsing helpers
const parseTime = (timeStr: string): number => {
  const sanitizedTime = timeStr.trim().toUpperCase();
  const [time, modifier] = sanitizedTime.split(" ");
  let [hours, minutes] = time.split(":").map(Number);
  minutes = minutes || 0;

  if (modifier === "PM" && hours < 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0; // Midnight case

  return hours * 60 + minutes;
};

const parseTimeRange = (
  timeStr: string
): { startTimeMinutes: number; durationMinutes: number } => {
  const timeParts = timeStr.split(" - ");
  if (timeParts.length < 2) {
    const startTime = parseTime(timeParts[0]);
    return { startTimeMinutes: startTime, durationMinutes: 60 };
  }
  const startTime = parseTime(timeParts[0]);
  const endTime = parseTime(timeParts[1]);
  const duration =
    endTime > startTime ? endTime - startTime : 24 * 60 - startTime + endTime;
  return { startTimeMinutes: startTime, durationMinutes: duration };
};

const generateSessionKey = (
  itemId: string,
  itemType: "course",
  group: any,
  date: Date
): string => {
  const dateString = date.toISOString().split("T")[0]; // YYYY-MM-DD
  let groupIdentifier: string;
  if (itemType === "course") {
    groupIdentifier = `${group.day}-${group.time}`;
  } else {
    // revision
    groupIdentifier = `${group.modalityType}-${group.type}-${group.day}-${group.time}`;
  }
  const sanitizedIdentifier = groupIdentifier.replace(/[\s,:&]/g, "");
  return `${itemId}_${sanitizedIdentifier}_${dateString}`;
};

const AdminDashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);
  const sessionCancellations = useAppSelector(
    (state) => state.sessionCancellations.items
  );

  // Utiliser le hook Redux read-only (pas de fetch automatique)
  const {
    coursesState,
    enrollmentsState,
    usersState,
    paymentsState,
    isDataAvailable,
  } = useReduxDataReadOnly();

  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [selectedApproval, setSelectedApproval] = useState<ApprovalItem | null>(
    null
  );
  const [isApprovalDetailsOpen, setIsApprovalDetailsOpen] = useState(false);
  const [stats, setStats] = useState({
    students: 0,
    instructors: 0,
    activeEnrollments: 0,
  });
  const [cancelledSessions, setCancelledSessions] = useState<
    CancelledSessionSummary[]
  >([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<ChartData>({
    labels: [],
    values: [],
  });
  const [coursePopularity, setCoursePopularity] = useState<ChartData>({
    labels: [],
    values: [],
  });
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
    visible: boolean;
  }>({
    message: "",
    type: "success",
    visible: false,
  });
  const [selectedSessionForDetails, setSelectedSessionForDetails] =
    useState<CancelledSessionSummary | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: "reactivate" | "delete";
    session: CancelledSessionSummary;
  } | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);

  // Memoized loader so we can depend on it safely in effects
  const loadData = useCallback(() => {
    // Utiliser uniquement les données Redux (pas de fetch)
    console.log(
      "📊 Loading dashboard data from Redux store (read-only mode)..."
    );

    // Get data from Redux store (préchargées au login)
    const allCourses = coursesState;
    const allEnrollments = enrollmentsState;
    const allUsers = usersState;
    const allPayments = paymentsState;

    // Vérifier si les données sont disponibles (mais ne pas faire de fetch)
    if (!isDataAvailable) {
      // Waiting for data to be available in Redux
      setIsDataLoaded(false);
      return;
    }

    // Data is available, proceeding with dashboard calculations
    setIsDataLoaded(true);

    // --- Calculate Stats ---
    // Compter les instructeurs depuis Redux (utilisateurs avec rôle 'prof')
    const instructorCount = (allUsers || []).filter(
      (user) => user.role === "prof"
    ).length;
    const studentCount = (allUsers || []).filter(
      (user) => user.role === "student"
    ).length;

    // Stats Debug

    setStats({
      students: studentCount,
      instructors: instructorCount,
      activeEnrollments: (allEnrollments || []).filter(
        (e) => e.status === "active"
      ).length,
    });

    // --- Get Pending Approvals from Payments ---
    const getTitle = (itemId: number | string) => {
      const source = allCourses || [];
      return source.find((item: any) => item.id == itemId)?.title || "";
    };

    const pendingApprovals: ApprovalItem[] = [];

    // Find pending payments and match with enrollments and users
    // Requirement: show ONLY first-month payments in approvals (exclude registration fee & later months)
    // Assuming registration fee has month === null/0 and normal first month is month === 1
    const pendingPayments = (allPayments || []).filter(
      (p) => p.status === "pending"
    );

    const backendBase = API_BASE_URL.replace("/api", "");

    pendingPayments.forEach((payment) => {
      const enrollment = (allEnrollments || []).find(
        (e) => e.id === payment.enrollment_id
      );
      if (enrollment) {
        // Keep only first-month payments in approvals
        const isInitial = payment.month === 1;
        if (!isInitial) return;

        const user = (allUsers || []).find((u) => u.id === enrollment.user_id);
        let proofUrl = "";
        if (payment.payment_proof) {
          proofUrl = payment.payment_proof.startsWith("http")
            ? payment.payment_proof
            : `${backendBase}/storage/${payment.payment_proof}`;
        }

        const enrollmentAny: any = enrollment as any;

        // Logic to extract detailed session info (same as AdminPaymentsPage)
        let itemTitle = "";
        let itemSubtitle = "";

        // Try to extract detailed session info first
        if (enrollmentAny?.session?.module) {
          const mod = enrollmentAny.session.module;
          const parc = mod.parcours || enrollmentAny.course;
          const sessionDate = enrollmentAny.session.start_date
            ? new Date(enrollmentAny.session.start_date).toLocaleDateString(
                "fr-FR",
                { day: "numeric", month: "long", year: "numeric" }
              )
            : "";

          itemTitle = mod.title; // "Initiation et Découverte"

          const parts = [];
          if (parc?.title) parts.push(`Parcours: ${parc.title}`);
          if (sessionDate) parts.push(`Session: ${sessionDate}`);
          if (mod.price) parts.push(`Montant: ${mod.price} MAD`);

          itemSubtitle = parts.join(" | ");
        } else {
          // Fallback
          const titleFromRelation = enrollmentAny?.course?.title;
          const titleFromStore = enrollmentAny?.course_id
            ? getTitle(enrollmentAny.course_id)
            : "";
          itemTitle = String(titleFromRelation || titleFromStore || "");

          if (enrollmentAny?.course?.price) {
            itemSubtitle = `Prix module: ${enrollmentAny.course.price} MAD`;
          }
        }

        const userEntity: any = user;
        const first = userEntity?.first_name || userEntity?.firstName || "";
        const last = userEntity?.last_name || userEntity?.lastName || "";
        const email = userEntity?.email || "";
        const userName = `${first} ${last}`.trim();

        pendingApprovals.push({
          paymentId: payment.id,
          enrollmentId: enrollment.id,
          userId: enrollment.user_id,
          userName: userName || "",
          userEmail: email || undefined,
          itemTitle,
          itemSubtitle,
          proof: proofUrl,
          month: payment.month,
          isInitial: isInitial,
          amount: payment.amount,
          enrolledDate: enrollment.created_at,
          paymentDate: payment.created_at,
        });
      }
    });

    setApprovals(
      pendingApprovals.sort(
        (a, b) =>
          new Date(b.enrolledDate).getTime() -
          new Date(a.enrolledDate).getTime()
      )
    );

    // --- Calculate Analytics ---
    // Monthly Revenue (last 6 months) - Using Redux payments data
    const revenueData: { [key: string]: number } = {};
    const monthLabels: string[] = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = d.toLocaleString("default", { month: "short" });
      monthLabels.push(monthKey);
      revenueData[monthKey] = 0;
    }

    // Use confirmed payments from Redux store (add robust parsing + debug)
    const confirmedPayments = (allPayments || []).filter(
      (p) => (p as any).status === "confirmed"
    );
    // Revenue Calc: confirmedPayments count

    confirmedPayments.forEach((payment) => {
      // Some backends might return amount as string – coerce to number safely
      const rawAmount: any = (payment as any).amount;
      const amountNumber =
        typeof rawAmount === "number" ? rawAmount : parseFloat(rawAmount);
      if (isNaN(amountNumber)) {
        console.warn("⚠️ Skipping payment with invalid amount", payment);
        return;
      }

      // Prefer confirmed_at if present, else created_at, else updated_at, else now
      const dateStr =
        (payment as any).confirmed_at ||
        (payment as any).created_at ||
        (payment as any).updated_at;
      const paymentDate = dateStr ? new Date(dateStr) : new Date();
      if (isNaN(paymentDate.getTime())) {
        console.warn(
          "⚠️ Invalid payment date, using current date for revenue calc",
          payment
        );
        paymentDate.setTime(Date.now());
      }

      const monthDiff =
        (now.getFullYear() - paymentDate.getFullYear()) * 12 +
        (now.getMonth() - paymentDate.getMonth());
      if (monthDiff >= 0 && monthDiff < 6) {
        const monthKey = paymentDate.toLocaleString("default", {
          month: "short",
        });
        if (revenueData[monthKey] !== undefined) {
          revenueData[monthKey] += amountNumber;
        }
      }
    });

    // Revenue Data Aggregated

    setMonthlyRevenue({
      labels: monthLabels,
      values: monthLabels.map((key) => revenueData[key]),
    });

    // Course Popularity (using Redux data)
    const popularity: { [key: number]: number } = {};
    (allCourses || []).forEach((c) => {
      popularity[c.id] = 0;
    });

    // Count active enrollments for each course using Redux data
    (allEnrollments || []).forEach((enrollment) => {
      if (
        enrollment.status === "active" &&
        enrollment.course_id &&
        popularity[enrollment.course_id] !== undefined
      ) {
        popularity[enrollment.course_id]++;
      }
    });

    const sortedPopularity = Object.entries(popularity)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5); // Show top 5 for clarity

    setCoursePopularity({
      labels: sortedPopularity.map(
        ([id]) =>
          (allCourses || []).find((c) => c.id === parseInt(id))?.title ||
          "Unknown"
      ),
      values: sortedPopularity.map(([, count]) => count),
    });
  }, [
    coursesState,

    enrollmentsState,
    usersState,
    paymentsState,
    isDataAvailable,
  ]);

  // Recompute dashboard whenever any underlying slice changes (and data is available)
  useEffect(() => {
    if (isDataAvailable) {
      loadData();
    }
  }, [loadData, isDataAvailable]);

  // Charger les annulations de sessions
  useEffect(() => {
    if (currentUser && sessionCancellations.length === 0) {
      console.log("🎓 Loading session cancellations for admin dashboard");
      dispatch(fetchSessionCancellations({}));
    }
  }, [currentUser, sessionCancellations.length, dispatch]);

  // Traiter les annulations de sessions pour l'affichage admin
  useEffect(() => {
    if (sessionCancellations.length > 0 && coursesState.length > 0 && false) {
      const cancelledSessionsSummary = sessionCancellations
        .map((cancellation) => {
          let item: any = null;
          let instructorName = "Instructeur non trouvé";

          // Helpers
          const normalizeDay = (raw: string) =>
            (raw || "").trim().toLowerCase().replace(/s$/, "");
          const dayMatch = (groupDay: string, cancellationDay: string) => {
            if (!groupDay || !cancellationDay) return false;
            const parts = groupDay
              .split(/, | & | et /i)
              .map((p) => normalizeDay(p));
            return parts.includes(normalizeDay(cancellationDay));
          };

          const tryResolveInstructor = (instructorId: any) => {
            if (!instructorId) return;
            const instructor = usersState.find(
              (u) => String(u.id) === String(instructorId)
            );
            if (instructor) {
              instructorName = `${instructor.firstName} ${instructor.lastName}`;
            }
          };

          if (cancellation.item_type === "course") {
            item = coursesState.find(
              (c) => String(c.id) === String(cancellation.course_id)
            );
            if (item && Array.isArray(item.groups)) {
              let group: any = null;
              // 1. Try direct id match
              group = item.groups.find(
                (g: any) =>
                  String(g.id) === String(cancellation.course_group_index)
              );
              // 2. If not found, try treat course_group_index as numeric index
              if (!group) {
                const idx = parseInt(
                  String(cancellation.course_group_index),
                  10
                );
                if (!isNaN(idx) && item.groups[idx]) group = item.groups[idx];
              }
              // 3. Fallback: match by day/time
              if (!group) {
                group = item.groups.find(
                  (g: any) =>
                    dayMatch(g.day, cancellation.day) &&
                    String(g.time) === String(cancellation.time)
                );
              }
              if (group) {
                tryResolveInstructor(group.instructor_id || group.instructorId);
              }
              // 4. Final fallback: course-level instructor
              if (instructorName === "Instructeur non trouvé") {
                tryResolveInstructor(item.instructor_id || item.instructorId);
              }
            }
          }

          if (!item) {
            console.warn(
              "[AdminDashboard][CancelledSessions] Élément non trouvé pour annulation",
              cancellation
            );
            return null;
          }

          return {
            title: item.title,
            type: "Module",
            day: cancellation.day,
            time: cancellation.time,
            sessionDate: cancellation.session_date,
            instructorName,
            item_type: cancellation.item_type,
          } as CancelledSessionSummary;
        })
        .filter(Boolean) as CancelledSessionSummary[];

      setCancelledSessions(cancelledSessionsSummary);
    }
  }, [sessionCancellations, coursesState, usersState]);

  // Fallback: si les données ne sont pas disponibles après 2 secondes, déclencher le préchargement
  useEffect(() => {
    if (!isDataAvailable && currentUser) {
      const fallbackTimer = setTimeout(async () => {
        if (!isDataAvailable) {
          console.log(
            "⚠️ Data not available after timeout, triggering fallback preload..."
          );
          try {
            await preloadAllDataOnce(
              dispatch,
              currentUser.role,
              currentUser.id
            );
          } catch (error) {
            console.error("❌ Fallback preload failed:", error);
          }
        }
      }, 2000); // 2 secondes de délai

      return () => clearTimeout(fallbackTimer);
    }
  }, [isDataAvailable, currentUser, dispatch]);

  // Handle global refresh of all data
  const handleRefreshAllData = async () => {
    if (isRefreshing || !currentUser) return;

    try {
      setIsRefreshing(true);
      await forceRefreshAllData(dispatch, currentUser.role, currentUser.id);
      // loadData sera appelé automatiquement par l'effet qui dépend de isDataAvailable

      // Ajouter un petit délai pour la confirmation visuelle
      setTimeout(() => {
        setIsRefreshing(false);

        // Afficher un toast de confirmation
        setToast({
          message: "Toutes les données ont été actualisées avec succès",
          type: "success",
          visible: true,
        });

        // Masquer le toast après 3 secondes
        setTimeout(() => {
          setToast((current) => ({ ...current, visible: false }));
        }, 3000);
      }, 500);
    } catch (error) {
      console.error("Error refreshing all data:", error);
      setIsRefreshing(false);

      // Afficher un toast d'erreur
      setToast({
        message: "Erreur lors de l'actualisation des données",
        type: "error",
        visible: true,
      });

      // Masquer le toast après 3 secondes
      setTimeout(() => {
        setToast((current) => ({ ...current, visible: false }));
      }, 3000);
    }
  };

  const navigateToStudentDetail = (userId: number) => {
    const student = usersState.find(
      (u) => u.id === userId || u.id === String(userId)
    );
    if (student) {
      setSelectedStudent(student);
      setIsStudentModalOpen(true);
    }
  };

  const openApprovalDetails = (a: ApprovalItem) => {
    setSelectedApproval(a);
    setIsApprovalDetailsOpen(true);
  };

  const closeApprovalDetails = () => {
    setIsApprovalDetailsOpen(false);
    setSelectedApproval(null);
  };

  const formatDate = (value: string) => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString("fr-FR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const buildMailto = (email: string, subject?: string) => {
    const params = new URLSearchParams();
    if (subject) params.set("subject", subject);
    const qs = params.toString();
    return `mailto:${encodeURIComponent(email)}${qs ? `?${qs}` : ""}`;
  };

  const handleUpdateStatus = async (
    approvalItem: ApprovalItem,
    action: "confirm" | "reject"
  ) => {
    try {
      // Optimistic UI update - supprimer immédiatement l'approbation de la liste
      setApprovals((current) =>
        current.filter((a) => a.paymentId !== approvalItem.paymentId)
      );

      // Mettre à jour les statistiques immédiatement en soustrayant un du nombre d'approbations en attente
      setStats((current) => ({
        ...current,
        // Les autres statistiques ne changent pas, seule l'UI est mise à jour
      }));

      // Envoyer l'action à l'API
      if (action === "confirm") {
        await dispatch(confirmPayment(approvalItem.paymentId));

        // Afficher le toast de confirmation
        setToast({
          message: `Paiement de ${approvalItem.userName} confirmé avec succès`,
          type: "success",
          visible: true,
        });

        // Si c'est une confirmation, il faut aussi mettre à jour les graphiques de revenus
        setMonthlyRevenue((current) => {
          // Clone pour éviter de modifier directement l'état
          const newData = {
            labels: [...current.labels],
            values: [...current.values],
          };

          // Trouver le mois actuel dans les labels
          const now = new Date();
          const currentMonthKey = now.toLocaleString("default", {
            month: "short",
          });
          const monthIndex = newData.labels.findIndex(
            (month) => month === currentMonthKey
          );

          // Ajouter le montant au mois actuel si trouvé
          if (monthIndex >= 0) {
            newData.values[monthIndex] += approvalItem.amount;
          }

          return newData;
        });

        // Mettre à jour les statistiques d'inscriptions actives
        setStats((current) => ({
          ...current,
          activeEnrollments: approvalItem.isInitial
            ? current.activeEnrollments + 1
            : current.activeEnrollments,
        }));
      } else {
        await dispatch(rejectPayment(approvalItem.paymentId));

        // Afficher le toast de rejet
        setToast({
          message: `Paiement de ${approvalItem.userName} rejeté`,
          type: "success", // On utilise success même pour un rejet car c'est une action réussie
          visible: true,
        });
      }

      // Masquer le toast après 3 secondes
      setTimeout(() => {
        setToast((current) => ({ ...current, visible: false }));
      }, 3000);

      // Actualisation silencieuse des données critiques en arrière-plan
      refreshCriticalData(dispatch, "admin")
        .then(() => {})
        .catch((error) => {});
    } catch (error) {
      // Erreur lors de la mise à jour du statut de paiement
      // En cas d'erreur, recharger complètement les données pour s'assurer de la cohérence
      loadData();

      // Afficher un toast d'erreur
      setToast({
        message: "Erreur lors de la mise à jour du statut de paiement",
        type: "error",
        visible: true,
      });

      // Masquer le toast après 3 secondes
      setTimeout(() => {
        setToast((current) => ({ ...current, visible: false }));
      }, 3000);
    }
  };

  // Fonctions pour gérer les sessions annulées
  const handleReactivateSession = async (session: CancelledSessionSummary) => {
    try {
      // Trouver l'ID de la session annulée dans Redux en utilisant les données correctes
      const cancellation = sessionCancellations.find((c) => {
        // Correspondance basée sur le type d'item
        const typeMatch = c.item_type === session.item_type;

        // Correspondance basée sur les détails de planning
        const scheduleMatch =
          c.day === session.day &&
          c.time === session.time &&
          c.session_date === session.sessionDate;

        // Pour les cours, vérifier aussi le course_id
        if (session.item_type === "course") {
          const courseMatch = coursesState.find(
            (course) =>
              course.title === session.title &&
              String(course.id) === String(c.course_id)
          );
          return typeMatch && scheduleMatch && courseMatch;
        }

        return typeMatch && scheduleMatch;
      });

      if (cancellation?.id) {
        await dispatch(deleteSessionCancellation(cancellation.id));

        // Afficher le toast de confirmation
        setToast({
          message: "Session réactivée avec succès",
          type: "success",
          visible: true,
        });

        // Masquer le toast après 3 secondes
        setTimeout(() => {
          setToast((current) => ({ ...current, visible: false }));
        }, 3000);

        // Actualiser les données
        dispatch(fetchSessionCancellations({}));
      }
    } catch (error) {
      // Erreur lors de la réactivation de la session
      setToast({
        message: "Erreur lors de la réactivation de la session",
        type: "error",
        visible: true,
      });
      setTimeout(() => {
        setToast((current) => ({ ...current, visible: false }));
      }, 3000);
    }
  };

  const handleDeleteCancellation = async (session: CancelledSessionSummary) => {
    try {
      // Trouver l'ID de la session annulée dans Redux avec une meilleure logique
      const cancellation = sessionCancellations.find((c) => {
        const typeMatch = c.item_type === session.item_type;
        const scheduleMatch =
          c.day === session.day &&
          c.time === session.time &&
          c.session_date === session.sessionDate;

        // Vérification supplémentaire par titre pour s'assurer qu'on a la bonne session
        if (session.item_type === "course") {
          const courseMatch = coursesState.find(
            (course) =>
              course.title === session.title &&
              String(course.id) === String(c.course_id)
          );
          return typeMatch && scheduleMatch && courseMatch;
        }
      });

      if (cancellation?.id) {
        await dispatch(deleteSessionCancellation(cancellation.id));

        // Afficher le toast de confirmation
        setToast({
          message: "Annulation supprimée avec succès",
          type: "success",
          visible: true,
        });

        // Masquer le toast après 3 secondes
        setTimeout(() => {
          setToast((current) => ({ ...current, visible: false }));
        }, 3000);

        // Actualiser les données
        dispatch(fetchSessionCancellations({}));
      }
    } catch (error) {
      // Erreur lors de la suppression de l'annulation
      setToast({
        message: "Erreur lors de la suppression de l'annulation",
        type: "error",
        visible: true,
      });
      setTimeout(() => {
        setToast((current) => ({ ...current, visible: false }));
      }, 3000);
    }
  };

  const handleShowDetails = (session: CancelledSessionSummary) => {
    setSelectedSessionForDetails(session);
    setIsDetailsModalOpen(true);
  };

  return (
    <AdminLayout>
      {!isDataLoaded ? (
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pistachio-dark mx-auto mb-4"></div>
            <p className="text-slate-600">
              Chargement des données du dashboard...
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-slate-800">
              Tableau de bord
            </h1>
            <div className="flex items-center gap-3">
              <RefreshButton
                className="px-4 py-2 !bg-[#ff7d2d] !text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 flex items-center gap-2"
                showText={true}
                onRefreshComplete={(success) => {
                  // Afficher un toast de confirmation
                  setToast({
                    message: success
                      ? "Données actualisées avec succès"
                      : "Erreur lors de l'actualisation des données",
                    type: success ? "success" : "error",
                    visible: true,
                  });

                  // Masquer le toast après 3 secondes
                  setTimeout(() => {
                    setToast((current) => ({ ...current, visible: false }));
                  }, 3000);
                }}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={<UsersIcon />}
              title="Étudiants Totaux"
              value={stats.students}
              colorClasses="from-sky-500 to-sky-400"
            />
            <StatCard
              icon={<AcademicCapIcon />}
              title="Instructeurs Totaux"
              value={stats.instructors}
              colorClasses="from-violet-500 to-violet-400"
            />
            <StatCard
              icon={<ClipboardListIcon />}
              title="Inscriptions Actives"
              value={stats.activeEnrollments}
              colorClasses="from-lime-500 to-lime-400"
            />
            <StatCard
              icon={<ClockIcon />}
              title="Approbations en Attente"
              value={approvals.length}
              colorClasses="from-amber-500 to-amber-400"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2 bg-white p-4 md:p-8 rounded-xl shadow-lg">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">
                Approbations en Attente
              </h2>
              {approvals.length > 0 ? (
                <>
                  <div className="overflow-x-auto hidden md:block">
                    <table className="w-full text-sm text-left text-slate-600">
                      <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                        <tr>
                          <th scope="col" className="px-6 py-3">
                            Utilisateur
                          </th>
                          <th scope="col" className="px-6 py-3">
                            Article (Paiement du Mois)
                          </th>
                          <th scope="col" className="px-6 py-3">
                            Montant
                          </th>
                          <th scope="col" className="px-6 py-3">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {approvals.map((a) => (
                          <tr
                            key={`${a.enrollmentId}-${a.month}`}
                            className="bg-white border-b hover:bg-slate-50"
                          >
                            <td className="px-6 py-4 font-medium">
                              <button
                                onClick={() =>
                                  navigateToStudentDetail(a.userId)
                                }
                                className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                              >
                                {a.userName}
                              </button>
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-medium text-slate-800">
                                {a.itemTitle}
                              </div>
                              {a.itemSubtitle ? (
                                <div className="text-xs text-slate-500">
                                  {a.itemSubtitle}
                                </div>
                              ) : null}
                              <div className="text-xs text-slate-500">
                                Mois {a.month}
                              </div>
                            </td>
                            <td className="px-6 py-4 font-semibold">
                              {a.amount.toLocaleString("de-DE")} MAD
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => openApprovalDetails(a)}
                                  className="p-2 text-slate-700 hover:bg-slate-100 rounded-full"
                                  title="Détails"
                                  aria-label="Détails"
                                >
                                  <SearchIcon className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleUpdateStatus(a, "confirm")
                                  }
                                  className="p-2 text-green-600 hover:bg-green-100 rounded-full"
                                  title="Confirm"
                                >
                                  <CheckCircleIcon className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleUpdateStatus(a, "reject")
                                  }
                                  className="p-2 text-red-600 hover:bg-red-100 rounded-full"
                                  title="Reject"
                                >
                                  <XCircleIcon className="w-5 h-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="md:hidden space-y-4">
                    {approvals.map((a) => (
                      <div
                        key={`${a.enrollmentId}-${a.month}`}
                        className="bg-slate-50 p-4 rounded-lg border border-slate-200"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold">
                              <button
                                onClick={() =>
                                  navigateToStudentDetail(a.userId)
                                }
                                className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                              >
                                {a.userName}
                              </button>
                            </h3>
                            <p className="text-sm text-slate-600">
                              {a.itemTitle} (Mois {a.month})
                            </p>
                            <p className="text-sm font-semibold text-pistachio-dark mt-1">
                              {a.amount.toLocaleString("de-DE")} MAD
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 justify-end pt-3 mt-3 border-t border-slate-200">
                          <button
                            onClick={() => openApprovalDetails(a)}
                            className="px-3 py-1 text-xs font-semibold text-slate-700 bg-slate-200 rounded-full"
                          >
                            Détails
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(a, "reject")}
                            className="px-3 py-1 text-xs font-semibold text-red-600 bg-red-100 rounded-full"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(a, "confirm")}
                            className="px-3 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full"
                          >
                            Confirm
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-center text-slate-500 py-4">
                  Aucune approbation en attente.
                </p>
              )}
            </div>
          </div>

          {/* Modal: détails d'une approbation */}
          {isApprovalDetailsOpen && selectedApproval && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
              <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-800">
                      Détails de l'approbation
                    </h3>
                    <p className="text-sm text-slate-500">
                      Paiement Mois {selectedApproval.month}
                    </p>
                  </div>
                  <button
                    onClick={closeApprovalDetails}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                    aria-label="Fermer"
                    title="Fermer"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs uppercase text-slate-500">
                        Utilisateur
                      </p>
                      <button
                        onClick={() =>
                          navigateToStudentDetail(selectedApproval.userId)
                        }
                        className="text-blue-600 hover:text-blue-800 hover:underline font-semibold"
                      >
                        {selectedApproval.userName || ""}
                      </button>
                    </div>
                    {selectedApproval.userEmail ? (
                      <div>
                        <p className="text-xs uppercase text-slate-500">
                          Email
                        </p>
                        <a
                          href={buildMailto(
                            selectedApproval.userEmail,
                            "Paiement - Approbation en attente"
                          )}
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {selectedApproval.userEmail}
                        </a>
                      </div>
                    ) : null}
                    <div>
                      <p className="text-xs uppercase text-slate-500">Module</p>
                      <p className="text-slate-800 font-medium">
                        {selectedApproval.itemTitle || ""}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-slate-500">
                        Montant
                      </p>
                      <p className="text-slate-800 font-semibold">
                        {Number(selectedApproval.amount || 0).toLocaleString(
                          "de-DE"
                        )}{" "}
                        MAD
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-xs uppercase text-slate-500">
                        Date d'inscription
                      </p>
                      <p className="text-slate-800">
                        {formatDate(selectedApproval.enrolledDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-slate-500">
                        Date du paiement
                      </p>
                      <p className="text-slate-800">
                        {formatDate(selectedApproval.paymentDate)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-slate-100 flex flex-col sm:flex-row gap-3 sm:justify-end">
                  <button
                    onClick={() => {
                      closeApprovalDetails();
                      handleUpdateStatus(selectedApproval, "reject");
                    }}
                    className="px-4 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 font-semibold"
                  >
                    Rejeter
                  </button>
                  <button
                    onClick={() => {
                      closeApprovalDetails();
                      handleUpdateStatus(selectedApproval, "confirm");
                    }}
                    className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 font-semibold"
                  >
                    Confirmer
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Section Sessions Annulées - Design moderne avec cartes améliorées */}
          {cancelledSessions.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-slate-800 mb-1">
                      Sessions Annulées
                    </h2>
                    <p className="text-slate-600">
                      Gérez les sessions annulées et leurs réactivations
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-r from-red-50 to-red-100 px-4 py-2 rounded-full border border-red-200">
                    <span className="text-sm font-semibold text-red-700">
                      {cancelledSessions.length} session
                      {cancelledSessions.length > 1 ? "s" : ""} annulée
                      {cancelledSessions.length > 1 ? "s" : ""}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      dispatch(fetchSessionCancellations({}));
                    }}
                    className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all duration-200 hover:shadow-md group"
                    title="Actualiser"
                  >
                    <ArrowPathIcon className="w-5 h-5 text-slate-600 group-hover:text-slate-800 transition-colors" />
                  </button>
                </div>
              </div>
              {/* Grille moderne avec cartes compactes */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {cancelledSessions.slice(0, 12).map((session, index) => (
                  <div
                    key={index}
                    className="group relative bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-slate-100 hover:border-red-200 overflow-hidden"
                  >
                    {/* Header compact avec gradient subtil */}
                    <div className="bg-gradient-to-r from-red-50 to-red-100 p-4 border-b border-red-100">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-800 text-sm mb-2 line-clamp-2 group-hover:text-red-800 transition-colors">
                            {session.title}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                session.item_type === "course"
                                  ? "bg-blue-100 text-blue-800 border border-blue-200"
                                  : "bg-purple-100 text-purple-800 border border-purple-200"
                              }`}
                            >
                              <svg
                                className="w-3 h-3 mr-1"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                {session.item_type === "course" ? (
                                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.84L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.84l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                                ) : (
                                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                )}
                              </svg>
                              {session.type}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            setConfirmAction({ type: "delete", session })
                          }
                          className="ml-2 p-1 text-red-400 hover:text-red-600 hover:bg-orange-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                          title="Supprimer l'annulation"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Corps de la carte compact */}
                    <div className="p-4 space-y-3">
                      <div className="grid grid-cols-1 gap-2">
                        <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                          <div className="p-1.5 bg-blue-100 rounded-md">
                            <svg
                              className="w-3 h-3 text-blue-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                              Planning
                            </p>
                            <p className="text-xs font-semibold text-slate-800">
                              {session.day} • {session.time}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                            Annulé le
                          </span>
                          <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded-md">
                            {new Date(session.sessionDate).toLocaleDateString(
                              "fr-FR",
                              {
                                day: "numeric",
                                month: "short",
                              }
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Footer compact avec actions */}
                    <div className="px-4 py-3 bg-gradient-to-r from-red-50 to-red-100 border-t border-red-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                          <span className="text-xs font-bold text-red-700 uppercase tracking-wide">
                            Annulée
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            className="px-2 py-1 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-white rounded-md transition-all duration-200"
                            onClick={() => handleShowDetails(session)}
                          >
                            Détails
                          </button>
                          <button
                            className="px-3 py-1 text-xs font-medium text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 rounded-md transition-all duration-200 shadow-sm hover:shadow-md"
                            onClick={() =>
                              setConfirmAction({ type: "reactivate", session })
                            }
                          >
                            Réactiver
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>{" "}
              {/* Message si plus de sessions annulées */}
              {cancelledSessions.length > 12 && (
                <div className="mt-8 text-center">
                  <div className="inline-flex items-center gap-3 bg-gradient-to-r from-slate-100 to-slate-200 px-6 py-3 rounded-full border border-slate-300 shadow-sm">
                    <svg
                      className="w-5 h-5 text-slate-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    <span className="text-sm font-medium text-slate-700">
                      Et {cancelledSessions.length - 12} autres sessions
                      annulées
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <ChartBarIcon className="w-6 h-6 text-slate-500" />
              <h2 className="text-2xl font-bold text-slate-800">Analytics</h2>
            </div>
            <div className="gprid grid-cols-1 lg:grid-cols-2 gap-8">
              <BarChart
                title="Monthly Revenue (Last 6 Months)"
                data={monthlyRevenue}
                color="bg-sky-400"
                unit=" MAD"
              />
              <BarChart
                title="Top 5 Popularité des Modules (Inscriptions Actives)"
                data={coursePopularity}
                color="bg-lime-400"
              />
            </div>
          </div>
        </>
      )}

      {/* Modal de confirmation pour réactivation/suppression */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-slate-800">
              {confirmAction.type === "reactivate"
                ? "Réactiver la session"
                : "Supprimer l'annulation"}
            </h3>
            <div className="space-y-2">
              <p className="text-sm text-slate-600">
                {confirmAction.type === "reactivate"
                  ? "Êtes-vous sûr de vouloir réactiver cette session ?"
                  : "Êtes-vous sûr de vouloir supprimer définitivement cette annulation ?"}
              </p>
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="font-semibold text-slate-800">
                  {confirmAction.session.title}
                </p>
                <p className="text-sm text-slate-600">
                  {confirmAction.session.day}, {confirmAction.session.time}
                </p>
                <p className="text-xs text-slate-500">
                  {new Date(
                    confirmAction.session.sessionDate
                  ).toLocaleDateString("fr-FR")}
                </p>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setConfirmAction(null)}
                className="flex-1 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={async () => {
                  if (confirmAction.type === "reactivate") {
                    await handleReactivateSession(confirmAction.session);
                  } else {
                    await handleDeleteCancellation(confirmAction.session);
                  }
                  setConfirmAction(null);
                }}
                className={`flex-1 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                  confirmAction.type === "reactivate"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-[#e06520]"
                }`}
              >
                {confirmAction.type === "reactivate"
                  ? "Réactiver"
                  : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal des détails de session annulée */}
      {isDetailsModalOpen && selectedSessionForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-slate-800">
                Détails de la session annulée
              </h3>
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Fermer"
                title="Fermer"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Titre et type */}
              <div>
                <h4 className="font-bold text-lg text-slate-800 mb-2">
                  {selectedSessionForDetails.title}
                </h4>
                <span
                  className={`inline-block text-sm font-semibold px-3 py-1 rounded-full ${
                    selectedSessionForDetails.item_type === "course"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-purple-100 text-purple-800"
                  }`}
                >
                  {selectedSessionForDetails.type}
                </span>
              </div>

              {/* Informations de planification */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Jour
                    </label>
                    <p className="text-sm font-medium text-slate-800">
                      {selectedSessionForDetails.day}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Heure
                    </label>
                    <p className="text-sm font-medium text-slate-800">
                      {selectedSessionForDetails.time}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Instructeur
                    </label>
                    <p className="text-sm font-medium text-slate-800">
                      {selectedSessionForDetails.instructorName}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Date d'annulation
                    </label>
                    <p className="text-sm font-medium text-slate-800">
                      {new Date(
                        selectedSessionForDetails.sessionDate
                      ).toLocaleDateString("fr-FR", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Statut */}
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                  <span className="font-semibold text-red-800">
                    Session Annulée
                  </span>
                </div>
                <p className="text-sm text-red-700 mt-1">
                  Cette session a été annulée et n'est plus disponible pour les
                  étudiants.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Fermer
              </button>
              <button
                onClick={() => {
                  setIsDetailsModalOpen(false);
                  setConfirmAction({
                    type: "reactivate",
                    session: selectedSessionForDetails,
                  });
                }}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
              >
                Réactiver
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.visible && (
        <div
          className={`fixed bottom-5 right-5 px-6 py-3 rounded-lg shadow-lg transition-all transform ${
            toast.visible
              ? "translate-y-0 opacity-100"
              : "translate-y-10 opacity-0"
          } ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          } text-white`}
        >
          {toast.message}
        </div>
      )}

      <StudentDetailModal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        student={selectedStudent}
      />
    </AdminLayout>
  );
};

export default AdminDashboardPage;

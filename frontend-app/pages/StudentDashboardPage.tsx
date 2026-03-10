import React, { useState, useEffect, useMemo } from "react";

import { ClockIcon } from "../components/icons/ClockIcon";
import { CheckCircleIcon } from "../components/icons/CheckCircleIcon";
import { CalendarDaysIcon } from "../components/icons/CalendarDaysIcon";
import RefreshButton from "../components/RefreshButton";
import { useReduxDataReadOnly } from "../hooks/useReduxData";
import { useAppSelector, useAppDispatch } from "../store";
import { fetchUserEnrollments } from "../store/enrollmentsSlice";
import { fetchUserPayments } from "../store/slices/paymentsSlice";
import { fetchSessionCancellations } from "../store/slices/sessionCancellationsSlice";
import { Enrollment } from "../services/enrollmentService";
import { enrichEnrollmentsWithGroupData } from "../utils/enrollmentUtils";
import { getCourseImageUrl } from "../services/baseApi";

// Interfaces pour les données de session de dashboard
interface Payment {
  date: string;
  amount: number;
  proof: string | null;
  status: "Confirmed" | "Pending Confirmation";
  month: number;
}

interface UpcomingSessionInfo {
  title: string;
  day: string;
  time: string;
  type: string;
  status: "current" | "next";
  meetingLink?: string;
  isCancelled?: boolean;
  groupId?: number; // ID du groupe (cours) ou de la modalité (révision)
}

interface TodayScheduleItem extends UpcomingSessionInfo {
  startTimeMinutes: number;
}

const generateSessionKey = (
  itemId: string,
  itemType: "course",
  session: { day: string; time: string; groupId?: number },
  date: Date
): string => {
  const dateString = date.toISOString().split("T")[0]; // YYYY-MM-DD
  const { day, time, groupId } = session;
  // Utiliser groupId si disponible, sinon revenir au format précédent
  const groupIdentifier = groupId ? `group-${groupId}` : `${day}-${time}`;
  const sanitizedIdentifier = groupIdentifier.replace(/[\s,:&]/g, "");
  return `${itemId}_${sanitizedIdentifier}_${dateString}`;
};

// Fonction pour vérifier si une session est annulée en utilisant Redux
const isSessionCancelled = (
  sessionCancellations: any[],
  itemType: "course",
  itemId: string | number,
  groupData: any,
  day: string,
  time: string,
  sessionDate: Date,
  opts?: { courseGroupIndex?: number }
): boolean => {
  // normalize day to plural (Lundis, ...)
  const toPlural = (d: string) => {
    if (!d) return d;
    const map: Record<string, string> = {
      monday: "Lundis",
      tuesday: "Mardis",
      wednesday: "Mercredis",
      thursday: "Jeudis",
      friday: "Vendredis",
      saturday: "Samedis",
      sunday: "Dimanches",
    };
    const base = d.trim().toLowerCase().replace(/s$/, "");
    return map[base] || (d.endsWith("s") ? d : d + "s");
  };
  const dayPlural = toPlural(day);
  const ymd = sessionDate.toISOString().split("T")[0];

  return sessionCancellations.some((cancellation) => {
    const sameCourse =
      itemType === "course" &&
      cancellation.item_type === "course" &&
      String(cancellation.course_id) === String(itemId);

    if (!sameCourse) return false;

    // Match by group reference when possible
    let groupMatch = false;
    if (itemType === "course") {
      // Prefer comparing the stored course_group_index with computed group index
      if (
        opts?.courseGroupIndex != null &&
        cancellation.course_group_index != null
      ) {
        groupMatch =
          String(cancellation.course_group_index) ===
          String(opts.courseGroupIndex);
      } else if (
        cancellation.course_group_index == null &&
        groupData?.id != null
      ) {
        // when backend didn't store an index, fall back to nothing here and rely on day/time below
        groupMatch = false;
      }
    }

    // Day/time tolerant matching (singular vs plural)
    const dayEqual =
      cancellation.day &&
      (String(cancellation.day) === dayPlural ||
        String(cancellation.day).replace(/s$/, "") === day.replace(/s$/, ""));
    const timeEqual = String(cancellation.time) === String(time);
    const dateEqual = String(cancellation.session_date) === ymd;

    // Accept when group matches and day/time/date align, or when no group index was stored but day/time/date align
    return (
      (groupMatch && dayEqual && timeEqual && dateEqual) ||
      (!groupMatch && dayEqual && timeEqual && dateEqual)
    );
  });
};

const StudentDashboardPage: React.FC = () => {
  // Redux data hooks
  const {
    coursesState,
    enrollmentsState,
    paymentsState,
    userEnrollmentsState,
    userActiveEnrollmentsState,
    userPaymentsState,
    isDataAvailable,
  } = useReduxDataReadOnly();
  const currentUser = useAppSelector((state) => state.auth.user);
  const sessionCancellations = useAppSelector(
    (state) => state.sessionCancellations.items
  );
  const dispatch = useAppDispatch();

  // Assurer que les données spécifiques (inscriptions & paiements) d'un étudiant sont chargées
  useEffect(() => {
    if (!currentUser?.id) return;
    if (currentUser.role === "student") {
      if (userEnrollmentsState.length === 0) {
        console.log("🎓 Auto-fetch user enrollments (fallback)");
        dispatch(fetchUserEnrollments(currentUser.id));
      }
      if (userPaymentsState.length === 0) {
        console.log("🎓 Auto-fetch user payments (fallback)");
        dispatch(fetchUserPayments(currentUser.id));
      }
      // Charger les annulations de la semaine courante (lundi -> dimanche) pour matcher la logique SchedulePage
      const today = new Date();
      const jsDay = today.getDay(); // 0=Sun
      const monday = new Date(today);
      monday.setDate(today.getDate() - (jsDay === 0 ? 6 : jsDay - 1));
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      const fmt = (d: Date) => d.toISOString().split("T")[0];
      console.log(
        "🎓 Fetch weekly cancellations range",
        fmt(monday),
        fmt(sunday)
      );
      dispatch(
        fetchSessionCancellations({ from: fmt(monday), to: fmt(sunday) })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);

  useEffect(() => {
    // Vérifier si des données sont disponibles dans localStorage (solution de secours)
    const localEnrollments = localStorage.getItem("enrollments");
    if (localEnrollments) {
      console.log(
        "🔍 Found enrollments in localStorage:",
        JSON.parse(localEnrollments).length
      );
    }
  }, [currentUser, enrollmentsState, isDataAvailable]);

  // Local state pour les données - Déplacer avant les useMemo qui les utilisent
  const [coursesData, setCoursesData] = useState<any[]>([]);
  const [upcomingSession, setUpcomingSession] =
    useState<UpcomingSessionInfo | null>(null);
  const [todaysSchedule, setTodaysSchedule] = useState<TodayScheduleItem[]>([]);

  // 1. Récupérer les enrollments de l'utilisateur avec priorité aux sélecteurs spécifiques
  const userEnrollments = useMemo(() => {
    if (!currentUser?.id) {
      console.log("⚠️ No currentUser.id available");
      return [];
    }

    // D'abord essayer d'utiliser les données spécifiques à l'utilisateur de Redux
    if (userEnrollmentsState.length > 0) {
      console.log(
        "🔍 Using userEnrollmentsState from Redux:",
        userEnrollmentsState.length
      );
      // Enrichir avec group_data basé sur group_id
      const enrichedEnrollments = enrichEnrollmentsWithGroupData(
        userEnrollmentsState,
        coursesData
      );
      return enrichedEnrollments;
    }

    // Si pas de données spécifiques, essayer de filtrer les enrollments généraux
    if (enrollmentsState.length > 0) {
      console.log("🔍 Filtering from general enrollments state");
      const filteredString = enrollmentsState.filter(
        (e) => String(e.user_id) === String(currentUser.id)
      );
      console.log("🔍 Found enrollments by filtering:", filteredString.length);
      if (filteredString.length > 0) {
        // Enrichir avec group_data basé sur group_id
        const enrichedEnrollments = enrichEnrollmentsWithGroupData(
          filteredString,
          coursesData
        );
        return enrichedEnrollments;
      }
    }

    // En dernier recours, essayer localStorage
    try {
      const storedEnrollments = JSON.parse(
        localStorage.getItem("enrollments") || "[]"
      );
      console.log(
        "📦 Found enrollments in localStorage:",
        storedEnrollments.length
      );

      // Filtrer pour l'utilisateur actuel (avec adaptation du format)
      const filtered = storedEnrollments.filter(
        (e) =>
          (e.userId && String(e.userId) === String(currentUser.email)) ||
          (e.user_id && String(e.user_id) === String(currentUser.id))
      );
      console.log("📦 Filtered local enrollments:", filtered.length);

      if (filtered.length > 0) {
        // Adapter le format si nécessaire
        const adaptedEnrollments = filtered.map((e) => ({
          ...e,
          user_id: e.user_id || currentUser.id,
          status: e.status?.toLowerCase() || "active",
          // Assurer la compatibilité avec le format attendu
          id: e.id || Math.random().toString(),
          course_id: e.courseId || e.course_id || e.itemId,
          created_at:
            e.created_at || e.enrolledDate || new Date().toISOString(),
          updated_at: e.updated_at || new Date().toISOString(),
          // Extraire group_id des données de groupe ou utiliser l'ID existant
          group_id: e.group_id || e.group?.id || e.group_data?.id || null,
        }));

        // Enrichir avec group_data basé sur group_id
        const enrichedEnrollments = enrichEnrollmentsWithGroupData(
          adaptedEnrollments,
          coursesData
        );
        return enrichedEnrollments;
      }
    } catch (error) {
      console.error("❌ Error using localStorage enrollments:", error);
    }

    console.log("⚠️ No enrollments found for user");
    return [];
  }, [currentUser, userEnrollmentsState, enrollmentsState, coursesData]);

  // 2. Récupérer les paiements avec priorité aux sélecteurs spécifiques
  const userPayments = useMemo(() => {
    if (!currentUser?.id) {
      console.log("⚠️ No user ID available for payments");
      return [];
    }

    // D'abord utiliser les données spécifiques à l'utilisateur de Redux
    if (userPaymentsState.length > 0) {
      console.log(
        "� Using userPaymentsState from Redux:",
        userPaymentsState.length
      );
      return userPaymentsState;
    }

    // Ensuite, essayer de filtrer les données générales
    if (paymentsState.length > 0) {
      console.log(
        "🔄 Filtering payments from Redux state:",
        paymentsState.length
      );

      // Filtrer pour cet utilisateur
      const userSpecificPayments = paymentsState.filter((p) => {
        // Check direct user_id property (if available in the payment)
        if (
          (p as any).user_id &&
          String((p as any).user_id) === String(currentUser.id)
        ) {
          return true;
        }

        // Check through enrollment relation
        if (p.enrollment) {
          return String(p.enrollment.user_id) === String(currentUser.id);
        }

        // Filter through enrollments relation
        const enrollment = enrollmentsState.find(
          (e) => String(e.id) === String(p.enrollment_id)
        );
        return (
          enrollment && String(enrollment.user_id) === String(currentUser.id)
        );
      });

      console.log(
        `🔄 Found ${userSpecificPayments.length} payments for user ${currentUser.id} in Redux state`
      );
      if (userSpecificPayments.length > 0) {
        return userSpecificPayments;
      }
    }

    // Si pas de données dans Redux, essayer localStorage
    try {
      const storedPayments = JSON.parse(
        localStorage.getItem("payments") || "[]"
      );
      console.log("📦 Found payments in localStorage:", storedPayments.length);

      const filteredPayments = storedPayments.filter((p) => {
        // Si l'utilisateur est identifié par email dans localStorage
        if (p.userId && p.userId === currentUser.email) {
          return true;
        }

        // Si l'utilisateur est identifié par ID dans localStorage
        if (p.user_id && String(p.user_id) === String(currentUser.id)) {
          return true;
        }

        // Si on a des inscriptions, vérifier si le paiement correspond
        const enrollmentIds = JSON.parse(
          localStorage.getItem("enrollments") || "[]"
        )
          .filter(
            (e) =>
              e.userId === currentUser.email ||
              String(e.user_id) === String(currentUser.id)
          )
          .map((e) => e.id);

        return enrollmentIds.includes(p.enrollmentId || p.enrollment_id);
      });

      console.log("📦 Filtered local payments:", filteredPayments.length);
      return filteredPayments;
    } catch (error) {
      console.error("❌ Error using localStorage payments:", error);
    }

    console.log("⚠️ No payments data available for user");
    return [];
  }, [currentUser, userPaymentsState, paymentsState, enrollmentsState]);

  // 3. Calculer les stats avec useMemo
  const stats = useMemo(() => {
    // Afficher plus d'informations pour débogage
    console.log(
      "🔍 Calculating stats with userEnrollments:",
      userEnrollments.length,
      "and payments:",
      userPayments.length
    );

    const activeEnrollments = userEnrollments.filter((e) => {
      const s = (e.status || "").toString().toLowerCase();
      return s === "active";
    });
    console.log("🔍 Active enrollments:", activeEnrollments.length);

    // Compter séparément les inscriptions et paiements en attente
    const pendingEnrollmentsCount = userEnrollments.reduce((acc, en) => {
      const s = (en.status || "").toString().toLowerCase();
      if (
        s === "pending_payment" ||
        s === "pending confirmation" ||
        s === "pending_confirmation"
      )
        return acc + 1;
      return acc;
    }, 0);

    const pendingPaymentsCount = userPayments.reduce((acc, payment) => {
      const status = payment.status?.toLowerCase();
      if (
        status === "pending" ||
        status === "pending confirmation" ||
        // Pour compatibilité avec les données localStorage ou format API différent
        payment.status === "Pending" ||
        payment.status === "Pending Confirmation"
      )
        return acc + 1;
      return acc;
    }, 0);

    console.log("🔍 Pending enrollments count:", pendingEnrollmentsCount);
    console.log("🔍 Pending payments count:", pendingPaymentsCount);

    return {
      active: activeEnrollments.length,
      pendingEnrollments: pendingEnrollmentsCount,
      pendingPayments: pendingPaymentsCount,
    };
  }, [userEnrollments, userPayments]);

  useEffect(() => {
    // D'abord utiliser Redux si disponible
    if (coursesState.length > 0) {
      setCoursesData(coursesState);
    } else {
      // Sinon, essayer localStorage
      try {
        const localCourses = JSON.parse(
          localStorage.getItem("courses") || "[]"
        );
        if (localCourses.length > 0) {
          setCoursesData(localCourses);
          console.log(
            "📦 Using courses from localStorage:",
            localCourses.length
          );
        }
      } catch (error) {
        console.error("❌ Error loading courses from localStorage:", error);
      }
    }
  }, [coursesState]);

  useEffect(() => {
    if (!currentUser || userEnrollments.length === 0) {
      console.log("⏳ Waiting for user info or enrollments...");
      return;
    }

    const activeEnrollments = userEnrollments.filter((e) => {
      const s = (e.status || "").toString().toLowerCase();
      return s === "active";
    });
    console.log(
      "🔍 Active enrollments for session finding:",
      activeEnrollments.length
    );

    // Récupérer les session overrides du sessionStorage (pour les liens personnalisés)
    const sessionLinkOverrides = JSON.parse(
      sessionStorage.getItem("session_link_overrides") || "{}"
    );

    findUpcomingSession(activeEnrollments, sessionLinkOverrides);

    // Log pour débogage du format des données d'inscription
    if (activeEnrollments.length > 0) {
      console.log(
        "📊 Format d'inscription (groupe):",
        activeEnrollments[0].group_id
          ? "Utilise group_id"
          : "Utilise group_data"
      );
    }
  }, [currentUser, userEnrollments, coursesData]);

  const findUpcomingSession = (
    activeEnrollments: any[],
    linkOverrides: Record<string, string>
  ) => {
    const weekDays = [
      "Lundi",
      "Mardi",
      "Mercredi",
      "Jeudi",
      "Vendredi",
      "Samedi",
      "Dimanche",
    ];
    // Mapping des jours français -> anglais (forme plurielle comme utilisée dans weekDays)
    const frenchDayMap: Record<string, string> = {
      lundi: "Lundi",
      mardi: "Mardi",
      mercredi: "Mercredi",
      jeudi: "Jeudi",
      vendredi: "Vendredi",
      samedi: "Samedi",
      dimanche: "Dimanche",
      // gérer variantes avec accents/espaces
      "lundi ": "Lundi",
      "mardi ": "Mardi",
      "mercredi ": "Mercredi",
      "jeudi ": "Jeudi",
      "vendredi ": "Vendredi",
      "samedi ": "Samedi",
      "dimanche ": "Dimanche",
    };
    const now = new Date();
    const todayJsDay = now.getDay(); // 0 Sunday .. 6 Saturday
    const currentDayName = weekDays[todayJsDay === 0 ? 6 : todayJsDay - 1]; // adapt previous logic
    const currentDayIndex = now.getDay() === 0 ? 6 : now.getDay() - 1;
    const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();

    const parseTime = (timeStr: string): number => {
      if (!timeStr) return 0;
      const sanitizedTime = timeStr.trim().toUpperCase();
      const [time, modifier] = sanitizedTime.split(" ");
      let [hours, minutes] = time.split(":").map(Number);
      minutes = minutes || 0;
      if (modifier === "PM" && hours < 12) hours += 12;
      if (modifier === "AM" && hours === 12) hours = 0;
      return hours * 60 + minutes;
    };

    let allUserSessions: (UpcomingSessionInfo & {
      startTimeMinutes: number;
      dayIndex: number;
      date: Date;
      itemId: string;
      itemType: "course";
    })[] = [];

    activeEnrollments.forEach((en) => {
      // Adapter à différentes structures (Redux vs localStorage)
      const courseId = en.course_id || en.courseId;

      const isForCourse = !!courseId || en.itemType === "course";

      // Récupérer l'élément correspondant (cours seulement)
      const item = coursesData.find(
        (c) => String(c.id) === String(courseId || en.itemId)
      );

      // Récupérer les données de groupe - soit par group_id soit par group_data
      let groupData = null;
      const groupId = en.group_id || en.group_data?.id;

      if (item) {
        if (isForCourse && item.groups) {
          // Pour les cours, rechercher le groupe par son ID
          groupData =
            item.groups.find((g) => String(g.id) === String(groupId)) ||
            en.group_data ||
            en.group;
        } else if (!isForCourse && item.active_modalities) {
          // Pour les révisions, rechercher la modalité par son ID
          groupData =
            item.active_modalities.find(
              (m) => String(m.id) === String(groupId)
            ) ||
            en.group_data ||
            en.group;
        } else {
          groupData = en.group_data || en.group;
        }
      }

      if (!item || !groupData) {
        console.log("⚠️ Missing item or group data for enrollment:", en.id);
        return;
      }

      const processGroup = (
        group: any,
        title: string,
        type: string,
        itemType: "course",
        itemId: string | number,
        options?: { courseGroupIndex?: number }
      ) => {
        if (group.day?.toLowerCase() === "self-paced") return;
        // Support des formats: 'Lundi & Mercredi', 'Mardi & Jeudi', 'Samedi', 'Lundi, Mercredi & Vendredi'
        const rawDays = group.day?.split(/, | & | et /i) || [];
        const days = rawDays.map((d: string) => {
          const lower = d.trim().toLowerCase();
          const mapped = frenchDayMap[lower] || d.trim();
          return mapped; // Garder en anglais si mappé, sinon original
        });
        const timeRange = group.time;
        if (!timeRange) return;

        const [startTimeStr] = timeRange.split(" - ");
        const startTimeMinutes = parseTime(startTimeStr);

        days.forEach((day: string) => {
          // Les seeds utilisent des jours singuliers en français -> converti en anglais singulier; weekDays utilise formes anglaises sans 's'
          // S'assurer qu'on ne rajoute pas de 's' inutile: weekDays contient 'Monday', pas 'Mondays'
          const dayStr = day;
          const dayIndex = weekDays.indexOf(dayStr);
          if (dayIndex > -1) {
            const sessionDate = new Date(now);
            const dayDiff = dayIndex - currentDayIndex;
            sessionDate.setDate(now.getDate() + dayDiff);
            if (
              dayDiff < 0 ||
              (dayDiff === 0 && startTimeMinutes < currentTimeMinutes)
            ) {
              sessionDate.setDate(sessionDate.getDate() + 7);
            }

            const sessionObj = {
              day: dayStr,
              time: timeRange,
              groupId: group.id,
            };
            const sessionKey = generateSessionKey(
              itemId.toString(),
              itemType,
              sessionObj,
              sessionDate
            );
            const isCancelled = isSessionCancelled(
              sessionCancellations,
              itemType,
              itemId,
              group,
              dayStr,
              timeRange,
              sessionDate,
              options
            );

            allUserSessions.push({
              title,
              type,
              day: dayStr,
              time: timeRange,
              status: "next",
              meetingLink:
                group.meetingLink || group.meeting_link || group.meetinglink,
              startTimeMinutes,
              dayIndex,
              date: sessionDate,
              itemId: itemId.toString(),
              itemType,
              groupId: group.id || null, // Stocker seulement l'ID du groupe
              isCancelled,
            });
          }
        });
      };

      // Process course enrollment
      const courseItem = item as any;
      const enrollmentCourseId = en.course_id || en.courseId || en.itemId;
      const courseType =
        courseItem.type || courseItem.courseType || "in-person";
      if (groupData) {
        // Compute the course group index (as stored by cancellations)
        let groupIndex: number | undefined = undefined;
        if (Array.isArray(courseItem.groups)) {
          groupIndex = courseItem.groups.findIndex(
            (g: any) => String(g.id) === String(groupData.id)
          );
          if (groupIndex === -1) groupIndex = undefined;
        }
        processGroup(
          groupData,
          courseItem.title,
          courseType === "online" ? "Online Course" : "In-Person Course",
          "course",
          enrollmentCourseId,
          { courseGroupIndex: groupIndex }
        );
      }
    });

    const todaysSessions = allUserSessions
      .filter((s) => s.dayIndex === currentDayIndex)
      .sort((a, b) => a.startTimeMinutes - b.startTimeMinutes);

    setTodaysSchedule(
      todaysSessions.map((s) => {
        const sessionKey = generateSessionKey(s.itemId, s.itemType, s, s.date);
        const finalLink = linkOverrides[sessionKey] || s.meetingLink;
        return { ...s, meetingLink: finalLink };
      })
    );

    let currentSession: UpcomingSessionInfo | null = null;
    let nextSession: (UpcomingSessionInfo & { sortKey: number }) | null = null;

    let cancelledCurrent: (UpcomingSessionInfo & { sortKey?: number }) | null =
      null;
    for (const session of allUserSessions) {
      const [startTimeStr, endTimeStr] = session.time.split(" - ");
      const startTimeMinutes = parseTime(startTimeStr);
      const endTimeMinutes = endTimeStr
        ? parseTime(endTimeStr)
        : startTimeMinutes + 60;
      const sessionKey = generateSessionKey(
        session.itemId,
        session.itemType,
        session,
        session.date
      );
      const finalLink = linkOverrides[sessionKey] || session.meetingLink;

      // Current time falls inside this session
      if (
        session.dayIndex === currentDayIndex &&
        currentTimeMinutes >= startTimeMinutes &&
        currentTimeMinutes < endTimeMinutes
      ) {
        if (session.isCancelled) {
          // keep as potential current, but still look for a non-cancelled current
          cancelledCurrent = {
            ...session,
            status: "current",
            meetingLink: finalLink,
          };
          continue;
        } else {
          currentSession = {
            ...session,
            status: "current",
            meetingLink: finalLink,
          };
          break;
        }
      }

      const sortKey = session.date.getTime() + session.startTimeMinutes;
      if (!nextSession || sortKey < nextSession.sortKey) {
        // Prefer non-cancelled; only choose cancelled if nothing else yet
        if (!session.isCancelled) {
          nextSession = {
            ...session,
            status: "next",
            sortKey,
            meetingLink: finalLink,
          };
        } else if (!nextSession) {
          nextSession = {
            ...session,
            status: "next",
            sortKey,
            meetingLink: finalLink,
          };
        }
      }
    }

    if (!currentSession && cancelledCurrent) currentSession = cancelledCurrent;
    setUpcomingSession(currentSession || nextSession);
  };

  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    window.location.hash = path;
  };

  const getItemDetails = (enrollment: any) => {
    // Gérer différents formats d'ID (Redux vs localStorage)
    const courseId =
      enrollment.course_id || enrollment.courseId || enrollment.itemId;

    return coursesData.find((c) => String(c.id) === String(courseId));
  };

  // 4. Annulations filtrées pour l'étudiant (VERSION SIMPLIFIÉE: seulement cours où l'étudiant est inscrit)
  // IMPORTANT: Ce hook doit être défini AVANT tout return conditionnel pour respecter l'ordre des hooks.
  const studentCancelledSessions = useMemo(() => {
    if (sessionCancellations.length === 0) return [] as any[];

    // Construire les sets d'inscription utilisateur pour cours et révisions
    const userCourseIds = new Set(
      userEnrollments
        .filter((en: any) => en.course_id)
        .map((en: any) => String(en.course_id))
    );

    const norm = (d: string) =>
      (d || "").trim().toLowerCase().replace(/s$/, "");
    const results: any[] = [];

    sessionCancellations.forEach((c: any) => {
      if (c.item_type === "course" && c.course_id) {
        if (!userCourseIds.has(String(c.course_id))) return; // filtrer si pas inscrit au cours
        const course = coursesData.find(
          (co) => String(co.id) === String(c.course_id)
        );
        if (course && Array.isArray(course.groups)) {
          let matchedGroup: any = course.groups.find(
            (g: any, idx: number) =>
              String(g.id) === String(c.course_group_index) ||
              String(idx) === String(c.course_group_index)
          );
          if (!matchedGroup) {
            matchedGroup = course.groups.find((g: any) => {
              const segments = (g.day || "")
                .split(/, | & | et /i)
                .map((seg: string) => norm(seg));
              const cancelDay = norm(c.day);
              const dayMatch = segments.includes(cancelDay);
              const timeMatch = String(g.time) === String(c.time);
              return dayMatch && timeMatch;
            });
          }
        }
        results.push(c);
      }
    });

    return results.sort((a, b) =>
      String(a.session_date).localeCompare(String(b.session_date))
    );
  }, [sessionCancellations, userEnrollments, coursesData]);

  if (!currentUser) {
    return (
      <div className="text-center py-20">Chargement du tableau de bord...</div>
    );
  }

  // Afficher un indicateur de chargement si les données ne sont pas disponibles
  if (!isDataAvailable) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-dark mx-auto mb-4"></div>
        <p>Chargement des données de votre tableau de bord...</p>
      </div>
    );
  }

  // Utiliser directement le sélecteur d'active enrollments s'il est disponible, sinon filtrer manuellement
  const activeEnrollments =
    userActiveEnrollmentsState.length > 0
      ? userActiveEnrollmentsState
      : userEnrollments.filter(
          (e) => (e.status || "").toString().toLowerCase() === "active"
        );

  // Get pending payment enrollments for dashboard display
  const pendingPaymentEnrollments = useMemo(() => {
    return userEnrollments.filter((e) => {
      const status = (e.status || "").toString().toLowerCase();
      return status === "pending_payment";
    });
  }, [userEnrollments]);

  return (
    <div className="w-full px-4 sm:px-6 py-6 sm:py-10">
      <div className="w-full">
        <div className="mb-8 sm:mb-10">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 mb-1 sm:mb-2">
                Bienvenue, {currentUser.firstName}!
              </h1>
              <p className="text-base sm:text-lg text-slate-600">
                Voici un résumé de vos activités.
              </p>
            </div>
            <RefreshButton
              onRefreshComplete={() => {
                if (currentUser?.id) {
                  console.log("🔄 Manually refreshing dashboard data...");
                  // Forcer une actualisation complète du localStorage également
                  window.location.reload();
                }
              }}
            />
          </div>
        </div>
        {/* Cancelled sessions repositioned below welcome and above upcoming session - now only rendered if there are cancellations */}
        {studentCancelledSessions.length > 0 && (
          <div className="mb-10">
            <div className="p-6 bg-white rounded-2xl shadow-lg border-l-4 border-red-500">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <svg
                    className="w-6 h-6 text-red-500"
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
                  <h2 className="text-xl font-bold text-red-800">
                    Sessions Annulées
                  </h2>
                </div>
                <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded-full whitespace-nowrap">
                  {studentCancelledSessions.length} annulée
                  {studentCancelledSessions.length > 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex flex-wrap gap-4 max-h-72 overflow-y-auto pr-1">
                {studentCancelledSessions.map(
                  (cancellation: any, index: number) => {
                    const item = coursesData.find(
                      (c) => String(c.id) === String(cancellation.course_id)
                    );
                    if (!item) return null;
                    return (
                      <div
                        key={cancellation.id || index}
                        className="w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.75rem)] xl:w-[calc(25%-0.75rem)] p-4 bg-red-50 rounded-lg border border-red-200 flex flex-col gap-1"
                      >
                        <p className="font-semibold text-red-800 text-sm line-clamp-2">
                          {item.title}
                        </p>
                        <p className="text-[10px] tracking-wide font-semibold text-red-600 uppercase">
                          Module
                        </p>
                        <p className="text-xs text-red-700 font-medium">
                          {cancellation.day}, {cancellation.time}
                        </p>
                        <p className="text-[11px] text-red-600">
                          {new Date(
                            cancellation.session_date
                          ).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          </div>
        )}
        {/* Upcoming session block follows cancelled sessions */}

        {/* Pending Payment Enrollments Section */}
        {pendingPaymentEnrollments.length > 0 && (
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-lg border-l-4 border-yellow-500">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <ClockIcon className="w-6 h-6 text-yellow-500" />
                    <h2 className="text-xl font-bold text-yellow-800">
                      Paiement en Attente Requis
                    </h2>
                  </div>
                  <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">
                    {pendingPaymentEnrollments.length} inscription
                    {pendingPaymentEnrollments.length > 1 ? "s" : ""}
                  </span>
                </div>
                <p className="text-yellow-700 mb-4 text-sm">
                  Complétez votre inscription en téléchargeant la preuve de
                  paiement pour le premier mois (inclut les frais d'inscription
                  de 250 DH).
                </p>

                <div className="space-y-4">
                  {pendingPaymentEnrollments.map((enrollment) => {
                    const item = getItemDetails(enrollment);
                    if (!item) return null;

                    const isForCourse = !!(
                      enrollment.course_id || (enrollment as any).courseId
                    );
                    const hasPaidRegistration = userPayments.some(
                      (p) => p.status === "confirmed" && p.month === 1
                    );

                    return (
                      <div
                        key={enrollment.id}
                        className="bg-yellow-50 rounded-lg border border-yellow-200 flex flex-col sm:flex-row gap-4 p-4"
                      >
                        <img
                          src={getCourseImageUrl(
                            (item as any)?.image_url,
                            (item as any)?.slug
                          )}
                          alt={item.title}
                          className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg flex-shrink-0"
                        />
                        <div className="flex-grow min-w-0">
                          <h3 className="font-bold text-yellow-800 text-lg truncate">
                            {item.title}
                          </h3>
                          <p className="text-sm text-yellow-600 mt-1">
                            Cours • Inscrit le :{" "}
                            {new Date(
                              enrollment.created_at || enrollment.updated_at
                            ).toLocaleDateString()}
                          </p>
                          {!hasPaidRegistration && (
                            <p className="text-xs text-yellow-600 italic mt-1">
                              Le premier paiement inclut les frais d'inscription
                              de 250 DH
                            </p>
                          )}
                        </div>
                        <div className="flex-shrink-0">
                          <a
                            href="#/monthly-payments"
                            onClick={(e) => handleNav(e, "#/monthly-payments")}
                            className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-brand-dark rounded-full hover:bg-[#e13734] transition-colors w-full sm:w-auto"
                          >
                            <ClockIcon className="w-4 h-4" />
                            Gérer les Paiements Mensuels
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {upcomingSession ? (
          <div className="mb-8 p-6 bg-white rounded-2xl shadow-lg border-2 border-brand">
            <div className="flex items-center gap-3 mb-2">
              {upcomingSession.status === "current" && (
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              )}
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                {upcomingSession.status === "current"
                  ? "En Cours :"
                  : "Prochainement :"}{" "}
                {upcomingSession.title}
                {upcomingSession.isCancelled && (
                  <span className="text-xs font-bold px-2 py-1 rounded-full bg-red-100 text-red-700 border border-red-300">
                    ANNULÉ
                  </span>
                )}
              </h2>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <p className="text-slate-600">{upcomingSession.type}</p>
                <p className="font-semibold text-slate-800 flex items-center gap-2 mt-1">
                  <ClockIcon className="w-5 h-5 text-slate-400" />
                  {upcomingSession.day}, {upcomingSession.time}
                </p>
              </div>
              {upcomingSession.meetingLink && !upcomingSession.isCancelled && (
                <a
                  href={upcomingSession.meetingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto text-center px-6 py-3 font-semibold text-white bg-brand-dark rounded-full hover:bg-[#e13734] transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Rejoindre la Session
                </a>
              )}
              {upcomingSession.isCancelled && (
                <div className="text-sm font-semibold text-red-600 bg-red-50 px-4 py-2 rounded-full border border-red-200">
                  Session Annulée
                </div>
              )}
            </div>
          </div>
        ) : (
          !todaysSchedule.some((s) => !s.isCancelled) && (
            <div className="mb-8 p-6 bg-white rounded-2xl shadow-lg border border-slate-200">
              <h2 className="text-xl font-bold text-slate-800">
                Aucune session à venir
              </h2>
              <p className="text-slate-600 mt-1">
                Revenez plus tard ou consultez votre horaire complet.
              </p>
            </div>
          )
        )}

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 mb-8">
          <div className="xl:col-span-1 bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <CalendarDaysIcon className="w-6 h-6 text-slate-500" />
                <h2 className="text-2xl font-bold text-slate-800">
                  Horaire du jour
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <RefreshButton compact={true} showText={false} />
                <span className="text-xs text-slate-500">
                  {userEnrollments.length} inscriptions
                </span>
              </div>
            </div>
            {todaysSchedule.length > 0 ? (
              <div className="space-y-3">
                {todaysSchedule.map((item, index) => {
                  const isOnline = /online/i.test(item.type || "");
                  const canJoin =
                    !item.isCancelled && isOnline && item.meetingLink;
                  return (
                    <div
                      key={index}
                      className={`p-3 rounded-lg space-y-1 ${
                        item.isCancelled ? "bg-red-50" : "bg-slate-50"
                      }`}
                    >
                      <p
                        className={`font-semibold text-slate-800 ${
                          item.isCancelled ? "line-through" : ""
                        }`}
                      >
                        {item.title}
                      </p>
                      <p
                        className={`text-xs uppercase tracking-wide font-semibold ${
                          isOnline ? "text-brand-dark" : "text-slate-500"
                        }`}
                      >
                        {item.type}
                      </p>
                      <p
                        className={`text-sm text-slate-500 ${
                          item.isCancelled ? "line-through" : ""
                        }`}
                      >
                        {item.time}
                      </p>
                      {item.isCancelled && (
                        <p className="text-xs font-bold text-red-600">ANNULÉ</p>
                      )}
                      {canJoin && (
                        <a
                          href={item.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block mt-1 text-xs font-semibold px-3 py-1.5 rounded-full bg-brand-dark text-white hover:bg-[#e13734] transition-colors shadow-sm"
                        >
                          Rejoindre la Session
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-slate-500 py-4">
                Aucune session programmée pour aujourd'hui.
              </p>
            )}
          </div>

          {/* (Cancelled sessions block moved to top) */}
          <div
            className={`${
              studentCancelledSessions.length > 0
                ? "xl:col-span-2"
                : "xl:col-span-3"
            } grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6`}
          >
            <div className="bg-white p-6 rounded-xl shadow-lg flex items-center gap-4">
              <CheckCircleIcon className="w-10 h-10 text-green-500" />
              <div>
                <p className="text-3xl font-bold">{stats.active}</p>
                <p className="text-sm text-slate-600">Inscriptions Actives</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg flex items-center gap-4">
              <ClockIcon className="w-10 h-10 text-yellow-500" />
              <div>
                <p className="text-3xl font-bold">{stats.pendingEnrollments}</p>
                <p className="text-sm text-slate-600">
                  Inscriptions en Attente
                </p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg flex items-center gap-4">
              <ClockIcon className="w-8 h-8 text-orange-500" />
              <div>
                <p className="text-3xl font-bold">{stats.pendingPayments}</p>
                <p className="text-sm text-slate-600">Paiements en Attente</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 sm:p-8 rounded-xl shadow-lg">
          <div className="flex justify-between items-center mb-5 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
              Inscriptions Actives
            </h2>
            <a
              href="#/my-courses"
              onClick={(e) => handleNav(e, "#/my-courses")}
              className="text-sm font-semibold text-brand-dark hover:text-[#e13734]"
            >
              Voir Tout &rarr;
            </a>
          </div>

          {activeEnrollments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {activeEnrollments.map((enrollment) => {
                const item = getItemDetails(enrollment);
                if (!item) return null;

                // Pour Redux, nous devrons implémenter un système de progression différent
                // Pour l'instant, simplifions en montrant juste le statut d'enrollment
                const statusText =
                  enrollment.status === "active" ? "Actif" : "En Cours";

                return (
                  <div
                    key={enrollment.id}
                    className="p-4 bg-slate-50 rounded-lg"
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="font-bold text-slate-800">{item.title}</h3>
                      <span className="text-xs font-semibold text-slate-600">
                        {statusText}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2.5 mt-2">
                      <div className="bg-green-500 h-2.5 rounded-full w-4/5"></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-slate-500 py-4">
              Vous n'avez aucune inscription active.
            </p>
          )}

          <div className="mt-6 pt-6 border-t border-slate-200">
            <a
              href="#/monthly-payments"
              onClick={(e) => handleNav(e, "#/monthly-payments")}
              className="w-full block text-center px-5 py-3 text-sm font-semibold text-white bg-brand-dark rounded-full hover:bg-[#e13734] transition-colors"
            >
              Gérer Tous les Paiements
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboardPage;

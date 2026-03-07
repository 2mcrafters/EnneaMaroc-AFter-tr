import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useAppDispatch, useAppSelector } from "../store";
import { fetchAllParcours } from "../store/slices/parcoursSlice";

import {
  fetchUsersAsync,
  selectInstructors,
  selectUsers,
  selectUserLoading,
} from "../store/slices/userSlice";
import {
  fetchAllEnrollments,
  selectAllEnrollments,
  selectEnrollmentsLoading,
} from "../store/enrollmentsSlice";
import {
  selectSessionStatusLoading,
  selectSessionStatusError,
} from "../store/slices/sessionStatusSlice";
import { getProfileImageUrl } from "../services/baseApi";
import { UsersIcon } from "../components/icons/UsersIcon";
import { ClockIcon } from "../components/icons/ClockIcon";
import ChevronLeftIcon from "../components/icons/ChevronLeftIcon";
import { ArrowPathIcon } from "../components/icons/ArrowPathIcon";
import ChevronRightIcon from "../components/icons/ChevronRightIcon";

import { selectUserEnrollments } from "../store/enrollmentsSlice";
import { showSuccess } from "../store/slices/uiSlice";

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  profilePicture: string;
}

interface ScheduleEvent {
  id: string;
  title: string;
  day: string;
  time: string;
  startTimeMinutes: number;
  durationMinutes: number;
  instructorName: string;
  students: UserData[];
  itemType: "course";
  itemId: string;
  type: string;
  group: any;
  meetingLink?: string;
  isCancelled: boolean;
  filterTypeKey: {
    category: "course";
    modality: "online" | "in-person";
    type: "written" | "oral" | "both" | "n/a";
  };
}

const colorPalette = [
  { bg: "bg-sky-50", border: "border-sky-500", darkText: "text-sky-600" },
  {
    bg: "bg-violet-50",
    border: "border-violet-500",
    darkText: "text-violet-600",
  },
  { bg: "bg-lime-50", border: "border-lime-500", darkText: "text-lime-600" },
  { bg: "bg-amber-50", border: "border-amber-500", darkText: "text-amber-600" },
  { bg: "bg-rose-50", border: "border-rose-500", darkText: "text-rose-600" },
  { bg: "bg-teal-50", border: "border-teal-500", darkText: "text-teal-600" },
];

interface PositionedEvent extends ScheduleEvent {
  top: number;
  height: number;
  left: string;
  width: string;
  colorSet: (typeof colorPalette)[0];
}

interface User {
  firstName: string;
  lastName: string;
  email: string;
  id?: string;
}

interface Enrollment {
  userId: string;
  userName: string;
  itemId: string;
  itemType: "course";
  status: string;
  group: any;
}

// New cancellations actions
import {
  createSessionCancellation,
  deleteSessionCancellation,
  fetchSessionCancellations,
} from "../store/slices/sessionCancellationsSlice";

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
    return { startTimeMinutes: startTime, durationMinutes: 60 }; // Default to 1 hour if no end time
  }

  const startTime = parseTime(timeParts[0]);
  const endTime = parseTime(timeParts[1]);

  const duration =
    endTime > startTime ? endTime - startTime : 24 * 60 - startTime + endTime;

  return { startTimeMinutes: startTime, durationMinutes: duration };
};

// Normalize any day label (FR/EN, singular/plural) to French plural used across the app (e.g., "Lundis")
const normalizeDayPlural = (raw: string): string => {
  if (!raw) return raw as any;
  const d = raw.trim().toLowerCase();
  const frToEn: Record<string, string> = {
    lundi: "Lundis",
    mardi: "Mardis",
    mercredi: "Mercredis",
    jeudi: "Jeudis",
    vendredi: "Vendredis",
    samedi: "Samedis",
    dimanche: "Dimanches",
  };
  if (frToEn[d]) return frToEn[d];
  const base = d.endsWith("s") ? d.slice(0, -1) : d;
  const enPlural: Record<string, string> = {
    monday: "Lundi",
    tuesday: "Mardi",
    wednesday: "Mercredi",
    thursday: "Jeudi",
    friday: "Vendredi",
    saturday: "Samedi",
    sunday: "Dimanche",
    mondays: "Lundis",
    tuesdays: "Mardis",
    wednesdays: "Mercredis",
    thursdays: "Jeudis",
    fridays: "Vendredis",
    saturdays: "Samedis",
    sundays: "Dimanches",
  };
  if (enPlural[d]) return enPlural[d];
  if (enPlural[base]) return enPlural[base];
  // Fallback: ensure trailing 's'
  return raw.endsWith("s") ? raw : `${raw}s`;
};

const generateSessionKey = (
  itemId: string,
  itemType: "course",
  group: any,
  date: Date
): string => {
  const dateString = date.toISOString().split("T")[0]; // YYYY-MM-DD
  let groupIdentifier: string;
  // IMPORTANT: group.day must be the specific day (e.g., "Mondays") not a composite ("Mondays & Wednesdays")
  groupIdentifier = `${group.day}-${group.time}`;
  const sanitizedIdentifier = groupIdentifier.replace(/[\s,:&]/g, "");
  return `${itemId}_${sanitizedIdentifier}_${dateString}`;
};

const EventCard: React.FC<{
  event: ScheduleEvent;
  userRole: string | null;
  colorSet: (typeof colorPalette)[0];
  onClick: () => void;
  isCancelled: boolean;
}> = ({ event, userRole, colorSet, onClick, isCancelled }) => {
  if (isCancelled) {
    return (
      <button
        onClick={onClick}
        className="relative bg-red-100 border-l-4 border-red-500 text-red-900 p-2 rounded-md h-full overflow-hidden flex flex-col text-left w-full focus:outline-none focus:ring-2 focus:ring-offset-2 ring-red-500 cursor-pointer opacity-80 hover:opacity-100 transition-opacity"
      >
        <div className="flex-grow relative">
          <p className="font-bold leading-tight line-through">{event.title}</p>
          <p className="font-semibold text-red-700 mt-1 text-xs line-through">
            {event.type}
          </p>
          <span className="mt-2 inline-block px-2 py-0.5 text-xs font-bold text-white bg-red-600 rounded-full">
            CANCELLED
          </span>
        </div>

        <div className="mt-1 pt-1 border-t border-red-900/10 text-red-800/90 space-y-1 text-xs flex-shrink-0 relative line-through">
          <p className="flex items-center gap-1">
            <ClockIcon className="w-3 h-3" />
            {event.time}
          </p>
          {(userRole === "admin" || userRole === "prof") && (
            <>
              <p>
                <strong>Instr:</strong> {event.instructorName}
              </p>
              <div className="flex items-start gap-1">
                <UsersIcon className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <div className="overflow-hidden">
                  <strong>({event.students.length}):</strong>
                  <span className="italic">
                    {" "}
                    {event.students
                      .map((s) => `${s.firstName[0]}. ${s.lastName}`)
                      .join(", ")}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`relative ${colorSet.bg} border-l-4 ${colorSet.border} text-slate-800 p-2 rounded-md h-full overflow-hidden flex flex-col text-left w-full focus:outline-none focus:ring-2 focus:ring-offset-2 ${colorSet.border}`}
    >
      <div className="flex-grow relative">
        <p className="font-bold text-slate-900 leading-tight">{event.title}</p>
        <p className={`font-semibold ${colorSet.darkText} mt-1 text-xs`}>
          {event.type}
        </p>
      </div>

      <div className="mt-1 pt-1 border-t border-slate-900/10 text-slate-600 space-y-1 text-xs flex-shrink-0 relative">
        <p className="flex items-center gap-1">
          <ClockIcon className="w-3 h-3" />
          {event.time}
        </p>
        {(userRole === "admin" || userRole === "prof") && (
          <>
            <p>
              <strong>Instr:</strong> {event.instructorName}
            </p>
            <div className="flex items-start gap-1">
              <UsersIcon className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <div className="overflow-hidden">
                <strong>({event.students.length}):</strong>
                <span className="italic">
                  {" "}
                  {event.students
                    .map((s) => `${s.firstName[0]}. ${s.lastName}`)
                    .join(", ")}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </button>
  );
};

const calculateLayout = (
  events: ScheduleEvent[],
  startHour: number,
  hourHeight: number
): PositionedEvent[] => {
  if (!events.length) return [];

  const sortedEvents = [...events]
    .map((e) => ({
      ...e,
      end: e.startTimeMinutes + e.durationMinutes,
    }))
    .sort((a, b) => a.startTimeMinutes - b.startTimeMinutes || b.end - a.end);

  const laidOutEvents: PositionedEvent[] = [];

  let collisionGroups: (typeof sortedEvents)[] = [];
  if (sortedEvents.length > 0) {
    let currentGroup = [sortedEvents[0]];
    let maxEnd = sortedEvents[0].end;
    for (let i = 1; i < sortedEvents.length; i++) {
      const event = sortedEvents[i];
      if (event.startTimeMinutes < maxEnd) {
        currentGroup.push(event);
        maxEnd = Math.max(maxEnd, event.end);
      } else {
        collisionGroups.push(currentGroup);
        currentGroup = [event];
        maxEnd = event.end;
      }
    }
    collisionGroups.push(currentGroup);
  }

  for (const group of collisionGroups) {
    const columns: (typeof group)[] = [];
    for (const event of group) {
      let placed = false;
      for (const col of columns) {
        if (event.startTimeMinutes >= col[col.length - 1].end) {
          col.push(event);
          placed = true;
          break;
        }
      }
      if (!placed) {
        columns.push([event]);
      }
    }

    const numCols = columns.length;
    for (let i = 0; i < numCols; i++) {
      for (const event of columns[i]) {
        laidOutEvents.push({
          ...event,
          top: ((event.startTimeMinutes - startHour * 60) / 60) * hourHeight,
          height: (event.durationMinutes / 60) * hourHeight - 2,
          left: `${(100 / numCols) * i}%`,
          width: `${100 / numCols}%`,
          colorSet: colorPalette[i % colorPalette.length],
        });
      }
    }
  }
  return laidOutEvents;
};

const SchedulePage: React.FC = () => {
  const dispatch = useAppDispatch();

  // Redux selectors
  const courses = useAppSelector((state: any) => state.parcours.items);
  const users = useAppSelector(selectUsers);
  const instructors = useAppSelector(selectInstructors);
  const enrollments = useAppSelector(selectAllEnrollments);
  const coursesLoading = useAppSelector((state: any) => state.parcours.loading);
  const usersLoading = useAppSelector(selectUserLoading);
  const enrollmentsLoading = useAppSelector(selectEnrollmentsLoading);
  const sessionStatusLoading = useAppSelector(selectSessionStatusLoading);
  const sessionStatusError = useAppSelector(selectSessionStatusError);
  // Session cancellations state
  const cancellations = useAppSelector(
    (state) => (state as any).sessionCancellations?.items || []
  );
  const cancellationsLoading = useAppSelector(
    (state) => (state as any).sessionCancellations?.loading || false
  );

  // Current auth user and their enrollments
  const authUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);
  const userEnrollmentsForUser = useAppSelector((state) =>
    authUser?.id ? selectUserEnrollments(state as any, authUser.id) : []
  ) as any[];

  // Memoize the user enrollments to prevent infinite loops
  const memoizedUserEnrollments = useMemo(() => {
    if (!userEnrollmentsForUser || userEnrollmentsForUser.length === 0) {
      return [];
    }
    return userEnrollmentsForUser;
  }, [userEnrollmentsForUser?.length]);

  // Build fast lookup maps for statuses (course groups)
  const courseGroupStatusMap = useMemo(() => {
    const map = new Map<string, string>();
    // Legacy logic removed for Parcours migration
    return map;
  }, [courses]);

  const isSessionCancelled = (event: ScheduleEvent, date?: Date): boolean => {
    // First, check per-occurrence cancellations table if we have a date
    if (date) {
      const ymd = date.toISOString().split("T")[0];
      return cancellations.some((c: any) => {
        if (c.item_type !== event.itemType) return false;
        return (
          String(c.course_id) === String(event.itemId) &&
          c.day === event.group.day &&
          c.time === event.group.time &&
          c.session_date === ymd
        );
      });
    }
    // Fallback to legacy group/modality inactive status
    const key = `${event.itemId}|${event.group.day}|${event.group.time}`;
    return courseGroupStatusMap.get(key) === "inactive";
  };

  const weekDays = [
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
    "Dimanche",
  ];
  const START_HOUR = 8;
  const END_HOUR = 23; // Up to 23:00 (11 PM)
  const HOUR_HEIGHT_MOBILE = 80;
  const HOUR_HEIGHT_DESKTOP = 60;

  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [title, setTitle] = useState("Horaire");

  // Initialize sidebar state from localStorage or default to true
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    const saved = localStorage.getItem("scheduleSidebarOpen");
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [modalEventDetails, setModalEventDetails] = useState<
    (ScheduleEvent & { date: Date }) | null
  >(null);
  const [currentMobileDayIndex, setCurrentMobileDayIndex] = useState(
    new Date().getDay() === 0 ? 6 : new Date().getDay() - 1
  );

  // Helper functions for sidebar control
  const hideSidebar = useCallback(() => {
    console.log("Hiding sidebar, current state:", isSidebarOpen);
    setIsSidebarOpen(false);
  }, [isSidebarOpen]);

  const showSidebar = useCallback(() => {
    console.log("Showing sidebar, current state:", isSidebarOpen);
    setIsSidebarOpen(true);
  }, [isSidebarOpen]);

  // Filter State
  const [showCurrentOnly, setShowCurrentOnly] = useState(false);
  const [instructorFilter, setInstructorFilter] = useState("");
  const [typeFilters, setTypeFilters] = useState<string[]>([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [isTypeFilterOpen, setIsTypeFilterOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const typeFilterRef = useRef<HTMLDivElement>(null);
  // Desktop option: toggle a per-day view similar to mobile
  const [desktopDayView, setDesktopDayView] = useState(false);

  // Resizable columns and rows state
  const [columnWidths, setColumnWidths] = useState<number[]>(
    weekDays.map(() => 200)
  ); // Default 200px per column
  const [hourHeight, setHourHeight] = useState(HOUR_HEIGHT_DESKTOP);
  const [isResizing, setIsResizing] = useState<{
    type: "column" | "row";
    index: number;
  } | null>(null);
  const [resizeStartPos, setResizeStartPos] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });
  const [initialSize, setInitialSize] = useState(0);

  // Link Modal State
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [selectedEventForLink, setSelectedEventForLink] = useState<
    (ScheduleEvent & { date: Date }) | null
  >(null);
  const [currentLink, setCurrentLink] = useState("");

  // Confirmation Modal State
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [confirmationAction, setConfirmationAction] = useState<
    (() => Promise<void>) | null
  >(null);
  const [confirmationTitle, setConfirmationTitle] = useState("");
  const [confirmationButtonText, setConfirmationButtonText] = useState("");
  const [confirmationButtonStyle, setConfirmationButtonStyle] = useState("");

  // Debug flag to silence verbose logs in production usage
  const DEBUG_SCHEDULE = false; // Set to true temporarily for deep diagnostics
  const logDebug = (...args: any[]) => {}; // No-op function to replace logging

  // Resize handlers
  const handleMouseDown = (
    e: React.MouseEvent,
    type: "column" | "row",
    index: number
  ) => {
    e.preventDefault();
    setIsResizing({ type, index });
    setResizeStartPos({ x: e.clientX, y: e.clientY });
    if (type === "column") {
      setInitialSize(columnWidths[index]);
    } else {
      setInitialSize(hourHeight);
    }
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing) return;

      const deltaX = e.clientX - resizeStartPos.x;
      const deltaY = e.clientY - resizeStartPos.y;

      if (isResizing.type === "column") {
        const newWidth = Math.max(100, initialSize + deltaX); // Min width 100px
        setColumnWidths((prev) => {
          const newWidths = [...prev];
          newWidths[isResizing.index] = newWidth;
          return newWidths;
        });
      } else {
        const newHeight = Math.max(40, initialSize + deltaY); // Min height 40px
        setHourHeight(newHeight);
      }
    },
    [isResizing, resizeStartPos, initialSize]
  );

  const handleMouseUp = useCallback(() => {
    setIsResizing(null);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  // One-time initialization of user role & current user to avoid repeated state churn in loadData
  useEffect(() => {
    try {
      const storedRole = localStorage.getItem("userRole");
      const storedUser = JSON.parse(localStorage.getItem("user") || "null");
      setUserRole(storedRole);
      setCurrentUser(storedUser);
      if (storedRole === "admin") setTitle("Horaire complet");
      else if (storedRole === "prof") setTitle("Mon horaire d'enseignement");
      else setTitle("Mon horaire de cours");
    } catch (e) {
      console.warn("Failed to init userRole/currentUser from localStorage", e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save sidebar state to localStorage when it changes
  useEffect(() => {
    console.log("Sidebar state changed to:", isSidebarOpen);
    localStorage.setItem("scheduleSidebarOpen", JSON.stringify(isSidebarOpen));
  }, [isSidebarOpen]);

  const loadData = useCallback(() => {
    // Use already initialized state values (userRole/currentUser); bail if not ready yet
    const role = userRole;
    const user = currentUser || ({} as any);
    if (!role) {
      logDebug("loadData aborted (userRole not ready yet)");
      return;
    }

    console.log("LoadData starting with:", {
      role,
      coursesCount: courses.length,
      usersCount: users.length,
      instructorsCount: instructors.length,
      enrollmentsCount: enrollments.length,
    });

    let processedEvents: Omit<ScheduleEvent, "isCancelled">[] = [];

    // Add sample data if no courses are available (fallback for demonstration)
    if (courses.length === 0 || instructors.length === 0) {
      console.log("No courses or instructors found, using sample data");
      processedEvents = [
        {
          id: "sample-1",
          title: "Allemand A1 - Débutant",
          day: "Lundi",
          time: "09:00 - 11:00",
          startTimeMinutes: 9 * 60,
          durationMinutes: 120,
          instructorName: "Hans Mueller",
          students: [
            {
              firstName: "Marie",
              lastName: "Dubois",
              email: "marie@example.com",
              profilePicture: "",
            },
            {
              firstName: "Pierre",
              lastName: "Martin",
              email: "pierre@example.com",
              profilePicture: "",
            },
          ],
          itemType: "course",
          itemId: "1",
          group: {
            day: "Lundi",
            time: "09:00 - 11:00",
            instructor_id: "1",
            meeting_link: "",
          },
          type: "In-Person Course",
          meetingLink: "",
          filterTypeKey: {
            category: "course",
            modality: "in-person",
            type: "n/a",
          },
        },
        {
          id: "sample-2",
          title: "Allemand A1 - En ligne",
          day: "Mercredi",
          time: "19:00 - 21:00",
          startTimeMinutes: 19 * 60,
          durationMinutes: 120,
          instructorName: "Hans Mueller",
          students: [
            {
              firstName: "Sophie",
              lastName: "Laurent",
              email: "sophie@example.com",
              profilePicture: "",
            },
            {
              firstName: "Jean",
              lastName: "Durand",
              email: "jean@example.com",
              profilePicture: "",
            },
          ],
          itemType: "course",
          itemId: "2",
          group: {
            day: "Mercredi",
            time: "19:00 - 21:00",
            instructor_id: "1",
            meeting_link: "https://zoom.us/j/123456789",
          },
          type: "Online Course",
          meetingLink: "https://zoom.us/j/123456789",
          filterTypeKey: {
            category: "course",
            modality: "online",
            type: "n/a",
          },
        },
        {
          id: "sample-3",
          title: "Allemand A2 - Intermédiaire",
          day: "Mardi",
          time: "16:00 - 18:00",
          startTimeMinutes: 16 * 60,
          durationMinutes: 120,
          instructorName: "Anna Schmidt",
          students: [
            {
              firstName: "Lucas",
              lastName: "Bernard",
              email: "lucas@example.com",
              profilePicture: "",
            },
          ],
          itemType: "course",
          itemId: "3",
          group: {
            day: "Mardi",
            time: "16:00 - 18:00",
            instructor_id: "2",
            meeting_link: "",
          },
          type: "In-Person Course",
          meetingLink: "",
          filterTypeKey: {
            category: "course",
            modality: "in-person",
            type: "n/a",
          },
        },
        {
          id: "sample-4",
          title: "Allemand B1 - Avancé",
          day: "Jeudi",
          time: "18:00 - 20:00",
          startTimeMinutes: 18 * 60,
          durationMinutes: 120,
          instructorName: "Anna Schmidt",
          students: [
            {
              firstName: "Camille",
              lastName: "Rousseau",
              email: "camille@example.com",
              profilePicture: "",
            },
            {
              firstName: "Thomas",
              lastName: "Leroy",
              email: "thomas@example.com",
              profilePicture: "",
            },
          ],
          itemType: "course",
          itemId: "4",
          group: {
            day: "Jeudi",
            time: "18:00 - 20:00",
            instructor_id: "2",
            meeting_link: "https://zoom.us/j/987654321",
          },
          type: "Online Course",
          meetingLink: "https://zoom.us/j/987654321",
          filterTypeKey: {
            category: "course",
            modality: "online",
            type: "n/a",
          },
        },
        {
          id: "sample-5",
          title: "Allemand A1 - Weekend",
          day: "Samedi",
          time: "10:00 - 14:00",
          startTimeMinutes: 10 * 60,
          durationMinutes: 240,
          instructorName: "Hans Mueller",
          students: [
            {
              firstName: "Emma",
              lastName: "Moreau",
              email: "emma@example.com",
              profilePicture: "",
            },
            {
              firstName: "Hugo",
              lastName: "Petit",
              email: "hugo@example.com",
              profilePicture: "",
            },
            {
              firstName: "Chloe",
              lastName: "Garcia",
              email: "chloe@example.com",
              profilePicture: "",
            },
          ],
          itemType: "course",
          itemId: "1",
          group: {
            day: "Samedi",
            time: "10:00 - 14:00",
            instructor_id: "1",
            meeting_link: "",
          },
          type: "In-Person Course",
          meetingLink: "",
          filterTypeKey: {
            category: "course",
            modality: "in-person",
            type: "n/a",
          },
        },
      ];
    } else {
      // Process real data from Redux store (Parcours)
      courses.forEach((parcours: any) => {
        if (parcours.modules) {
          parcours.modules.forEach((module: any) => {
            if (module.sessions) {
              module.sessions.forEach((session: any) => {
                const startDate = new Date(session.start_date);
                const endDate = new Date(session.end_date);

                // Get day name in French
                const dayName = startDate.toLocaleDateString("fr-FR", {
                  weekday: "long",
                });
                const specificDay = normalizeDayPlural(dayName);

                // Get time string HH:mm - HH:mm
                const timeStr = `${startDate.toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })} - ${endDate.toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}`;

                const startTimeMinutes =
                  startDate.getHours() * 60 + startDate.getMinutes();
                const durationMinutes =
                  (endDate.getTime() - startDate.getTime()) / (1000 * 60);

                processedEvents.push({
                  id: `parcours-${parcours.id}-m${module.id}-s${session.id}`,
                  title: `${parcours.title} - ${module.title}`,
                  day: specificDay,
                  time: timeStr,
                  startTimeMinutes,
                  durationMinutes,
                  instructorName: "N/A", // TODO: Add instructor info
                  students: [], // TODO: Fix enrollments
                  itemType: "course",
                  itemId: parcours.id.toString(),
                  group: {
                    day: specificDay,
                    time: timeStr,
                    // instructor_id: ...
                  },
                  type: "Parcours",
                  meetingLink: session.location || "",
                  filterTypeKey: {
                    category: "course",
                    modality: "in-person",
                    type: "n/a",
                  },
                });
              });
            }
          });
        }
      });
    } // Close the else block

    logDebug("Total processed events (raw):", processedEvents.length);

    // --- Deduplicate potential duplicate sessions ---
    // Duplicates can happen when:
    // 1. A course group definition is loaded twice in Redux (race conditions / re-fetch)
    // 2. Normalization of day names (singular/plural, FR -> EN) causes logically identical entries with different original ids
    // We build a composite key capturing all distinguishing attributes.
    const makeKey = (e: any) => {
      return `course|${e.itemId}|${e.day}|${e.time}|${
        e.group.instructor_id || ""
      }`;
    };
    const seen = new Map<string, Omit<ScheduleEvent, "isCancelled">>();
    for (const ev of processedEvents) {
      const k = makeKey(ev);
      if (!seen.has(k)) {
        seen.set(k, ev);
      } else {
        // Merge students (union) to avoid losing any enrollment info
        const existing = seen.get(k)!;
        const existingEmails = new Set(existing.students.map((s) => s.email));
        ev.students.forEach((s) => {
          if (!existingEmails.has(s.email)) existing.students.push(s);
        });
      }
    }
    if (processedEvents.length !== seen.size) {
      logDebug("Deduplicated events", {
        before: processedEvents.length,
        after: seen.size,
      });
    }
    processedEvents = Array.from(seen.values());
    // --- End deduplication ---

    logDebug("Total processed events (deduped):", processedEvents.length);

    let finalEvents: Omit<ScheduleEvent, "isCancelled">[] = [];
    if (role === "admin" || role === "employee") {
      finalEvents = processedEvents;
    } else if (role === "prof") {
      finalEvents = processedEvents.filter((event) => {
        const instructor = instructors.find(
          (i) => `${i.firstName} ${i.lastName}` === event.instructorName
        );
        return instructor?.id === user.id;
      });
    } else if (role === "student") {
      // Prefer using userEnrollments list for student schedule
      const activeUserEnrollments = (memoizedUserEnrollments || []).filter(
        (e: any) => e.status === "active"
      );
      const courseIds = new Set<number>(
        activeUserEnrollments
          .filter((e: any) => e.course_id != null)
          .map((e: any) => Number(e.course_id))
      );
      logDebug("Student schedule via userEnrollments meta", {
        userId: user?.id,
        enrollmentsCount: activeUserEnrollments.length,
        courseIds: Array.from(courseIds),
      });
      if (courseIds.size > 0) {
        finalEvents = processedEvents.filter(
          (event) =>
            event.itemType === "course" && courseIds.has(Number(event.itemId))
        );
      } else {
        // Fallback to previous email-based filter if no userEnrollments yet
        finalEvents = processedEvents.filter((event) =>
          event.students.some((s) => s.email === user.email)
        );
      }
    }

    console.log(
      "SchedulePage loadData: Final filtered events:",
      finalEvents.length,
      "for role:",
      role
    );
    console.log(
      "SchedulePage loadData: Events sample:",
      finalEvents.slice(0, 3)
    );

    // Sort by id for stable ordering so equality check is reliable
    const next = finalEvents
      .map((e) => ({ ...e, isCancelled: false }))
      .sort((a, b) => a.id.localeCompare(b.id));

    // Prevent unnecessary state updates that can cascade into effects
    setEvents((prev) => {
      if (prev.length === next.length) {
        // Because we sort, we can compare index-wise
        for (let i = 0; i < prev.length; i++) {
          if (prev[i].id !== next[i].id) {
            console.log(
              "Events differ at index",
              i,
              prev[i].id,
              "!=",
              next[i].id
            );
            return next; // difference found -> update
          }
        }
        // If we reach here lists are identical
        console.log("Skip setEvents (no structural change)");
        return prev;
      }
      console.log(
        "SchedulePage: Applying setEvents with",
        next.length,
        "items"
      );
      return next;
    }); // isCancelled is checked dynamically
  }, [
    courses,
    users,
    instructors,
    enrollments,
    memoizedUserEnrollments,
    userRole,
    currentUser,
  ]);

  // Fonction pour rafraîchir les données locales uniquement
  const handleRefreshAllData = async () => {
    if (isRefreshing || !userRole) return;

    try {
      setIsRefreshing(true);
      // Utiliser uniquement les données Redux existantes (pas de fetch forcé)
      logDebug("Refreshing local data display only");
      loadData(); // Recharger les événements depuis les données Redux existantes

      // Petit délai pour la confirmation visuelle
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500);
    } catch (error) {
      console.error("Error refreshing local data:", error);
      setIsRefreshing(false);
    }
  };

  // Fetch all required data on component mount
  useEffect(() => {
    console.log("SchedulePage: Loading initial data...");

    // Fetch courses, users and enrollments
    dispatch(fetchAllParcours() as any);
    dispatch(fetchUsersAsync() as any);
    dispatch(fetchAllEnrollments() as any);

    // Fetch cancellations for current week
    logDebug("Fetch cancellations (once)");
    const today = new Date();
    const dayIndex = today.getDay(); // 0=Sun
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayIndex === 0 ? 6 : dayIndex - 1));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const fmt = (d: Date) => d.toISOString().split("T")[0];
    (dispatch as any)(
      fetchSessionCancellations({ from: fmt(monday), to: fmt(sunday) })
    );
  }, [dispatch]);

  useEffect(() => {
    console.log("SchedulePage data change:", {
      coursesCount: courses.length,
      usersCount: users.length,
      enrollmentsCount: enrollments.length,
      instructorsCount: instructors.length,
      userRole,
      currentUser: currentUser?.id,
    });

    // Debug: Log first course structure if available
    if (courses.length > 0) {
      console.log("First course sample:", {
        id: courses[0].id,
        title: courses[0].title,
        groupsCount: courses[0].groups?.length,
        firstGroup: courses[0].groups?.[0],
      });
    }

    // Recharger les événements quand les données Redux changent
    if (
      courses.length > 0 &&
      users.length > 0 &&
      instructors.length > 0 &&
      userRole
    ) {
      console.log("SchedulePage: All data available, loading events...");
      loadData();
    } else {
      console.log("SchedulePage: Waiting for data...", {
        hasCourses: courses.length > 0,
        hasUsers: users.length > 0,
        hasInstructors: instructors.length > 0,
        hasUserRole: !!userRole,
      });
    }
  }, [
    courses.length,
    users.length,
    instructors.length,
    userRole,
    currentUser,
    enrollments.length,
    memoizedUserEnrollments,
    loadData,
  ]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        typeFilterRef.current &&
        !typeFilterRef.current.contains(event.target as Node)
      ) {
        setIsTypeFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [typeFilterRef]);

  const displayedEvents = useMemo(() => {
    let filtered = [...events];

    if (showCurrentOnly) {
      const now = new Date();
      const currentDayIndex = now.getDay() === 0 ? 6 : now.getDay() - 1;
      const currentDayName = weekDays[currentDayIndex];
      const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();

      filtered = filtered.filter(
        (event) =>
          event.day === currentDayName &&
          currentTimeMinutes >= event.startTimeMinutes &&
          currentTimeMinutes < event.startTimeMinutes + event.durationMinutes
      );
    }

    if (instructorFilter) {
      filtered = filtered.filter(
        (event) => event.instructorName === instructorFilter
      );
    }

    if (typeFilters.length > 0) {
      filtered = filtered.filter((event) => {
        return typeFilters.some((filter) => {
          const { category, modality, type } = event.filterTypeKey;
          switch (filter) {
            case "course-online":
              return category === "course" && modality === "online";
            case "course-in-person":
              return category === "course" && modality === "in-person";
            default:
              return false;
          }
        });
      });
    }

    if (studentSearch) {
      const searchLower = studentSearch.toLowerCase();
      filtered = filtered.filter((event) =>
        event.students.some((student) =>
          `${student.firstName} ${student.lastName}`
            .toLowerCase()
            .includes(searchLower)
        )
      );
    }

    return filtered;
  }, [events, showCurrentOnly, instructorFilter, typeFilters, studentSearch]);

  const positionedMobileEvents = useMemo(() => {
    const mobileDay = weekDays[currentMobileDayIndex];
    const eventsForDay = displayedEvents.filter((e) => e.day === mobileDay);
    return calculateLayout(eventsForDay, START_HOUR, HOUR_HEIGHT_MOBILE);
  }, [displayedEvents, currentMobileDayIndex]);

  const positionedDesktopEvents = useMemo(() => {
    const layoutByDay: { [key: string]: PositionedEvent[] } = {};
    for (const day of weekDays) {
      const eventsForDay = displayedEvents.filter((e) => e.day === day);
      layoutByDay[day] = calculateLayout(eventsForDay, START_HOUR, hourHeight);
    }
    return layoutByDay;
  }, [displayedEvents, hourHeight]);

  // Desktop single-day timeline layout (reuse mobile navigation index)
  const positionedDesktopSingleDayEvents = useMemo(() => {
    const day = weekDays[currentMobileDayIndex];
    const eventsForDay = displayedEvents.filter((e) => e.day === day);
    return calculateLayout(eventsForDay, START_HOUR, hourHeight);
  }, [displayedEvents, currentMobileDayIndex, hourHeight]);

  const handleEventClick = (event: ScheduleEvent, day: string) => {
    const today = new Date();
    const dayIndex = today.getDay(); // 0=Sun
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayIndex === 0 ? 6 : dayIndex - 1));

    const eventDate = new Date(monday);
    eventDate.setDate(monday.getDate() + weekDays.indexOf(day));

    const sessionKey = generateSessionKey(
      event.itemId,
      event.itemType,
      event.group,
      eventDate
    );
    const overrides = JSON.parse(
      localStorage.getItem("session_link_overrides") || "{}"
    );
    const finalLink = overrides[sessionKey] || event.meetingLink;

    setModalEventDetails({
      ...event,
      meetingLink: finalLink,
      date: eventDate,
      isCancelled: isSessionCancelled(event, eventDate),
    });
  };

  const showCustomConfirmation = (
    title: string,
    message: string,
    buttonText: string,
    buttonStyle: string,
    action: () => Promise<void>
  ) => {
    setConfirmationTitle(title);
    setConfirmationMessage(message);
    setConfirmationButtonText(buttonText);
    setConfirmationButtonStyle(buttonStyle);
    setConfirmationAction(() => action);
    setShowConfirmationModal(true);
  };

  const handleConfirmationConfirm = async () => {
    if (confirmationAction) {
      await confirmationAction();
    }
    setShowConfirmationModal(false);
    setConfirmationAction(null);
  };

  const handleConfirmationCancel = () => {
    setShowConfirmationModal(false);
    setConfirmationAction(null);
  };

  const handleSessionCancelToggle = () => {
    if (!modalEventDetails) return;
    logDebug(
      "[CancelToggle] Initiated with modalEventDetails:",
      modalEventDetails
    );
    const currentlyCancelled = isSessionCancelled(
      modalEventDetails,
      modalEventDetails.date
    );
    const newStatus: "active" | "inactive" = currentlyCancelled
      ? "active"
      : "inactive";
    logDebug(
      "[CancelToggle] currentlyCancelled?",
      currentlyCancelled,
      "-> newStatus:",
      newStatus
    );
    const title = currentlyCancelled
      ? "Réactiver la session"
      : "Annuler la session";
    const message = currentlyCancelled
      ? `Réactiver cette session ?\n\n${
          modalEventDetails.title
        }\n${modalEventDetails.date.toLocaleDateString()} - ${
          modalEventDetails.time
        }`
      : `Annuler cette session ?\n\n${
          modalEventDetails.title
        }\n${modalEventDetails.date.toLocaleDateString()} - ${
          modalEventDetails.time
        }`;
    const buttonText = currentlyCancelled ? "Réactiver" : "Confirmer";
    const buttonStyle = currentlyCancelled
      ? "bg-green-600 hover:bg-green-700"
      : "bg-red-600 hover:bg-red-700";

    const perform = async () => {
      try {
        logDebug(
          "[CancelToggle.perform] Start. itemType=",
          modalEventDetails.itemType
        );
        // New behavior: create or remove a per-occurrence cancellation entry
        const ymd = modalEventDetails.date.toISOString().split("T")[0];
        const payload: any = {
          item_type: modalEventDetails.itemType,
          day: modalEventDetails.group.day,
          time: modalEventDetails.group.time,
          session_date: ymd,
        };
        if (modalEventDetails.itemType === "course") {
          payload.course_id = parseInt(modalEventDetails.itemId);
          // Try to compute the course_group_index for traceability
          const course = courses.find(
            (c) => c.id.toString() === modalEventDetails.itemId
          );
          if (course) {
            const targetDay = modalEventDetails.group.day.replace(/s$/, "");
            const idx = course.groups.findIndex((g: any) => {
              const groupDays = (g.day || "")
                .split(/, | & /)
                .map((d: string) => d.replace(/s$/, ""));
              return (
                g.time === modalEventDetails.group.time &&
                groupDays.includes(targetDay)
              );
            });
            if (idx !== -1) payload.course_group_index = idx;
          }
        }
        if (!currentlyCancelled) {
          const res: any = await (dispatch as any)(
            createSessionCancellation(payload)
          );
          if (res.meta.requestStatus === "rejected") {
            console.error("createSessionCancellation failed", res);
          } else {
            setModalEventDetails((prev) =>
              prev ? { ...prev, isCancelled: true } : prev
            );
          }
        } else {
          // find the existing cancellation id for this occurrence
          const existing = (cancellations as any[]).find(
            (c) =>
              c.item_type === payload.item_type &&
              c.course_id === payload.course_id &&
              c.day === payload.day &&
              c.time === payload.time &&
              c.session_date === payload.session_date
          );
          if (existing) {
            const res: any = await (dispatch as any)(
              deleteSessionCancellation(existing.id)
            );
            if (res.meta.requestStatus === "rejected") {
              console.error("deleteSessionCancellation failed", res);
            } else {
              setModalEventDetails((prev) =>
                prev ? { ...prev, isCancelled: false } : prev
              );
            }
          } else {
            console.warn("No matching cancellation entry found to delete");
          }
        }
      } catch (e) {
        console.error("Erreur toggle statut session", e);
      }
    };
    showCustomConfirmation(title, message, buttonText, buttonStyle, perform);
  };

  const openLinkEditor = () => {
    if (!modalEventDetails || !modalEventDetails.date) return;
    setSelectedEventForLink({
      ...modalEventDetails,
      date: modalEventDetails.date,
    });
    setCurrentLink(modalEventDetails.meetingLink || "");
    setIsLinkModalOpen(true);
  };

  const handleSaveLink = () => {
    if (!selectedEventForLink) return;

    const sessionKey = generateSessionKey(
      selectedEventForLink.itemId,
      selectedEventForLink.itemType,
      selectedEventForLink.group,
      selectedEventForLink.date
    );
    const overrides = JSON.parse(
      localStorage.getItem("session_link_overrides") || "{}"
    );

    if (currentLink.trim()) {
      overrides[sessionKey] = currentLink.trim();
    } else {
      delete overrides[sessionKey]; // Remove override if link is cleared
    }

    localStorage.setItem("session_link_overrides", JSON.stringify(overrides));

    // Close modals and reload data to reflect the change everywhere
    setIsLinkModalOpen(false);
    setModalEventDetails(null);
    setSelectedEventForLink(null);
    setCurrentLink("");
    dispatch(
      showSuccess({ title: "Succès", message: "Lien de la session mis à jour" })
    );
    loadData();
  };

  const timeLabels = Array.from(
    { length: END_HOUR - START_HOUR + 1 },
    (_, i) => {
      const hour = START_HOUR + i;
      const pad = (n: number) => n.toString().padStart(2, "0");
      return { time: `${pad(hour)}:00`, hour24: hour };
    }
  );

  const handleResetFilters = () => {
    setInstructorFilter("");
    setTypeFilters([]);
    setStudentSearch("");
    setShowCurrentOnly(false);
  };

  const handleTypeFilterChange = (filterKey: string) => {
    setTypeFilters((prev) =>
      prev.includes(filterKey)
        ? prev.filter((f) => f !== filterKey)
        : [...prev, filterKey]
    );
  };

  const filterGroups = {
    Course: {
      "course-online": "En Ligne",
      "course-in-person": "En Présentiel",
    },
  };

  const isLoading = coursesLoading || usersLoading || enrollmentsLoading;

  // Le contenu de l'horaire qui sera affiché dans le layout approprié
  const scheduleContent = (
    <>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 md:mb-0 text-center">
          {title}
        </h1>
        <button
          onClick={handleRefreshAllData}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 bg-brand-dark text-white rounded-lg hover:bg-[#e13734] transition-colors disabled:opacity-70"
        >
          <ArrowPathIcon
            className={`w-5 h-5 ${isRefreshing ? "animate-spin" : ""}`}
          />
          {isRefreshing ? "Actualisation..." : "Actualiser l'affichage"}
        </button>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-dark"></div>
          <span className="ml-2 text-slate-600">
            Chargement de l'emploi du temps...
          </span>
        </div>
      )}

      {!isLoading && (userRole === "admin" || userRole === "prof") ? (
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nom de l'Étudiant
              </label>
              <input
                type="text"
                placeholder="ex: Jean Dupont"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-pistachio-dark focus:border-pistachio-dark sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="instructorFilter"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Instructeur
              </label>
              <select
                id="instructorFilter"
                value={instructorFilter}
                onChange={(e) => setInstructorFilter(e.target.value)}
                className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-pistachio-dark focus:border-pistachio-dark sm:text-sm"
              >
                <option value="">Tous les Instructeurs</option>
                {instructors.map((prof) => (
                  <option
                    key={prof.id}
                    value={`${prof.firstName} ${prof.lastName}`}
                  >
                    {prof.firstName} {prof.lastName}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative" ref={typeFilterRef}>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Type de Session
              </label>
              <button
                type="button"
                onClick={() => setIsTypeFilterOpen(!isTypeFilterOpen)}
                className="flex items-center justify-between w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm text-left focus:outline-none focus:ring-pistachio-dark focus:border-pistachio-dark sm:text-sm"
              >
                <span className="truncate">
                  {typeFilters.length === 0
                    ? "Tous les Types"
                    : `${typeFilters.length} sélectionné${
                        typeFilters.length > 1 ? "s" : ""
                      }`}
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-slate-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              {isTypeFilterOpen && (
                <div
                  className="absolute z-10 mt-1 w-full bg-white border border-slate-300 rounded-md shadow-lg p-2"
                  style={{ zIndex: 100 }}
                >
                  {Object.entries(filterGroups).map(([groupName, options]) => (
                    <div key={groupName}>
                      <h4 className="px-2 pt-2 pb-1 text-xs font-bold text-slate-500 uppercase">
                        {groupName}
                      </h4>
                      {Object.entries(options).map(([key, label]) => (
                        <label
                          key={key}
                          className="flex items-center space-x-3 p-2 hover:bg-[#e13734]/10 cursor-pointer rounded-md transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={typeFilters.includes(key)}
                            onChange={() => handleTypeFilterChange(key)}
                            className="h-4 w-4 rounded border-gray-300 text-pistachio-dark focus:ring-pistachio-dark"
                          />
                          <span className="text-sm font-medium text-slate-700">
                            {label}
                          </span>
                        </label>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-6">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showCurrentOnly}
                  onChange={() => setShowCurrentOnly(!showCurrentOnly)}
                  className="h-4 w-4 rounded border-gray-300 text-pistachio-dark focus:ring-pistachio-dark"
                />
                <span className="text-slate-600 font-medium text-sm">
                  Afficher uniquement les événements actuels
                </span>
              </label>
              <label className="hidden md:flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={desktopDayView}
                  onChange={() => setDesktopDayView((v) => !v)}
                  className="h-4 w-4 rounded border-gray-300 text-pistachio-dark focus:ring-pistachio-dark"
                />
                <span className="text-slate-600 font-medium text-sm">
                  Vue par jour (PC)
                </span>
              </label>
            </div>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-200 rounded-full hover:bg-[#e13734] hover:text-white transition-colors"
            >
              Réinitialiser les filtres
            </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center gap-6 mb-8">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showCurrentOnly}
              onChange={() => setShowCurrentOnly(!showCurrentOnly)}
              className="h-4 w-4 rounded border-gray-300 text-pistachio-dark focus:ring-pistachio-dark"
            />
            <span className="text-slate-600 font-medium">
              Afficher uniquement les événements actuels
            </span>
          </label>
          <label className="hidden md:flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={desktopDayView}
              onChange={() => setDesktopDayView((v) => !v)}
              className="h-4 w-4 rounded border-gray-300 text-pistachio-dark focus:ring-pistachio-dark"
            />
            <span className="text-slate-600 font-medium">
              Vue par jour (PC)
            </span>
          </label>
        </div>
      )}

      {/* Desktop View (Weekly grid) */}
      {!desktopDayView && (
        <div className="hidden md:block bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <div className="flex">
              <div className="w-20 flex-shrink-0 relative">
                <div className="h-16 border-b border-slate-200 relative">
                  {/* Row resize handle */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-1 cursor-row-resize hover:bg-blue-300 z-20"
                    onMouseDown={(e) => handleMouseDown(e, "row", 0)}
                  />
                </div>
                {timeLabels.map(({ time }, index) => (
                  <div
                    key={time}
                    style={{ height: `${hourHeight}px` }}
                    className="relative -top-3.5 flex justify-end border-b border-slate-200"
                  >
                    <span className="text-xs text-slate-500 pr-2">{time}</span>
                    {/* Row resize handle */}
                    <div
                      className="absolute bottom-0 left-0 right-0 h-1 cursor-row-resize hover:bg-blue-300 z-20"
                      onMouseDown={(e) => handleMouseDown(e, "row", index + 1)}
                    />
                  </div>
                ))}
              </div>
              <div className="flex">
                {weekDays.map((day, dayIndex) => {
                  const today = new Date();
                  const currentDayOfWeek = today.getDay();
                  const monday = new Date(today);
                  monday.setDate(
                    today.getDate() -
                      (currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1)
                  );
                  const columnDate = new Date(monday);
                  columnDate.setDate(monday.getDate() + dayIndex);

                  return (
                    <div
                      key={day}
                      className="relative border-l border-slate-200"
                      style={{ width: `${columnWidths[dayIndex]}px` }}
                    >
                      <div className="h-16 border-b border-slate-200 text-center font-bold text-slate-800 flex items-center justify-center sticky top-0 bg-white z-10 relative">
                        {day}
                        {/* Column resize handle */}
                        <div
                          className="absolute top-0 right-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-300 z-20"
                          onMouseDown={(e) =>
                            handleMouseDown(e, "column", dayIndex)
                          }
                        />
                      </div>
                      <div className="h-full relative">
                        {timeLabels.map((_, index) => (
                          <div
                            key={index}
                            style={{ height: `${hourHeight}px` }}
                            className="border-b border-slate-200"
                          ></div>
                        ))}
                        {(positionedDesktopEvents[day] || []).map((event) => {
                          const sessionKey = generateSessionKey(
                            event.itemId,
                            event.itemType,
                            event.group,
                            columnDate
                          );
                          const isCancelled = isSessionCancelled(
                            event,
                            columnDate
                          );
                          return (
                            <div
                              key={event.id}
                              className="absolute"
                              style={{
                                top: `${
                                  ((event.startTimeMinutes - START_HOUR * 60) /
                                    60) *
                                    hourHeight +
                                  64
                                }px`,
                                height: `${
                                  (event.durationMinutes / 60) * hourHeight - 2
                                }px`,
                                left: event.left,
                                width: event.width,
                                padding: "0 4px",
                              }}
                            >
                              <EventCard
                                event={event}
                                userRole={userRole}
                                colorSet={event.colorSet}
                                onClick={() => handleEventClick(event, day)}
                                isCancelled={isCancelled}
                              />
                            </div>
                          );
                        })}
                        {/* Column resize handle */}
                        <div
                          className="absolute top-0 right-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-300 z-10"
                          onMouseDown={(e) =>
                            handleMouseDown(e, "column", dayIndex)
                          }
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Single-Day View (mobile-like) */}
      {desktopDayView && (
        <div className="hidden md:block">
          <div className="flex justify-between items-center mb-4 px-2">
            <button
              aria-label="Jour précédent"
              onClick={() =>
                setCurrentMobileDayIndex((prev) => (prev - 1 + 7) % 7)
              }
              className="p-2 rounded-full hover:bg-[#e13734]/10 transition-colors"
            >
              <ChevronLeftIcon className="w-6 h-6 text-slate-600" />
            </button>
            <h2 className="text-xl font-bold text-slate-800">
              {weekDays[currentMobileDayIndex]}
            </h2>
            <button
              aria-label="Jour suivant"
              onClick={() => setCurrentMobileDayIndex((prev) => (prev + 1) % 7)}
              className="p-2 rounded-full hover:bg-[#e13734]/10 transition-colors"
            >
              <ChevronRightIcon className="w-6 h-6 text-slate-600" />
            </button>
          </div>

          <div
            className="relative bg-white p-4 rounded-xl shadow-lg border border-slate-200"
            style={{
              height: `${(END_HOUR - START_HOUR) * hourHeight + 40}px`,
            }}
          >
            {/* Hour markers and grid lines */}
            {timeLabels.map(({ time, hour24 }, index) => (
              <div
                key={time}
                className="absolute w-full"
                style={{
                  top: `${(hour24 - START_HOUR) * hourHeight + 40}px`,
                }}
              >
                <div className="absolute -left-2 transform -translate-y-1/2">
                  <span className="text-xs text-slate-400">{time}</span>
                </div>
                <div
                  className="border-t border-slate-200 relative"
                  style={{ marginLeft: "50px" }}
                >
                  {/* Row resize handle */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-1 cursor-row-resize hover:bg-blue-300 z-20"
                    onMouseDown={(e) => handleMouseDown(e, "row", index)}
                  />
                </div>
              </div>
            ))}
            {/* Events container */}
            <div
              className="absolute"
              style={{ top: "40px", bottom: "0", left: "70px", right: "0" }}
            >
              {positionedDesktopSingleDayEvents.map((event) => {
                const today = new Date();
                const currentDayOfWeek = today.getDay();
                const monday = new Date(today);
                monday.setDate(
                  today.getDate() -
                    (currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1)
                );
                const eventDate = new Date(monday);
                eventDate.setDate(monday.getDate() + currentMobileDayIndex);
                const sessionKey = generateSessionKey(
                  event.itemId,
                  event.itemType,
                  event.group,
                  eventDate
                );
                const isCancelled = isSessionCancelled(event, eventDate);

                return (
                  <div
                    key={event.id}
                    className="absolute pr-1"
                    style={{
                      top: `${event.top}px`,
                      height: `${event.height}px`,
                      left: event.left,
                      width: event.width,
                    }}
                  >
                    <EventCard
                      event={event}
                      userRole={userRole}
                      colorSet={event.colorSet}
                      onClick={() =>
                        handleEventClick(event, weekDays[currentMobileDayIndex])
                      }
                      isCancelled={isCancelled}
                    />
                  </div>
                );
              })}
            </div>

            {positionedDesktopSingleDayEvents.length === 0 && (
              <p className="text-center text-slate-500 pt-16">
                Aucun événement prévu pour {weekDays[currentMobileDayIndex]}.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Mobile View (Single Day Timeline) */}
      <div className="md:hidden">
        <div className="flex justify-between items-center mb-4 px-2">
          <button
            aria-label="Jour précédent"
            onClick={() =>
              setCurrentMobileDayIndex((prev) => (prev - 1 + 7) % 7)
            }
            className="p-2 rounded-full hover:bg-slate-100"
          >
            <ChevronLeftIcon className="w-6 h-6 text-slate-600" />
          </button>
          <h2 className="text-xl font-bold text-slate-800">
            {weekDays[currentMobileDayIndex]}
          </h2>
          <button
            aria-label="Jour suivant"
            onClick={() => setCurrentMobileDayIndex((prev) => (prev + 1) % 7)}
            className="p-2 rounded-full hover:bg-slate-100"
          >
            <ChevronRightIcon className="w-6 h-6 text-slate-600" />
          </button>
        </div>

        <div
          className="relative bg-white p-4 rounded-xl shadow-lg border border-slate-200"
          style={{
            height: `${(END_HOUR - START_HOUR) * HOUR_HEIGHT_MOBILE + 40}px`,
          }}
        >
          {/* Hour markers and grid lines */}
          {timeLabels.map(({ time, hour24 }) => (
            <div
              key={time}
              className="absolute w-full"
              style={{
                top: `${(hour24 - START_HOUR) * HOUR_HEIGHT_MOBILE + 40}px`,
              }}
            >
              <div className="absolute -left-2 transform -translate-y-1/2">
                <span className="text-xs text-slate-400">{time}</span>
              </div>
              <div
                className="border-t border-slate-200"
                style={{ marginLeft: "50px" }}
              ></div>
            </div>
          ))}

          {/* Events container */}
          <div
            className="absolute"
            style={{ top: "40px", bottom: "0", left: "70px", right: "0" }}
          >
            {positionedMobileEvents.map((event) => {
              const today = new Date();
              const currentDayOfWeek = today.getDay();
              const monday = new Date(today);
              monday.setDate(
                today.getDate() -
                  (currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1)
              );
              const eventDate = new Date(monday);
              eventDate.setDate(monday.getDate() + currentMobileDayIndex);
              const sessionKey = generateSessionKey(
                event.itemId,
                event.itemType,
                event.group,
                eventDate
              );
              const isCancelled = isSessionCancelled(event);

              return (
                <div
                  key={event.id}
                  className="absolute pr-1"
                  style={{
                    top: `${event.top}px`,
                    height: `${event.height}px`,
                    left: event.left,
                    width: event.width,
                  }}
                >
                  <EventCard
                    event={event}
                    userRole={userRole}
                    colorSet={event.colorSet}
                    onClick={() =>
                      handleEventClick(event, weekDays[currentMobileDayIndex])
                    }
                    isCancelled={isCancelled}
                  />
                </div>
              );
            })}
          </div>

          {positionedMobileEvents.length === 0 && (
            <p className="text-center text-slate-500 pt-16">
              Aucun événement prévu pour {weekDays[currentMobileDayIndex]}.
            </p>
          )}
        </div>
      </div>

      {/* Event Detail Modal */}
      {modalEventDetails && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
          style={{ animationDuration: "0.3s" }}
          onClick={() => setModalEventDetails(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg m-4 p-6"
            style={{ animationDuration: "0.4s" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pb-4 border-b border-slate-200">
              {modalEventDetails.isCancelled && (
                <p className="text-sm font-bold text-red-600 bg-red-100 px-3 py-1 rounded-full inline-block mb-3">
                  THIS SESSION IS CANCELLED
                </p>
              )}
              <h3 className="text-2xl font-bold text-slate-900">
                {modalEventDetails.title}
              </h3>
              <p className="text-pistachio-dark font-semibold mt-1">
                {modalEventDetails.type}
              </p>
            </div>

            <div className="my-4 text-slate-700 space-y-2">
              <p>
                <strong>Date:</strong>{" "}
                {modalEventDetails.date.toLocaleDateString()}
              </p>
              <p>
                <strong>Time:</strong> {modalEventDetails.time}
              </p>
              <p>
                <strong>Instructor:</strong> {modalEventDetails.instructorName}
              </p>
            </div>

            {modalEventDetails.meetingLink &&
              !modalEventDetails.isCancelled && (
                <div className="my-4">
                  <a
                    href={modalEventDetails.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center px-6 py-3 font-semibold text-white bg-pistachio-dark rounded-full hover:bg-lime-900 transition-colors"
                  >
                    Join Session
                  </a>
                </div>
              )}

            {userRole === "admin" &&
              modalEventDetails.filterTypeKey.modality === "online" && (
                <div className="my-4">
                  <button
                    onClick={openLinkEditor}
                    className="block w-full text-center px-6 py-3 font-semibold text-pistachio-dark bg-pistachio-light rounded-full hover:bg-red-200 transition-colors"
                  >
                    Ajouter/Modifier le Lien de Session
                  </button>
                </div>
              )}
            {userRole === "admin" && modalEventDetails.date && (
              <div className="my-4">
                <button
                  onClick={handleSessionCancelToggle}
                  className={`w-full px-6 py-3 font-semibold text-white rounded-full transition-colors ${
                    modalEventDetails.isCancelled
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {modalEventDetails.isCancelled
                    ? "Reinstate Session"
                    : "Cancel Session"}
                </button>
              </div>
            )}

            <div>
              <h4 className="text-lg font-bold text-slate-800 mb-2">
                Enrolled Students ({modalEventDetails.students.length})
              </h4>
              {modalEventDetails.students.length > 0 ? (
                <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                  {modalEventDetails.students.map((student) => (
                    <div
                      key={student.email}
                      className="flex items-center gap-3 p-2 bg-slate-50 rounded-md"
                    >
                      <img
                        src={getProfileImageUrl(student.profilePicture)}
                        alt={`${student.firstName} ${student.lastName}`}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-semibold text-slate-800">
                          {student.firstName} {student.lastName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {student.email}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">
                  No students are enrolled in this session.
                </p>
              )}
            </div>

            <div className="mt-6 text-right">
              <button
                onClick={() => setModalEventDetails(null)}
                className="px-5 py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-full hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Link Editor Modal */}
      {isLinkModalOpen && selectedEventForLink && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]"
          style={{ animationDuration: "0.2s" }}
          onClick={() => setIsLinkModalOpen(false)}
        >
          <div
            className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              Session Link
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              For {selectedEventForLink.title} on{" "}
              {selectedEventForLink.date.toLocaleDateString()}
            </p>
            <div>
              <label
                htmlFor="meetingLink"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Meeting URL
              </label>
              <input
                type="url"
                id="meetingLink"
                value={currentLink}
                onChange={(e) => setCurrentLink(e.target.value)}
                placeholder="https://meet.google.com/..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-pistachio-dark"
              />
              <p className="text-xs text-slate-500 mt-1">
                Leave blank to remove the daily override.
              </p>
            </div>
            <div className="flex justify-end gap-4 pt-6">
              <button
                type="button"
                onClick={() => setIsLinkModalOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-full"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveLink}
                className="px-5 py-2 text-sm font-semibold text-white bg-pistachio-dark rounded-full"
              >
                Save Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      {showConfirmationModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[70]"
          style={{ animationDuration: "0.3s" }}
          onClick={handleConfirmationCancel}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md m-4 p-6 transform transition-all duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              {/* Icon */}
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <svg
                  className="h-8 w-8 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  />
                </svg>
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {confirmationTitle}
              </h3>

              {/* Message */}
              <div className="text-sm text-slate-600 mb-4 whitespace-pre-line leading-relaxed">
                {confirmationMessage}
              </div>

              {/* Loading / Error feedback */}
              {sessionStatusLoading && (
                <div className="flex items-center justify-center gap-2 text-sm text-slate-500 mb-4">
                  <svg
                    className="animate-spin h-4 w-4 text-slate-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                  <span>Traitement en cours...</span>
                </div>
              )}
              {!sessionStatusLoading && sessionStatusError && (
                <div className="mb-4 text-sm text-red-600 font-medium">
                  Erreur: {sessionStatusError}
                </div>
              )}

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  type="button"
                  onClick={
                    !sessionStatusLoading ? handleConfirmationCancel : undefined
                  }
                  disabled={sessionStatusLoading}
                  className={`px-6 py-3 text-sm font-semibold rounded-full transition-colors ${
                    sessionStatusLoading
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                      : "text-slate-700 bg-slate-100 hover:bg-slate-200"
                  }`}
                >
                  {sessionStatusLoading ? "..." : "Annuler"}
                </button>
                <button
                  type="button"
                  onClick={
                    !sessionStatusLoading
                      ? handleConfirmationConfirm
                      : undefined
                  }
                  disabled={sessionStatusLoading}
                  className={`px-6 py-3 text-sm font-semibold text-white rounded-full transition-colors flex items-center justify-center gap-2 ${confirmationButtonStyle} ${
                    sessionStatusLoading ? "opacity-80 cursor-wait" : ""
                  }`}
                >
                  {sessionStatusLoading && (
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      ></path>
                    </svg>
                  )}
                  <span>
                    {sessionStatusLoading
                      ? "Veuillez patienter"
                      : confirmationButtonText}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );

  // Navigation helpers (robust hash navigation without fighting browser default)
  const forceHashNavigation = (path: string) => {
    if (window.location.hash === path) return;
    try {
      // Mark this as user initiated so global guards don't override
      (window as any).__manualNav = true;
      window.location.hash = path;
      // Failsafe: if some code swallows the hashchange, dispatch one
      setTimeout(() => {
        if (window.location.hash !== path) {
          window.location.hash = path;
        }
        window.dispatchEvent(new HashChangeEvent("hashchange"));
        // Clear the flag shortly after to avoid affecting other flows
        setTimeout(() => {
          (window as any).__manualNav = false;
        }, 50);
      }, 0);
    } catch (err) {
      // Absolute fallback
      window.location.replace(path);
    }
  };

  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    // Let the anchor default proceed, but stop propagation so no parent swallows it
    e.stopPropagation();
    if (window.location.hash !== path) {
      forceHashNavigation(path);
    }
  };

  // Navigation component
  const NavLink: React.FC<{
    path: string;
    children: React.ReactNode;
    isPrefix?: boolean;
  }> = ({ path, children, isPrefix = false }) => {
    const currentPath = window.location.hash;
    const isActive = isPrefix
      ? currentPath.startsWith(path)
      : currentPath === path;

    return (
      <a
        href={path}
        onMouseDown={() => forceHashNavigation(path)}
        onClick={(e) => handleNav(e, path)}
        aria-current={isActive ? "page" : undefined}
        tabIndex={0}
        className={`pointer-events-auto relative z-30 flex items-center gap-3 px-4 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer block ${
          isActive
            ? "bg-[#e13734] text-white"
            : "text-slate-600 hover:bg-slate-100 hover:text-[#e13734]"
        }`}
      >
        {children}
      </a>
    );
  };

  // Sidebar component with hide/show functionality
  const ScheduleSidebar = () => (
    <>
      {/* Mobile and Desktop Toggle Buttons - Only shown when sidebar is closed */}
      {!isSidebarOpen && (
        <button
          onClick={showSidebar}
          className="lg:hidden fixed top-24 left-4 z-50 bg-white p-3 rounded-lg shadow-lg border border-slate-200 hover:bg-slate-50 cursor-pointer"
          aria-label="Ouvrir la barre latérale"
          title="Ouvrir la barre latérale"
          type="button"
        >
          <svg
            className="w-6 h-6 text-slate-600 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      )}

      {!isSidebarOpen && (
        <button
          onClick={showSidebar}
          className="hidden lg:block fixed top-24 left-4 z-50 bg-white p-3 rounded-lg shadow-lg border border-slate-200 hover:bg-slate-50 hover:shadow-xl transition-all cursor-pointer"
          aria-label="Ouvrir la barre latérale"
          title="Ouvrir la barre latérale"
          type="button"
        >
          <svg
            className="w-5 h-5 text-slate-600 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      )}

      <aside
        className={`
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          ${isSidebarOpen ? "block" : "hidden"}
          fixed lg:relative top-0 left-0 z-40 w-80 h-screen lg:h-auto
          transition-transform duration-300 ease-in-out
          lg:w-1/6 lg:min-w-[300px]
          flex-shrink-0
        `}
      >
        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-30"
            onClick={hideSidebar}
          />
        )}

        <div className="bg-white p-4 rounded-xl shadow-lg h-full relative z-40 mt-16 lg:mt-0 lg:w-1/4 lg:min-w-[100%]">
          {/* Hide Sidebar Button */}
          <button
            onClick={hideSidebar}
            className="absolute top-2 right-2 p-2 rounded-lg text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-all duration-200 bg-white border border-slate-200 hover:border-slate-300 shadow-lg hover:shadow-xl active:scale-95 z-[9999] cursor-pointer select-none"
            aria-label="Masquer la barre latérale"
            title="Masquer la barre latérale"
            type="button"
          >
            <svg
              className="w-5 h-5 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* Sidebar Header */}
          <div className="mb-4 pb-3 border-b border-slate-200 pr-12">
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
              Menu
            </h3>
          </div>
          <nav className="space-y-1">
            {userRole === "admin" && (
              <>
                <NavLink path="#/admin/dashboard">
                  <span>Tableau de bord</span>
                </NavLink>
                <NavLink path="#/admin/payments" isPrefix={true}>
                  <span>Paiements</span>
                </NavLink>
                <div className="pt-2 mt-2 border-t border-slate-200">
                  <p className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase">
                    Personnes
                  </p>
                  <NavLink path="#/admin/students" isPrefix={true}>
                    <span>Étudiants</span>
                  </NavLink>
                  <NavLink path="#/admin/profs" isPrefix={true}>
                    <span>Instructeurs</span>
                  </NavLink>
                  <NavLink path="#/admin/employees" isPrefix={true}>
                    <span>Employés</span>
                  </NavLink>
                </div>
                <div className="pt-2 mt-2 border-t border-slate-200">
                  <p className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase">
                    Contenu
                  </p>
                  <NavLink path="#/admin/courses" isPrefix={true}>
                    <span>Cours</span>
                  </NavLink>
                </div>
              </>
            )}

            {userRole === "prof" && (
              <>
                <NavLink path="#/prof/dashboard">
                  <span>Tableau de bord</span>
                </NavLink>
                <NavLink path="#/prof/profile">
                  <span>Profil</span>
                </NavLink>
              </>
            )}

            {userRole === "employee" && (
              <>
                <NavLink path="#/admin/dashboard">
                  <span>Tableau de bord</span>
                </NavLink>
                <NavLink path="#/admin/payments" isPrefix={true}>
                  <span>Paiements</span>
                </NavLink>
                <div className="pt-2 mt-2 border-t border-slate-200">
                  <p className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase">
                    Personnes
                  </p>
                  <NavLink path="#/admin/students" isPrefix={true}>
                    <span>Étudiants</span>
                  </NavLink>
                  <NavLink path="#/admin/profs" isPrefix={true}>
                    <span>Instructeurs</span>
                  </NavLink>
                </div>
                <div className="pt-2 mt-2 border-t border-slate-200">
                  <p className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase">
                    Contenu
                  </p>
                  <NavLink path="#/admin/courses" isPrefix={true}>
                    <span>Cours</span>
                  </NavLink>
                </div>
              </>
            )}

            {userRole === "student" && (
              <>
                <NavLink path="#/dashboard">
                  <span>Tableau de bord</span>
                </NavLink>
                <NavLink path="#/my-courses">
                  <span>Mes cours</span>
                </NavLink>
                <NavLink path="#/monthly-payments">
                  <span>Paiements mensuels</span>
                </NavLink>
                <NavLink path="#/profile">
                  <span>Profil</span>
                </NavLink>
              </>
            )}
          </nav>
        </div>
      </aside>
    </>
  );

  // Rendu avec sidebar personnalisée intégrée
  return (
    <div
      className={`w-full min-h-screen py-6 ${
        userRole === "student" ? "px-2 sm:px-4" : "px-2 sm:px-4"
      }`}
    >
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar only shows on desktop lg+ screens and only for admin/prof users */}
        {(userRole === "admin" || userRole === "prof") && <ScheduleSidebar />}
        <main
          className={`flex-grow min-w-0 w-full transition-all duration-300 ${
            (userRole === "admin" || userRole === "prof") && !isSidebarOpen
              ? "lg:ml-0"
              : "lg:ml-0"
          } ${
            userRole === "student"
              ? "mx-4 sm:mx-8 lg:mx-16 xl:mx-24 pt-16 lg:pt-0"
              : "pt-16 lg:pt-0"
          }`}
        >
          {scheduleContent}
        </main>
      </div>
    </div>
  );
};

export default SchedulePage;



import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from "../store";
import { fetchAllParcours } from "../store/slices/parcoursSlice";
import {
  fetchUsersAsync,
  selectUsers,
  selectUserLoading,
} from "../store/slices/userSlice";
import {
  fetchAllEnrollments,
  selectAllEnrollments,
  selectEnrollmentsLoading,
} from "../store/enrollmentsSlice";
import { Instructor } from "../data/instructors";
import { CalendarDaysIcon } from "../components/icons/CalendarDaysIcon";
import { UsersIcon } from "../components/icons/UsersIcon";
import { ClipboardListIcon } from "../components/icons/ClipboardListIcon";
import RefreshButton from "../components/RefreshButton";
import { getProfileImageUrl } from "../services/baseApi";
import { fetchSessionCancellations } from "../store/slices/sessionCancellationsSlice";

// A generic user data type
interface UserData {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  city?: string;
  profilePicture?: string;
  dob?: string;
}

// A generic enrollment type compatible with Redux
interface LocalEnrollment {
  id: number;
  user_id: number;
  course_id: number;
  status: "active" | "cancelled" | "pending";
  enrolled_at: string;
  group_data?: any;
  created_at: string;
  updated_at: string;
}

interface ScheduleItem {
  title: string;
  time: string;
  type: string;
  isCancelled: boolean;
}

const generateSessionKey = (
  itemId: string,
  itemType: "course",
  group: any,
  date: Date
): string => {
  const dateString = date.toISOString().split("T")[0]; // YYYY-MM-DD
  const groupIdentifier = `${group.day}-${group.time}`;
  const sanitizedIdentifier = groupIdentifier.replace(/[\s,:&]/g, "");
  return `${itemId}_${sanitizedIdentifier}_${dateString}`;
};

// A local StatCard component for styling consistency
// FIX: Explicitly type the `icon` prop to be a ReactElement that accepts a `className`, resolving the `cloneElement` type error.
const StatCard: React.FC<{
  icon: React.ReactElement<{ className?: string }>;
  title: string;
  value: string | number;
  colorClasses: string;
}> = ({ icon, title, value, colorClasses }) => {
  return (
    <div
      className={`bg-gradient-to-br ${colorClasses} text-white p-6 rounded-xl shadow-lg relative overflow-hidden`}
    >
      <div className="absolute -right-4 -bottom-4 text-white/20">
        {React.cloneElement(icon, { className: "w-24 h-24" })}
      </div>
      <div className="relative">
        <p className="text-4xl font-bold">{value}</p>
        <p className="text-sm font-medium uppercase tracking-wider">{title}</p>
      </div>
    </div>
  );
};

const ProfDashboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [prof, setProf] = useState<Instructor | null>(null);
  const [students, setStudents] = useState<UserData[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<UserData | null>(null);
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalStudents: 0,
    sessionsToday: 0,
  });
  const [todaysSchedule, setTodaysSchedule] = useState<ScheduleItem[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [studentQuery, setStudentQuery] = useState<string>("");
  const pageSize = 30;

  // Redux selectors
  const courses = useAppSelector((state: any) => state.parcours.items);
  const users = useAppSelector(selectUsers);
  const enrollments = useAppSelector(selectAllEnrollments);
  const sessionCancellations = useAppSelector(
    (state) => (state as any).sessionCancellations?.items || []
  );
  const sessionCancellationsLoading = useAppSelector(
    (state) => (state as any).sessionCancellations?.loading || false
  );
  const coursesLoading = useAppSelector((state: any) => state.parcours.loading);
  const usersLoading = useAppSelector(selectUserLoading);
  const enrollmentsLoading = useAppSelector(selectEnrollmentsLoading);

  const isLoading = coursesLoading || usersLoading || enrollmentsLoading;

  useEffect(() => {
    // Load data from Redux
    dispatch(fetchAllParcours());
    dispatch(fetchUsersAsync());
    dispatch(fetchAllEnrollments());
    (dispatch as any)(fetchSessionCancellations({}));
  }, [dispatch]);

  useEffect(() => {
    // Calculate stats when Redux data changes
    const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");
    setProf(loggedInUser);

    if (
      loggedInUser?.id &&
      courses.length > 0 &&
      users.length > 0 &&
      enrollments.length > 0
    ) {
      calculateStatsAndSchedule(loggedInUser);
    }
  }, [courses, users, enrollments]);

  // Filtered students (by name or email)
  const filteredStudents = React.useMemo(() => {
    const q = studentQuery.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) => {
      const fullName = `${s.firstName || ""} ${s.lastName || ""}`.toLowerCase();
      return fullName.includes(q) || (s.email || "").toLowerCase().includes(q);
    });
  }, [students, studentQuery]);

  // Ensure current page is valid when filtered list changes
  useEffect(() => {
    const totalPages = Math.max(
      1,
      Math.ceil(filteredStudents.length / pageSize)
    );
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [filteredStudents.length]);

  // Compute professor-relevant cancellations
  const profCancelledSessions = React.useMemo(() => {
    return [] as Array<{
      id: number;
      title: string;
      type: string;
      day: string;
      time: string;
      date: string;
    }>;
  }, [prof, sessionCancellations, courses]);
  const smallCancelledLayout = profCancelledSessions.length <= 3;

  const calculateStatsAndSchedule = (loggedInUser: any) => {
    const sessionCancellations = new Set(
      JSON.parse(localStorage.getItem("session_cancellations") || "[]")
    );

    // --- Calculate Total Sessions & Today's Schedule ---
    let totalSessionsCount = 0;
    const todaysEvents: ScheduleItem[] = [];
    const weekDays = [
      "Lundis",
      "Mardis",
      "Mercredis",
      "Jeudis",
      "Vendredis",
      "Samedis",
      "Dimanches",
    ];
    const today = new Date();
    const currentDayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1;
    const currentDayName = weekDays[currentDayIndex];

    // Process parcours
    courses.forEach((parcours: any) => {
      if (parcours.modules) {
        parcours.modules.forEach((module: any) => {
          if (module.sessions) {
            module.sessions.forEach((session: any) => {
              // TODO: Check instructor
              const sessionDate = new Date(session.start_date);
              if (sessionDate.toDateString() === today.toDateString()) {
                todaysEvents.push({
                  title: `${parcours.title} - ${module.title}`,
                  time: sessionDate.toLocaleTimeString(),
                  type: "Parcours",
                  isCancelled: false,
                });
              }
              totalSessionsCount++;
            });
          }
        });
      }
    });

    setTodaysSchedule(todaysEvents);

    // --- Find Students ---
    const activeEnrollments = enrollments.filter((e) => e.status === "active");
    const profStudentIds = new Set<number>();

    activeEnrollments.forEach((en) => {
      // Check if this enrollment is for a course taught by this professor
      if (en.course_id) {
        const course = courses.find((c) => c.id === en.course_id);
        if (course) {
          const hasGroupTaughtByProf = course.groups.some(
            (g) => g.instructor_id === loggedInUser.id
          );
          if (hasGroupTaughtByProf) {
            profStudentIds.add(en.user_id);
          }
        }
      }
    });

    const profStudents = users
      .filter((u) => profStudentIds.has(u.id))
      .map((u) => ({
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        phone: u.phone || "",
        city: u.city || "",
        profilePicture: u.profilePicture,
        dob: u.dob || "",
      }));

    setStudents(profStudents);

    // --- Set Final Stats ---
    setStats({
      totalSessions: totalSessionsCount,
      totalStudents: profStudents.length,
      sessionsToday: todaysEvents.length,
    });
  };

  if (!prof || isLoading) {
    return (
      <div className="container mx-auto px-6 py-12">
        <div className="text-center py-20">
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pistachio-dark"></div>
            <span className="ml-2 text-slate-600">
              Chargement des données du tableau de bord...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-6 py-12">
      <div className="w-full">
        <div className="flex justify-between items-center mb-12">
          <div className="text-center flex-1">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-2">
              Tableau de Bord Professeur
            </h1>
            <p className="text-slate-600">Bon retour, {prof.name}.</p>
          </div>
          <div>
            <RefreshButton />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={<ClipboardListIcon />}
            title="Total Sessions"
            value={stats.totalSessions}
            colorClasses="from-sky-500 to-sky-400"
          />
          <StatCard
            icon={<UsersIcon />}
            title="Total Étudiants"
            value={stats.totalStudents}
            colorClasses="from-violet-500 to-violet-400"
          />
          <StatCard
            icon={<CalendarDaysIcon />}
            title="Sessions Aujourd'hui"
            value={stats.sessionsToday}
            colorClasses="from-lime-500 to-lime-400"
          />
        </div>

        {/* Cancelled Sessions + Today's Schedule layout */}
        {smallCancelledLayout ? (
          <div className="flex flex-col md:flex-row items-stretch gap-8 mb-8">
            {/* Cancelled Sessions */}
            <div className="bg-white p-8 rounded-xl shadow-lg md:flex-none md:w-auto">
              <div className="flex items-center gap-3 mb-6">
                <ClipboardListIcon className="w-6 h-6 text-slate-500" />
                <h2 className="text-2xl font-bold text-slate-800">
                  Cancelled Sessions
                </h2>
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  {profCancelledSessions.length}
                </span>
                {sessionCancellationsLoading && (
                  <span className="ml-2 text-sm text-slate-500">Loading…</span>
                )}
              </div>
              {profCancelledSessions.length > 0 ? (
                <div className="flex flex-wrap gap-4">
                  {profCancelledSessions.map((c) => (
                    <div
                      key={c.id}
                      className="p-4 rounded-lg border bg-red-50 border-red-200 w-fit max-w-full"
                    >
                      <p className="font-semibold text-slate-800">{c.title}</p>
                      <p className="text-sm text-slate-600">{c.type}</p>
                      <p className="text-sm text-red-700 mt-1">
                        {c.day} • {c.time}
                      </p>
                      <p className="text-xs text-slate-500">Date: {c.date}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-slate-500 py-4">
                  No cancelled sessions.
                </p>
              )}
            </div>

            {/* Today's Schedule */}
            <div className="bg-white p-8 rounded-xl shadow-lg md:flex-1 md:min-w-0">
              <div className="flex items-center gap-3 mb-6">
                <CalendarDaysIcon className="w-6 h-6 text-slate-500" />
                <h2 className="text-2xl font-bold text-slate-800">
                  Horaire du jour
                </h2>
              </div>
              {todaysSchedule.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {todaysSchedule.map((item, index) => (
                    <div
                      key={`${item.title}-${item.time}-${index}`}
                      className={`p-4 rounded-lg border ${
                        item.isCancelled
                          ? "bg-red-50 border-red-200"
                          : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <p
                        className={`font-bold text-slate-800 ${
                          item.isCancelled ? "line-through" : ""
                        }`}
                      >
                        {item.title}
                      </p>
                      <p
                        className={`text-sm text-slate-600 ${
                          item.isCancelled ? "line-through" : ""
                        }`}
                      >
                        {item.time}
                      </p>
                      <p
                        className={`text-xs text-pistachio-dark font-semibold mt-1 ${
                          item.isCancelled ? "line-through" : ""
                        }`}
                      >
                        {item.type}
                      </p>
                      {item.isCancelled && (
                        <p className="text-xs font-bold text-red-600 mt-1">
                          ANNULÉ
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-slate-500 py-4">
                  Aucun cours prévu pour aujourd'hui.
                </p>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Cancelled Sessions (Top) */}
            <div className="bg-white p-8 rounded-xl shadow-lg mb-8">
              <div className="flex items-center gap-3 mb-6">
                <ClipboardListIcon className="w-6 h-6 text-slate-500" />
                <h2 className="text-2xl font-bold text-slate-800">
                  Cancelled Sessions
                </h2>
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  {profCancelledSessions.length}
                </span>
                {sessionCancellationsLoading && (
                  <span className="ml-2 text-sm text-slate-500">Loading…</span>
                )}
              </div>
              {profCancelledSessions.length > 0 ? (
                <div className="flex flex-wrap gap-4">
                  {profCancelledSessions.map((c) => (
                    <div
                      key={c.id}
                      className="p-4 rounded-lg border bg-red-50 border-red-200 w-fit max-w-full"
                    >
                      <p className="font-semibold text-slate-800">{c.title}</p>
                      <p className="text-sm text-slate-600">{c.type}</p>
                      <p className="text-sm text-red-700 mt-1">
                        {c.day} • {c.time}
                      </p>
                      <p className="text-xs text-slate-500">Date: {c.date}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-slate-500 py-4">
                  No cancelled sessions.
                </p>
              )}
            </div>

            {/* Today's Schedule (Second) */}
            <div className="bg-white p-8 rounded-xl shadow-lg mb-8">
              <div className="flex items-center gap-3 mb-6">
                <CalendarDaysIcon className="w-6 h-6 text-slate-500" />
                <h2 className="text-2xl font-bold text-slate-800">
                  Horaire du jour
                </h2>
              </div>
              {todaysSchedule.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {todaysSchedule.map((item, index) => (
                    <div
                      key={`${item.title}-${item.time}-${index}`}
                      className={`p-4 rounded-lg border ${
                        item.isCancelled
                          ? "bg-red-50 border-red-200"
                          : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <p
                        className={`font-bold text-slate-800 ${
                          item.isCancelled ? "line-through" : ""
                        }`}
                      >
                        {item.title}
                      </p>
                      <p
                        className={`text-sm text-slate-600 ${
                          item.isCancelled ? "line-through" : ""
                        }`}
                      >
                        {item.time}
                      </p>
                      <p
                        className={`text-xs text-pistachio-dark font-semibold mt-1 ${
                          item.isCancelled ? "line-through" : ""
                        }`}
                      >
                        {item.type}
                      </p>
                      {item.isCancelled && (
                        <p className="text-xs font-bold text-red-600 mt-1">
                          ANNULÉ
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-slate-500 py-4">
                  Aucun cours prévu pour aujourd'hui.
                </p>
              )}
            </div>
          </>
        )}

        {/* My Students (Third) with pagination and horizontal item layout) */}
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-6 gap-3">
            <div className="flex items-center gap-3">
              <UsersIcon className="w-6 h-6 text-slate-500" />
              <h2 className="text-2xl font-bold text-slate-800">My Students</h2>
            </div>
            <div className="flex items-center gap-3 max-w-full">
              <input
                type="text"
                placeholder="Rechercher par nom ou e-mail..."
                value={studentQuery}
                onChange={(e) => {
                  setStudentQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full md:w-80 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pistachio-dark"
              />
              <div className="text-sm text-slate-600 whitespace-nowrap">
                {filteredStudents.length} of {students.length}
              </div>
            </div>
          </div>
          {students.length > 0 ? (
            filteredStudents.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredStudents
                    .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                    .map((student) => (
                      <button
                        key={student.email}
                        onClick={() => setSelectedStudent(student)}
                        className="w-full text-left group focus:outline-none focus:ring-2 focus:ring-pistachio-dark rounded-lg"
                      >
                        <div className="flex items-center gap-4 p-4 border rounded-lg hover:border-pistachio-DEFAULT transition-colors">
                          <img
                            src={getProfileImageUrl(student.profilePicture)}
                            alt={`${student.firstName} ${student.lastName}`}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-800 truncate">
                              {student.firstName} {student.lastName}
                            </p>
                            <p className="text-xs text-slate-500 truncate">
                              {student.email}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                </div>
                {/* Pagination */}
                <div className="flex items-center justify-between mt-6 text-sm">
                  <div>
                    Page {currentPage} of{" "}
                    {Math.max(1, Math.ceil(filteredStudents.length / pageSize))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="px-3 py-1 rounded border disabled:opacity-50"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Prev
                    </button>
                    <button
                      className="px-3 py-1 rounded border disabled:opacity-50"
                      onClick={() =>
                        setCurrentPage((p) =>
                          Math.min(
                            Math.max(
                              1,
                              Math.ceil(filteredStudents.length / pageSize)
                            ),
                            p + 1
                          )
                        )
                      }
                      disabled={
                        currentPage >=
                        Math.ceil(filteredStudents.length / pageSize)
                      }
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-center text-slate-500 py-4">
                Aucun résultat ne correspond à votre filtre.
              </p>
            )
          ) : (
            <p className="text-center text-slate-500 py-4">
              Vous n'avez encore aucun étudiant inscrit dans vos cours.
            </p>
          )}
        </div>
      </div>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="student-modal-title"
          onClick={() => setSelectedStudent(null)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setSelectedStudent(null);
            }
          }}
          tabIndex={-1}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md m-4 p-8"
            onClick={(e) => e.stopPropagation()}
            role="document"
          >
            <div className="flex flex-col items-center text-center">
              <img
                src={getProfileImageUrl(selectedStudent.profilePicture)}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover mb-4 border-4 border-slate-100"
              />
              <h3
                id="student-modal-title"
                className="text-2xl font-bold text-slate-900"
              >
                {selectedStudent.firstName} {selectedStudent.lastName}
              </h3>
              <p className="text-slate-500">{selectedStudent.email}</p>
            </div>
            <div className="mt-6 pt-6 border-t border-slate-200 text-sm space-y-3">
              <div className="flex justify-between">
                <strong className="font-semibold text-slate-500">Phone:</strong>{" "}
                <span className="text-slate-700">{selectedStudent.phone}</span>
              </div>
              <div className="flex justify-between">
                <strong className="font-semibold text-slate-500">City:</strong>{" "}
                <span className="text-slate-700">{selectedStudent.city}</span>
              </div>
              <div className="flex justify-between">
                <strong className="font-semibold text-slate-500">
                  Date of Birth:
                </strong>{" "}
                <span className="text-slate-700">{selectedStudent.dob}</span>
              </div>
            </div>
            <div className="mt-6 text-right">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-5 py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-full hover:bg-slate-200"
                autoFocus
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfDashboardPage;
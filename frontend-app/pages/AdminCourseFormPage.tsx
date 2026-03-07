import React, { useEffect, useState } from "react";
import { getCourseImageUrl, API_BASE_URL } from "../services/baseApi";
import AdminLayout from "../components/admin/AdminLayout";
import InputField from "../components/InputField";
import BackArrowIcon from "../components/icons/BackArrowIcon";
import TrashIcon from "../components/icons/TrashIcon";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../store";
import { showSuccess, showError } from "../store/slices/uiSlice";
import StatusModal from "../components/StatusModal";
import {
  createParcours,
  updateParcours,
  clearCurrentParcours,
} from "../store/slices/parcoursSlice";
import {
  compressImage,
  getDataUrlSizeMB,
  isValidImageType,
} from "../utils/imageUtils";
import {
  selectInstructors,
  selectUserLoading,
} from "../store/slices/userSlice";
import { Parcours } from "../services/parcoursService";

interface FormGroup {
  // New optional fields for display/labeling of a group
  title?: string;
  subtitle?: string;
  day?: string;
  dayOfMonth?: number | null; // 1-31
  month?: number | null; // 1-12
  time?: string;
  price: number;
  instructorId?: number | null;
  meetingLink?: string;
}
interface FormCourse {
  id?: number;
  title: string;
  type: "in-person" | "online";
  shortDescription: string;
  description: string;
  imageUrl?: string; // preview or existing relative path
  imageFile?: File | null; // raw file selected
  durationMonths: number;
  sessionsPerMonth: number;
  groups: FormGroup[];
}

const daysOfWeek = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
];

const AdminCourseFormPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const courses = useSelector((state: any) => state.parcours.items);
  const selectedCourse = useSelector(
    (state: any) => state.parcours.currentItem
  );
  const loadError = useSelector((state: any) => state.parcours.error);
  const instructors = useSelector(selectInstructors);
  const isLoadingUsers = useSelector(selectUserLoading);
  const [isEditing, setIsEditing] = useState(false);
  const [course, setCourse] = useState<FormCourse>({
    title: "",
    type: "in-person",
    shortDescription: "",
    description: "",
    imageUrl: "",
    groups: [
      {
        title: "",
        subtitle: "",
        day: "",
        time: "",
        price: 0,
        instructorId: null,
        meetingLink: "",
      },
    ],
    durationMonths: 1,
    sessionsPerMonth: 4,
  });
  const [openDayPicker, setOpenDayPicker] = useState<number | null>(null);
  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean;
    type: "success" | "error";
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".day-picker-dropdown")) {
        setOpenDayPicker(null);
      }
    };

    if (openDayPicker !== null) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [openDayPicker]);

  useEffect(() => {
    // Utiliser les instructeurs déjà présents dans Redux (pas de fetch)

    const hash = window.location.hash;
    if (hash.includes("/edit/")) {
      const rawId = hash.split("/edit/").pop();
      const id = rawId ? parseInt(rawId, 10) : NaN;
      if (!isNaN(id)) {
        setIsEditing(true);
        // Utiliser les données déjà présentes dans Redux au lieu d'un fetch
        const courseToEdit = courses.find((course) => course.id === id);
        if (courseToEdit) {
          // Mapper directement les données Redux vers le state local
          setCourse({
            id: courseToEdit.id,
            title: courseToEdit.title,
            type: courseToEdit.type || "in-person",
            shortDescription: courseToEdit.short_description || "",
            description: courseToEdit.description || "",
            imageUrl: courseToEdit.image_url || "",
            durationMonths: courseToEdit.duration_months || 1,
            sessionsPerMonth: courseToEdit.sessions_per_month || 4,
            groups: (courseToEdit.groups || []).map((g) => {
              // parse existing jour/month (or fallback to date YYYY-MM-DD) into dayOfMonth and month
              let dayOfMonth: number | null = null;
              let month: number | null = null;
              if ((g as any).jour || (g as any).month) {
                dayOfMonth = (g as any).jour
                  ? Number((g as any).jour) || null
                  : null;
                month = (g as any).month
                  ? Number((g as any).month) || null
                  : null;
              } else if ((g as any).date) {
                try {
                  const parts = (g as any).date.split("-");
                  if (parts.length === 3) {
                    month = Number(parts[1]) || null;
                    dayOfMonth = Number(parts[2]) || null;
                  }
                } catch (e) {
                  // ignore
                }
              }
              return {
                title: (g as any).title || "",
                subtitle: (g as any).subtitle || "",
                day: g.day || "",
                dayOfMonth,
                month,
                time: g.time || "",
                price: Number(g.price) || 0,
                instructorId: g.instructor
                  ? g.instructor.id
                  : g.instructor_id || null,
                meetingLink: g.meeting_link || "",
              };
            }) || [
              {
                title: "",
                subtitle: "",
                day: "",
                dayOfMonth: null,
                month: null,
                time: "",
                price: 0,
                instructorId: null,
                meetingLink: "",
              },
            ],
          });
        }
      }
    }
    return () => {
      dispatch(clearCurrentParcours());
    };
  }, [dispatch, courses]); // Ajouter courses comme dépendance

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setCourse((prev) => ({
      ...prev,
      [name]: ["durationMonths", "sessionsPerMonth", "price"].includes(name)
        ? Number(value)
        : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];

      // Validate file type
      if (!isValidImageType(file)) {
        dispatch(
          showError({
            title: "Erreur",
            message:
              "Type de fichier non supporté. Veuillez utiliser JPG, PNG ou GIF.",
          })
        );
        e.target.value = ""; // Clear the input
        return;
      }

      // Validate file size (20MB raw limit before compression)
      const sizeMB = file.size / (1024 * 1024);
      if (sizeMB > 20) {
        dispatch(
          showError({
            title: "Erreur",
            message: `L'image est trop grande (${sizeMB.toFixed(
              1
            )}MB). Veuillez utiliser une image plus petite.`,
          })
        );
        e.target.value = ""; // Clear the input
        return;
      }

      const preview = URL.createObjectURL(file);
      setCourse((prev) => ({ ...prev, imageFile: file, imageUrl: preview }));
    }
  };

  const handleGroupChange = (
    index: number,
    field: keyof FormGroup,
    value: any
  ) => {
    setCourse((prev) => {
      const groups = [...prev.groups];
      const g = { ...groups[index] };
      (g as any)[field] = field === "price" ? Number(value) : value;
      groups[index] = g;
      return { ...prev, groups };
    });
  };

  const handleDaySelection = (groupIndex: number, day: string) => {
    console.log("Day selection clicked:", day, "for group", groupIndex);

    setCourse((prev) => {
      const newCourse = { ...prev };
      const newGroups = [...newCourse.groups];
      const currentGroup = { ...newGroups[groupIndex] };

      // Parse current days
      const currentDaysStr = currentGroup.day || "";
      const currentDaysArr = currentDaysStr
        ? currentDaysStr.split(", ").filter(Boolean)
        : [];
      console.log("Current days array:", currentDaysArr);

      // Toggle day
      const dayIndex = currentDaysArr.indexOf(day);
      if (dayIndex >= 0) {
        // Remove day
        currentDaysArr.splice(dayIndex, 1);
        console.log("Removed day:", day);
      } else {
        // Add day
        currentDaysArr.push(day);
        console.log("Added day:", day);
      }

      // Sort days according to daysOfWeek order
      const sortedDays = daysOfWeek.filter((d) => currentDaysArr.includes(d));
      const newDayString = sortedDays.join(", ");

      currentGroup.day = newDayString;
      newGroups[groupIndex] = currentGroup;
      newCourse.groups = newGroups;

      console.log("New day string:", newDayString);
      console.log("Updated course:", newCourse);

      return newCourse;
    });
  };

  const parseRange = (range: string): { start: string; end: string } => {
    const cleaned = (range || "").replace(/\s*(AM|PM)\s*/gi, "").trim();
    if (!cleaned) return { start: "", end: "" };

    const parts = cleaned.split("-").map((p) => p.trim());
    if (parts.length === 2) {
      const [start, end] = parts;
      return { start: start || "", end: end || "" };
    }

    // S’il n’y a qu’une seule partie, on la considère comme "start"
    if (parts.length === 1 && parts[0]) {
      return { start: parts[0], end: "" };
    }

    return { start: "", end: "" };
  };

  const handleTimeChange = (
    index: number,
    which: "start" | "end",
    value: string
  ) => {
    setCourse((prev) => {
      const newCourse = { ...prev };
      const newGroups = [...newCourse.groups];
      const currentGroup = { ...newGroups[index] };

      const { start, end } = parseRange(currentGroup.time || "");
      const newStart = which === "start" ? value : start;
      const newEnd = which === "end" ? value : end;

      // Toujours garder le séparateur, même si l’un des deux est vide
      currentGroup.time = `${newStart || ""} - ${newEnd || ""}`.trim();
      newGroups[index] = currentGroup;
      newCourse.groups = newGroups;

      return newCourse;
    });
  };

  const addGroup = () => {
    setCourse((prev) => ({
      ...prev,
      groups: [
        ...prev.groups,
        {
          title: "",
          subtitle: "",
          day: "",
          time: "",
          price: 0,
          instructorId: null,
          meetingLink: "",
        },
      ],
    }));
  };

  const removeGroup = (index: number) => {
    setCourse((prev) => ({
      ...prev,
      groups: prev.groups.filter((_, i) => i !== index),
    }));
  };

  const buildPayload = (): Partial<Parcours> => {
    return {
      title: course.title,
      slug: course.title.toLowerCase().replace(/ /g, "-"),
      description: course.description,
      photo: course.imageFile ? undefined : course.imageUrl || undefined,
      lieu: course.type === "in-person" ? "Sur place" : "En ligne",
      // groups are ignored for now as Parcours structure is different
    };
  };

  const buildFormData = (isUpdate: boolean): FormData => {
    const fd = new FormData();
    fd.append("title", course.title);
    fd.append("description", course.description);
    fd.append("short_description", course.shortDescription);
    fd.append("type", course.type);
    fd.append("duration_months", String(course.durationMonths));
    fd.append("sessions_per_month", String(course.sessionsPerMonth));
    // Keep existing path if editing and no new file selected
    if (course.imageFile) {
      fd.append("image", course.imageFile);
    } else if (course.imageUrl && !course.imageUrl.startsWith("blob:")) {
      fd.append("image_url", course.imageUrl); // relative path already stored
    }
    fd.append(
      "groups",
      JSON.stringify(
        course.groups.map((g) => {
          return {
            title: (g as any).title || undefined,
            subtitle: (g as any).subtitle || undefined,
            day: g.day || undefined,
            jour: g.dayOfMonth ?? undefined,
            month: g.month ?? undefined,
            time: g.time || undefined,
            price: g.price,
            instructor_id: g.instructorId ?? undefined,
            meeting_link: g.meetingLink || undefined,
          };
        })
      )
    );
    return fd;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const readAsDataURL = (file: File) =>
      new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

    // Always use Redux thunks for consistency and better error handling
    const submitWithFallback = async () => {
      setIsSubmitting(true);

      try {
        let payload = buildPayload();

        // If there's an image file, compress and convert to base64
        if (course.imageFile) {
          try {
            // Validate file type first
            if (!isValidImageType(course.imageFile)) {
              setStatusModal({
                isOpen: true,
                type: "error",
                title: "Erreur",
                message:
                  "Type de fichier non supporté. Veuillez utiliser JPG, PNG ou GIF.",
              });
              return;
            }

            // Compress image to reduce payload size
            const compressedDataUrl = await compressImage(
              course.imageFile,
              800,
              600,
              0.8
            );
            const sizeMB = getDataUrlSizeMB(compressedDataUrl);

            console.log(`🖼️ Image compressed: ${sizeMB.toFixed(2)}MB`);

            if (sizeMB > 10) {
              setStatusModal({
                isOpen: true,
                type: "error",
                title: "Erreur",
                message:
                  "L'image est encore trop grande après compression. Veuillez utiliser une image plus petite.",
              });
              return;
            }

            (payload as any).image_url = compressedDataUrl;
          } catch (imgErr) {
            console.error("Image compression failed:", imgErr);
            setStatusModal({
              isOpen: true,
              type: "error",
              title: "Erreur",
              message: "Erreur lors du traitement de l'image",
            });
            return;
          }
        }

        let result: any;
        if (isEditing && course.id) {
          result = await dispatch(
            updateParcours({
              id: course.id,
              data: payload,
            })
          );
        } else {
          result = await dispatch(createParcours(payload));
        }

        if (!result.error) {
          setStatusModal({
            isOpen: true,
            type: "success",
            title: "Succès",
            message: isEditing
              ? "Module modifié avec succès! 🎉"
              : "Module créé avec succès! 🎉",
          });

          dispatch(
            showSuccess({
              title: "Succès",
              message: isEditing
                ? "Module modifié avec succès"
                : "Module créé avec succès",
            })
          );
        } else {
          console.error("Course save failed:", result.error);
          setStatusModal({
            isOpen: true,
            type: "error",
            title: "Erreur",
            message: result.error?.message || "Erreur lors de la sauvegarde",
          });
        }
      } catch (err: any) {
        console.error("Submit error:", err);
        setStatusModal({
          isOpen: true,
          type: "error",
          title: "Erreur",
          message: err?.message || "Erreur lors de la sauvegarde",
        });
      } finally {
        setIsSubmitting(false);
      }
    };

    submitWithFallback();
  };

  const handleStatusModalClose = () => {
    setStatusModal({ ...statusModal, isOpen: false });

    // If it was a success, navigate back after closing the modal
    if (statusModal.type === "success") {
      setTimeout(() => {
        window.history.back();
      }, 300);
    }
  };

  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    window.location.hash = path;
  };

  return (
    <AdminLayout>
      <a
        href="#/admin/courses"
        onClick={(e) => handleNav(e, "#/admin/courses")}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 mb-4 transition-colors"
      >
        <BackArrowIcon className="w-5 h-5" />
        Retour à Tous les Modules
      </a>
      <div className="bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">
          {isEditing ? "Modifier le Module" : "Ajouter un Nouveau Module"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loadError && (
              <div className="md:col-span-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded">
                {String(loadError)}
              </div>
            )}
            <InputField
              id="title"
              label="Titre du Module"
              type="text"
              value={course.title}
              onChange={handleChange}
              required
            />
            <div>
              <label
                htmlFor="type"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Type de Module
              </label>
              <select
                id="type"
                name="type"
                value={course.type}
                onChange={handleChange}
                className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-pistachio-dark focus:border-pistachio-dark sm:text-sm"
              >
                <option value="in-person">En Présentiel</option>
                <option value="online">En Ligne</option>
              </select>
            </div>
          </div>
          <InputField
            id="shortDescription"
            label="Description Courte"
            type="text"
            value={course.shortDescription}
            onChange={handleChange}
            required
          />
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Description Complète
            </label>
            <textarea
              id="description"
              name="description"
              value={course.description || ""}
              onChange={handleChange}
              rows={4}
              className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-pistachio-dark focus:border-pistachio-dark sm:text-sm"
              required
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              id="durationMonths"
              label="Durée (Mois)"
              type="number"
              value={String(course.durationMonths)}
              onChange={handleChange}
              required
            />
            <InputField
              id="sessionsPerMonth"
              label="Sessions par Mois"
              type="number"
              value={String(course.sessionsPerMonth)}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label
              htmlFor="courseImage"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Image du Module
            </label>
            <div className="flex items-center gap-4">
              {course.imageUrl && (
                <img
                  src={
                    course.imageUrl.startsWith("blob:")
                      ? course.imageUrl
                      : getCourseImageUrl(course.imageUrl)
                  }
                  alt="preview"
                  className="w-20 h-20 object-cover rounded-md"
                />
              )}
              <input
                id="courseImage"
                type="file"
                onChange={handleFileChange}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pistachio-light file:text-pistachio-dark hover:file:bg-lime-200"
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-slate-800 mb-2 border-b pb-2">
              Sessions
            </h3>
            <div className="space-y-4 pt-2">
              {course.groups.map((group, index) => {
                // Parse time values once per group per render
                const { start: startTime, end: endTime } = parseRange(
                  group.time || ""
                );

                return (
                  // eslint-disable-next-line react/no-array-index-key
                  <div
                    key={index}
                    className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end p-3 bg-slate-50 rounded-lg"
                  >
                    {/* Title & Subtitle for Group */}
                    <div className="sm:col-span-6">
                      <label
                        htmlFor={`gtitle-${index}`}
                        className="block text-sm font-medium text-slate-700 mb-1"
                      >
                        Titre de la session
                      </label>
                      <input
                        id={`gtitle-${index}`}
                        type="text"
                        value={group.title || ""}
                        onChange={(e) =>
                          handleGroupChange(index, "title", e.target.value)
                        }
                        placeholder="ex. Débutants A1 – Matin"
                        className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-pistachio-dark focus:border-pistachio-dark sm:text-sm"
                      />
                    </div>
                    <div className="sm:col-span-6">
                      <label
                        htmlFor={`gsubtitle-${index}`}
                        className="block text-sm font-medium text-slate-700 mb-1"
                      >
                        Sous-titre
                      </label>
                      <input
                        id={`gsubtitle-${index}`}
                        type="text"
                        value={group.subtitle || ""}
                        onChange={(e) =>
                          handleGroupChange(index, "subtitle", e.target.value)
                        }
                        placeholder="ex. Session du week-end / Salle 2"
                        className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-pistachio-dark focus:border-pistachio-dark sm:text-sm"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label
                        htmlFor={`daypicker-${index}`}
                        className="block text-sm font-medium text-slate-700 mb-1"
                      >
                        Jour(s)
                      </label>
                      <div className="relative day-picker-dropdown">
                        <button
                          id={`daypicker-${index}`}
                          type="button"
                          onClick={() =>
                            setOpenDayPicker(
                              openDayPicker === index ? null : index
                            )
                          }
                          className="block text-left w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-pistachio-dark focus:border-pistachio-dark sm:text-sm"
                        >
                          {group.day ? (
                            <span className="text-slate-900">{group.day}</span>
                          ) : (
                            <span className="text-slate-400">
                              Sélectionner...
                            </span>
                          )}
                        </button>
                        {openDayPicker === index && (
                          <div className="absolute z-10 mt-1 w-full bg-white border border-slate-300 rounded-md shadow-lg p-2 grid grid-cols-2 gap-2">
                            {daysOfWeek.map((day) => {
                              const selectedDaysArr = group.day
                                ? group.day.split(", ").filter(Boolean)
                                : [];
                              const active = selectedDaysArr.includes(day);
                              return (
                                <button
                                  key={day}
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleDaySelection(index, day);
                                  }}
                                  className={`px-2 py-1 text-sm rounded-md transition-colors ${
                                    active
                                      ? "bg-pistachio-dark text-white"
                                      : "hover:bg-slate-100"
                                  }`}
                                >
                                  {day}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="sm:col-span-2 grid grid-cols-2 gap-2">
                      <div>
                        <label
                          htmlFor={`dayOfMonth-${index}`}
                          className="block text-sm font-medium text-slate-700 mb-1"
                        >
                          Jour (1-31)
                        </label>
                        <input
                          id={`dayOfMonth-${index}`}
                          type="number"
                          min={1}
                          max={31}
                          value={group.dayOfMonth ?? ""}
                          onChange={(e) =>
                            handleGroupChange(
                              index,
                              "dayOfMonth",
                              e.target.value ? Number(e.target.value) : null
                            )
                          }
                          className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-pistachio-dark focus:border-pistachio-dark sm:text-sm"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor={`month-${index}`}
                          className="block text-sm font-medium text-slate-700 mb-1"
                        >
                          Mois
                        </label>
                        <select
                          id={`month-${index}`}
                          value={group.month ?? ""}
                          onChange={(e) =>
                            handleGroupChange(
                              index,
                              "month",
                              e.target.value ? Number(e.target.value) : null
                            )
                          }
                          className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-pistachio-dark focus:border-pistachio-dark sm:text-sm"
                        >
                          <option value="">Mois...</option>
                          {[...Array(12)].map((_, i) => (
                            <option key={i + 1} value={i + 1}>
                              {i + 1}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="sm:col-span-3">
                      <label
                        htmlFor={`start-${index}`}
                        className="block text-sm font-medium text-slate-700 mb-1"
                      >
                        Heure de début
                      </label>
                      <input
                        id={`start-${index}`}
                        type="time"
                        step={900}
                        value={startTime}
                        onChange={(e) =>
                          handleTimeChange(index, "start", e.target.value)
                        }
                        className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-pistachio-dark focus:border-pistachio-dark sm:text-sm"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label
                        htmlFor={`end-${index}`}
                        className="block text-sm font-medium text-slate-700 mb-1"
                      >
                        Heure de fin
                      </label>
                      <input
                        id={`end-${index}`}
                        type="time"
                        step={900}
                        value={endTime}
                        onChange={(e) =>
                          handleTimeChange(index, "end", e.target.value)
                        }
                        className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-pistachio-dark focus:border-pistachio-dark sm:text-sm"
                      />
                    </div>
                    {course.type === "online" && (
                      <div className="sm:col-span-3">
                        <InputField
                          id={`link-${index}`}
                          label="Lien de Réunion"
                          type="url"
                          value={group.meetingLink || ""}
                          onChange={(e) =>
                            handleGroupChange(
                              index,
                              "meetingLink",
                              e.target.value
                            )
                          }
                        />
                      </div>
                    )}
                    <div
                      className={
                        course.type === "online"
                          ? "sm:col-span-3"
                          : "sm:col-span-6"
                      }
                    >
                      <label
                        htmlFor={`instructor-${index}`}
                        className="block text-sm font-medium text-slate-700 mb-1"
                      >
                        Instructeur
                      </label>
                      <select
                        id={`instructor-${index}`}
                        name="instructorId"
                        value={group.instructorId ?? ""}
                        onChange={(e) =>
                          handleGroupChange(
                            index,
                            "instructorId",
                            e.target.value ? Number(e.target.value) : null
                          )
                        }
                        className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-pistachio-dark focus:border-pistachio-dark sm:text-sm"
                      >
                        <option value="" disabled>
                          {isLoadingUsers
                            ? "Chargement..."
                            : "Sélectionner un instructeur..."}
                        </option>
                        {instructors.map((instructor) => (
                          <option key={instructor.id} value={instructor.id}>
                            {instructor.firstName} {instructor.lastName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-1">
                      <InputField
                        id={`price-${index}`}
                        label="Prix"
                        type="number"
                        value={String(group.price)}
                        onChange={(e) =>
                          handleGroupChange(index, "price", e.target.value)
                        }
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeGroup(index)}
                      aria-label="Supprimer la session"
                      className="p-2 text-red-500 hover:bg-red-100 rounded-full h-10 w-10 flex items-center justify-center"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                );
              })}
            </div>
            <button
              type="button"
              onClick={addGroup}
              className="mt-4 px-4 py-2 text-sm font-semibold text-pistachio-dark border border-pistachio-dark rounded-full hover:bg-pistachio-light"
            >
              + Ajouter une Session
            </button>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <a
              href="#/admin/courses"
              onClick={(e) => handleNav(e, "#/admin/courses")}
              className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-full hover:bg-slate-200"
            >
              Annuler
            </a>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-5 py-2 text-sm font-semibold rounded-full transition-colors ${
                isSubmitting
                  ? "bg-slate-400 cursor-not-allowed text-white"
                  : "text-white bg-pistachio-dark hover:bg-lime-900"
              }`}
            >
              {isSubmitting
                ? "Enregistrement..."
                : isEditing
                ? "Enregistrer les Modifications"
                : "Créer le Module"}
            </button>
          </div>
        </form>
      </div>

      <StatusModal
        isOpen={statusModal.isOpen}
        onClose={handleStatusModalClose}
        type={statusModal.type}
        title={statusModal.title}
        message={statusModal.message}
      />
    </AdminLayout>
  );
};

export default AdminCourseFormPage;

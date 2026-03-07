import React, { useEffect, useState } from "react";
import AdminLayout from "../components/admin/AdminLayout";
import InputField from "../components/InputField";
import BackArrowIcon from "../components/icons/BackArrowIcon";
import TrashIcon from "../components/icons/TrashIcon";
import StatusModal from "../components/StatusModal";
import AlertManager from "../utils/AlertManager";
import { useDispatch } from "react-redux";
import { showSuccess, showError } from "../store/slices/uiSlice";

// Types for revisions
interface Revision {
  id?: string;
  title: string;
  shortDescription: string;
  description: string;
  imageUrl?: string;
  durationMonths: number;
  sessionsPerMonth: number;
  modalities: any[];
}

// Constants
import { API_BASE_URL, BACKEND_URL } from "../services/baseApi";

// Local form shape mirroring adapted revision structure used in UI
interface FormModalityOption {
  id?: number; // Add id to track existing options
  type: "Written" | "Oral" | "Both";
  day: string;
  time: string;
  price: number;
  instructorId?: number | null;
  meetingLink?: string;
}
interface FormModality {
  type: "Online" | "In-Person";
  options: FormModalityOption[];
}
interface FormRevision {
  id?: string;
  title: string;
  shortDescription: string;
  description: string;
  imageUrl?: string; // preview or existing relative path
  imageFile?: File | null; // raw file chosen
  durationMonths: number;
  sessionsPerMonth: number;
  modalities: FormModality[];
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

const AdminRevisionFormPage: React.FC = () => {
  const revisions = JSON.parse(localStorage.getItem("revisions") || "[]");
  const instructors = JSON.parse(localStorage.getItem("profs") || "[]");
  const [isEditing, setIsEditing] = useState(false);
  const [openDayPicker, setOpenDayPicker] = useState<string | null>(null); // "modIndex-optIndex" format
  const [revision, setRevision] = useState<FormRevision>({
    title: "",
    shortDescription: "",
    description: "",
    imageUrl: "",
    durationMonths: 1,
    sessionsPerMonth: 4,
    modalities: [],
  });
  const dispatch = useDispatch();
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

  // Helper function to get the correct image URL
  const getImageUrl = (imageUrl: string | undefined): string | undefined => {
    if (!imageUrl) return undefined;

    // If it's already a blob URL (for newly selected files), return as is
    if (imageUrl.startsWith("blob:")) return imageUrl;

    // If it's a full URL, return as is
    if (imageUrl.startsWith("http")) return imageUrl;

    // If it's a relative path from Laravel storage, construct the full URL using BACKEND_URL
    return `${BACKEND_URL}/storage/${imageUrl}`;
  };

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
        const revisionToEdit = revisions.find((revision) => revision.id === id);
        if (revisionToEdit) {
          // Mapper directement les données Redux vers le state local
          setRevision({
            id: revisionToEdit.id,
            title: revisionToEdit.title,
            shortDescription: revisionToEdit.shortDescription || "",
            description: revisionToEdit.description || "",
            imageUrl: revisionToEdit.imageUrl || "",
            durationMonths: revisionToEdit.durationMonths,
            sessionsPerMonth: (revisionToEdit as any).sessionsPerMonth || 4,
            modalities: (revisionToEdit.modalities || []).map((m) => ({
              type: m.type,
              options: (m.options || []).map((o) => ({
                id: o.id, // Preserve the ID for existing options
                type: o.type,
                day: o.day || "",
                time: o.time || "",
                price: o.price || 0,
                instructorId: (o as any).instructorId || null,
                meetingLink: o.meetingLink || "",
              })),
            })),
          });
        }
      }
    }
  }, [revisions]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setRevision((prev) => ({
      ...prev,
      [name]: ["durationMonths", "sessionsPerMonth"].includes(name)
        ? Number(value)
        : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      const blobPreview = URL.createObjectURL(file);
      setRevision((prev) => ({
        ...prev,
        imageFile: file,
        imageUrl: blobPreview,
      }));
    }
  };

  const handleModalityChange = (
    modIndex: number,
    field: keyof FormModality,
    value: any
  ) => {
    setRevision((prev) => {
      const mods = [...prev.modalities];
      (mods[modIndex] as any)[field] = value;
      return { ...prev, modalities: mods };
    });
  };

  const handleOptionChange = (
    modIndex: number,
    optIndex: number,
    field: keyof FormModalityOption,
    value: any
  ) => {
    setRevision((prev) => {
      const mods = [...prev.modalities];
      const opts = [...mods[modIndex].options];
      (opts[optIndex] as any)[field] =
        field === "price" ? Number(value) : value;
      mods[modIndex].options = opts;
      return { ...prev, modalities: mods };
    });
  };

  const handleDaySelection = (
    modIndex: number,
    optIndex: number,
    day: string
  ) => {
    console.log(
      "Day selection clicked:",
      day,
      "for modality",
      modIndex,
      "option",
      optIndex
    );

    setRevision((prev) => {
      const newRevision = { ...prev };
      const newModalities = [...newRevision.modalities];
      const currentModality = { ...newModalities[modIndex] };
      const newOptions = [...currentModality.options];
      const currentOption = { ...newOptions[optIndex] };

      // Parse current days
      const currentDaysStr = currentOption.day || "";
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

      currentOption.day = newDayString;
      newOptions[optIndex] = currentOption;
      currentModality.options = newOptions;
      newModalities[modIndex] = currentModality;
      newRevision.modalities = newModalities;

      console.log("New day string:", newDayString);

      return newRevision;
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

    // S'il n'y a qu'une seule partie, on la considère comme "start"
    if (parts.length === 1 && parts[0]) {
      return { start: parts[0], end: "" };
    }

    return { start: "", end: "" };
  };

  const handleTimeChange = (
    modIndex: number,
    optIndex: number,
    which: "start" | "end",
    value: string
  ) => {
    setRevision((prev) => {
      const newRevision = { ...prev };
      const newModalities = [...newRevision.modalities];
      const currentModality = { ...newModalities[modIndex] };
      const newOptions = [...currentModality.options];
      const currentOption = { ...newOptions[optIndex] };

      const { start, end } = parseRange(currentOption.time || "");
      const newStart = which === "start" ? value : start;
      const newEnd = which === "end" ? value : end;

      // Toujours garder le séparateur, même si l'un des deux est vide
      currentOption.time = `${newStart || ""} - ${newEnd || ""}`.trim();

      newOptions[optIndex] = currentOption;
      currentModality.options = newOptions;
      newModalities[modIndex] = currentModality;
      newRevision.modalities = newModalities;

      return newRevision;
    });
  };

  const addModality = () => {
    setRevision((prev) => ({
      ...prev,
      modalities: [...prev.modalities, { type: "Online", options: [] }],
    }));
  };

  const removeModality = async (modIndex: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette modalité ?")) return;

    setRevision((prev) => ({
      ...prev,
      modalities: prev.modalities.filter((_, i) => i !== modIndex),
    }));
  };

  const addOption = (modIndex: number) => {
    setRevision((prev) => {
      const mods = [...prev.modalities];
      mods[modIndex].options = [
        ...mods[modIndex].options,
        {
          type: "Written",
          day: "",
          time: "",
          price: 0,
          instructorId: null,
          meetingLink: "",
        },
      ];
      return { ...prev, modalities: mods };
    });
  };

  const removeOption = async (modIndex: number, optIndex: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette option ?")) return;

    setRevision((prev) => {
      const mods = [...prev.modalities];
      mods[modIndex].options = mods[modIndex].options.filter(
        (_, i) => i !== optIndex
      );
      return { ...prev, modalities: mods };
    });
  };

  const buildPayload = (): any => {
    // Flatten grouped modalities -> API expects one entry per option with delivery_type + session_type
    // Note: nous ne passons pas les IDs car le backend va recréer toutes les modalités
    const flattened = revision.modalities.flatMap((m) =>
      m.options.map((o) => ({
        delivery_type: m.type,
        session_type: o.type,
        day: o.day,
        time: o.time,
        price: o.price,
        instructor_id: (o.instructorId ?? undefined) as number | undefined,
        meeting_link: o.meetingLink || undefined,
        // capacity & status optional; could add UI later
        // Note: on n'inclut pas l'ID car le backend va tout recréer
      }))
    );
    return {
      title: revision.title,
      description: revision.description,
      short_description: revision.shortDescription,
      image_url: revision.imageUrl || null,
      duration_months: revision.durationMonths,
      sessions_per_month: revision.sessionsPerMonth,
      modalities: flattened,
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Flatten grouped modalities -> API expects one entry per option with delivery_type + session_type
    // Note: on n'inclut pas les IDs car le backend va tout recréer
    const flattened = revision.modalities.flatMap((m) =>
      m.options.map((o) => ({
        delivery_type: m.type,
        session_type: o.type,
        day: o.day,
        time: o.time,
        price: o.price,
        instructor_id: (o.instructorId ?? undefined) as number | undefined,
        meeting_link: o.meetingLink || undefined,
      }))
    );

    if (revision.imageFile) {
      const fd = new FormData();
      fd.append("title", revision.title);
      fd.append("description", revision.description);
      fd.append("short_description", revision.shortDescription);
      fd.append("duration_months", String(revision.durationMonths));
      fd.append("sessions_per_month", String(revision.sessionsPerMonth));
      fd.append("status", "active");
      fd.append("modalities", JSON.stringify(flattened));
      fd.append("image", revision.imageFile);
      const token = localStorage.getItem("auth_token");
      const isUpdate = isEditing && revision.id;
      const url = isUpdate
        ? `${API_BASE_URL}/revisions/${revision.id}`
        : `${API_BASE_URL}/revisions`;
      const method = "POST";
      if (isUpdate) fd.append("_method", "PUT");
      fetch(url, {
        method,
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: fd,
      })
        .then((r) => r.json())
        .then((json) => {
          if (json.id || json.success) {
            setStatusModal({
              isOpen: true,
              type: "success",
              title: "Succès",
              message: "Révision enregistrée avec succès! 🎉",
            });

            dispatch(
              showSuccess({
                title: "Succès",
                message: "Révision enregistrée avec succès",
              })
            );
          } else {
            console.error("Revision save failed", json);
            setStatusModal({
              isOpen: true,
              type: "error",
              title: "Erreur",
              message: json.message || "Failed to save revision",
            });
          }
        })
        .catch((err) => {
          console.error("Revision upload error", err);
          setStatusModal({
            isOpen: true,
            type: "error",
            title: "Erreur",
            message: "Erreur upload image",
          });
        })
        .finally(() => {
          setIsSubmitting(false);
        });
      return;
    }

    // Save to localStorage
    const allRevisions: Revision[] = JSON.parse(
      localStorage.getItem("revisions") || "[]"
    );
    if (isEditing) {
      const updated = allRevisions.map((r) =>
        r.id === revision.id ? (revision as unknown as Revision) : r
      );
      localStorage.setItem("revisions", JSON.stringify(updated));
    } else {
      const newRevision: Revision = {
        ...revision,
        id:
          revision.title!.toLowerCase().replace(/\s+/g, "-") +
          "-" +
          Date.now().toString(36),
      } as unknown as Revision;
      allRevisions.push(newRevision);
      localStorage.setItem("revisions", JSON.stringify(allRevisions));
    }

    setStatusModal({
      isOpen: true,
      type: "success",
      title: "Succès",
      message: "Révision enregistrée avec succès! 🎉",
    });

    dispatch(
      showSuccess({
        title: "Succès",
        message: "Révision enregistrée avec succès",
      })
    );
    setIsSubmitting(false);
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
        href="#/admin/revisions"
        onClick={(e) => handleNav(e, "#/admin/revisions")}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 mb-4 transition-colors"
      >
        <BackArrowIcon className="w-5 h-5" /> Back to All Revisions
      </a>
      <div className="bg-white p-8 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">
          {isEditing ? "Edit Revision Session" : "Add New Revision Session"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <InputField
            id="title"
            label="Title"
            type="text"
            value={revision.title}
            onChange={handleChange}
            required
          />
          <InputField
            id="shortDescription"
            label="Short Description"
            type="text"
            value={revision.shortDescription}
            onChange={handleChange}
            required
          />
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Full Description
            </label>
            <textarea
              id="description"
              name="description"
              value={revision.description || ""}
              onChange={handleChange}
              rows={4}
              className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-pistachio-dark focus:border-pistachio-dark sm:text-sm"
              required
            ></textarea>
          </div>
          <InputField
            id="durationMonths"
            label="Duration (Months)"
            type="number"
            value={String(revision.durationMonths)}
            onChange={handleChange}
            required
          />
          <div>
            <label
              htmlFor="imageUpload"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Image
            </label>
            <div className="flex items-center gap-4">
              {revision.imageUrl && (
                <img
                  src={getImageUrl(revision.imageUrl)}
                  alt="preview"
                  className="w-20 h-20 object-cover rounded-md"
                  onError={(e) => {
                    console.error("Error loading image:", revision.imageUrl);
                    e.currentTarget.style.display = "none";
                  }}
                />
              )}
              <input
                id="imageUpload"
                type="file"
                onChange={handleFileChange}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pistachio-light file:text-pistachio-dark hover:file:bg-lime-200"
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-slate-800 mb-2 border-b pb-2">
              Modalities & Options
            </h3>
            <div className="space-y-4 pt-2">
              {revision.modalities.map((mod, modIndex) => (
                // eslint-disable-next-line react/no-array-index-key
                <div
                  key={modIndex}
                  className="p-4 bg-slate-50 rounded-lg border"
                >
                  <div className="flex justify-between items-center mb-4">
                    <select
                      value={mod.type}
                      onChange={(e) =>
                        handleModalityChange(modIndex, "type", e.target.value)
                      }
                      className="block w-full sm:w-auto px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-pistachio-dark focus:border-pistachio-dark sm:text-sm font-semibold"
                    >
                      <option value="Online">Online</option>
                      <option value="In-Person">In-Person</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => removeModality(modIndex)}
                    >
                      <TrashIcon className="w-5 h-5 text-red-500" />
                    </button>
                  </div>
                  {mod.options.map((opt, optIndex) => {
                    // Parse time values once per option per render
                    const { start: startTime, end: endTime } = parseRange(
                      opt.time || ""
                    );
                    const dropdownKey = `${modIndex}-${optIndex}`;

                    return (
                      // eslint-disable-next-line react/no-array-index-key
                      <div
                        key={optIndex}
                        className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end p-2 border-t"
                      >
                        <div className="sm:col-span-2">
                          <label
                            htmlFor={`type-${modIndex}-${optIndex}`}
                            className="block text-sm font-medium text-slate-700 mb-1"
                          >
                            Type
                          </label>
                          <select
                            id={`type-${modIndex}-${optIndex}`}
                            value={opt.type}
                            onChange={(e) =>
                              handleOptionChange(
                                modIndex,
                                optIndex,
                                "type",
                                e.target.value
                              )
                            }
                            className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-pistachio-dark focus:border-pistachio-dark sm:text-sm"
                          >
                            <option>Written</option>
                            <option>Oral</option>
                            <option>Both</option>
                          </select>
                        </div>
                        <div className="sm:col-span-2">
                          <label
                            htmlFor={`instructor-${modIndex}-${optIndex}`}
                            className="block text-sm font-medium text-slate-700 mb-1"
                          >
                            Instructor
                          </label>
                          <select
                            id={`instructor-${modIndex}-${optIndex}`}
                            value={opt.instructorId ?? ""}
                            onChange={(e) =>
                              handleOptionChange(
                                modIndex,
                                optIndex,
                                "instructorId",
                                e.target.value ? Number(e.target.value) : null
                              )
                            }
                            className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-pistachio-dark focus:border-pistachio-dark sm:text-sm"
                            required
                          >
                            <option value="" disabled>
                              Select instructor...
                            </option>
                            {instructors.map((instructor) => (
                              <option key={instructor.id} value={instructor.id}>
                                {instructor.firstName} {instructor.lastName}
                              </option>
                            ))}
                          </select>
                        </div>
                        {mod.type === "Online" && (
                          <div className="sm:col-span-2">
                            <InputField
                              id={`link-${modIndex}-${optIndex}`}
                              label="Meeting Link"
                              type="url"
                              value={opt.meetingLink || ""}
                              onChange={(e) =>
                                handleOptionChange(
                                  modIndex,
                                  optIndex,
                                  "meetingLink",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        )}
                        <div className="sm:col-span-2">
                          <label
                            htmlFor={`daypicker-${modIndex}-${optIndex}`}
                            className="block text-sm font-medium text-slate-700 mb-1"
                          >
                            Day(s)
                          </label>
                          <div className="relative day-picker-dropdown">
                            <button
                              id={`daypicker-${modIndex}-${optIndex}`}
                              type="button"
                              onClick={() =>
                                setOpenDayPicker(
                                  openDayPicker === dropdownKey
                                    ? null
                                    : dropdownKey
                                )
                              }
                              className="block text-left w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-pistachio-dark focus:border-pistachio-dark sm:text-sm"
                            >
                              {opt.day ? (
                                <span className="text-slate-900">
                                  {opt.day}
                                </span>
                              ) : (
                                <span className="text-slate-400">
                                  Select days...
                                </span>
                              )}
                            </button>
                            {openDayPicker === dropdownKey && (
                              <div className="absolute z-10 mt-1 w-full bg-white border border-slate-300 rounded-md shadow-lg p-2 grid grid-cols-2 gap-2">
                                {daysOfWeek.map((day) => {
                                  const selectedDaysArr = opt.day
                                    ? opt.day.split(", ").filter(Boolean)
                                    : [];
                                  const active = selectedDaysArr.includes(day);
                                  return (
                                    <button
                                      key={day}
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleDaySelection(
                                          modIndex,
                                          optIndex,
                                          day
                                        );
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
                        <div className="sm:col-span-1">
                          <label
                            htmlFor={`start-${modIndex}-${optIndex}`}
                            className="block text-sm font-medium text-slate-700 mb-1"
                          >
                            Start Time
                          </label>
                          <input
                            id={`start-${modIndex}-${optIndex}`}
                            type="time"
                            step={900}
                            value={startTime}
                            onChange={(e) =>
                              handleTimeChange(
                                modIndex,
                                optIndex,
                                "start",
                                e.target.value
                              )
                            }
                            className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-pistachio-dark focus:border-pistachio-dark sm:text-sm"
                          />
                        </div>
                        <div className="sm:col-span-1">
                          <label
                            htmlFor={`end-${modIndex}-${optIndex}`}
                            className="block text-sm font-medium text-slate-700 mb-1"
                          >
                            End Time
                          </label>
                          <input
                            id={`end-${modIndex}-${optIndex}`}
                            type="time"
                            step={900}
                            value={endTime}
                            onChange={(e) =>
                              handleTimeChange(
                                modIndex,
                                optIndex,
                                "end",
                                e.target.value
                              )
                            }
                            className="block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-pistachio-dark focus:border-pistachio-dark sm:text-sm"
                          />
                        </div>
                        <div className="sm:col-span-1">
                          <InputField
                            id={`price-${modIndex}-${optIndex}`}
                            label="Price"
                            type="number"
                            value={String(opt.price)}
                            onChange={(e) =>
                              handleOptionChange(
                                modIndex,
                                optIndex,
                                "price",
                                e.target.value
                              )
                            }
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeOption(modIndex, optIndex)}
                          className="p-2 text-red-500 hover:bg-red-100 rounded-full h-10 w-10 flex items-center justify-center"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => addOption(modIndex)}
                    className="mt-2 px-3 py-1 text-xs font-semibold text-pistachio-dark border border-pistachio-dark rounded-full hover:bg-pistachio-light"
                  >
                    + Add Option
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addModality}
              className="mt-4 px-4 py-2 text-sm font-semibold text-pistachio-dark border border-pistachio-dark rounded-full hover:bg-pistachio-light"
            >
              + Add Modality
            </button>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <a
              href="#/admin/revisions"
              onClick={(e) => handleNav(e, "#/admin/revisions")}
              className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-full hover:bg-slate-200"
            >
              Cancel
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
                ? "Save Changes"
                : "Create Revision"}
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

export default AdminRevisionFormPage;

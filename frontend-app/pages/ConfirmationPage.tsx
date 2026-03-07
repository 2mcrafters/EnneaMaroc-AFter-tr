import React, { useState, useEffect } from 'react';
import {
  Box,
  Button as MUIButton,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fade,
  Typography,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import CloseIcon from "@mui/icons-material/Close";
// Utilisation des slices Redux au lieu des données locales
import { fetchAllParcours } from "../store/slices/parcoursSlice";
import { BankIcon } from "../components/icons/BankIcon";
import BackArrowIcon from "../components/icons/BackArrowIcon";
import { useAppDispatch, useAppSelector } from "../store";
import { createEnrollment } from "../store/enrollmentsSlice";
import {
  createPayment,
  fetchUserPayments,
  selectUserPayments,
} from "../store/slices/paymentsSlice";
import { getCourseImageUrl } from "../services/baseApi";
import {
  confirmationService,
  ConfirmationEmailPayload,
} from "../services/confirmationService";
import { exportConfirmationDocx } from "../services/confirmationDocx";

// Types génériques simplifiés
type GenericItem = any; // simplification
type GenericGroup = any; // CourseGroup

const parseMoney = (value: unknown): number => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return 0;
  // Accept formats like: "1200", "1 200", "1,200", "1200 MAD", "1200DH"
  let cleaned = value
    .trim()
    .replace(/(mad|dh|dhs|dirham|dirhams)/gi, "")
    .replace(/\s+/g, "");

  // If both '.' and ',' are present, assume one is thousands and one is decimal.
  // Heuristic: last separator is decimal, remove the other.
  const lastDot = cleaned.lastIndexOf(".");
  const lastComma = cleaned.lastIndexOf(",");
  if (lastDot !== -1 && lastComma !== -1) {
    const decimalSep = lastDot > lastComma ? "." : ",";
    const thousandsSep = decimalSep === "." ? "," : ".";
    cleaned = cleaned.split(thousandsSep).join("");
    cleaned = cleaned.replace(decimalSep, ".");
  } else {
    // Only comma present => treat as decimal
    cleaned = cleaned.replace(/,/g, ".");
  }

  // Keep only digits, minus, and dot
  cleaned = cleaned.replace(/[^0-9.-]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
};

// On récupère l'utilisateur depuis auth slice (structure backend)

const ConfirmationPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const courses = useAppSelector((state) => state.parcours.items);
  // Utiliser selectUserPayments qui retourne seulement les paiements de cet utilisateur
  // Plus efficace que de filtrer tous les paiements
  const userPayments = useAppSelector((state) =>
    user ? selectUserPayments(state, user.id) : []
  );
  const [item, setItem] = useState<GenericItem | null>(null);
  const [group, setGroup] = useState<GenericGroup | null>(null);
  const [itemType, setItemType] = useState<"course" | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [sendStatus, setSendStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");
  const [sendStatusMessage, setSendStatusMessage] = useState<string | null>(
    null
  );
  const [form, setForm] = useState({
    nom: user?.lastName || "",
    prenom: user?.firstName || "",
    adresse: "",
    telephone_personnel: user?.phone || "",
    email: user?.email || "",
    diplome_obtenu: "",
    profession_exercee: "",

    is_entreprise: false,
    entreprise: "",
    bon_de_commande: "non" as "oui" | "non",
    adresse_facturation: "",
    contact_dossier: "",
    telephone_contact: "",
    email_contact: "",

    accept_conditions: false,
  });
  const REGISTRATION_FEE = 0; // Registration fee disabled

  // Charger listes (si non présentes) et récupérer item depuis sessionStorage (temporaire pour flux)
  useEffect(() => {
    if (!courses.length) dispatch(fetchAllParcours());
  }, [dispatch, courses.length]);

  useEffect(() => {
    // 1. Check sessionStorage for vitrine registration (new flow)
    const registrationDataRaw = sessionStorage.getItem("registrationData");
    if (registrationDataRaw) {
      try {
        const regData = JSON.parse(registrationDataRaw);
        // Adapt to the page's expected structure
        setItemType("course"); // Treat as course for now

        // Construct a mock item/group from the vitrine data
        const mockItem = {
          id: regData.moduleId, // Using module ID as course ID for now, or need mapping
          title: regData.moduleTitle,
          price: regData.price,
          // Add other necessary fields
        };
        const mockGroup = {
          id: regData.sessionId,
          start_date: regData.sessionDate, // This might need parsing if it's a string range
          place: regData.place,
          price: regData.price, // Ensure price is available for payment creation
        };

        setItem(mockItem);
        setGroup(mockGroup);
        return;
      } catch (e) {
        console.error("Error parsing registration data", e);
      }
    }

    // 2. Check localStorage for vitrine enrollment (legacy flow)
    const pendingRaw = localStorage.getItem("pending_enrollment");
    if (pendingRaw) {
      try {
        const pending = JSON.parse(pendingRaw);
        if (pending.type === "vitrine_module") {
          setItemType("vitrine_module" as any);
          setItem(pending.module);
          setGroup(pending.session);
          return;
        }
      } catch (e) {
        console.error("Error parsing pending enrollment", e);
      }
    }

    // 2. Fallback to existing sessionStorage flow
    const type = sessionStorage.getItem("enrollmentType") as "course" | null;
    const itemIdRaw = sessionStorage.getItem("enrollmentItemId");
    const groupJSON = sessionStorage.getItem("enrollmentGroup");
    if (!type || !itemIdRaw || !groupJSON || type !== "course") {
      window.location.hash = "#/";
      return;
    }
    setItemType(type);
    const itemId = Number(itemIdRaw);
    const course = courses.find((c) => c.id === itemId);
    if (course) setItem(course as GenericItem);

    try {
      setGroup(JSON.parse(groupJSON));
    } catch {
      setGroup(null);
    }
  }, [courses]);

  // Charger les paiements de l'utilisateur pour décider frais inscription
  useEffect(() => {
    if (user) dispatch(fetchUserPayments(user.id));
  }, [dispatch, user]);

  useEffect(() => {
    // Pre-fill form when user loads/changes.
    if (!user) return;
    setForm((prev) => ({
      ...prev,
      nom: prev.nom || user.lastName || "",
      prenom: prev.prenom || user.firstName || "",
      telephone_personnel:
        prev.telephone_personnel || (user as any).phone || "",
      email: prev.email || user.email || "",
    }));
  }, [user]);

  const proceedEnrollment = async () => {
    if (!item || !group || !itemType || !user) return;

    console.log("🔍 Enrollment Debug Info:", {
      itemType,
      item,
      group,
      groupId: group.id,
      groupKeys: Object.keys(group),
    });

    setIsLoading(true);
    try {
      // 1. Create enrollment via API
      let groupId = group.id;

      if (!groupId) {
        console.error("❌ No group_id found in group object:", group);
        alert(
          "Erreur : Aucun ID de groupe trouvé. Veuillez réessayer de sélectionner votre option."
        );
        setIsLoading(false);
        return;
      }

      const enrollmentData = {
        user_id: user.id,
        course_id: (item as any).id, // Only courses now, no revisions
        group_id: groupId,
        status: "pending_payment" as const,
        course_title: (item as any).title, // Ensure title is saved if backend supports it
      };

      console.log("📊 Enrollment data to be sent:", enrollmentData);

      const enrollmentResult = await dispatch(
        createEnrollment(enrollmentData)
      ).unwrap();

      // 2. Create payments
      // Registration fee disabled
      const requiresRegistrationFee = false;

      console.log("💰 Registration fee disabled for user:", {
        userId: user.id,
        requiresRegistrationFee,
      });

      // 2.a Course payment (no registration fee)
      // If enrollment already existed and already has payments, don't create duplicates.
      const existingPayments = (enrollmentResult as any)?.payments;
      const hasAnyPayment =
        Array.isArray(existingPayments) && existingPayments.length > 0;

      if (!hasAnyPayment) {
        const coursePaymentData = {
          enrollment_id: enrollmentResult.id,
          amount: parseMoney((group as any).price),
          month: 1,
          course_price: (group as any).price,
          registration_fee: 0,
          payment_method: "Bank Transfer",
          payment_date: new Date().toISOString().slice(0, 10),
          status: "pending",
          course_title: (item as any).title, // Send title to ensure it appears in admin
        } as any;
        await dispatch(createPayment(coursePaymentData)).unwrap();
      }

      // Clean up session storage
      sessionStorage.removeItem("enrollmentType");
      sessionStorage.removeItem("enrollmentItemId");
      sessionStorage.removeItem("enrollmentGroup");
      sessionStorage.removeItem("enrollmentCourseName");
      sessionStorage.removeItem("enrollmentFlow");
      sessionStorage.removeItem("registrationData"); // Clean up new flow data

      // Redirect to Dashboard page
      window.location.hash = "#/dashboard";
    } catch (error) {
      console.error("Error creating enrollment:", error);
      alert(
        "Une erreur s'est produite lors du traitement de votre inscription. Veuillez réessayer."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmEnrollment = async () => {
    if (!item || !group || !itemType || !user) return;
    setFormError(null);
    setIsModalOpen(true);
  };

  const submitConfirmationForm = async () => {
    if (!item || !group || !user) return;
    setFormError(null);

    if (!form.nom.trim() || !form.prenom.trim() || !form.email.trim()) {
      setFormError("Veuillez remplir au minimum: Nom, Prénom et Email.");
      return;
    }
    if (!form.accept_conditions) {
      setFormError("Veuillez accepter les conditions d'inscription.");
      return;
    }
    if (
      form.is_entreprise &&
      form.email_contact &&
      form.email_contact.trim().length > 0
    ) {
      // Basic email validation is also enforced server-side.
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email_contact.trim());
      if (!ok) {
        setFormError("Email contact dossier invalide.");
        return;
      }
    }

    setIsSubmittingForm(true);
    setSendDialogOpen(true);
    setSendStatus("sending");
    setSendStatusMessage("Envoi des informations par email...");
    try {
      const durationMonthsRaw =
        (group as any).durationMonths ??
        (group as any).duration_months ??
        (group as any).months;
      const durationMonths = Math.max(1, Number(durationMonthsRaw) || 1);

      const groupPriceRaw = (group as any).price;
      const itemPriceRaw = (item as any)?.price;
      const groupPrice = parseMoney(groupPriceRaw);
      const itemPrice = parseMoney(itemPriceRaw);
      const basePrice = groupPrice || itemPrice || 0;
      const monthlyAmount =
        Math.round((basePrice / durationMonths) * 100) / 100;

      const payload: ConfirmationEmailPayload = {
        user_id: user.id,
        course_id: (item as any).id,
        group_id: (group as any).id,
        course_title: (item as any).title,
        group_title:
          (group as any).title ||
          (group as any).name ||
          (group as any).date ||
          "Session Standard",
        monthly_amount: monthlyAmount,
        duration_months: durationMonths,

        nom: form.nom,
        prenom: form.prenom,
        adresse: form.adresse,
        telephone_personnel: form.telephone_personnel,
        email: form.email,
        diplome_obtenu: form.diplome_obtenu,
        profession_exercee: form.profession_exercee,

        entreprise: form.entreprise,
        is_entreprise: form.is_entreprise,
        bon_de_commande: form.is_entreprise ? form.bon_de_commande : undefined,
        adresse_facturation: form.is_entreprise
          ? form.adresse_facturation
          : undefined,
        contact_dossier: form.is_entreprise ? form.contact_dossier : undefined,
        telephone_contact: form.is_entreprise
          ? form.telephone_contact
          : undefined,
        email_contact: form.is_entreprise ? form.email_contact : undefined,

        accept_conditions: form.accept_conditions,
      };

      await confirmationService.sendEnrollmentConfirmationEmail(payload);
      setSendStatus("success");
      setSendStatusMessage("Envoyé avec succès. Merci !");

      // Let the user see the success state briefly
      await new Promise((r) => setTimeout(r, 1100));

      setIsModalOpen(false);
      setSendDialogOpen(false);
      setSendStatus("idle");
      setSendStatusMessage(null);
      await proceedEnrollment();

      // After successful email + enrollment, redirect to profile page
      window.location.hash = "#/profile";
    } catch (e: any) {
      console.error("Error sending confirmation form:", e);
      const msg =
        e?.message || "Une erreur est survenue lors de l'envoi du formulaire.";
      setFormError(msg);
      setSendStatus("error");
      setSendStatusMessage(msg);
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const closeContactModal = () => setIsContactOpen(false);

  useEffect(() => {
    if (!isContactOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeContactModal();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isContactOpen]);

  if (!item || !group || !user) {
    return (
      <div className="text-center py-20">Chargement de la confirmation...</div>
    );
  }

  // Only handling courses now
  // Registration fee disabled
  const requiresRegistrationFee = false;
  const groupPriceRaw = (group as any).price;
  const itemPriceRaw = (item as any)?.price;
  const groupPrice = parseMoney(groupPriceRaw);
  const itemPrice = parseMoney(itemPriceRaw);
  // Prefer group price; otherwise fall back to course price.
  const basePrice = groupPrice || itemPrice || 0;
  const totalDueNumber = basePrice; // No registration fee
  const totalDue = totalDueNumber; // for semantic clarity

  // Monthly amount calculation:
  // Prefer explicit durationMonths on group data if present, otherwise fall back to 1.
  // This keeps the UI stable even when backend doesn't provide the duration yet.
  const durationMonthsRaw =
    (group as any).durationMonths ??
    (group as any).duration_months ??
    (group as any).months;
  const durationMonths = Math.max(1, Number(durationMonthsRaw) || 1);
  const monthlyAmount =
    Math.round((totalDueNumber / durationMonths) * 100) / 100;

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="max-w-4xl mx-auto">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.history.back();
          }}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#2790d0] hover:text-[#2790d0]/80 mb-8 transition-colors"
        >
          <BackArrowIcon className="w-5 h-5" />
          Retour
        </a>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-8 text-center">
          Confirmez votre inscription
        </h1>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">
                Détails
              </h2>
              {/* Display image from backend Laravel with proper functions */}
              {(itemType === "course" ||
                itemType === ("vitrine_module" as any)) && (
                <img
                  src={
                    itemType === "course"
                      ? getCourseImageUrl((item as any).image_url)
                      : (item as any).image ||
                        "/assets/imgss001/coaching (1).jpg"
                  }
                  alt={item.title}
                  className="rounded-lg mb-4 aspect-video object-cover w-full"
                  onError={(e) => {
                    e.currentTarget.src = "/assets/imgss001/coaching (1).jpg";
                  }}
                />
              )}
              <h3 className="text-xl font-semibold">{item.title}</h3>
              <div className="mt-6 pt-6 border-t border-slate-200 space-y-2 text-lg">
                <div className="flex justify-between items-center font-bold text-slate-900">
                  <span>Montant</span>
                  <span className="text-2xl text-pistachio-dark">
                    {monthlyAmount.toLocaleString("de-DE")} MAD
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-100">
              <button
                type="button"
                onClick={() => setIsContactOpen(true)}
                className="w-full inline-flex items-center justify-center rounded-full bg-[#2790d0] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#2790d0]/90 transition-colors"
              >
                Contact
              </button>
            </div>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">
              Informations de paiement
            </h2>
            <p className="text-slate-600 mb-6">
              Pour finaliser votre inscription, veuillez effectuer le paiement
              en utilisant l'une des méthodes ci-dessous. Votre place sera
              réservée dès confirmation du paiement.
            </p>

            <div className="space-y-4 text-slate-700">
              <div className="flex items-start">
                <BankIcon className="w-8 h-8 text-pistachio-dark mr-4 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold">Virement bancaire</h4>
                  <p className="text-sm">
                    Veuillez utiliser votre nom complet et le titre du module
                    comme référence de paiement.
                  </p>
                </div>
              </div>
              {/* Bank details hidden per user request */}
              {/*
              <ul className="text-sm space-y-2 pl-12">
                <li>
                  <strong>Banque :</strong> BANK
                </li>
                <li>
                  <strong>RIB :</strong> 0XX XXX XXXX0XXXX0000XXXX 0X
                </li>
                <li>
                  <strong>IBAN :</strong> MA64 XXXX X000 00XX XX00 00XX XXX9
                </li>
                <li>
                  <strong>Bénéficiaire :</strong> HORIZON RH
                </li>
                <li>
                  <strong>Référence :</strong>{" "}
                  {`${user.firstName} ${user.lastName} - ${item.title}`}
                </li>
              </ul>
              */}
              <div className="flex items-start pt-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-8 h-8 text-pistachio-dark mr-4 flex-shrink-0"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M8.433 7.418c.158-.103.346-.195.574-.277a6.213 6.213 0 014.22.613A4.21 4.21 0 0115 11.231V12.5a.5.5 0 01-1 0v-1.269a3.21 3.21 0 00-3-3.21H8.5a.5.5 0 01-.067-.982z" />
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v5.562l-2.5 2.5a1 1 0 001.414 1.414l3-3A1 1 0 0011 10.562V5z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <h4 className="font-semibold">Paiement sur place</h4>
                  <p className="text-sm">
                    Vous pouvez également payer directement à l'accueil de notre
                    centre.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleConfirmEnrollment}
              disabled={isLoading}
              className="mt-8 w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-pistachio-dark hover:bg-lime-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading
                ? "Traitement en cours..."
                : "Confirmer la demande d'inscription"}
            </button>

            {isContactOpen && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center px-4"
                role="dialog"
                aria-modal="true"
                aria-label="Contact"
                onMouseDown={(e) => {
                  // Close on backdrop click (but not on modal click)
                  if (e.target === e.currentTarget) closeContactModal();
                }}
              >
                <div className="absolute inset-0 bg-black/50" />

                <div className="relative w-full max-w-md rounded-2xl bg-white shadow-xl border border-slate-100">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900">
                      Contact
                    </h3>
                    <button
                      type="button"
                      onClick={closeContactModal}
                      className="inline-flex items-center justify-center rounded-full p-2 text-slate-600 hover:bg-slate-100"
                      aria-label="Fermer"
                    >
                      <CloseIcon fontSize="small" />
                    </button>
                  </div>

                  <div className="p-6 space-y-3">
                    <a
                      className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 hover:bg-slate-50 transition-colors"
                      href="mailto:contact@enneamaroc.com"
                    >
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                        <EmailIcon fontSize="small" />
                      </span>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-900">
                          Email
                        </div>
                        <div className="text-sm text-[#2790d0] truncate">
                          contact@enneamaroc.com
                        </div>
                      </div>
                    </a>

                    <a
                      className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 hover:bg-slate-50 transition-colors"
                      href="https://wa.me/212662062032"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                        <WhatsAppIcon fontSize="small" />
                      </span>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-900">
                          WhatsApp
                        </div>
                        <div className="text-sm text-[#2790d0]">
                          0662 062 032
                        </div>
                      </div>
                    </a>

                    <a
                      className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 hover:bg-slate-50 transition-colors"
                      href="tel:+212661246647"
                    >
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-sky-50 text-sky-700">
                        <PhoneIcon fontSize="small" />
                      </span>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-slate-900">
                          Appel
                        </div>
                        <div className="text-sm text-[#2790d0]">
                          0661 24 66 47
                        </div>
                      </div>
                    </a>
                  </div>

                  <div className="px-6 pb-6">
                    <button
                      type="button"
                      onClick={closeContactModal}
                      className="w-full rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Fermer
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => {
                if (!isSubmittingForm) setIsModalOpen(false);
              }}
            />
            <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">
                  Informations finales
                </h3>
                <button
                  className="text-slate-500 hover:text-slate-700"
                  onClick={() => {
                    if (!isSubmittingForm) setIsModalOpen(false);
                  }}
                  aria-label="Fermer"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 max-h-[70vh] overflow-auto space-y-5">
                {formError && (
                  <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200">
                    {formError}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="text-sm">
                    <span className="block font-semibold text-slate-700 mb-1">
                      Nom *
                    </span>
                    <input
                      className="w-full border border-slate-300 rounded-lg px-3 py-2"
                      value={form.nom}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, nom: e.target.value }))
                      }
                    />
                  </label>
                  <label className="text-sm">
                    <span className="block font-semibold text-slate-700 mb-1">
                      Prénom *
                    </span>
                    <input
                      className="w-full border border-slate-300 rounded-lg px-3 py-2"
                      value={form.prenom}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, prenom: e.target.value }))
                      }
                    />
                  </label>
                  <label className="text-sm md:col-span-2">
                    <span className="block font-semibold text-slate-700 mb-1">
                      Adresse
                    </span>
                    <input
                      className="w-full border border-slate-300 rounded-lg px-3 py-2"
                      value={form.adresse}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          adresse: e.target.value,
                        }))
                      }
                    />
                  </label>
                  <label className="text-sm">
                    <span className="block font-semibold text-slate-700 mb-1">
                      Téléphone personnel
                    </span>
                    <input
                      className="w-full border border-slate-300 rounded-lg px-3 py-2"
                      value={form.telephone_personnel}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          telephone_personnel: e.target.value,
                        }))
                      }
                    />
                  </label>
                  <label className="text-sm">
                    <span className="block font-semibold text-slate-700 mb-1">
                      Email *
                    </span>
                    <input
                      type="email"
                      className="w-full border border-slate-300 rounded-lg px-3 py-2"
                      value={form.email}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, email: e.target.value }))
                      }
                    />
                  </label>
                  <label className="text-sm">
                    <span className="block font-semibold text-slate-700 mb-1">
                      Diplôme obtenu
                    </span>
                    <input
                      className="w-full border border-slate-300 rounded-lg px-3 py-2"
                      value={form.diplome_obtenu}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          diplome_obtenu: e.target.value,
                        }))
                      }
                    />
                  </label>
                  <label className="text-sm">
                    <span className="block font-semibold text-slate-700 mb-1">
                      Profession exercée
                    </span>
                    <input
                      className="w-full border border-slate-300 rounded-lg px-3 py-2"
                      value={form.profession_exercee}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          profession_exercee: e.target.value,
                        }))
                      }
                    />
                  </label>
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <label className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={form.is_entreprise}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          is_entreprise: e.target.checked,
                        }))
                      }
                    />
                    Inscription via entreprise
                  </label>

                  {form.is_entreprise && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <label className="text-sm md:col-span-2">
                        <span className="block font-semibold text-slate-700 mb-1">
                          Entreprise
                        </span>
                        <input
                          className="w-full border border-slate-300 rounded-lg px-3 py-2"
                          value={form.entreprise}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              entreprise: e.target.value,
                            }))
                          }
                        />
                      </label>
                      <label className="text-sm">
                        <span className="block font-semibold text-slate-700 mb-1">
                          Bon de commande
                        </span>
                        <select
                          className="w-full border border-slate-300 rounded-lg px-3 py-2"
                          value={form.bon_de_commande}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              bon_de_commande: e.target.value as any,
                            }))
                          }
                        >
                          <option value="non">Non</option>
                          <option value="oui">Oui</option>
                        </select>
                      </label>
                      <label className="text-sm md:col-span-2">
                        <span className="block font-semibold text-slate-700 mb-1">
                          Adresse de facturation
                        </span>
                        <input
                          className="w-full border border-slate-300 rounded-lg px-3 py-2"
                          value={form.adresse_facturation}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              adresse_facturation: e.target.value,
                            }))
                          }
                        />
                      </label>
                      <label className="text-sm">
                        <span className="block font-semibold text-slate-700 mb-1">
                          Contact dossier
                        </span>
                        <input
                          className="w-full border border-slate-300 rounded-lg px-3 py-2"
                          value={form.contact_dossier}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              contact_dossier: e.target.value,
                            }))
                          }
                        />
                      </label>
                      <label className="text-sm">
                        <span className="block font-semibold text-slate-700 mb-1">
                          Téléphone
                        </span>
                        <input
                          className="w-full border border-slate-300 rounded-lg px-3 py-2"
                          value={form.telephone_contact}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              telephone_contact: e.target.value,
                            }))
                          }
                        />
                      </label>
                      <label className="text-sm md:col-span-2">
                        <span className="block font-semibold text-slate-700 mb-1">
                          Email
                        </span>
                        <input
                          type="email"
                          className="w-full border border-slate-300 rounded-lg px-3 py-2"
                          value={form.email_contact}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              email_contact: e.target.value,
                            }))
                          }
                        />
                      </label>
                    </div>
                  )}
                </div>

                <div className="text-xs text-slate-500 leading-relaxed opacity-70">
                  <p className="font-semibold text-slate-600 mb-1">
                    Conditions d'inscription
                  </p>
                  <p>
                    Toute inscription est considérée comme définitive après
                    confirmation. Les frais engagés ne sont pas remboursables.
                    En validant, vous confirmez l'exactitude de vos
                    informations.
                  </p>
                </div>

                <label className="flex items-start gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={form.accept_conditions}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        accept_conditions: e.target.checked,
                      }))
                    }
                  />
                  <span>
                    J'ai lu et j'accepte les conditions d'inscription *
                  </span>
                </label>
              </div>

              <div className="p-6 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmittingForm}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                  disabled={isSubmittingForm}
                  onClick={async () => {
                    if (!item || !group || !user) return;
                    try {
                      const groupPrice = parseMoney((group as any).price);
                      const particuliers =
                        groupPrice > 0 ? `${groupPrice} DH` : "6000 DH";
                      const entreprise =
                        groupPrice > 0
                          ? `${Math.round(groupPrice * 1.3333)} DH. HT`
                          : "8000 DH. HT";

                      await exportConfirmationDocx({
                        courseTitle: (item as any).title || "Formation",
                        nom: form.nom,
                        prenom: form.prenom,
                        adresse: form.adresse,
                        telephonePersonnel: form.telephone_personnel,
                        email: form.email,
                        diplomeObtenu: form.diplome_obtenu,
                        professionExercee: form.profession_exercee,
                        isEntreprise: form.is_entreprise,
                        entreprise: form.entreprise,
                        bonDeCommande: form.bon_de_commande,
                        adresseFacturation: form.adresse_facturation,
                        contactDossier: form.contact_dossier,
                        telephoneContact: form.telephone_contact,
                        emailContact: form.email_contact,
                        // Logo + computed defaults
                        logoSrc: "/assets/logo/Coaching HRH.png",
                        // Tarifs: try to derive from the selected group price, fallback to template values
                        tarifEntrepriseText: entreprise,
                        tarifParticuliersText: particuliers,
                      });
                    } catch (e) {
                      console.error("DOCX export failed", e);
                      alert("Impossible de générer le document Word.");
                    }
                  }}
                >
                  Exporter (Word)
                </button>
                <button
                  className="px-4 py-2 rounded-lg bg-[#2790d0] text-white font-semibold disabled:opacity-60"
                  onClick={submitConfirmationForm}
                  disabled={isSubmittingForm}
                >
                  {isSubmittingForm ? "Envoi..." : "Valider et envoyer"}
                </button>
              </div>
            </div>
          </div>
        )}

        <Dialog
          open={sendDialogOpen}
          TransitionComponent={Fade}
          keepMounted
          onClose={(_, reason) => {
            // Prevent closing while sending
            if (sendStatus === "sending") return;
            if (reason === "backdropClick" || reason === "escapeKeyDown")
              return;
            setSendDialogOpen(false);
          }}
          aria-labelledby="send-status-dialog-title"
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle id="send-status-dialog-title">
            {sendStatus === "sending" && "Envoi en cours"}
            {sendStatus === "success" && "Terminé"}
            {sendStatus === "error" && "Erreur"}
          </DialogTitle>

          <DialogContent>
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              gap={2}
              py={1}
            >
              {sendStatus === "sending" && (
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  gap={2}
                  width="100%"
                >
                  <CircularProgress size={46} />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    align="center"
                  >
                    {sendStatusMessage || "Envoi..."}
                  </Typography>

                  {/* Small animated bar for a “sending” feel */}
                  <Box
                    sx={{
                      position: "relative",
                      width: "100%",
                      height: 6,
                      borderRadius: 99,
                      bgcolor: "rgba(39, 144, 208, 0.15)",
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: "-35%",
                        width: "35%",
                        height: "100%",
                        bgcolor: "#2790d0",
                        borderRadius: 99,
                        animation: "sendBar 1.1s ease-in-out infinite",
                        "@keyframes sendBar": {
                          "0%": { transform: "translateX(0)" },
                          "100%": { transform: "translateX(380%)" },
                        },
                      }}
                    />
                  </Box>
                </Box>
              )}

              {sendStatus === "success" && (
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  gap={2}
                >
                  {/* Creative success ring + pop animation */}
                  <Box
                    sx={{
                      position: "relative",
                      width: 110,
                      height: 110,
                      borderRadius: "50%",
                      display: "grid",
                      placeItems: "center",
                      background:
                        "conic-gradient(from 180deg, #2790d0, #8bc34a, #2790d0)",
                      animation: "ringSpin 1.2s linear infinite",
                      "@keyframes ringSpin": {
                        "0%": { transform: "rotate(0deg)" },
                        "100%": { transform: "rotate(360deg)" },
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 92,
                        height: 92,
                        borderRadius: "50%",
                        bgcolor: "#fff",
                        display: "grid",
                        placeItems: "center",
                        boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
                      }}
                    >
                      <Box
                        sx={{
                          animation:
                            "checkPop 600ms cubic-bezier(.2, 1.4, .2, 1) 1",
                          "@keyframes checkPop": {
                            "0%": { transform: "scale(0.6)", opacity: 0 },
                            "60%": { transform: "scale(1.1)", opacity: 1 },
                            "100%": { transform: "scale(1)", opacity: 1 },
                          },
                        }}
                      >
                        <CheckCircleOutlineIcon
                          sx={{ fontSize: 60, color: "#2e7d32" }}
                        />
                      </Box>
                    </Box>
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    align="center"
                  >
                    {sendStatusMessage || "Envoyé."}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    align="center"
                  >
                    Redirection vers votre profil...
                  </Typography>
                </Box>
              )}

              {sendStatus === "error" && (
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  gap={1.5}
                >
                  <ErrorOutlineIcon sx={{ fontSize: 54, color: "#d32f2f" }} />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    align="center"
                  >
                    {sendStatusMessage || "Erreur lors de l'envoi."}
                  </Typography>
                </Box>
              )}
            </Box>
          </DialogContent>

          {sendStatus !== "sending" && (
            <DialogActions>
              {sendStatus === "error" ? (
                <>
                  <MUIButton
                    onClick={() => {
                      setSendDialogOpen(false);
                    }}
                    color="inherit"
                  >
                    Fermer
                  </MUIButton>
                  <MUIButton
                    onClick={() => {
                      // Retry by simply re-submitting
                      void submitConfirmationForm();
                    }}
                    variant="contained"
                  >
                    Réessayer
                  </MUIButton>
                </>
              ) : (
                <MUIButton
                  onClick={() => {
                    setSendDialogOpen(false);
                  }}
                  variant="contained"
                >
                  Continuer
                </MUIButton>
              )}
            </DialogActions>
          )}
        </Dialog>
      </div>
    </div>
  );
};

export default ConfirmationPage;
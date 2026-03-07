import React, { useEffect, useState } from "react";

// Icône de vérification personnalisée
const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
  </svg>
);

interface EnrollmentInfo {
  courseName: string;
  group: {
    day: string;
    time: string;
    price: number;
  };
}

const EnrollmentConfirmationPage: React.FC = () => {
  const [enrollmentInfo, setEnrollmentInfo] = useState<EnrollmentInfo | null>(null);

  useEffect(() => {
    // Récupérer les informations d'enrollment du sessionStorage
    const courseName = sessionStorage.getItem("enrollmentCourseName");
    const groupData = sessionStorage.getItem("enrollmentGroup");
    
    if (courseName && groupData) {
      try {
        const group = JSON.parse(groupData);
        setEnrollmentInfo({
          courseName,
          group
        });
      } catch (error) {
        console.error("Erreur lors du parsing des données d'enrollment:", error);
      }
    }
  }, []);

  const handleConfirmEnrollment = () => {
    // TODO: Implémenter l'enrollment réel via API
    // Pour l'instant, simuler l'enrollment et rediriger vers mes cours
    
    // Nettoyer le sessionStorage
    sessionStorage.removeItem("enrollmentType");
    sessionStorage.removeItem("enrollmentItemId");
    sessionStorage.removeItem("enrollmentCourseName");
    sessionStorage.removeItem("enrollmentGroup");
    sessionStorage.removeItem("enrollmentFlow");
    
    // Rediriger vers mes cours avec un message de succès
    alert("Inscription confirmée avec succès ! Vous êtes maintenant inscrit au cours.");
    window.location.hash = "#/my-courses";
  };

  const handleCancel = () => {
    // Nettoyer le sessionStorage et retourner aux cours
    sessionStorage.removeItem("enrollmentType");
    sessionStorage.removeItem("enrollmentItemId");
    sessionStorage.removeItem("enrollmentCourseName");
    sessionStorage.removeItem("enrollmentGroup");
    sessionStorage.removeItem("enrollmentFlow");
    
    window.location.hash = "#/courses";
  };

  if (!enrollmentInfo) {
    return (
      <div className="container mx-auto px-6 py-20 text-center">
        <h1 className="text-2xl font-bold text-slate-900">
          Chargement...
        </h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pistachio-light to-white">
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Confirmer votre inscription
            </h1>
            <p className="text-slate-600">
              Vous êtes sur le point de vous inscrire au cours suivant
            </p>
          </div>

          <div className="bg-slate-50 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">
              Détails de l'inscription
            </h2>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Cours :</span>
                <span className="font-semibold text-slate-900">
                  {enrollmentInfo.courseName}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Jour :</span>
                <span className="font-semibold text-slate-900">
                  {enrollmentInfo.group.day}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Heure :</span>
                <span className="font-semibold text-slate-900">
                  {enrollmentInfo.group.time}
                </span>
              </div>
              
              <div className="flex justify-between items-center border-t pt-3">
                <span className="text-slate-600 font-medium">Prix mensuel :</span>
                <span className="font-bold text-xl text-pistachio-dark">
                  {Number(enrollmentInfo.group.price).toLocaleString("de-DE")} MAD
                </span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <h3 className="font-semibold text-blue-900 mb-2">
              📋 Informations importantes
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Votre inscription sera effective immédiatement après confirmation</li>
              <li>• Vous recevrez un email de confirmation</li>
              <li>• Les paiements se font mensuellement</li>
              <li>• Vous pouvez annuler votre inscription à tout moment</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleCancel}
              className="flex-1 px-6 py-3 text-slate-600 bg-slate-100 rounded-full font-semibold hover:bg-slate-200 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleConfirmEnrollment}
              className="flex-1 px-6 py-3 text-white bg-pistachio-dark rounded-full font-semibold hover:bg-lime-900 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Confirmer l'inscription
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentConfirmationPage;

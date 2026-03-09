import { Link } from "react-router-dom";

const Footer = () => {
  const logoSrc = "/assets/images/logo/ennea%20logo%20white.png";

  const navLinks = [
    { label: "L’Ennéagramme", path: "/#enneagramme-section" },
    { label: "École", path: "/ecole" },
    { label: "Parcours", path: "/découvrir" },
    { label: "Solution", path: "/solution" },
    { label: "Agenda", path: "/agenda" },
    { label: "Contact", path: "/contact" },
  ];

  const contact = {
    phone: {
      main: "0662 062 032",
    },
    whatsapp: "0661 24 66 47",
  email: "contact@enneamaroc.com",
    address:
      "Av. My Youssef, résidence Hamza (au-dessus du café Picasso), 4ème étage n°1, CP 90000 Tanger",
  };

  const digitsOnly = (value) => value.replace(/\D/g, "");

  const buildTelHref = (value) => {
    const digits = digitsOnly(value);
    if (!digits) return "#";
    if (digits.startsWith("0")) {
      return `+212${digits.slice(1)}`;
    }
    if (digits.startsWith("212")) {
      return `+${digits}`;
    }
    return digits;
  };

  const buildWhatsAppHref = (value) => {
    const digits = digitsOnly(value);
    if (!digits) return "#";
    if (digits.startsWith("0")) {
      return `https://wa.me/212${digits.slice(1)}`;
    }
    if (digits.startsWith("212")) {
      return `https://wa.me/${digits}`;
    }
    return `https://wa.me/${digits}`;
  };

  const legalLinks = [
    { label: "Conditions générales", path: "#" },
    { label: "Politique de confidentialité", path: "#" },
    { label: "Mentions légales", path: "#" },
  ];

  return (
    <footer className="bg-[#ff8f42] text-white not-prose">
      {/* Main */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-8 pb-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 items-start">
          {/* Brand + creative copy */}
          <div className="space-y-3">
            <Link to="/" className="inline-block">
              <img
                src={logoSrc}
                alt="EnnéaMaroc"
                className="h-7 w-auto"
                style={{ maxWidth: "61%" }}
              />
            </Link>

            <p className="max-w-sm text-white leading-relaxed text-xs">
              <span className="font-bold text-sm block mb-1">
                EnnéaMaroc – Chemin vers soi.
              </span>
              Respirez. Observez. Choisissez. Chaque jour, un pas de plus vers
              une clarté intérieure.
            </p>

            <p className="text-xs text-white leading-relaxed opacity-90">
              Outils, formations et accompagnements pour mieux vous comprendre
              et transformer vos relations.
            </p>
          </div>

          {/* Navigation */}
          <div className="space-y-3 hidden sm:block">
            <h3 className="text-xs font-bold tracking-wider uppercase text-white">
              Navigation
            </h3>
            <ul className="space-y-1.5">
              {navLinks.map(({ label, path }) => (
                <li key={path}>
                  <Link
                    to={path}
                    className="text-white hover:translate-x-1 transition-all inline-block text-xs"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold tracking-wider uppercase text-white">
              Contact
            </h3>
            <ul className="space-y-3 text-white text-xs">
              <li className="flex items-start gap-1.5">
                <i
                  className="bi bi-telephone-fill text-sm mt-0.5"
                  aria-hidden="true"
                />
                <div className="space-y-1">
                  <div className="font-bold uppercase tracking-wide text-[11px]">
                    Appelez-nous :{" "}
                    <a
                      href={`tel:${buildTelHref(contact.phone.main)}`}
                      className="text-white transition underline-offset-2 hover:underline"
                    >
                      {contact.phone.main}
                    </a>
                  </div>
                </div>
              </li>
              <li className="flex items-center gap-1.5">
                <i className="bi bi-whatsapp text-sm" aria-hidden="true" />
                <a
                  href={buildWhatsAppHref(contact.whatsapp)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-white transition underline-offset-2 hover:underline"
                >
                  {contact.whatsapp}
                </a>
              </li>
              <li className="flex items-center gap-1.5">
                <i className="bi bi-envelope-fill text-sm" aria-hidden="true" />
                <a
                  href={`mailto:${contact.email}`}
                  className="text-white transition"
                >
                  {contact.email}
                </a>
              </li>
              <li className="flex items-center gap-1.5">
                <i className="bi bi-geo-alt-fill text-sm" aria-hidden="true" />
                <a
                  className="text-white transition"
                  href={`https://maps.google.com/?q=${encodeURIComponent(
                    contact.address
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {contact.address}
                </a>
              </li>
            </ul>
            {/* Removed quick question note per request */}
          </div>
          {/* Social section removed per request (icons and CTA) */}
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-white/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-3">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <span className="text-[11px] text-white">
              © {new Date().getFullYear()} EnnéaMaroc.
            </span>
            <div className="flex items-center gap-x-3 text-[11px]">
              {legalLinks.map(({ label, path }) => (
                <a key={label} href={path} className="text-white transition">
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import { FaXTwitter, FaTiktok } from "react-icons/fa6";

export default function Footer() {
  const footerSections = [
    {
      title: 'Acerca de',
      links: [
        { label: 'Acerca del Reino', href: '#' },
        { label: 'Habitar el Reino', href: '#' },
        { label: 'Invertir en el Reino', href: '#' },
      ],
    },
    {
      title: 'Gobierno',
      links: [
        { label: 'Gobierno', href: '#' },
        { label: 'Leyes Básicas', href: '#' },
        { label: 'Composición', href: '#' },
        { label: 'Socios', href: '#' },
      ],
    },
    {
      title: 'Información',
      links: [
        { label: 'Donar', href: '#' },
        { label: 'Términos y Condiciones', href: '#' },
        { label: 'Política de Privacidad', href: '#' },
      ],
    },
    {
      title: 'Portales',
      links: [
        { label: 'Presidencia', href: '#' },
        { label: 'Asuntos Exteriores', href: '#' },
        { label: 'Portal Ciudadano', href: '#' },
        { label: 'Portal DPI', href: '#' },
      ],
    },
  ];

  return (<footer className="bg-black text-white"> <div className="container section-spacious">

    {/* Logo */}
    <div className="flex items-center gap-4 mb-12">
      <img
        src="/logo.png"
        alt="Logo Reino del Pan"
        className="h-16 w-auto object-contain"
      />

      <div>
        <h2 className="display-font text-2xl font-bold">
          Reino del Pan
        </h2>
        <p className="text-sm text-white/60">
          Gobierno Oficial
        </p>
      </div>
    </div>

    {/* Enlaces */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
      {footerSections.map((section) => (
        <div key={section.title}>
          <h3 className="display-font text-lg text-accent mb-6">
            {section.title}
          </h3>

          <ul className="space-y-3">
            {section.links.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="text-white/75 hover:text-accent transition-colors text-sm"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>

    {/* Redes sociales */}
    <div className="flex justify-center gap-6 mb-10">
      <a
        href="https://x.com/gov_pan"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-white/70 hover:text-accent transition-colors"
      >
        <FaXTwitter size={22} />
        <span>X</span>
      </a>

      <a
        href="https://www.tiktok.com/@gov_pan"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-white/70 hover:text-accent transition-colors"
      >
        <FaTiktok size={22} />
        <span>TikTok</span>
      </a>
    </div>

    <div className="h-px bg-white/15 mb-8" />

    {/* Copyright */}
    <div className="flex flex-col md:flex-row justify-between gap-4">
      <p className="text-white/60 text-sm max-w-2xl">
        El Reino del Pan es una nación digital comprometida con la libertad,
        la innovación, la prosperidad y la participación ciudadana.
      </p>

      <p className="text-white/60 text-sm">
        © 2026 Reino del Pan. Todos los derechos reservados.
      </p>
    </div>

  </div>
  </footer>
  );
}
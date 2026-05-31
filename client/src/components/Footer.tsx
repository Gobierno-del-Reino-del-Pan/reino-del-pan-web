/**
 * Footer Component - Elegancia Minimalista Moderna
 * 
 * Diseño:
 * - Fondo negro profundo con texto blanco
 * - Acentos en oro
 * - Grid de enlaces organizados por categoría
 */
export default function Footer() {
  const footerSections = [
    {
      title: 'Acerca de',
      links: [
        { label: 'Acerca de', href: '#' },
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
      title: 'Enlaces Rápidos',
      links: [
        { label: 'Donar', href: '#' },
        { label: 'Términos y Condiciones', href: '#' },
        { label: 'Política de Privacidad', href: '#' },
      ],
    },
    {
      title: 'Enlaces Externos',
      links: [
        { label: 'Presidente', href: '#' },
        { label: 'Ministerio de Asuntos Externos', href: '#' },
        { label: 'Portal myGov', href: '#' },
        { label: 'Portal DPI', href: '#' },
      ],
    },
  ];

  return (
    <footer className="bg-foreground text-background">
      <div className="container section-spacious">
        {/* Logo en Footer */}
        <div className="flex items-center mb-12">
          <img src="/src/assets/logo.png" alt="Artis Panis Logo" className="w-12 h-12 object-contain brightness-0 invert" />
          <span className="ml-3 display-font text-xl text-background">
            Reino del Pan
          </span>
        </div>
        {/* Contenido principal */}
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
                      className="text-background/80 hover:text-accent transition-colors duration-200 text-sm"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Línea divisora */}
        <div className="h-px bg-background/20 mb-8" />

        {/* Información del país y copyright */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
          <div>
            <p className="text-background/70 text-sm leading-relaxed">
              El Reino del Pan es un pequeño país en Europa dedicado a valores democráticos, reconciliación de grupos étnicos, modernización y protección del ambiente.
            </p>
          </div>
          <div className="text-right">
            <p className="text-background/70 text-sm">
              © 2026 Reino del Pan. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

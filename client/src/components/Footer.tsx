import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import { FaXTwitter, FaTiktok } from 'react-icons/fa6';

/**
 * Newsletter Component - Gobierno del Reino del Pan
 */
export default function Newsletter() {
  const socialItems = [
    {
      id: 'x',
      icon: <FaXTwitter className="w-4 h-4" />,
      label: 'X',
      href: 'https://x.com/gov_pan',
    },
    {
      id: 'tiktok',
      icon: <FaTiktok className="w-4 h-4" />,
      label: 'TikTok',
      href: 'https://www.tiktok.com/@gov_pan',
    },
  ];

  return (
    <section
      className="bg-secondary/30 py-16 lg:py-24 border-b border-border/50"
      id="donate"
    >
      <div className="container max-w-4xl">
        <div className="bg-background border border-accent/20 rounded-2xl shadow-xl p-8 sm:p-12 md:p-16 relative overflow-hidden text-center">
          {/* Decoración de fondo */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-accent/5 rounded-full blur-2xl pointer-events-none" />

          <div className="max-w-2xl mx-auto flex flex-col items-center">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="mb-8"
            >
              <img
                src="/logo.png"
                alt="Gobierno del Reino del Pan"
                className="w-28 h-28 sm:w-32 sm:h-32 object-contain mx-auto"
              />
            </motion.div>

            {/* Título */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="display-font text-4xl sm:text-5xl text-foreground font-extrabold tracking-tight mb-4"
            >
              Únete a nuestro boletín
            </motion.h2>

            {/* Descripción */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-foreground/70 text-sm sm:text-base mb-8 leading-relaxed font-light"
            >
              Suscríbete para recibir notificaciones diplomáticas, boletines de
              leyes y las últimas actualizaciones del Gobierno del Reino del Pan
              en tu correo.
            </motion.p>

            {/* Formulario */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              onSubmit={(e) => e.preventDefault()}
              className="w-full max-w-xl flex flex-col sm:flex-row gap-3 mb-10"
            >
              <input
                type="email"
                required
                placeholder="Tu correo electrónico oficial"
                className="flex-1 px-5 py-3 border border-border bg-background text-foreground rounded-lg placeholder:text-foreground/40 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-300 text-sm font-light shadow-sm"
              />

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-minimal whitespace-nowrap text-xs tracking-wider uppercase py-3 px-6 rounded-lg flex items-center justify-center gap-2"
              >
                Suscribirse
                <Send className="w-3.5 h-3.5" />
              </motion.button>
            </motion.form>

            {/* Redes sociales */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="flex justify-center gap-6 pt-4 border-t border-border/40 w-full"
            >
              {socialItems.map((social) => (
                <a
                  key={social.id}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-foreground/60 hover:text-accent font-semibold tracking-wider uppercase transition-colors duration-200"
                >
                  <span className="p-2 bg-secondary border border-border/20 rounded-md">
                    {social.icon}
                  </span>

                  <span>{social.label}</span>
                </a>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
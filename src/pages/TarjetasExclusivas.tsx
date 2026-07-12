import React, { useState } from 'react';
import { Shield, Award, Building2, Gem, CheckCircle2, ArrowRight, Plus, Download, FileSpreadsheet, Lock, Key } from 'lucide-react';

interface CardSectionProps {
  title: string;
  subtitle: string;
  type: 'gold' | 'platinum';
  description: string;
  benefits: string[];
  requirements: string[];
}

interface IssuedCard {
  id: string;
  name: string;
  cardNumber: string;
  type: 'gold' | 'platinum';
  issueDate: string;
}

const ENCRYPTED_KEY = "OTEwNThBbGZhU25pcGVyIw==";

export default function TarjetasExclusivas() {
  const [activeTab, setActiveTab] = useState<'gold' | 'platinum'>('gold');

  // Estados para el acceso gubernamental oculto
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [isAdminAuthorized, setIsAdminAuthorized] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Estados del creador de tarjetas extendido
  const [newCardType, setNewCardType] = useState<'gold' | 'platinum'>('gold');
  const [newCardName, setNewCardName] = useState('');
  const [newCardNumber, setNewCardNumber] = useState('');
  const [newCardDate, setNewCardDate] = useState(new Date().toISOString().split('T')[0]);
  const [issuedCards, setIssuedCards] = useState<IssuedCard[]>([]);
  const [successMessage, setSuccessMessage] = useState('');

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (btoa(passwordInput) === ENCRYPTED_KEY) {
      setIsAdminAuthorized(true);
      setLoginError('');
      setShowAdminModal(false);
      setPasswordInput('');
    } else {
      setLoginError('Credenciales de seguridad incorrectas. Acceso denegado.');
      setPasswordInput('');
    }
  };

  const handleCreateCard = (e: React.FormEvent) => {
    e.preventDefault();

    const formattedNumber = newCardNumber.trim() || Math.floor(1000 + Math.random() * 9000) + " " + Math.floor(1000 + Math.random() * 9000) + " " + Math.floor(1000 + Math.random() * 9000) + " " + Math.floor(1000 + Math.random() * 9000);

    const card: IssuedCard = {
      id: crypto.randomUUID(),
      name: newCardName.toUpperCase(),
      cardNumber: formattedNumber,
      type: newCardType,
      issueDate: newCardDate
    };

    setIssuedCards([card, ...issuedCards]);
    setSuccessMessage(`Tarjeta ${newCardType === 'gold' ? 'Dorada' : 'Platino'} autorizada para su descarga.`);

    setNewCardName('');
    setNewCardNumber('');
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  // Función de renderizado Canvas al estilo estricto de Trump Gold Card
  const downloadCardAsImage = (card: IssuedCard) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1012;
    canvas.height = 638;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    const isGold = card.type === 'gold';

    // 1. Fondo base metálico estructurado
    const bgGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    if (isGold) {
      bgGrad.addColorStop(0, '#fef08a'); // Amarillo suave alto
      bgGrad.addColorStop(0.5, '#eab308'); // Dorado Trump clásico
      bgGrad.addColorStop(1, '#ca8a04');
    } else {
      bgGrad.addColorStop(0, '#e5e7eb'); // Platino brillante
      bgGrad.addColorStop(0.5, '#9ca3af');
      bgGrad.addColorStop(1, '#4b5563');
    }
    ctx.fillStyle = bgGrad;
    ctx.beginPath();
    ctx.roundRect(0, 0, canvas.width, canvas.height, 28);
    ctx.fill();

    // Bordes dobles heráldicos internos de precisión militar
    ctx.strokeStyle = isGold ? '#854d0e' : '#1f2937';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(20, 20, canvas.width - 40, canvas.height - 40, 20);
    ctx.stroke();

    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(28, 28, canvas.width - 56, canvas.height - 56, 16);
    ctx.stroke();

    // 2. Franja Central Oscura Identificativa del Modelo Base
    ctx.fillStyle = isGold ? '#0a0a0a' : '#111827';
    ctx.fillRect(29, 190, canvas.width - 58, 120);

    // Líneas doradas/plateadas finas que encierran la franja central
    ctx.fillStyle = isGold ? '#fef08a' : '#f9fafb';
    ctx.fillRect(29, 190, canvas.width - 58, 3);
    ctx.fillRect(29, 307, canvas.width - 58, 3);

    // 3. Estrellas y Detalles Simétricos de Cabecera
    ctx.fillStyle = isGold ? '#713f12' : '#374151';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText("★ ★ ★ ★ ★   CREDENCIAL OFICIAL   ★ ★ ★ ★ ★", canvas.width / 2, 65);

    // Texto Central de la Franja
    ctx.fillStyle = isGold ? '#f59e0b' : '#e5e7eb';
    ctx.font = 'bold 54px "Times New Roman", Times, serif';
    ctx.letterSpacing = '5px';
    ctx.fillText(isGold ? "TARJETA DORADA" : "TARJETA PLATINO", canvas.width / 2, 272);

    // Subtítulo Superior del Reino
    ctx.fillStyle = isGold ? '#1e1b4b' : '#ffffff';
    ctx.font = 'italic bold 28px "Times New Roman", Times, serif';
    ctx.letterSpacing = '2px';
    ctx.fillText("Reino del Pan", canvas.width / 2, 120);

    // 4. Datos del Titular en Zona Inferior (Alineación Izquierda)
    ctx.textAlign = 'left';
    ctx.fillStyle = isGold ? '#0a0a0a' : '#ffffff';

    // Número de Tarjeta destacado
    ctx.font = 'bold 30px monospace';
    ctx.letterSpacing = '3px';
    ctx.fillText(card.cardNumber, 60, 400);

    // Nombre Completo Oficial
    ctx.font = 'bold 26px "Times New Roman", Times, serif';
    ctx.letterSpacing = '1px';
    ctx.fillText(card.name, 60, 465);

    // Fecha de emisión
    ctx.fillStyle = isGold ? '#451a03' : '#d1d5db';
    ctx.font = '15px sans-serif';
    ctx.fillText(`FECHA EXPEDICIÓN: ${card.issueDate}`, 60, 520);
    ctx.fillText("ESTADO RESIDENTE CONCEDIDO", 60, 550);

    // 5. Firma Autógrafa Simulada Presidencial (Zona Inferior Derecha)
    ctx.textAlign = 'center';
    ctx.fillStyle = isGold ? '#000000' : '#ffffff';
    ctx.font = 'italic 34px "Brush Script MT", cursive, sans-serif';
    ctx.fillText("GOV.PAN", canvas.width - 220, 460); // Firma simulada elegante

    // Línea de base para la firma
    ctx.strokeStyle = isGold ? '#0a0a0a' : '#9ca3af';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(canvas.width - 360, 480);
    ctx.lineTo(canvas.width - 80, 480);
    ctx.stroke();

    ctx.fillStyle = isGold ? '#451a03' : '#d1d5db';
    ctx.font = 'bold 12px sans-serif';
    ctx.letterSpacing = '1px';
    ctx.fillText("FIRMA AUTORIZADA DEL REINO", canvas.width - 220, 505);

    // 6. Descarga forzada del archivo procesado
    const link = document.createElement('a');
    link.download = `Acreditacion_${card.type.toUpperCase()}__${card.name.replace(/\s+/g, '_')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-amber-500/30">

      {/* HERO SECTION */}
      <header className="relative overflow-hidden py-24 border-b border-neutral-800 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-neutral-950">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

        <div className="max-w-5xl mx-auto px-6 text-center relative z-10 flex flex-col items-center">
          <div className="mb-6">
            <img
              src="/Visa/logogov.png"
              alt="Logo Reino del Pan"
              className="h-20 w-auto object-contain drop-shadow-[0_0_15px_rgba(245,158,11,0.2)]"
            />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-medium uppercase tracking-wider mb-6 animate-fade-in">
            <Award className="w-3.5 h-3.5" /> Programa de Alta Distinción Ciudadana
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight uppercase bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 via-neutral-200 to-neutral-500 mb-8 text-balance max-w-4xl">
            Acreditaciones de Élite
          </h1>

          <p className="text-neutral-400 text-lg max-w-2xl mx-auto font-light leading-relaxed">
            El Ministerio de Asuntos Exteriores y el Ministerio de Economía, Comercio y Empresa presentan las máximas distinciones residenciales y financieras del <span className="text-neutral-200 font-medium">Reino del Pan</span>.
          </p>
        </div>
      </header>

      {/* SECCIÓN ADMINISTRATIVA INTEGRAL */}
      {isAdminAuthorized && (
        <section className="max-w-5xl mx-auto mt-12 p-6 bg-neutral-900 border border-amber-500/30 rounded-2xl shadow-xl shadow-amber-500/5 space-y-8">
          <div className="flex justify-between items-center border-b border-neutral-800 pb-4">
            <h2 className="text-xl font-bold text-amber-400 flex items-center gap-2">
              <Shield className="w-5 h-5" /> Panel de Emisión e Impresión Oficial
            </h2>
            <button
              onClick={() => setIsAdminAuthorized(false)}
              className="text-xs text-neutral-500 hover:text-neutral-300 underline"
            >
              Cerrar Sesión
            </button>
          </div>

          {/* Formulario de Emisión */}
          <form onSubmit={handleCreateCard} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Credencial</label>
              <select
                value={newCardType}
                onChange={(e) => setNewCardType(e.target.value as 'gold' | 'platinum')}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-sm text-neutral-200 focus:outline-none focus:border-amber-500"
              >
                <option value="gold">Tarjeta Dorada</option>
                <option value="platinum">Tarjeta Platino</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Nombre Completo</label>
              <input
                type="text"
                placeholder="ALEX GONZÁLEZ"
                value={newCardName}
                onChange={(e) => setNewCardName(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-sm text-neutral-200 focus:outline-none focus:border-amber-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Número Personalizado (Opcional)</label>
              <input
                type="text"
                placeholder="XXXX XXXX XXXX XXXX"
                value={newCardNumber}
                onChange={(e) => setNewCardNumber(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 text-sm text-neutral-200 focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-neutral-950 text-sm font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-500/10"
              >
                <Plus className="w-4 h-4" /> Autorizar Credencial
              </button>
            </div>
          </form>

          {successMessage && (
            <div className="p-3 bg-green-500/10 border border-green-500/30 text-green-400 text-sm rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> {successMessage}
            </div>
          )}

          {/* Historial de Impresión de Tarjetas */}
          {issuedCards.length > 0 && (
            <div className="border-t border-neutral-800 pt-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-neutral-400 mb-4 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-neutral-500" /> Cola de Impresión en Alta Resolución
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {issuedCards.map((card) => (
                  <div key={card.id} className="flex items-center justify-between p-4 bg-neutral-950 border border-neutral-800 rounded-xl hover:border-neutral-700 transition-all">
                    <div>
                      <p className="text-sm font-bold text-neutral-200">{card.name}</p>
                      <p className="text-xs font-mono text-neutral-500 mt-0.5">{card.cardNumber}</p>
                      <span className={`inline-block text-[9px] font-bold uppercase px-2 py-0.5 rounded mt-2 ${card.type === 'gold' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-neutral-500/10 text-neutral-300 border border-neutral-500/20'}`}>
                        {card.type === 'gold' ? 'Dorada' : 'Platino'}
                      </span>
                    </div>
                    <button
                      onClick={() => downloadCardAsImage(card)}
                      className="p-3 bg-neutral-900 hover:bg-neutral-800 text-amber-400 hover:text-amber-300 rounded-lg border border-neutral-800 transition-colors flex items-center gap-2 text-xs font-semibold"
                      title="Descargar Imagen de Alta Calidad"
                    >
                      <Download className="w-4 h-4" /> Descargar PNG
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* TABS SELECTION */}
      <nav className="max-w-md mx-auto mt-12 px-6">
        <div className="flex p-1 bg-neutral-900 rounded-xl border border-neutral-800">
          <button
            onClick={() => setActiveTab('gold')}
            className={`flex-1 py-3 text-sm font-semibold tracking-wider uppercase rounded-lg transition-all duration-300 ${activeTab === 'gold'
              ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-neutral-950 shadow-lg shadow-amber-500/10'
              : 'text-neutral-400 hover:text-neutral-200'
              }`}
          >
            Tarjeta Dorada
          </button>
          <button
            onClick={() => setActiveTab('platinum')}
            className={`flex-1 py-3 text-sm font-semibold tracking-wider uppercase rounded-lg transition-all duration-300 ${activeTab === 'platinum'
              ? 'bg-gradient-to-r from-neutral-400 to-neutral-200 text-neutral-950 shadow-lg shadow-white/10'
              : 'text-neutral-400 hover:text-neutral-200'
              }`}
          >
            Tarjeta Platino
          </button>
        </div>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-5xl mx-auto px-6 py-16 transition-all duration-500">
        {activeTab === 'gold' ? (
          <CardInfo
            title="Tarjeta Dorada"
            subtitle="Distinción Diplomática y Residencia de Honor"
            type="gold"
            description="Otorgada directamente por el Ministerio de Asuntos Exteriores o el Ministerio de Economía, Comercio y Empresa. Esta acreditación concede un privilegio exclusivo de residencia en el Reino del Pan a personalidades de alto prestigio internacional, sin necesidad de ostentar la ciudadanía inicial."
            benefits={[
              "Privilegio de Residencia Legal Permanente automática en el Reino del Pan.",
              "Acceso preferente por canales diplomáticos en fronteras y aeropuertos.",
              "Exención de visados y trámites burocráticos ordinarios.",
              "Estatus elegible para regularización express por decreto gubernamental."
            ]}
            requirements={[
              "Nominación directa por un Ministerio del Reino.",
              "Prestigio internacional contrastado (Ciencia, Cultura, Diplomacia o Negocios).",
              "Aprobación final del Consejo de Ministros."
            ]}
          />
        ) : (
          <CardInfo
            title="Tarjeta Platino"
            subtitle="Acreditación de Desarrollo y Alta Inversión"
            type="platinum"
            description="La credencial definitiva para los Boosters del Reino del Pan. Diseñada exclusivamente para ciudadanos o extranjeros estratégicos que impulsan la soberanía económica mediante la creación de tejido empresarial o la adquisición de bonos y deuda pública."
            benefits={[
              "Estatus de 'Booster Oficial del Reino' con prioridad institucional.",
              "Bonificaciones fiscales exclusivas para las empresas constituidas en el Reino.",
              "Acceso preferente a subastas de deuda soberana y rendimiento de bonos.",
              "Inclusión en el Registro de Inversores de Élite del Reino del Pan."
            ]}
            requirements={[
              "Constitución activa de una empresa dentro del Reino del Pan.",
              "Adquisición verificada de bonos del Estado o deuda soberana.",
              "Ser ciudadano activo catalogado como 'Booster' de la infraestructura digital."
            ]}
          />
        )}
      </main>

      {/* MODAL OCULTO DE AUTENTICACIÓN ADMINISTRATIVA */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md p-6 relative">
            <h3 className="text-lg font-bold text-neutral-200 flex items-center gap-2 mb-2">
              <Lock className="w-5 h-5 text-amber-500" /> Autenticación de Seguridad
            </h3>
            <p className="text-xs text-neutral-400 mb-6">Esta sección requiere credenciales autorizadas por el Consejo de Ministros del Reino del Pan.</p>

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-neutral-500 mb-2 tracking-wider">Código de Acceso Gubernamental</label>
                <div className="relative">
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="•••••••••••••••••"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2.5 pl-10 text-sm text-neutral-200 focus:outline-none focus:border-amber-500"
                    required
                  />
                  <Key className="w-4 h-4 text-neutral-600 absolute left-3 top-3.5" />
                </div>
              </div>

              {loginError && <p className="text-xs text-red-400 font-medium">{loginError}</p>}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowAdminModal(false); setLoginError(''); }}
                  className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-sm font-semibold py-2 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-neutral-950 text-sm font-semibold py-2 rounded-lg transition-colors"
                >
                  Verificar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FOOTER INSTITUCIONAL */}
      <footer className="border-t border-neutral-900 bg-neutral-950 py-8 text-center text-xs text-neutral-600 tracking-wider uppercase relative">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span>© {new Date().getFullYear()} Gobierno del Reino del Pan · Todos los derechos reservados</span>
          <button
            onClick={() => setIsAdminAuthorized(!isAdminAuthorized ? true : false)}
            className="text-[10px] text-neutral-800 hover:text-neutral-700 transition-colors focus:outline-none flex items-center gap-1 cursor-default select-none"
          >
            Terminal Gov
          </button>
        </div>
      </footer>
    </div>
  );
}

function CardInfo({ title, subtitle, type, description, benefits, requirements }: CardSectionProps) {
  const isGold = type === 'gold';

  return (
    <div className="grid md:grid-cols-12 gap-12 items-center">
      {/* VISTA PREVIA INTERACTIVA CON EL DISEÑO DE LA WEB BASE (TRUMP CARD STYLE) */}
      <div className="md:col-span-5 flex justify-center w-full">
        <div
          className={`w-full max-w-[360px] aspect-[1.586/1] rounded-2xl p-4 flex flex-col justify-between shadow-2xl relative overflow-hidden border-4 transition-all duration-500 hover:scale-105 select-none ${isGold
            ? 'bg-gradient-to-br from-yellow-200 via-amber-400 to-yellow-600 text-neutral-950 border-amber-700 shadow-amber-500/10'
            : 'bg-gradient-to-br from-gray-200 via-neutral-400 to-neutral-600 text-neutral-950 border-neutral-700 shadow-white/5'
            }`}
        >
          {/* Bordes internos ornamentales */}
          <div className={`absolute inset-1.5 border border-dashed rounded-xl pointer-events-none ${isGold ? 'border-amber-900/30' : 'border-neutral-900/30'}`} />

          <div className="text-center relative z-10 w-full pt-1">
            <p className="text-[7px] font-bold tracking-[4px] uppercase opacity-70">★ ★ ★ ★ ★ CREDENCIAL OFICIAL ★ ★ ★ ★ ★</p>
            <h4 className="text-lg italic font-serif font-black tracking-wide mt-1 drop-shadow-sm">Reino del Pan</h4>
          </div>

          {/* Bloque Central Oscuro Característico del modelo de referencia */}
          <div className="w-full bg-neutral-950 py-2.5 text-center my-1 border-y border-amber-500/30 relative z-10">
            <span className={`text-sm font-serif font-extrabold tracking-[3px] uppercase ${isGold ? 'text-amber-400' : 'text-neutral-200'}`}>
              {isGold ? 'TARJETA DORADA' : 'TARJETA PLATINO'}
            </span>
          </div>

          <div className="flex justify-between items-end relative z-10 px-1 pb-1">
            <div className="space-y-0.5">
              <p className="font-mono text-xs tracking-wider font-bold">0000 0000 0000 0000</p>
              <p className="font-serif text-[11px] font-bold uppercase tracking-wider">NOMBRE COMPLETO</p>
              <p className="text-[7px] font-semibold uppercase opacity-60">ACREDITACIÓN DE RESIDENCIA</p>
            </div>

            {/* Espacio para la firma presidencial */}
            <div className="text-center border-t border-neutral-900/60 pt-0.5 w-24">
              <p className="italic font-serif text-[11px] font-bold leading-none select-none">GOV.PAN</p>
              <p className="text-[5px] font-bold uppercase tracking-tighter opacity-50 mt-1">AUTORIZACIÓN GOB.</p>
            </div>
          </div>
        </div>
      </div>

      {/* INFORMACIÓN DE LA TARJETA */}
      <div className="md:col-span-7 space-y-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2 text-neutral-100">{title}</h2>
          <p className={`text-sm font-semibold tracking-wide uppercase ${isGold ? 'text-amber-400' : 'text-neutral-400'}`}>
            {subtitle}
          </p>
          <p className="mt-4 text-neutral-400 leading-relaxed font-light">{description}</p>
        </div>

        <hr className="border-neutral-900" />

        {/* BENEFICIOS */}
        <div>
          <h4 className="text-xs font-bold tracking-widest uppercase text-neutral-300 mb-4 flex items-center gap-2">
            <CheckCircle2 className={`w-4 h-4 ${isGold ? 'text-amber-400' : 'text-neutral-400'}`} /> Beneficios y Privilegios
          </h4>
          <ul className="space-y-3">
            {benefits.map((benefit, idx) => (
              <li key={idx} className="flex items-start gap-3 text-sm text-neutral-400">
                <span className={`inline-block w-1.5 h-1.5 rounded-full mt-1.5 ${isGold ? 'bg-amber-400' : 'bg-neutral-400'}`} />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* REQUISITOS */}
        <div className="p-5 rounded-xl bg-neutral-900/50 border border-neutral-900">
          <h4 className="text-xs font-bold tracking-widest uppercase text-neutral-300 mb-3 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-neutral-500" /> Criterios de Elegibilidad
          </h4>
          <ul className="space-y-2">
            {requirements.map((req, idx) => (
              <li key={idx} className="text-xs text-neutral-500 flex items-center gap-2">
                <ArrowRight className="w-3 h-3 text-neutral-600" /> {req}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
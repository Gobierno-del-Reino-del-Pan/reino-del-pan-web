import { useRef } from 'react';
import { motion } from 'framer-motion';
import { MapView } from './Map';
import { MapPin, Compass, Waves, ShieldAlert } from 'lucide-react';

/**
 * Territory Component - Elegancia Minimalista Premium
 * 
 * Muestra un mapa de la ubicación oficial del Reino en el Danubio
 * y una ficha técnica/descriptiva con la información geográfica.
 */
export default function Territory() {
    const mapRef = useRef<google.maps.Map | null>(null);
    const location = { lat: 45.586, lng: 18.917 }; // Enclave del Reino del Pan en el Danubio

    const handleMapReady = (map: google.maps.Map) => {
        mapRef.current = map;

        // Colocar un marcador oficial en las coordenadas
        new window.google.maps.Marker({
            position: location,
            map: map,
            title: "Reino del Pan",
            animation: window.google.maps.Animation.DROP,
        });
    };

    const geoDetails = [
        {
            icon: <Compass className="w-5 h-5 text-accent" />,
            label: 'Coordenadas',
            value: '45.586° N, 18.917° E',
        },
        {
            icon: <Waves className="w-5 h-5 text-accent" />,
            label: 'Acceso natural',
            value: 'Río Danubio, Europa Central',
        },
        {
            icon: <MapPin className="w-5 h-5 text-accent" />,
            label: 'Estatus',
            value: 'Reclamación de soberanía pacífica',
        },
    ];

    return (
        <section className="bg-secondary/20 py-16 lg:py-28 border-b border-border/50" id="government">
            <div className="container">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
                    {/* Left Column: Map */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, margin: '-50px' }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="lg:col-span-7 relative"
                    >
                        <div className="absolute -inset-1.5 bg-gradient-to-r from-accent/20 to-amber-500/10 rounded-2xl blur opacity-30" />
                        <div className="relative bg-background border border-accent/20 rounded-2xl overflow-hidden shadow-xl">
                            <MapView
                                initialCenter={location}
                                initialZoom={14}
                                onMapReady={handleMapReady}
                                className="w-full h-[400px] sm:h-[480px]"
                            />
                        </div>
                    </motion.div>

                    {/* Right Column: Info & Details */}
                    <div className="lg:col-span-5 text-left">
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-xs font-semibold text-accent tracking-widest uppercase mb-3"
                        >
                            Territorio Soberano
                        </motion.p>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="display-font text-4xl sm:text-5xl text-foreground font-extrabold tracking-tight mb-6"
                        >
                            Ubicación Geográfica
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="text-foreground/75 font-light leading-relaxed mb-8"
                        >
                            El territorio del Reino del Pan está ubicado sobre una franja de tierra no reclamada en las riberas del Danubio. Nuestro compromiso es transformar este espacio en un faro de sostenibilidad y paz, respetando la naturaleza que nos rodea.
                        </motion.p>

                        {/* Ficha técnica */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3 }}
                            className="space-y-4"
                        >
                            {geoDetails.map((detail, idx) => (
                                <div key={idx} className="flex items-center gap-4 p-4 bg-background border border-border/30 rounded-xl">
                                    <div className="p-2.5 bg-secondary border border-border/20 rounded-lg shadow-sm">
                                        {detail.icon}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-semibold tracking-wider text-accent uppercase mb-0.5">
                                            {detail.label}
                                        </p>
                                        <p className="text-sm font-semibold text-foreground">
                                            {detail.value}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}

import React, { useState } from 'react';

export interface BorderGatewayProps {
    onAccessGranted?: () => void;
    discordInviteUrl?: string;
    [key: string]: any; // Permite props inyectadas por React Router u otros Wrappers
}

export const BorderGateway: React.FC<BorderGatewayProps> = ({
    onAccessGranted,
    discordInviteUrl = 'https://discord.gg/xkdGSb9djv',
}) => {
    const [acknowledged, setAcknowledged] = useState(false);

    const handleContinue = () => {
        setAcknowledged(true);
        if (onAccessGranted) {
            onAccessGranted();
        } else {
            window.location.href = discordInviteUrl;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950 p-4 text-stone-100 font-sans">
            {/* Background pattern grid / atmosphere */}
            <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none" />

            <div className="relative w-full max-w-lg overflow-hidden rounded-xl border border-amber-500/30 bg-stone-900/90 p-6 shadow-2xl backdrop-blur-md md:p-8">
                {/* Top Warning Banner */}
                <div className="mb-6 flex items-center justify-between border-b border-amber-500/20 pb-4">
                    <div className="flex items-center space-x-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/30">
                            <svg
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                            </svg>
                        </div>
                        <div>
                            <span className="text-xs font-semibold uppercase tracking-wider text-amber-500">
                                Aviso Oficial
                            </span>
                            <h2 className="text-lg font-bold text-white">Paso Fronterizo</h2>
                        </div>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-medium text-red-400 ring-1 ring-inset ring-red-500/20">
                        CERRADO
                    </span>
                </div>

                {/* Content */}
                <div className="space-y-4">
                    <div className="rounded-lg bg-stone-950/60 p-4 border border-stone-800">
                        <p className="text-sm leading-relaxed text-stone-300">
                            <strong className="text-amber-400 font-semibold block mb-1">
                                Restricción de acceso temporal:
                            </strong>
                            Las fronteras están temporalmente cerradas. El paso a través de este control para acceder al servidor de Discord requiere confirmación manual de llegada.
                        </p>
                    </div>

                    <div className="space-y-2 text-xs text-stone-400">
                        <div className="flex items-center space-x-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                            <span>Estado del servidor: Tránsito restringido</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-stone-500" />
                            <span>Protocolo de moderación activo</span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={handleContinue}
                        className="w-full flex-1 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 active:scale-[0.98]"
                    >
                        Entendido, continuar
                    </button>
                    <button
                        onClick={() => window.history.back()}
                        className="w-full sm:w-auto rounded-lg border border-stone-700 bg-stone-800/50 px-4 py-2.5 text-sm font-medium text-stone-300 transition-colors hover:bg-stone-800 hover:text-white focus:outline-none"
                    >
                        Volver
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BorderGateway;
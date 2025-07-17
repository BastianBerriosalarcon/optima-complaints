import Link from "next/link";
import { ArrowUpRight, Check, Car } from "lucide-react";

export default function Hero() {
  return (
    <div className="relative overflow-hidden bg-white">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-gray-50 opacity-70" />

      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-blue-100 rounded-full opacity-20" />
      <div className="absolute top-40 right-20 w-32 h-32 bg-blue-200 rounded-full opacity-15" />
      <div className="absolute bottom-20 left-20 w-24 h-24 bg-blue-150 rounded-full opacity-10" />

      <div className="relative pt-24 pb-32 sm:pt-32 sm:pb-40">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-5xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <Car className="w-6 h-6 text-white" />
              </div>
              <span className="text-blue-600 font-semibold text-lg">
                Óptima-CX
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-8 tracking-tight leading-tight">
              Transforme la{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800">
                Experiencia
              </span>{" "}
              de sus Clientes Automotrices
            </h1>

            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              La plataforma que permite a concesionarios gestionar encuestas,
              reclamos y mejorar la satisfacción del cliente con análisis NPS en
              tiempo real.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link
                href="/sign-up"
                className="inline-flex items-center px-8 py-4 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors text-lg font-medium shadow-lg hover:shadow-xl"
              >
                Comenzar Prueba Gratuita
                <ArrowUpRight className="ml-2 w-5 h-5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="flex flex-col items-center gap-2">
                <Check className="w-6 h-6 text-green-500" />
                <span className="text-gray-600 font-medium">
                  30 días gratis
                </span>
                <span className="text-sm text-gray-500">
                  Sin tarjeta de crédito
                </span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Check className="w-6 h-6 text-green-500" />
                <span className="text-gray-600 font-medium">
                  Configuración incluida
                </span>
                <span className="text-sm text-gray-500">
                  Implementación guiada
                </span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Check className="w-6 h-6 text-green-500" />
                <span className="text-gray-600 font-medium">Soporte 24/7</span>
                <span className="text-sm text-gray-500">
                  Equipo especializado
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

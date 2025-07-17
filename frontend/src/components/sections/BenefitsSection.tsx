import { ArrowUpRight, BarChart3, Shield, Star, TrendingUp } from "lucide-react";

interface Benefit {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface TrialFeature {
  text: string;
}

const benefits: Benefit[] = [
  {
    icon: <BarChart3 className="w-4 h-4 text-blue-600" />,
    title: "Dashboard Intuitivo",
    description:
      "Visualice todos sus KPIs de experiencia del cliente en un solo lugar con gráficos interactivos y alertas inteligentes.",
  },
  {
    icon: <Shield className="w-4 h-4 text-blue-600" />,
    title: "Roles y Permisos",
    description:
      "Control granular de acceso con roles específicos para Super Usuarios y personal de concesionario.",
  },
  {
    icon: <TrendingUp className="w-4 h-4 text-blue-600" />,
    title: "Automatización Inteligente",
    description:
      "Flujos de trabajo automatizados que mejoran la eficiencia y reducen el tiempo de respuesta.",
  },
];

const trialFeatures: TrialFeature[] = [
  { text: "30 días completamente gratis" },
  { text: "Configuración e implementación incluida" },
  { text: "Soporte técnico especializado" },
];

export default function BenefitsSection() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">
              ¿Por qué Elegir Óptima-CX?
            </h2>
            <div className="space-y-6">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    {benefit.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">{benefit.title}</h3>
                    <p className="text-gray-600">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Prueba Gratuita</h3>
              <p className="text-gray-600">
                Experimente Óptima-CX sin compromiso
              </p>
            </div>
            <ul className="space-y-3 mb-6">
              {trialFeatures.map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                    <ArrowUpRight className="w-3 h-3 text-green-600" />
                  </div>
                  <span className="text-sm">{feature.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
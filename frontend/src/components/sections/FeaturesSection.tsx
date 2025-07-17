import {
  BarChart3,
  MessageSquare,
  Shield,
  Star,
  TrendingUp,
} from "lucide-react";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Análisis NPS",
    description: "Mida y mejore su Net Promoter Score en tiempo real",
  },
  {
    icon: <MessageSquare className="w-6 h-6" />,
    title: "Gestión de Reclamos",
    description: "Centralice y resuelva reclamos de manera eficiente",
  },
  {
    icon: <Star className="w-6 h-6" />,
    title: "Encuestas Inteligentes",
    description: "Capture feedback valioso de sus clientes automáticamente",
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Seguridad Enterprise",
    description: "Protección de datos con estándares bancarios",
  },
  {
    icon: <TrendingUp className="w-6 h-6" />,
    title: "Dashboard Ejecutivo",
    description: "KPIs y métricas clave en tiempo real",
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">
            Transforme la Experiencia de sus Clientes
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Óptima-CX es la plataforma integral que necesita su concesionario
            para gestionar encuestas, reclamos y mejorar la satisfacción del
            cliente.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
            >
              <div className="text-blue-600 mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
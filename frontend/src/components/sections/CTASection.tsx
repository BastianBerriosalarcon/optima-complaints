import { ArrowUpRight } from "lucide-react";

interface CTAButton {
  href: string;
  text: string;
  variant: "primary" | "secondary";
  icon?: React.ReactNode;
}

const ctaButtons: CTAButton[] = [
  {
    href: "/sign-up",
    text: "Comenzar Prueba Gratuita",
    variant: "primary",
    icon: <ArrowUpRight className="ml-2 w-5 h-5" />,
  },
  {
    href: "/dashboard",
    text: "Ver Demo",
    variant: "secondary",
  },
];

const getButtonClasses = (variant: "primary" | "secondary"): string => {
  const baseClasses = "inline-flex items-center px-8 py-4 rounded-lg transition-colors text-lg font-medium";
  
  if (variant === "primary") {
    return `${baseClasses} text-white bg-blue-600 hover:bg-blue-700`;
  }
  
  return `${baseClasses} text-blue-600 bg-blue-50 hover:bg-blue-100`;
};

export default function CTASection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">
          ¿Listo para Transformar su Experiencia del Cliente?
        </h2>
        <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
          Únase a los concesionarios líderes que ya están mejorando su NPS y
          satisfacción del cliente con Óptima-CX.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {ctaButtons.map((button, index) => (
            <a
              key={index}
              href={button.href}
              className={getButtonClasses(button.variant)}
            >
              {button.text}
              {button.icon}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
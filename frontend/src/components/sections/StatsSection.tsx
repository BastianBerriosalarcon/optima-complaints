interface Stat {
  value: string;
  label: string;
}

const stats: Stat[] = [
  {
    value: "+25%",
    label: "Mejora en NPS",
  },
  {
    value: "-60%",
    label: "Tiempo de Resolución",
  },
  {
    value: "99.9%",
    label: "Disponibilidad",
  },
];

export default function StatsSection() {
  return (
    <section className="py-20 bg-blue-600 text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            Resultados que Hablan por Sí Solos
          </h2>
          <p className="text-blue-100 max-w-2xl mx-auto">
            Concesionarios líderes confían en Óptima-CX para mejorar su
            experiencia del cliente
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 text-center">
          {stats.map((stat, index) => (
            <div key={index}>
              <div className="text-4xl font-bold mb-2">{stat.value}</div>
              <div className="text-blue-100">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
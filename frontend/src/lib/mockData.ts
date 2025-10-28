// Mock data para desarrollo y pruebas.
// Estos datos serán reemplazados por llamadas a la API.

export const mockDashboardStats = {
  reclamos: {
    total: 30,
    nuevos: 6,
    cerrados: 2,
    en_proceso: 13,
    asignados: 7,
    resueltos: 2
  },
};

export const mockNotifications = [];

// Datos mock de reclamos - Compatibilidad con ComplaintsTable
export const mockComplaints = [
  {
    id: "rec-001",
    id_externo: "REC-2025-001",
    cliente: {
      id: "cli-001",
      nombre: "Juan Carlos Pérez González",
      telefono: "+56912345678",
      email: "juan.perez@gmail.com"
    },
    vehiculo: {
      id: "veh-001",
      patente: "BBCD12",
      marca: "Toyota",
      modelo: "Corolla 2024",
      vin: "1HGBH41JXMN109186"
    },
    detalle: "El motor hace un ruido extraño al encender en las mañanas frías. Compré el auto hace 4 meses y esto no debería pasar. He llevado el vehículo 2 veces al taller y no solucionan el problema.",
    tipo_reclamo: "garantia",
    estado: "asignado",
    urgencia: "alta",
    black_alert: true,
    fecha_creacion: "2025-01-20T09:15:00Z",
    sucursal: {
      id: "suc-001",
      nombre: "Sucursal Centro"
    },
    taller: {
      id: "tall-001",
      nombre: "Taller Central"
    },
    asesor_asignado: {
      id: "ase-001",
      nombre: "María Fernanda Lagos",
      email: "mlagos@concesionario.cl"
    }
  },
  {
    id: "rec-002",
    id_externo: "REC-2025-002",
    cliente: {
      id: "cli-002",
      nombre: "María José Contreras",
      telefono: "+56987654321",
      email: "mj.contreras@outlook.com"
    },
    vehiculo: {
      id: "veh-002",
      patente: "KLMN34",
      marca: "Nissan",
      modelo: "Kicks 2023",
      vin: "3N1CN7AP9KL123456"
    },
    detalle: "Los frenos hacen un chirrido molesto cada vez que freno. El técnico me dice que es normal pero yo creo que no.",
    tipo_reclamo: "servicio",
    estado: "en_proceso",
    urgencia: "media",
    black_alert: false,
    fecha_creacion: "2025-01-19T14:30:00Z",
    sucursal: {
      id: "suc-002",
      nombre: "Sucursal Norte"
    },
    taller: {
      id: "tall-002",
      nombre: "Taller Norte"
    },
    asesor_asignado: {
      id: "ase-002",
      nombre: "Carlos Alberto Muñoz",
      email: "cmunoz@concesionario.cl"
    }
  },
  {
    id: "rec-003",
    id_externo: "REC-2025-003",
    cliente: {
      id: "cli-003",
      nombre: "Pedro Antonio Ramírez",
      telefono: "+56956781234",
      email: ""
    },
    vehiculo: {
      id: "veh-003",
      patente: "XYZA56",
      marca: "Chevrolet",
      modelo: "Tracker 2024",
      vin: ""
    },
    detalle: "Quiero felicitar al equipo por la excelente atención recibida durante mi última revisión. Todo impecable y rápido.",
    tipo_reclamo: "atencion",
    estado: "cerrado",
    urgencia: "baja",
    black_alert: false,
    fecha_creacion: "2025-01-18T11:00:00Z",
    sucursal: {
      id: "suc-003",
      nombre: "Sucursal Sur"
    },
    taller: {
      id: "tall-003",
      nombre: "Taller Sur"
    }
  },
  {
    id: "rec-004",
    id_externo: "REC-2025-004",
    cliente: {
      id: "cli-004",
      nombre: "Carla Beatriz Soto",
      telefono: "+56945123456",
      email: "carla.soto@empresa.cl"
    },
    vehiculo: {
      id: "veh-004",
      patente: "PQRS78",
      marca: "Suzuki",
      modelo: "Vitara 2023",
      vin: "MPATF53V200123456"
    },
    detalle: "Las luces delanteras parpadean de forma intermitente mientras conduzco. Esto es muy peligroso, especialmente de noche.",
    tipo_reclamo: "garantia",
    estado: "nuevo",
    urgencia: "alta",
    black_alert: false,
    fecha_creacion: "2025-01-20T16:45:00Z",
    sucursal: {
      id: "suc-001",
      nombre: "Sucursal Centro"
    },
    taller: {
      id: "tall-001",
      nombre: "Taller Central"
    }
  },
  {
    id: "rec-005",
    id_externo: "REC-2025-005",
    cliente: {
      id: "cli-005",
      nombre: "Roberto Andrés Flores",
      telefono: "+56932147856",
      email: ""
    },
    vehiculo: {
      id: "veh-005",
      patente: "ABCD90",
      marca: "Hyundai",
      modelo: "Tucson 2024",
      vin: "KMHD35LH5MU123456"
    },
    detalle: "El aire acondicionado no está enfriando correctamente. Solo sale aire tibio.",
    tipo_reclamo: "servicio",
    estado: "asignado",
    urgencia: "media",
    black_alert: false,
    fecha_creacion: "2025-01-19T10:20:00Z",
    sucursal: {
      id: "suc-002",
      nombre: "Sucursal Norte"
    },
    taller: {
      id: "tall-002",
      nombre: "Taller Norte"
    },
    asesor_asignado: {
      id: "ase-003",
      nombre: "Valentina Morales",
      email: "vmorales@concesionario.cl"
    }
  },
  {
    id: "rec-006",
    id_externo: "REC-2025-006",
    cliente: {
      id: "cli-006",
      nombre: "Francisca Ignacia Vargas",
      telefono: "+56998765432",
      email: "fran.vargas@hotmail.com"
    },
    vehiculo: {
      id: "veh-006",
      patente: "WXYZ11",
      marca: "Toyota",
      modelo: "Yaris 2025",
      vin: "NMTKHMBXXPR123456"
    },
    detalle: "La transmisión automática da sacudidas al cambiar de marcha. El auto tiene solo 2 meses de uso.",
    tipo_reclamo: "garantia",
    estado: "en_proceso",
    urgencia: "alta",
    black_alert: true,
    fecha_creacion: "2025-01-20T08:30:00Z",
    sucursal: {
      id: "suc-001",
      nombre: "Sucursal Centro"
    },
    taller: {
      id: "tall-001",
      nombre: "Taller Central"
    },
    asesor_asignado: {
      id: "ase-001",
      nombre: "María Fernanda Lagos",
      email: "mlagos@concesionario.cl"
    }
  },
  {
    id: "rec-007",
    id_externo: "REC-2025-007",
    cliente: {
      id: "cli-007",
      nombre: "Diego Esteban Silva",
      telefono: "+56923456789",
      email: ""
    },
    vehiculo: {
      id: "veh-007",
      patente: "LMNO22",
      marca: "Nissan",
      modelo: "Sentra 2023",
      vin: ""
    },
    detalle: "Quiero agendar la mantención de los 15.000 km. ¿Qué día tienen disponibilidad?",
    tipo_reclamo: "consulta",
    estado: "resuelto",
    urgencia: "baja",
    black_alert: false,
    fecha_creacion: "2025-01-17T13:15:00Z",
    sucursal: {
      id: "suc-003",
      nombre: "Sucursal Sur"
    },
    taller: {
      id: "tall-003",
      nombre: "Taller Sur"
    },
    asesor_asignado: {
      id: "ase-004",
      nombre: "Javiera Rojas",
      email: "jrojas@concesionario.cl"
    }
  },
  {
    id: "rec-008",
    id_externo: "REC-2025-008",
    cliente: {
      id: "cli-008",
      nombre: "Camila Andrea Torres",
      telefono: "+56976543210",
      email: "camila.torres@gmail.com"
    },
    vehiculo: {
      id: "veh-008",
      patente: "STUV33",
      marca: "Chevrolet",
      modelo: "Onix 2024",
      vin: ""
    },
    detalle: "Llevo 3 semanas esperando un repuesto que me dijeron llegaría en 5 días. Nadie me da información clara.",
    tipo_reclamo: "atencion",
    estado: "asignado",
    urgencia: "media",
    black_alert: false,
    fecha_creacion: "2025-01-19T15:45:00Z",
    sucursal: {
      id: "suc-002",
      nombre: "Sucursal Norte"
    },
    taller: {
      id: "tall-002",
      nombre: "Taller Norte"
    },
    asesor_asignado: {
      id: "ase-002",
      nombre: "Carlos Alberto Muñoz",
      email: "cmunoz@concesionario.cl"
    }
  },
  {
    id: "rec-009",
    id_externo: "REC-2025-009",
    cliente: {
      id: "cli-009",
      nombre: "Andrés Felipe Moreno",
      telefono: "+56934567890",
      email: ""
    },
    vehiculo: {
      id: "veh-009",
      patente: "GHIJ44",
      marca: "Suzuki",
      modelo: "Swift 2023",
      vin: "JS2YB41S305123456"
    },
    detalle: "Escucho un ruido metálico en la suspensión delantera al pasar por lomos de toro.",
    tipo_reclamo: "servicio",
    estado: "en_proceso",
    urgencia: "media",
    black_alert: false,
    fecha_creacion: "2025-01-20T11:00:00Z",
    sucursal: {
      id: "suc-001",
      nombre: "Sucursal Centro"
    },
    taller: {
      id: "tall-001",
      nombre: "Taller Central"
    },
    asesor_asignado: {
      id: "ase-001",
      nombre: "María Fernanda Lagos",
      email: "mlagos@concesionario.cl"
    }
  },
  {
    id: "rec-010",
    id_externo: "REC-2025-010",
    cliente: {
      id: "cli-010",
      nombre: "Valentina Isabel Guzmán",
      telefono: "+56987654321",
      email: "vguzman@empresa.com"
    },
    vehiculo: {
      id: "veh-010",
      patente: "EFGH55",
      marca: "Hyundai",
      modelo: "Accent 2024",
      vin: "KMHCT41BAPU123456"
    },
    detalle: "El sistema multimedia no conecta con mi celular vía Bluetooth. La pantalla táctil a veces no responde.",
    tipo_reclamo: "servicio",
    estado: "nuevo",
    urgencia: "baja",
    black_alert: false,
    fecha_creacion: "2025-01-20T17:30:00Z",
    sucursal: {
      id: "suc-003",
      nombre: "Sucursal Sur"
    },
    taller: {
      id: "tall-003",
      nombre: "Taller Sur"
    }
  },
  {
    id: "rec-011",
    id_externo: "REC-2025-011",
    cliente: {
      id: "cli-011",
      nombre: "Sofía Antonieta Muñoz",
      telefono: "+56945678901",
      email: "sofia.munoz@gmail.com",
      rut: "22.345.678-5"
    },
    vehiculo: {
      id: "veh-011",
      patente: "WXYZ22",
      marca: "Mazda",
      modelo: "CX-5 2024",
      vin: "JM3KFBDM8M0123456"
    },
    detalle: "El sistema de navegación GPS quedó congelado y no responde. He intentado reiniciar pero sigue igual.",
    tipo_reclamo: "servicio",
    estado: "nuevo",
    urgencia: "baja",
    black_alert: false,
    fecha_creacion: "2025-01-21T09:00:00Z",
    sucursal: {
      id: "suc-002",
      nombre: "Sucursal Norte"
    },
    taller: {
      id: "tall-002",
      nombre: "Taller Norte"
    }
  },
  {
    id: "rec-012",
    id_externo: "REC-2025-012",
    cliente: {
      id: "cli-012",
      nombre: "Benjamín Ignacio Rojas",
      telefono: "+56967890123",
      email: "",
      rut: "19.876.543-2"
    },
    vehiculo: {
      id: "veh-012",
      patente: "QRST44",
      marca: "Kia",
      modelo: "Sportage 2023",
      vin: ""
    },
    detalle: "Ruido en la dirección al girar en bajas velocidades. Parece que algo está rozando.",
    tipo_reclamo: "servicio",
    estado: "asignado",
    urgencia: "media",
    black_alert: false,
    fecha_creacion: "2025-01-20T15:00:00Z",
    sucursal: {
      id: "suc-001",
      nombre: "Sucursal Centro"
    },
    taller: {
      id: "tall-001",
      nombre: "Taller Central"
    },
    asesor_asignado: {
      id: "ase-001",
      nombre: "María Fernanda Lagos",
      email: "mlagos@concesionario.cl"
    }
  },
  {
    id: "rec-013",
    id_externo: "REC-2025-013",
    cliente: {
      id: "cli-013",
      nombre: "Isidora Constanza Pérez",
      telefono: "+56934567891",
      email: "isidora.perez@empresa.cl",
      rut: "20.123.456-8"
    },
    vehiculo: {
      id: "veh-013",
      patente: "ABEF56",
      marca: "Toyota",
      modelo: "RAV4 Hybrid 2025",
      vin: "JTMCFREV8PD123456"
    },
    detalle: "El motor híbrido no está cargando la batería eléctrica correctamente. El consumo de combustible ha aumentado mucho.",
    tipo_reclamo: "garantia",
    estado: "en_proceso",
    urgencia: "alta",
    black_alert: true,
    fecha_creacion: "2025-01-19T08:00:00Z",
    fecha_limite_resolucion: "2025-01-20T08:00:00Z",
    sucursal: {
      id: "suc-001",
      nombre: "Sucursal Centro"
    },
    taller: {
      id: "tall-001",
      nombre: "Taller Central"
    },
    asesor_asignado: {
      id: "ase-001",
      nombre: "María Fernanda Lagos",
      email: "mlagos@concesionario.cl"
    }
  },
  {
    id: "rec-014",
    id_externo: "REC-2025-014",
    cliente: {
      id: "cli-014",
      nombre: "Matías Sebastián Silva",
      telefono: "+56989012345",
      email: "matias.silva@outlook.com"
    },
    vehiculo: {
      id: "veh-014",
      patente: "PQRS89",
      marca: "Ford",
      modelo: "Ranger 2023",
      vin: "8AFBR1FM0MDK12345"
    },
    detalle: "Pérdida de potencia al subir pendientes. El motor pierde fuerza y hace ruido extraño.",
    tipo_reclamo: "servicio",
    estado: "asignado",
    urgencia: "alta",
    black_alert: false,
    fecha_creacion: "2025-01-21T10:30:00Z",
    sucursal: {
      id: "suc-003",
      nombre: "Sucursal Sur"
    },
    taller: {
      id: "tall-003",
      nombre: "Taller Sur"
    },
    asesor_asignado: {
      id: "ase-004",
      nombre: "Javiera Rojas",
      email: "jrojas@concesionario.cl"
    }
  },
  {
    id: "rec-015",
    id_externo: "REC-2025-015",
    cliente: {
      id: "cli-015",
      nombre: "Trinidad Catalina Fernández",
      telefono: "+56956789012",
      email: "trinidad.fernandez@gmail.com",
      rut: "21.456.789-1"
    },
    vehiculo: {
      id: "veh-015",
      patente: "MNOP67",
      marca: "Volkswagen",
      modelo: "Tiguan 2024",
      vin: "WVGZZZ5NZPW123456"
    },
    detalle: "El maletero eléctrico no abre automáticamente. Tengo que abrirlo manualmente cada vez.",
    tipo_reclamo: "servicio",
    estado: "en_proceso",
    urgencia: "baja",
    black_alert: false,
    fecha_creacion: "2025-01-18T14:00:00Z",
    sucursal: {
      id: "suc-002",
      nombre: "Sucursal Norte"
    },
    taller: {
      id: "tall-002",
      nombre: "Taller Norte"
    },
    asesor_asignado: {
      id: "ase-002",
      nombre: "Carlos Alberto Muñoz",
      email: "cmunoz@concesionario.cl"
    }
  },
  {
    id: "rec-016",
    id_externo: "REC-2025-016",
    cliente: {
      id: "cli-016",
      nombre: "Joaquín Tomás Vargas",
      telefono: "+56923456780",
      email: ""
    },
    vehiculo: {
      id: "veh-016",
      patente: "HIJK78",
      marca: "Peugeot",
      modelo: "3008 2023",
      vin: ""
    },
    detalle: "Vibración excesiva en el volante a velocidades sobre 100 km/h. Puede ser desbalanceo de ruedas.",
    tipo_reclamo: "servicio",
    estado: "resuelto",
    urgencia: "media",
    black_alert: false,
    fecha_creacion: "2025-01-16T11:00:00Z",
    sucursal: {
      id: "suc-001",
      nombre: "Sucursal Centro"
    },
    taller: {
      id: "tall-001",
      nombre: "Taller Central"
    },
    asesor_asignado: {
      id: "ase-001",
      nombre: "María Fernanda Lagos",
      email: "mlagos@concesionario.cl"
    }
  },
  {
    id: "rec-017",
    id_externo: "REC-2025-017",
    cliente: {
      id: "cli-017",
      nombre: "Martina Paz Núñez",
      telefono: "+56945678902",
      email: "martina.nunez@hotmail.com",
      rut: "18.234.567-9"
    },
    vehiculo: {
      id: "veh-017",
      patente: "CDEF89",
      marca: "Honda",
      modelo: "HR-V 2024",
      vin: "3CZRU6H39PM123456"
    },
    detalle: "Sensor de retroceso defectuoso. No detecta obstáculos y es muy peligroso.",
    tipo_reclamo: "garantia",
    estado: "asignado",
    urgencia: "alta",
    black_alert: false,
    fecha_creacion: "2025-01-21T08:15:00Z",
    sucursal: {
      id: "suc-002",
      nombre: "Sucursal Norte"
    },
    taller: {
      id: "tall-002",
      nombre: "Taller Norte"
    },
    asesor_asignado: {
      id: "ase-003",
      nombre: "Valentina Morales",
      email: "vmorales@concesionario.cl"
    }
  },
  {
    id: "rec-018",
    id_externo: "REC-2025-018",
    cliente: {
      id: "cli-018",
      nombre: "Agustín Maximiliano Rojas",
      telefono: "+56967890124",
      email: "agustin.rojas@gmail.com"
    },
    vehiculo: {
      id: "veh-018",
      patente: "TUVW90",
      marca: "Mitsubishi",
      modelo: "L200 2023",
      vin: "MMBJNKB40PH123456"
    },
    detalle: "Fuga de aceite en motor. Se forma un charco después de estacionar por varias horas.",
    tipo_reclamo: "garantia",
    estado: "en_proceso",
    urgencia: "alta",
    black_alert: false,
    fecha_creacion: "2025-01-20T12:00:00Z",
    sucursal: {
      id: "suc-003",
      nombre: "Sucursal Sur"
    },
    taller: {
      id: "tall-003",
      nombre: "Taller Sur"
    },
    asesor_asignado: {
      id: "ase-004",
      nombre: "Javiera Rojas",
      email: "jrojas@concesionario.cl"
    }
  },
  {
    id: "rec-019",
    id_externo: "REC-2025-019",
    cliente: {
      id: "cli-019",
      nombre: "Emilia Rocío Soto",
      telefono: "+56989012346",
      email: "emilia.soto@empresa.cl",
      rut: "19.345.678-0"
    },
    vehiculo: {
      id: "veh-019",
      patente: "NOPQ12",
      marca: "Renault",
      modelo: "Duster 2024",
      vin: "93YHSR0MJ5J123456"
    },
    detalle: "Excelente servicio de mantención preventiva. Todo muy profesional y rápido. Felicitaciones al equipo.",
    tipo_reclamo: "atencion",
    estado: "cerrado",
    urgencia: "baja",
    black_alert: false,
    fecha_creacion: "2025-01-17T15:30:00Z",
    sucursal: {
      id: "suc-001",
      nombre: "Sucursal Centro"
    },
    taller: {
      id: "tall-001",
      nombre: "Taller Central"
    }
  },
  {
    id: "rec-020",
    id_externo: "REC-2025-020",
    cliente: {
      id: "cli-020",
      nombre: "Lucas Benjamín Castillo",
      telefono: "+56956789013",
      email: ""
    },
    vehiculo: {
      id: "veh-020",
      patente: "RSTU23",
      marca: "Subaru",
      modelo: "Outback 2023",
      vin: "4S4BTANC2P3123456"
    },
    detalle: "Control de crucero adaptativo no funciona. Se desactiva solo mientras conduzco.",
    tipo_reclamo: "servicio",
    estado: "nuevo",
    urgencia: "media",
    black_alert: false,
    fecha_creacion: "2025-01-21T11:45:00Z",
    sucursal: {
      id: "suc-002",
      nombre: "Sucursal Norte"
    },
    taller: {
      id: "tall-002",
      nombre: "Taller Norte"
    }
  },
  {
    id: "rec-021",
    id_externo: "REC-2025-021",
    cliente: {
      id: "cli-021",
      nombre: "Catalina Javiera Herrera",
      telefono: "+56923456781",
      email: "catalina.herrera@outlook.com",
      rut: "20.987.654-3"
    },
    vehiculo: {
      id: "veh-021",
      patente: "VWXY34",
      marca: "Jeep",
      modelo: "Compass 2024",
      vin: "3C4NJDBN8PT123456"
    },
    detalle: "Calefacción no calienta suficiente. Sale aire apenas tibio incluso con temperatura al máximo.",
    tipo_reclamo: "servicio",
    estado: "asignado",
    urgencia: "media",
    black_alert: false,
    fecha_creacion: "2025-01-20T13:20:00Z",
    sucursal: {
      id: "suc-001",
      nombre: "Sucursal Centro"
    },
    taller: {
      id: "tall-001",
      nombre: "Taller Central"
    },
    asesor_asignado: {
      id: "ase-001",
      nombre: "María Fernanda Lagos",
      email: "mlagos@concesionario.cl"
    }
  },
  {
    id: "rec-022",
    id_externo: "REC-2025-022",
    cliente: {
      id: "cli-022",
      nombre: "Sebastián Alonso Tapia",
      telefono: "+56945678903",
      email: "sebastian.tapia@gmail.com"
    },
    vehiculo: {
      id: "veh-022",
      patente: "ZABC45",
      marca: "Skoda",
      modelo: "Octavia 2023",
      vin: "TMBEF7NJ8M8123456"
    },
    detalle: "Cristal delantero con fisura que se está extendiendo. Necesito cambio urgente.",
    tipo_reclamo: "servicio",
    estado: "en_proceso",
    urgencia: "alta",
    black_alert: false,
    fecha_creacion: "2025-01-19T09:30:00Z",
    sucursal: {
      id: "suc-003",
      nombre: "Sucursal Sur"
    },
    taller: {
      id: "tall-003",
      nombre: "Taller Sur"
    },
    asesor_asignado: {
      id: "ase-004",
      nombre: "Javiera Rojas",
      email: "jrojas@concesionario.cl"
    }
  },
  {
    id: "rec-023",
    id_externo: "REC-2025-023",
    cliente: {
      id: "cli-023",
      nombre: "Fernanda Monserrat Morales",
      telefono: "+56967890125",
      email: "fernanda.morales@empresa.cl",
      rut: "21.234.567-4"
    },
    vehiculo: {
      id: "veh-023",
      patente: "DEFG56",
      marca: "Chery",
      modelo: "Tiggo 8 Pro 2024",
      vin: "LVVDC11B7MD123456"
    },
    detalle: "Pantalla del sistema multimedia se apaga sola intermitentemente. Muy molesto mientras conduzco.",
    tipo_reclamo: "servicio",
    estado: "nuevo",
    urgencia: "media",
    black_alert: false,
    fecha_creacion: "2025-01-21T14:00:00Z",
    sucursal: {
      id: "suc-002",
      nombre: "Sucursal Norte"
    },
    taller: {
      id: "tall-002",
      nombre: "Taller Norte"
    }
  },
  {
    id: "rec-024",
    id_externo: "REC-2025-024",
    cliente: {
      id: "cli-024",
      nombre: "Felipe Andrés Bravo",
      telefono: "+56989012347",
      email: ""
    },
    vehiculo: {
      id: "veh-024",
      patente: "HIJK67",
      marca: "MG",
      modelo: "ZS 2023",
      vin: "LSJW54E59MS123456"
    },
    detalle: "Consumo de combustible excesivo. El computador marca 12 lt/100km en ciudad cuando debería ser 8.",
    tipo_reclamo: "servicio",
    estado: "asignado",
    urgencia: "media",
    black_alert: false,
    fecha_creacion: "2025-01-20T16:00:00Z",
    sucursal: {
      id: "suc-001",
      nombre: "Sucursal Centro"
    },
    taller: {
      id: "tall-001",
      nombre: "Taller Central"
    },
    asesor_asignado: {
      id: "ase-001",
      nombre: "María Fernanda Lagos",
      email: "mlagos@concesionario.cl"
    }
  },
  {
    id: "rec-025",
    id_externo: "REC-2025-025",
    cliente: {
      id: "cli-025",
      nombre: "Antonia Belén Ulloa",
      telefono: "+56956789014",
      email: "antonia.ulloa@hotmail.com",
      rut: "22.876.543-5"
    },
    vehiculo: {
      id: "veh-025",
      patente: "LMNO78",
      marca: "Haval",
      modelo: "H6 2024",
      vin: "LGWEF4A57PY123456"
    },
    detalle: "Asientos eléctricos no guardan la memoria de posición. Cada vez que subo tengo que ajustar todo de nuevo.",
    tipo_reclamo: "servicio",
    estado: "en_proceso",
    urgencia: "baja",
    black_alert: false,
    fecha_creacion: "2025-01-19T10:45:00Z",
    sucursal: {
      id: "suc-003",
      nombre: "Sucursal Sur"
    },
    taller: {
      id: "tall-003",
      nombre: "Taller Sur"
    },
    asesor_asignado: {
      id: "ase-004",
      nombre: "Javiera Rojas",
      email: "jrojas@concesionario.cl"
    }
  },
  {
    id: "rec-026",
    id_externo: "REC-2025-026",
    cliente: {
      id: "cli-026",
      nombre: "Vicente Matías Espinoza",
      telefono: "+56923456782",
      email: "vicente.espinoza@gmail.com"
    },
    vehiculo: {
      id: "veh-026",
      patente: "OPQR89",
      marca: "BYD",
      modelo: "Song Plus 2024",
      vin: "LGXC28EV3PG123456"
    },
    detalle: "Batería eléctrica no carga al 100%. Se detiene en 87% y no avanza más.",
    tipo_reclamo: "garantia",
    estado: "asignado",
    urgencia: "alta",
    black_alert: true,
    fecha_creacion: "2025-01-21T07:30:00Z",
    fecha_limite_resolucion: "2025-01-22T07:30:00Z",
    sucursal: {
      id: "suc-002",
      nombre: "Sucursal Norte"
    },
    taller: {
      id: "tall-002",
      nombre: "Taller Norte"
    },
    asesor_asignado: {
      id: "ase-003",
      nombre: "Valentina Morales",
      email: "vmorales@concesionario.cl"
    }
  },
  {
    id: "rec-027",
    id_externo: "REC-2025-027",
    cliente: {
      id: "cli-027",
      nombre: "Amanda Isidora Briceño",
      telefono: "+56945678904",
      email: "amanda.briceno@outlook.com",
      rut: "19.123.456-2"
    },
    vehiculo: {
      id: "veh-027",
      patente: "STUV90",
      marca: "Great Wall",
      modelo: "Wingle 2023",
      vin: "LGWRB12318H123456"
    },
    detalle: "Consulta por disponibilidad de repuestos para mantención de 30.000 km.",
    tipo_reclamo: "consulta",
    estado: "resuelto",
    urgencia: "baja",
    black_alert: false,
    fecha_creacion: "2025-01-18T12:00:00Z",
    sucursal: {
      id: "suc-001",
      nombre: "Sucursal Centro"
    },
    taller: {
      id: "tall-001",
      nombre: "Taller Central"
    },
    asesor_asignado: {
      id: "ase-001",
      nombre: "María Fernanda Lagos",
      email: "mlagos@concesionario.cl"
    }
  },
  {
    id: "rec-028",
    id_externo: "REC-2025-028",
    cliente: {
      id: "cli-028",
      nombre: "Cristóbal Eduardo Fuentes",
      telefono: "+56967890126",
      email: ""
    },
    vehiculo: {
      id: "veh-028",
      patente: "WXYZ01",
      marca: "JAC",
      modelo: "S3 2024",
      vin: "LJATA13C8PA123456"
    },
    detalle: "Limpiaparabrisas raspan el vidrio. Dejan marcas y no limpian bien cuando llueve.",
    tipo_reclamo: "servicio",
    estado: "nuevo",
    urgencia: "baja",
    black_alert: false,
    fecha_creacion: "2025-01-21T15:15:00Z",
    sucursal: {
      id: "suc-003",
      nombre: "Sucursal Sur"
    },
    taller: {
      id: "tall-003",
      nombre: "Taller Sur"
    }
  },
  {
    id: "rec-029",
    id_externo: "REC-2025-029",
    cliente: {
      id: "cli-029",
      nombre: "Renata Josefa Cortés",
      telefono: "+56989012348",
      email: "renata.cortes@empresa.cl",
      rut: "20.456.789-6"
    },
    vehiculo: {
      id: "veh-029",
      patente: "ABCD12",
      marca: "Volvo",
      modelo: "XC40 2024",
      vin: "YV4H60CK9P2123456"
    },
    detalle: "Sistema de frenado automático se activa sin razón. Muy peligroso, casi provoca un choque por detrás.",
    tipo_reclamo: "garantia",
    estado: "en_proceso",
    urgencia: "alta",
    black_alert: false,
    fecha_creacion: "2025-01-20T08:45:00Z",
    sucursal: {
      id: "suc-002",
      nombre: "Sucursal Norte"
    },
    taller: {
      id: "tall-002",
      nombre: "Taller Norte"
    },
    asesor_asignado: {
      id: "ase-002",
      nombre: "Carlos Alberto Muñoz",
      email: "cmunoz@concesionario.cl"
    }
  },
  {
    id: "rec-030",
    id_externo: "REC-2025-030",
    cliente: {
      id: "cli-030",
      nombre: "Maximiliano Gabriel Vera",
      telefono: "+56956789015",
      email: "maximiliano.vera@gmail.com"
    },
    vehiculo: {
      id: "veh-030",
      patente: "EFGH23",
      marca: "Audi",
      modelo: "Q3 2023",
      vin: "WAUZZZ8U3PA123456"
    },
    detalle: "Escape con ruido anormal. Suena como si hubiera una fuga o algo suelto.",
    tipo_reclamo: "servicio",
    estado: "asignado",
    urgencia: "media",
    black_alert: false,
    fecha_creacion: "2025-01-21T12:30:00Z",
    sucursal: {
      id: "suc-001",
      nombre: "Sucursal Centro"
    },
    taller: {
      id: "tall-001",
      nombre: "Taller Central"
    },
    asesor_asignado: {
      id: "ase-001",
      nombre: "María Fernanda Lagos",
      email: "mlagos@concesionario.cl"
    }
  }
];

// Alias para compatibilidad
export const mockReclamos = mockComplaints;

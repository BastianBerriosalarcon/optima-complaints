"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

// Validación de RUT chileno
const validarRUT = (rut: string | undefined) => {
  if (!rut || rut.length === 0) return true; // opcional

  // Remover puntos y guiones
  const rutLimpio = rut.replace(/\./g, '').replace(/-/g, '');

  // Verificar formato básico
  if (!/^\d{7,8}[0-9K]$/i.test(rutLimpio)) {
    return false;
  }

  // Separar número y dígito verificador
  const cuerpo = rutLimpio.slice(0, -1);
  const dv = rutLimpio.slice(-1).toUpperCase();

  // Calcular dígito verificador
  let suma = 0;
  let multiplo = 2;

  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo.charAt(i)) * multiplo;
    multiplo = multiplo < 7 ? multiplo + 1 : 2;
  }

  const dvEsperado = 11 - (suma % 11);
  const dvCalculado = dvEsperado === 11 ? '0' : dvEsperado === 10 ? 'K' : String(dvEsperado);

  return dv === dvCalculado;
};

// Schema de validación
const complaintSchema = z.object({
  // Cliente
  cliente_nombre: z.string().min(3, "Mínimo 3 caracteres").max(255, "Máximo 255 caracteres"),
  cliente_rut: z.string().optional().refine(validarRUT, "RUT inválido (formato: 12.345.678-9)"),
  cliente_telefono: z.string().regex(/^\+56\d{9}$/, "Formato inválido. Ejemplo: +56912345678"),
  cliente_email: z.string().email("Email inválido").optional().or(z.literal("")),

  // Vehículo
  vehiculo_patente: z.string().regex(/^[A-Z]{2,4}-?\d{2,4}$/i, "Formato inválido. Ejemplo: AB1234 o BBCD12"),
  vehiculo_marca: z.string().optional(),
  vehiculo_modelo: z.string().optional(),

  // Reclamo
  sucursal_id: z.string().min(1, "Debe seleccionar una sucursal"),
  titulo: z.string().min(10, "Mínimo 10 caracteres").max(500, "Máximo 500 caracteres"),
  descripcion: z.string().min(20, "Mínimo 20 caracteres"),
  es_black_alert: z.boolean(),
});

type ComplaintFormData = z.infer<typeof complaintSchema>;

// Sucursales mock
const mockSucursales = [
  { id: "suc-001", nombre: "Sucursal Centro" },
  { id: "suc-002", nombre: "Sucursal Norte" },
  { id: "suc-003", nombre: "Sucursal Sur" },
];

interface NewComplaintModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplaintCreated?: () => void;
}

export default function NewComplaintModal({
  open,
  onOpenChange,
  onComplaintCreated
}: NewComplaintModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ComplaintFormData>({
    resolver: zodResolver(complaintSchema),
    defaultValues: {
      cliente_nombre: "",
      cliente_rut: "",
      cliente_telefono: "+56",
      cliente_email: "",
      vehiculo_patente: "",
      vehiculo_marca: "",
      vehiculo_modelo: "",
      sucursal_id: "",
      titulo: "",
      descripcion: "",
      es_black_alert: false,
    },
  });

  const onSubmit = async (data: ComplaintFormData) => {
    setIsSubmitting(true);

    try {
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 800));

      // Generar número de reclamo (en producción vendría del backend)
      const numeroReclamo = `REC-2025-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;

      console.log("Nuevo reclamo:", {
        ...data,
        numero_reclamo: numeroReclamo,
        canal_origen: "contact_center",
        fecha_creacion: new Date().toISOString(),
        estado: "nuevo"
      });

      // Mostrar toast de éxito
      toast.success(`Reclamo ${numeroReclamo} creado exitosamente`, {
        description: "El reclamo ha sido registrado y será procesado por IA.",
        duration: 4000,
      });

      // Resetear formulario
      form.reset();

      // Cerrar modal
      onOpenChange(false);

      // Callback opcional
      if (onComplaintCreated) {
        onComplaintCreated();
      }

    } catch (error) {
      console.error("Error al crear reclamo:", error);
      toast.error("Error al crear reclamo", {
        description: "Ocurrió un error al intentar crear el reclamo. Intente nuevamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuevo Reclamo</DialogTitle>
          <DialogDescription>
            Ingrese los datos del reclamo. Los campos marcados con * son obligatorios.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Sección: Información del Cliente */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Información del Cliente</h3>

              <FormField
                control={form.control}
                name="cliente_nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre Completo *</FormLabel>
                    <FormControl>
                      <Input placeholder="Juan Carlos Pérez González" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="cliente_rut"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>RUT (opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="12.345.678-9" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cliente_telefono"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono *</FormLabel>
                      <FormControl>
                        <Input placeholder="+56912345678" {...field} />
                      </FormControl>
                      <FormDescription>Formato: +56912345678</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="cliente_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email (opcional)</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="ejemplo@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Sección: Información del Vehículo */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Información del Vehículo</h3>

              <FormField
                control={form.control}
                name="vehiculo_patente"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patente *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="AB1234 o BBCD12"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="vehiculo_marca"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marca (opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Toyota, Nissan, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vehiculo_modelo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Modelo (opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Corolla 2024" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Sección: Detalles del Reclamo */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Detalles del Reclamo</h3>

              <FormField
                control={form.control}
                name="sucursal_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sucursal *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione una sucursal" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {mockSucursales.map((sucursal) => (
                          <SelectItem key={sucursal.id} value={sucursal.id}>
                            {sucursal.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="titulo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título del Reclamo *</FormLabel>
                    <FormControl>
                      <Input placeholder="Breve descripción del problema" {...field} />
                    </FormControl>
                    <FormDescription>Mínimo 10 caracteres</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="descripcion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción Completa *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describa detalladamente el problema, incluyendo cuándo ocurrió, síntomas, etc."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Mínimo 20 caracteres</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="es_black_alert"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-red-50 dark:bg-red-950/30">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        Black Alert
                      </FormLabel>
                      <FormDescription className="text-red-700 dark:text-red-400">
                        Marque esta opción si el vehículo tiene menos de 6 meses de compra
                        y presenta falla en componentes críticos (motor, transmisión, frenos, dirección).
                        Esto activará prioridad máxima y notificaciones urgentes.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  "Crear Reclamo"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

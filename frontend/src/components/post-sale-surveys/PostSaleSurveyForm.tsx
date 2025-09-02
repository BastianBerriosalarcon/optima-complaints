"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardCheck } from "lucide-react";

interface PostSaleSurveyFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: PostSaleSurveyData) => void;
  initialData?: Partial<PostSaleSurveyData>;
}

interface PostSaleSurveyData {
  cliente_nombre: string;
  cliente_telefono: string;
  cliente_email?: string;
  vehiculo_modelo: string;
  vehiculo_patente: string;
  recomendacion: number;
  satisfaccion: number;
  lavado: number;
  asesor: number;
  comentario?: string;
}

const surveyQuestions = [
  {
    key: 'recomendacion',
    label: '¿Qué tan probable es que recomiende nuestro servicio?',
    description: 'Escala del 1 al 10'
  },
  {
    key: 'satisfaccion',
    label: '¿Cuál es su nivel de satisfacción general?',
    description: 'Escala del 1 al 10'
  },
  {
    key: 'lavado',
    label: '¿Cómo califica el servicio de lavado?',
    description: 'Escala del 1 al 10'
  },
  {
    key: 'asesor',
    label: '¿Cómo califica la atención del asesor?',
    description: 'Escala del 1 al 10'
  }
];

export default function PostSaleSurveyForm({
  open,
  onClose,
  onSubmit,
  initialData
}: PostSaleSurveyFormProps) {
  const [formData, setFormData] = useState<PostSaleSurveyData>({
    cliente_nombre: initialData?.cliente_nombre || "",
    cliente_telefono: initialData?.cliente_telefono || "",
    cliente_email: initialData?.cliente_email || "",
    vehiculo_modelo: initialData?.vehiculo_modelo || "",
    vehiculo_patente: initialData?.vehiculo_patente || "",
    recomendacion: initialData?.recomendacion || 0,
    satisfaccion: initialData?.satisfaccion || 0,
    lavado: initialData?.lavado || 0,
    asesor: initialData?.asesor || 0,
    comentario: initialData?.comentario || ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.cliente_nombre.trim()) {
      newErrors.cliente_nombre = "Nombre del cliente es requerido";
    }

    if (!formData.cliente_telefono.trim()) {
      newErrors.cliente_telefono = "Teléfono es requerido";
    } else if (!/^\+56\d{9}$/.test(formData.cliente_telefono)) {
      newErrors.cliente_telefono = "Formato inválido (+56XXXXXXXXX)";
    }

    if (!formData.vehiculo_modelo.trim()) {
      newErrors.vehiculo_modelo = "Modelo del vehículo es requerido";
    }

    if (!formData.vehiculo_patente.trim()) {
      newErrors.vehiculo_patente = "Patente es requerida";
    }

    // Validate ratings (1-10)
    surveyQuestions.forEach(question => {
      const value = formData[question.key as keyof PostSaleSurveyData] as number;
      if (value < 1 || value > 10) {
        newErrors[question.key] = "Calificación debe estar entre 1 y 10";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
      onClose();
    }
  };

  const handleRatingChange = (field: string, value: number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const RatingScale = ({ 
    field, 
    value, 
    onChange 
  }: { 
    field: string; 
    value: number; 
    onChange: (value: number) => void;
  }) => (
    <div className="survey-rating-scale">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
        <button
          key={num}
          type="button"
          onClick={() => onChange(num)}
          className={`survey-rating-button ${value === num ? 'selected' : ''}`}
        >
          {num}
        </button>
      ))}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5" />
            Encuesta de Satisfacción Post-Venta
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información del Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="cliente_nombre">Nombre del Cliente</Label>
                <Input
                  id="cliente_nombre"
                  value={formData.cliente_nombre}
                  onChange={(e) => setFormData(prev => ({ ...prev, cliente_nombre: e.target.value }))}
                  className={errors.cliente_nombre ? 'border-red-500' : ''}
                />
                {errors.cliente_nombre && (
                  <p className="text-red-500 text-sm mt-1">{errors.cliente_nombre}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cliente_telefono">Teléfono</Label>
                  <Input
                    id="cliente_telefono"
                    value={formData.cliente_telefono}
                    onChange={(e) => setFormData(prev => ({ ...prev, cliente_telefono: e.target.value }))}
                    placeholder="+56912345678"
                    className={errors.cliente_telefono ? 'border-red-500' : ''}
                  />
                  {errors.cliente_telefono && (
                    <p className="text-red-500 text-sm mt-1">{errors.cliente_telefono}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="cliente_email">Email (Opcional)</Label>
                  <Input
                    id="cliente_email"
                    type="email"
                    value={formData.cliente_email}
                    onChange={(e) => setFormData(prev => ({ ...prev, cliente_email: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vehiculo_modelo">Modelo del Vehículo</Label>
                  <Input
                    id="vehiculo_modelo"
                    value={formData.vehiculo_modelo}
                    onChange={(e) => setFormData(prev => ({ ...prev, vehiculo_modelo: e.target.value }))}
                    className={errors.vehiculo_modelo ? 'border-red-500' : ''}
                  />
                  {errors.vehiculo_modelo && (
                    <p className="text-red-500 text-sm mt-1">{errors.vehiculo_modelo}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="vehiculo_patente">Patente</Label>
                  <Input
                    id="vehiculo_patente"
                    value={formData.vehiculo_patente}
                    onChange={(e) => setFormData(prev => ({ ...prev, vehiculo_patente: e.target.value }))}
                    className={errors.vehiculo_patente ? 'border-red-500' : ''}
                  />
                  {errors.vehiculo_patente && (
                    <p className="text-red-500 text-sm mt-1">{errors.vehiculo_patente}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Survey Questions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Preguntas de Satisfacción</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {surveyQuestions.map((question) => (
                <div key={question.key} className="survey-question-group">
                  <Label className="text-base font-medium">
                    {question.label}
                  </Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    {question.description}
                  </p>
                  <RatingScale
                    field={question.key}
                    value={formData[question.key as keyof PostSaleSurveyData] as number}
                    onChange={(value) => handleRatingChange(question.key, value)}
                  />
                  {errors[question.key] && (
                    <p className="text-red-500 text-sm mt-1">{errors[question.key]}</p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Comments */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Comentarios Adicionales</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.comentario}
                onChange={(e) => setFormData(prev => ({ ...prev, comentario: e.target.value }))}
                placeholder="Comparta cualquier comentario adicional sobre su experiencia..."
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              Guardar Encuesta
            </Button>
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
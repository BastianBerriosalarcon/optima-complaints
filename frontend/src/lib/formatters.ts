// Funciones de formateo para datos del sistema

export const formatScore = (score: number): string => {
  return score.toFixed(1);
};

export const formatPercentage = (value: number, total: number): string => {
  if (total === 0) return '0%';
  return `${((value / total) * 100).toFixed(1)}%`;
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0
  }).format(amount);
};

export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('es-CL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date(date));
};

export const formatDateTime = (date: string | Date): string => {
  return new Intl.DateTimeFormat('es-CL', {
    year: 'numeric',
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
};

export const formatTimeAgo = (date: string | Date): string => {
  const now = new Date();
  const past = new Date(date);
  const diffInHours = Math.floor((now.getTime() - past.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Hace menos de 1 hora';
  if (diffInHours < 24) return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
  
  const diffInMonths = Math.floor(diffInDays / 30);
  return `Hace ${diffInMonths} mes${diffInMonths > 1 ? 'es' : ''}`;
};

export const formatPhone = (phone: string): string => {
  // Format Chilean phone numbers
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 9) {
    return `+56 ${cleaned.slice(0, 1)} ${cleaned.slice(1, 5)} ${cleaned.slice(5)}`;
  }
  return phone;
};

export const formatLeadScore = (score: number): { label: string; color: string } => {
  if (score >= 70) return { label: 'Caliente', color: 'bg-red-500' };
  if (score >= 40) return { label: 'Tibio', color: 'bg-yellow-500' };
  return { label: 'Frío', color: 'bg-blue-500' };
};

export const formatSurveyScore = (score: number): { label: string; color: string } => {
  if (score >= 9) return { label: 'Excelente', color: 'bg-green-500' };
  if (score >= 7) return { label: 'Bueno', color: 'bg-blue-500' };
  if (score >= 5) return { label: 'Regular', color: 'bg-yellow-500' };
  return { label: 'Bajo', color: 'bg-red-500' };
};
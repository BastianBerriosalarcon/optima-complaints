"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { redirect } from "next/navigation";

import Sidebar from "@/components/navigation/Sidebar";
import DashboardStats from "@/components/dashboard/DashboardStats";
import NotificationCenter from "@/components/notifications/NotificationCenter";
import LeadsTable from "@/components/leads/LeadsTable";
import ComplaintsTable from "@/components/complaints/ComplaintsTable";
import FilterBar from "@/components/shared/FilterBar";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { 
  LayoutGrid, 
  Target, 
  ClipboardCheck, 
  CircleAlert, 
  Bell, 
  TrendingUp,
  Plus,
  AlertTriangle,
  Users,
  BarChart3
} from "lucide-react";

import { mockDashboardStats, mockNotifications, mockLeads, mockComplaints } from "@/lib/mockData";
import { LeadStatus, ComplaintStatus, ComplaintUrgency } from "@/lib/enums";

export default function OptimaCXDashboard() {
  const { user, isAuthenticated } = useAuth();
  const { hasPermission } = useRole();
  
  // State management
  const [stats, setStats] = useState(mockDashboardStats);
  const [notifications, setNotifications] = useState(mockNotifications);
  const [leads, setLeads] = useState(mockLeads);
  const [complaints, setComplaints] = useState(mockComplaints);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  // Filter states
  const [leadsSearch, setLeadsSearch] = useState("");
  const [leadsFilters, setLeadsFilters] = useState({
    estado: "",
    nivel_interes: "",
    asesor_id: "",
    sucursal_id: ""
  });

  const [complaintsSearch, setComplaintsSearch] = useState("");
  const [complaintsFilters, setComplaintsFilters] = useState({
    estado: "",
    urgencia: "",
    black_alert: "",
    sucursal_id: ""
  });

  if (!isAuthenticated || !user) {
    redirect("/sign-in");
  }

  // Event handlers
  const handleMarkNotificationAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, leida: true } : notif
      )
    );
  };

  const handleMarkAllNotificationsAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, leida: true }))
    );
  };

  const handleLeadStatusUpdate = (leadId: string, status: string) => {
    setLeads(prev => 
      prev.map(lead => 
        lead.id === leadId ? { ...lead, estado: status } : lead
      )
    );
  };

  const handleComplaintStatusUpdate = (complaintId: string, status: string) => {
    setComplaints(prev => 
      prev.map(complaint => 
        complaint.id === complaintId ? { ...complaint, estado: status } : complaint
      )
    );
  };

  const handleLeadsFilterChange = (key: string, value: string) => {
    setLeadsFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleComplaintsFilterChange = (key: string, value: string) => {
    setComplaintsFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearLeadsFilters = () => {
    setLeadsSearch("");
    setLeadsFilters({ estado: "", nivel_interes: "", asesor_id: "", sucursal_id: "" });
  };

  const clearComplaintsFilters = () => {
    setComplaintsSearch("");
    setComplaintsFilters({ estado: "", urgencia: "", black_alert: "", sucursal_id: "" });
  };

  // Filter options
  const leadsFilterOptions = [
    {
      key: "estado",
      label: "Estado",
      value: leadsFilters.estado,
      options: [
        { value: LeadStatus.NUEVO, label: "Nuevo" },
        { value: LeadStatus.CONTACTADO, label: "Contactado" },
        { value: LeadStatus.COTIZADO, label: "Cotizado" },
        { value: LeadStatus.VENDIDO, label: "Vendido" },
        { value: LeadStatus.PERDIDO, label: "Perdido" }
      ]
    }
  ];

  const complaintsFilterOptions = [
    {
      key: "estado",
      label: "Estado", 
      value: complaintsFilters.estado,
      options: [
        { value: ComplaintStatus.PENDIENTE, label: "Pendiente" },
        { value: ComplaintStatus.EN_PROCESO, label: "En Proceso" },
        { value: ComplaintStatus.CERRADO, label: "Cerrado" }
      ]
    },
    {
      key: "urgencia",
      label: "Urgencia",
      value: complaintsFilters.urgencia,
      options: [
        { value: ComplaintUrgency.ALTA, label: "Alta" },
        { value: ComplaintUrgency.MEDIA, label: "Media" },
        { value: ComplaintUrgency.BAJA, label: "Baja" }
      ]
    }
  ];

  // Filtered data
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = !leadsSearch || 
      lead.nombre_cliente.toLowerCase().includes(leadsSearch.toLowerCase()) ||
      lead.telefono_cliente.includes(leadsSearch) ||
      lead.modelo_interes.toLowerCase().includes(leadsSearch.toLowerCase());

    const matchesFilters = 
      (!leadsFilters.estado || lead.estado === leadsFilters.estado) &&
      (!leadsFilters.nivel_interes || lead.nivel_interes === leadsFilters.nivel_interes);

    return matchesSearch && matchesFilters;
  });

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = !complaintsSearch || 
      complaint.cliente.nombre.toLowerCase().includes(complaintsSearch.toLowerCase()) ||
      complaint.cliente.telefono.includes(complaintsSearch) ||
      complaint.id_externo.toLowerCase().includes(complaintsSearch.toLowerCase());

    const matchesFilters = 
      (!complaintsFilters.estado || complaint.estado === complaintsFilters.estado) &&
      (!complaintsFilters.urgencia || complaint.urgencia === complaintsFilters.urgencia) &&
      (!complaintsFilters.black_alert || complaint.black_alert.toString() === complaintsFilters.black_alert);

    return matchesSearch && matchesFilters;
  });

  const unreadNotifications = notifications.filter(n => !n.leida);
  const blackAlertCount = filteredComplaints.filter(c => c.black_alert).length;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Óptima-CX Dashboard</h1>
              <p className="text-muted-foreground">
                Plataforma integral de gestión de experiencia del cliente automotriz
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="outline" className="relative">
                <Bell className="h-4 w-4" />
                {unreadNotifications.length > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                  >
                    {unreadNotifications.length}
                  </Badge>
                )}
              </Button>
            </div>
          </div>

          {/* Black Alert Warning */}
          {blackAlertCount > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Hay {blackAlertCount} reclamo{blackAlertCount > 1 ? 's' : ''} Black Alert que requieren atención inmediata.
              </AlertDescription>
            </Alert>
          )}

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="leads">Leads</TabsTrigger>
              <TabsTrigger value="complaints">Reclamos</TabsTrigger>
              <TabsTrigger value="surveys">Encuestas</TabsTrigger>
              <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
            </TabsList>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-6">
              <DashboardStats stats={stats} />
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  {/* Quick Actions */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Acciones Rápidas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {hasPermission('leads:create') && (
                          <Button variant="outline" className="h-20 flex flex-col gap-2">
                            <Target className="h-6 w-6" />
                            <span className="text-sm">Nuevo Lead</span>
                          </Button>
                        )}
                        
                        {hasPermission('reclamos:create') && (
                          <Button variant="outline" className="h-20 flex flex-col gap-2">
                            <CircleAlert className="h-6 w-6" />
                            <span className="text-sm">Nuevo Reclamo</span>
                          </Button>
                        )}
                        
                        {hasPermission('encuestas:view') && (
                          <Button variant="outline" className="h-20 flex flex-col gap-2">
                            <ClipboardCheck className="h-6 w-6" />
                            <span className="text-sm">Ver Encuestas</span>
                          </Button>
                        )}
                        
                        {hasPermission('reports:view') && (
                          <Button variant="outline" className="h-20 flex flex-col gap-2">
                            <LayoutGrid className="h-6 w-6" />
                            <span className="text-sm">Reportes</span>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  <NotificationCenter
                    notifications={notifications.slice(0, 5)}
                    onMarkAsRead={handleMarkNotificationAsRead}
                    onMarkAllAsRead={handleMarkAllNotificationsAsRead}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Leads Tab */}
            <TabsContent value="leads" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Gestión de Leads</h2>
                {hasPermission('leads:create') && (
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Nuevo Lead
                  </Button>
                )}
              </div>

              <FilterBar
                searchValue={leadsSearch}
                onSearchChange={setLeadsSearch}
                filters={leadsFilterOptions}
                onFilterChange={handleLeadsFilterChange}
                onClearFilters={clearLeadsFilters}
                showExport={hasPermission('reports:export')}
              />

              <Card>
                <CardHeader>
                  <CardTitle>Leads ({filteredLeads.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <LeadsTable
                    leads={filteredLeads}
                    onUpdateStatus={handleLeadStatusUpdate}
                    canAssignLeads={hasPermission('leads:assign')}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Complaints Tab */}
            <TabsContent value="complaints" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Gestión de Reclamos</h2>
                {hasPermission('reclamos:create') && (
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Nuevo Reclamo
                  </Button>
                )}
              </div>

              <FilterBar
                searchValue={complaintsSearch}
                onSearchChange={setComplaintsSearch}
                filters={complaintsFilterOptions}
                onFilterChange={handleComplaintsFilterChange}
                onClearFilters={clearComplaintsFilters}
                showExport={hasPermission('reports:export')}
              />

              <Card>
                <CardHeader>
                  <CardTitle>Reclamos ({filteredComplaints.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <ComplaintsTable
                    complaints={filteredComplaints}
                    onUpdateStatus={handleComplaintStatusUpdate}
                    canAssignComplaints={hasPermission('reclamos:assign')}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Surveys Tab */}
            <TabsContent value="surveys" className="space-y-4">
              <div className="text-center py-8">
                <ClipboardCheck className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Módulo de Encuestas</h3>
                <p className="text-muted-foreground mb-4">
                  Gestión de encuestas de ventas y post-venta
                </p>
                <Button variant="outline">
                  Ir a Encuestas de Ventas
                </Button>
              </div>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-4">
              <NotificationCenter
                notifications={notifications}
                onMarkAsRead={handleMarkNotificationAsRead}
                onMarkAllAsRead={handleMarkAllNotificationsAsRead}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
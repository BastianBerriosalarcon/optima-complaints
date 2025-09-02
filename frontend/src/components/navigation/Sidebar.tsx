"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRole } from "@/hooks/useRole";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  LayoutGrid, 
  Target, 
  ClipboardCheck, 
  CircleAlert, 
  Bell,
  Settings,
  BarChart3,
  FileText
} from "lucide-react";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutGrid,
    permissions: ["metrics:view"]
  },
  {
    name: "Gestión de Leads",
    href: "/dashboard/leads",
    icon: Target,
    permissions: ["leads:view"]
  },
  {
    name: "Encuestas de Ventas",
    href: "/dashboard/encuestas-ventas",
    icon: ClipboardCheck,
    permissions: ["encuestas:view"]
  },
  {
    name: "Encuestas Post-Venta",
    href: "/dashboard/encuestas-post-venta",
    icon: ClipboardCheck,
    permissions: ["encuestas:view"]
  },
  {
    name: "Gestión de Reclamos",
    href: "/dashboard/reclamos",
    icon: CircleAlert,
    permissions: ["reclamos:view"]
  },
  {
    name: "Notificaciones",
    href: "/dashboard/notificaciones",
    icon: Bell,
    permissions: ["metrics:view"]
  }
];

const secondaryNavigation = [
  {
    name: "Reportes",
    href: "/dashboard/reportes",
    icon: BarChart3,
    permissions: ["reports:view"]
  },
  {
    name: "Configuración",
    href: "/dashboard/configuracion",
    icon: Settings,
    permissions: ["config:view"]
  }
];

export default function Sidebar() {
  const pathname = usePathname();
  const { hasPermission } = useRole();

  const filteredNavigation = navigation.filter(item => 
    item.permissions.some(permission => hasPermission(permission as any))
  );

  const filteredSecondaryNavigation = secondaryNavigation.filter(item =>
    item.permissions.some(permission => hasPermission(permission as any))
  );

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200">
      <div className="flex h-16 items-center px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">ÓX</span>
          </div>
          <span className="text-xl font-bold text-gray-900">Óptima-CX</span>
        </Link>
      </div>
      
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1 py-4">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Button
                key={item.name}
                asChild
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-2 h-10",
                  isActive && "bg-blue-50 text-blue-700 hover:bg-blue-100"
                )}
              >
                <Link href={item.href}>
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              </Button>
            );
          })}
        </div>

        {filteredSecondaryNavigation.length > 0 && (
          <>
            <Separator className="my-4" />
            <div className="space-y-1 py-4">
              {filteredSecondaryNavigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Button
                    key={item.name}
                    asChild
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-2 h-10",
                      isActive && "bg-blue-50 text-blue-700 hover:bg-blue-100"
                    )}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  </Button>
                );
              })}
            </div>
          </>
        )}
      </ScrollArea>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  MapPin, 
  User, 
  CheckCircle2,
  XCircle,
  Clock,
  QrCode,
  Package
} from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

interface ServiceRequest {
  id: string;
  event_id: string;
  service_id: string;
  status: string;
  proposed_price: number;
  final_price: number | null;
  qr_token: string | null;
  qr_used_at: string | null;
  qr_expires_at: string | null;
  created_at: string;
  event: {
    title: string;
    event_date: string;
    location: string;
    organizer: {
      full_name: string;
    };
  };
  service: {
    name: string;
  };
}

export default function ProviderRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("service_requests")
        .select(`
          *,
          event:events(
            title,
            event_date,
            location,
            organizer:profiles(full_name)
          ),
          service:services(name)
        `)
        .eq("provider_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast.error("Error al cargar solicitudes");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from("service_requests")
        .update({ status: "ACCEPTED" })
        .eq("id", requestId);

      if (error) throw error;
      toast.success("Solicitud aceptada");
      fetchRequests();
    } catch (error) {
      console.error("Error accepting request:", error);
      toast.error("Error al aceptar la solicitud");
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from("service_requests")
        .update({ status: "REJECTED" })
        .eq("id", requestId);

      if (error) throw error;
      toast.success("Solicitud rechazada");
      fetchRequests();
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast.error("Error al rechazar la solicitud");
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800",
      ACCEPTED: "bg-green-100 text-green-800",
      REJECTED: "bg-red-100 text-red-800",
      COMPLETED: "bg-blue-100 text-blue-800",
      CANCELLED: "bg-gray-100 text-gray-800",
    };
    const labels: Record<string, string> = {
      PENDING: "Pendiente",
      ACCEPTED: "Aceptada",
      REJECTED: "Rechazada",
      COMPLETED: "Completada",
      CANCELLED: "Cancelada",
    };
    return (
      <Badge className={styles[status] || "bg-gray-100"}>
        {labels[status] || status}
      </Badge>
    );
  };

  const filteredRequests = requests.filter(r => {
    if (activeTab === "pending") return r.status === "PENDING";
    if (activeTab === "active") return ["ACCEPTED", "CONFIRMED"].includes(r.status);
    if (activeTab === "completed") return r.status === "COMPLETED";
    if (activeTab === "all") return true;
    return false;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Mis Solicitudes</h1>
          <p className="text-gray-600">Gestiona las solicitudes de servicios para eventos</p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="pending">
              Pendientes
              <Badge variant="secondary" className="ml-2">
                {requests.filter(r => r.status === "PENDING").length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="active">Activas</TabsTrigger>
            <TabsTrigger value="completed">Completadas</TabsTrigger>
            <TabsTrigger value="all">Todas</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {filteredRequests.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-lg">
                <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay solicitudes {activeTab === "pending" ? "pendientes" : ""}
                </h3>
                <p className="text-gray-600">
                  {activeTab === "pending" 
                    ? "Cuando un organizador te solicite, aparecerá aquí"
                    : "No hay solicitudes en esta categoría"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRequests.map((request) => (
                  <Card key={request.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        {/* Event Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {getStatusBadge(request.status)}
                            <span className="text-sm text-gray-500">
                              Solicitud #{request.id.slice(0, 8)}
                            </span>
                          </div>
                          
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {request.event?.title || "Evento"}
                          </h3>
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Package className="w-4 h-4" />
                              {request.service?.name}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(request.event?.event_date).toLocaleDateString("es-PY")}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {request.event?.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <User className="w-4 h-4" />
                              {request.event?.organizer?.full_name}
                            </span>
                          </div>
                        </div>

                        {/* Price & Actions */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Precio propuesto</p>
                            <p className="text-xl font-bold text-violet-600">
                              Gs {request.proposed_price.toLocaleString()}
                            </p>
                          </div>

                          {request.status === "PENDING" && (
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleReject(request.id)}
                                className="text-red-600 border-red-200 hover:bg-red-50"
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Rechazar
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleAccept(request.id)}
                                className="bg-gradient-to-r from-violet-600 to-rose-500"
                              >
                                <CheckCircle2 className="w-4 h-4 mr-1" />
                                Aceptar
                              </Button>
                            </div>
                          )}

                          {request.status === "ACCEPTED" && request.qr_token && (
                            <Link href={`/qr/${request.id}`}>
                              <Button className="bg-green-600 hover:bg-green-700">
                                <QrCode className="w-4 h-4 mr-2" />
                                Ver QR
                              </Button>
                            </Link>
                          )}

                          {request.status === "COMPLETED" && (
                            <Badge className="bg-blue-100 text-blue-800">
                              <CheckCircle2 className="w-4 h-4 mr-1" />
                              Servicio validado
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}


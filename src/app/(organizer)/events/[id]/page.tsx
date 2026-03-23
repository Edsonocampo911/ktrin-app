"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  QrCode,
  CheckCircle2,
  Download,
  Share2,
  Loader2
} from "lucide-react";
import toast from "react-hot-toast";
import type { Event, EventStatus, EventService } from "@/types/database";

export default function EventDetailPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;
  
  const [event, setEvent] = useState<Event | null>(null);
  const [eventServices, setEventServices] = useState<EventService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("services");

  useEffect(() => {
    if (eventId) {
      loadData();
    }
  }, [eventId]);

  const loadData = async () => {
    try {
      setIsLoading(true);

      // Get event
      const { data: eventData } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();

      if (eventData) {
        setEvent(eventData);

        // Get event services
        const { data: servicesData } = await supabase
          .from("event_services")
          .select("*, services(name), providers(business_name)")
          .eq("event_id", eventId);

        setEventServices(servicesData || []);
      }
    } catch (error) {
      console.error("Error loading event:", error);
      toast.error("Error al cargar el evento");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: EventStatus) => {
    const styles: Record<EventStatus, string> = {
      DRAFT: "bg-gray-100 text-gray-700",
      OPEN: "bg-blue-100 text-blue-700",
      CONFIRMED: "bg-emerald-100 text-emerald-700",
      IN_PROGRESS: "bg-amber-100 text-amber-700",
      COMPLETED: "bg-purple-100 text-purple-700",
      PARTIALLY_VALIDATED: "bg-orange-100 text-orange-700",
      FULLY_VALIDATED: "bg-green-100 text-green-700",
      CANCELLED: "bg-red-100 text-red-700",
      POSTPONED: "bg-yellow-100 text-yellow-700",
      POSTPONED_WEATHER: "bg-sky-100 text-sky-700",
    };
    
    const labels: Record<EventStatus, string> = {
      DRAFT: "Borrador",
      OPEN: "Abierto",
      CONFIRMED: "Confirmado",
      IN_PROGRESS: "En curso",
      COMPLETED: "Completado",
      PARTIALLY_VALIDATED: "Parcialmente validado",
      FULLY_VALIDATED: "Totalmente validado",
      CANCELLED: "Cancelado",
      POSTPONED: "Pospuesto",
      POSTPONED_WEATHER: "Pospuesto por clima",
    };
    
    return (
      <Badge className={styles[status]} variant="secondary">
        {labels[status]}
      </Badge>
    );
  };

  const getServiceStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-700",
      ACCEPTED: "bg-blue-100 text-blue-700",
      REJECTED: "bg-red-100 text-red-700",
      FULFILLED: "bg-green-100 text-green-700",
      NOT_VALIDATED: "bg-orange-100 text-orange-700",
      CANCELLED: "bg-gray-100 text-gray-700",
    };
    
    const labels: Record<string, string> = {
      PENDING: "Pendiente",
      ACCEPTED: "Aceptado",
      REJECTED: "Rechazado",
      FULFILLED: "Cumplido",
      NOT_VALIDATED: "No validado",
      CANCELLED: "Cancelado",
    };
    
    return (
      <Badge className={styles[status] || "bg-gray-100"} variant="secondary">
        {labels[status] || status}
      </Badge>
    );
  };

  const progress = eventServices.length > 0 
    ? Math.round((eventServices.filter(es => es.status === 'FULFILLED').length / eventServices.length) * 100)
    : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Evento no encontrado</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button variant="ghost" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Compartir
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Event Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
                {getStatusBadge(event.status)}
              </div>
              <p className="text-gray-600">{event.description}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {new Date(event.event_date).toLocaleDateString('es-PY', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {event.start_time} - {event.end_time}
            </span>
            {event.location && (
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {event.location}
              </span>
            )}
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              {event.expected_guests} invitados esperados
            </span>
          </div>
        </div>

        {/* Progress Card */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg">Progreso del Evento</h3>
                <p className="text-gray-500">
                  {eventServices.filter(es => es.status === 'FULFILLED').length} de {eventServices.length} servicios validados
                </p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold text-violet-600">{progress}%</span>
              </div>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-violet-600 to-rose-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            {event.status === 'IN_PROGRESS' && (
              <div className="mt-4 flex justify-end">
                <Link href={`/events/${eventId}/qr-scan`}>
                  <Button className="bg-gradient-to-r from-violet-600 to-rose-500">
                    <QrCode className="w-4 h-4 mr-2" />
                    Escanear QR de Proveedor
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="services">Servicios</TabsTrigger>
            <TabsTrigger value="guests">Invitados</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="services" className="space-y-4">
            {eventServices.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-gray-500">No hay servicios contratados</p>
              </Card>
            ) : (
              eventServices.map((service: any) => (
                <Card key={service.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          {getServiceStatusBadge(service.status)}
                          {service.qr_used && (
                            <Badge className="bg-green-100 text-green-700">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              QR Validado
                            </Badge>
                          )}
                        </div>
                        <p className="font-medium">{service.services?.name}</p>
                        <p className="text-sm text-gray-500">
                          Proveedor: {service.providers?.business_name}
                        </p>
                        <p className="text-violet-600 font-medium mt-1">
                          ₲ {service.agreed_price.toLocaleString()}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        {service.status === 'FULFILLED' ? (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle2 className="w-5 h-5" />
                            <span className="font-medium">Validado</span>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="guests">
            <Card className="p-8 text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Gestión de Invitados</h3>
              <p className="text-gray-500 mb-4">
                Administra tu lista de invitados y sus confirmaciones
              </p>
              <Button variant="outline">
                <Users className="w-4 h-4 mr-2" />
                Ver Invitados
              </Button>
            </Card>
          </TabsContent>

          <TabsContent value="timeline">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4">Cronología del Evento</h3>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-violet-600" />
                    </div>
                    <div>
                      <p className="font-medium">Evento creado</p>
                      <p className="text-sm text-gray-500">
                        {new Date(event.created_at).toLocaleString('es-PY')}
                      </p>
                    </div>
                  </div>
                  
                  {eventServices.map((service, index) => (
                    <div key={service.id} className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        service.status === 'FULFILLED' 
                          ? 'bg-green-100' 
                          : service.status === 'ACCEPTED'
                          ? 'bg-blue-100'
                          : 'bg-gray-100'
                      }`}>
                        {service.status === 'FULFILLED' ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        ) : (
                          <span className="text-sm font-medium text-gray-500">{index + 2}</span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {service.status === 'FULFILLED' 
                            ? 'Servicio validado' 
                            : service.status === 'ACCEPTED'
                            ? 'Servicio aceptado'
                            : 'Servicio pendiente'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {service.services?.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
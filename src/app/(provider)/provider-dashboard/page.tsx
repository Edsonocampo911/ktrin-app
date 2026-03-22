"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  TrendingUp, 
  Star,
  Clock,
  CheckCircle2,
  LogOut,
  Bell,
  MapPin,
  Briefcase,
  Award,
  Shield,
  QrCode,
  DollarSign,
  Loader2
} from "lucide-react";
import toast from "react-hot-toast";
import type { EventService, ServiceStatus, Event } from "@/types/database";

export default function ProviderDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [provider, setProvider] = useState<any>(null);
  const [eventServices, setEventServices] = useState<EventService[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("requests");

  useEffect(() => {
    checkAuth();
    loadData();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }
    setUser(user);
  };

  const loadData = async () => {
    try {
      setIsLoading(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      
      if (profileData) {
        setProfile(profileData);

        // Get provider data
        const { data: providerData } = await supabase
          .from("providers")
          .select("*")
          .eq("profile_id", profileData.id)
          .single();
        
        setProvider(providerData);

        // Get event services
        const { data: servicesData } = await supabase
          .from("event_services")
          .select("*")
          .eq("provider_id", providerData?.id)
          .order("created_at", { ascending: false });
        
        setEventServices(servicesData || []);

        // Get events for these services
        if (servicesData && servicesData.length > 0) {
          const eventIds = servicesData.map(s => s.event_id);
          const { data: eventsData } = await supabase
            .from("events")
            .select("*")
            .in("id", eventIds);
          
          setEvents(eventsData || []);
        }
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Error al cargar los datos");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (serviceId: string) => {
    try {
      // Generate QR token
      const qrToken = `qr-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      const { error } = await supabase
        .from("event_services")
        .update({
          status: 'ACCEPTED',
          qr_token: qrToken,
          qr_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", serviceId);

      if (error) throw error;

      toast.success("Solicitud aceptada. QR generado exitosamente.");
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Error al aceptar la solicitud");
    }
  };

  const handleReject = async (serviceId: string) => {
    try {
      const { error } = await supabase
        .from("event_services")
        .update({
          status: 'REJECTED',
          updated_at: new Date().toISOString(),
        })
        .eq("id", serviceId);

      if (error) throw error;

      toast.info("Solicitud rechazada");
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Error al rechazar la solicitud");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Sesión cerrada");
    router.push("/login");
  };

  const getVerificationBadge = (level: string) => {
    const styles: Record<string, string> = {
      BASIC: "bg-gray-100 text-gray-700",
      VERIFIED_ID: "bg-blue-100 text-blue-700",
      VERIFIED_BUSINESS: "bg-emerald-100 text-emerald-700",
    };
    
    const labels: Record<string, string> = {
      BASIC: "Básico",
      VERIFIED_ID: "ID Verificado",
      VERIFIED_BUSINESS: "Negocio Verificado",
    };
    
    return (
      <Badge className={styles[level]} variant="secondary">
        <Shield className="w-3 h-3 mr-1" />
        {labels[level]}
      </Badge>
    );
  };

  const getServiceStatusBadge = (status: ServiceStatus) => {
    const styles: Record<ServiceStatus, string> = {
      PENDING: "bg-yellow-100 text-yellow-700",
      ACCEPTED: "bg-blue-100 text-blue-700",
      REJECTED: "bg-red-100 text-red-700",
      FULFILLED: "bg-green-100 text-green-700",
      NOT_VALIDATED: "bg-orange-100 text-orange-700",
      CANCELLED: "bg-gray-100 text-gray-700",
    };
    
    const labels: Record<ServiceStatus, string> = {
      PENDING: "Pendiente",
      ACCEPTED: "Aceptado",
      REJECTED: "Rechazado",
      FULFILLED: "Cumplido",
      NOT_VALIDATED: "No validado",
      CANCELLED: "Cancelado",
    };
    
    return (
      <Badge className={styles[status]} variant="secondary">
        {labels[status]}
      </Badge>
    );
  };

  const pendingRequests = eventServices.filter(es => es.status === 'PENDING');
  const activeEvents = eventServices.filter(es => ['ACCEPTED', 'FULFILLED'].includes(es.status));
  const completedServices = eventServices.filter(es => es.status === 'FULFILLED');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-rose-500 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">KTRIN</h1>
                <p className="text-xs text-gray-500">Panel de Proveedor</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-500 hover:text-gray-700">
                <Bell className="w-5 h-5" />
                {pendingRequests.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </button>
              
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{provider?.business_name}</p>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span className="text-xs text-gray-500">{provider?.trust_score?.toFixed(2) || "5.00"}</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
                  <span className="text-violet-600 font-medium">
                    {provider?.business_name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Card */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-600 to-rose-500 flex items-center justify-center text-white text-2xl font-bold">
                  {provider?.business_name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-bold">{provider?.business_name}</h2>
                    {provider?.is_founder && (
                      <Badge className="bg-amber-100 text-amber-700">
                        <Award className="w-3 h-3 mr-1" />
                        Fundador
                      </Badge>
                    )}
                    {provider?.is_ambassador && (
                      <Badge className="bg-purple-100 text-purple-700">
                        <Star className="w-3 h-3 mr-1" />
                        Embajador
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-500 text-sm mb-2">{provider?.description}</p>
                  <div className="flex items-center gap-2">
                    {getVerificationBadge(provider?.verification_level || 'BASIC')}
                    <Badge variant="outline">
                      <MapPin className="w-3 h-3 mr-1" />
                      {provider?.base_zone}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-violet-600">{provider?.events_completed || 0}</p>
                  <p className="text-sm text-gray-500">Eventos</p>
                </div>
                <div className="w-px bg-gray-200" />
                <div>
                  <p className="text-2xl font-bold text-violet-600">{provider?.trust_score?.toFixed(2) || "5.00"}</p>
                  <p className="text-sm text-gray-500">Trust Score</p>
                </div>
                <div className="w-px bg-gray-200" />
                <div>
                  <p className="text-2xl font-bold text-violet-600">
                    ₲ {((provider?.total_earnings || 0) / 1000000).toFixed(1)}M
                  </p>
                  <p className="text-sm text-gray-500">Ganancias</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Solicitudes Pendientes</p>
                  <p className="text-3xl font-bold text-amber-600">{pendingRequests.length}</p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Eventos Activos</p>
                  <p className="text-3xl font-bold text-blue-600">{activeEvents.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Servicios Completados</p>
                  <p className="text-3xl font-bold text-green-600">{completedServices.length}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="requests">
              Solicitudes
              {pendingRequests.length > 0 && (
                <span className="ml-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {pendingRequests.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="active">Mis Eventos</TabsTrigger>
            <TabsTrigger value="services">Mis Servicios</TabsTrigger>
            <TabsTrigger value="earnings">Ganancias</TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="space-y-4">
            {pendingRequests.length === 0 ? (
              <Card className="p-8 text-center">
                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay solicitudes pendientes</h3>
                <p className="text-gray-500">
                  Cuando un organizador te solicite, aparecerá aquí
                </p>
              </Card>
            ) : (
              pendingRequests.map((service) => {
                const event = events.find(e => e.id === service.event_id);
                return (
                  <Card key={service.id} className="border-amber-200">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            {getServiceStatusBadge(service.status)}
                            <span className="text-sm text-gray-500">
                              Solicitud #{service.id.slice(-6)}
                            </span>
                          </div>
                          <h3 className="font-semibold text-lg">{event?.title}</h3>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mt-2">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {event && new Date(event.event_date).toLocaleDateString('es-PY')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {event?.start_time}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {event?.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              ₲ {service.agreed_price.toLocaleString()}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            onClick={() => handleReject(service.id)}
                          >
                            Rechazar
                          </Button>
                          <Button 
                            className="bg-gradient-to-r from-violet-600 to-rose-500 hover:from-violet-700 hover:to-rose-600"
                            onClick={() => handleAccept(service.id)}
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Aceptar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            {activeEvents.length === 0 ? (
              <Card className="p-8 text-center">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes eventos activos</h3>
                <p className="text-gray-500">
                  Acepta solicitudes para ver tus eventos aquí
                </p>
              </Card>
            ) : (
              activeEvents.map((service) => {
                const event = events.find(e => e.id === service.event_id);
                return (
                  <Card key={service.id}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            {getServiceStatusBadge(service.status)}
                          </div>
                          <h3 className="font-semibold text-lg">{event?.title}</h3>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mt-2">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {event && new Date(event.event_date).toLocaleDateString('es-PY')}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {event?.location}
                            </span>
                          </div>
                        </div>
                        
                        {service.status === 'ACCEPTED' && service.qr_token && (
                          <Link href={`/provider/qr/${service.id}`}>
                            <Button className="bg-gradient-to-r from-violet-600 to-rose-500">
                              <QrCode className="w-4 h-4 mr-2" />
                              Ver QR
                            </Button>
                          </Link>
                        )}
                        
                        {service.status === 'FULFILLED' && (
                          <Badge className="bg-green-100 text-green-700">
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Validado
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="services">
            <Card className="p-8 text-center">
              <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Mis Servicios</h3>
              <p className="text-gray-500 mb-4">
                Gestiona los servicios que ofreces a los organizadores
              </p>
              <Link href="/provider/services">
                <Button className="bg-gradient-to-r from-violet-600 to-rose-500">
                  Gestionar Servicios
                </Button>
              </Link>
            </Card>
          </TabsContent>

          <TabsContent value="earnings">
            <Card className="p-8">
              <div className="text-center mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Resumen de Ganancias</h3>
                <p className="text-4xl font-bold text-violet-600">
                  ₲ {(provider?.total_earnings || 0).toLocaleString()}
                </p>
                <p className="text-gray-500">Ganancias totales acumuladas</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold">{completedServices.length}</p>
                  <p className="text-sm text-gray-500">Servicios completados</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold">
                    ₲ {completedServices.reduce((sum, s) => sum + (s.agreed_price || 0), 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">Ingresos este mes</p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}


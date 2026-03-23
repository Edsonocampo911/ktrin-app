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
  Plus, 
  Users, 
  TrendingUp, 
  Star,
  Clock,
  MapPin,
  ChevronRight,
  QrCode,
  CheckCircle2,
  LogOut,
  Bell,
  Loader2
} from "lucide-react";
import toast from "react-hot-toast";
import type { Event, EventStatus, EventService } from "@/types/database";

interface DashboardStats {
  totalEvents: number;
  activeEvents: number;
  completedEvents: number;
  upcomingEvents: number;
}

export default function OrganizerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [organizer, setOrganizer] = useState<any>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [eventServices, setEventServices] = useState<EventService[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalEvents: 0,
    activeEvents: 0,
    completedEvents: 0,
    upcomingEvents: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("events");

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
        .single() as any;
      
      if (profileData) {
        setProfile(profileData);

        // Get organizer data
        const { data: organizerData } = await supabase
          .from("organizers")
          .select("*")
          .eq("profile_id", profileData.id)
          .single() as any;
        
        setOrganizer(organizerData);

        // Get events
        const { data: eventsData } = await supabase
          .from("events")
          .select("*")
          .eq("organizer_id", organizerData?.id)
          .order("event_date", { ascending: false }) as any;
        
        setEvents(eventsData || []);

        // Calculate stats
        const total = eventsData?.length || 0;
        const active = eventsData?.filter((e: any) => 
          ['OPEN', 'CONFIRMED', 'IN_PROGRESS'].includes(e.status)
        ).length || 0;
        const completed = eventsData?.filter((e: any) => 
          ['COMPLETED', 'FULLY_VALIDATED', 'PARTIALLY_VALIDATED'].includes(e.status)
        ).length || 0;
        const upcoming = eventsData?.filter((e: any) => 
          new Date(e.event_date) > new Date() && e.status !== 'CANCELLED'
        ).length || 0;

        setStats({
          totalEvents: total,
          activeEvents: active,
          completedEvents: completed,
          upcomingEvents: upcoming,
        });

        // Get event services for all events
        if (eventsData && eventsData.length > 0) {
          const eventIds = eventsData.map((e: any) => e.id);
          const { data: servicesData } = await supabase
            .from("event_services")
            .select("*")
            .in("event_id", eventIds) as any;
          
          setEventServices(servicesData || []);
        }
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Error al cargar los datos");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Sesión cerrada");
    router.push("/login");
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

  const getEventProgress = (eventId: string) => {
    const services = eventServices.filter(es => es.event_id === eventId);
    if (services.length === 0) return 0;
    const validated = services.filter(es => es.status === 'FULFILLED').length;
    return Math.round((validated / services.length) * 100);
  };

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
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">KTRIN</h1>
                <p className="text-xs text-gray-500">Panel de Organizador</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-500 hover:text-gray-700">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{profile?.full_name}</p>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span className="text-xs text-gray-500">{organizer?.trust_score?.toFixed(2) || "5.00"}</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
                  <span className="text-violet-600 font-medium">
                    {profile?.full_name?.charAt(0).toUpperCase()}
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Eventos</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalEvents}</p>
                </div>
                <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-violet-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Activos</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.activeEvents}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Completados</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.completedEvents}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Próximos</p>
                  <p className="text-3xl font-bold text-amber-600">{stats.upcomingEvents}</p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Mis Eventos</h2>
            <p className="text-gray-500">Gestiona tus eventos y proveedores</p>
          </div>
          
          <Link href="/events/new">
            <Button className="bg-gradient-to-r from-violet-600 to-rose-500 hover:from-violet-700 hover:to-rose-600">
              <Plus className="w-4 h-4 mr-2" />
              Crear Evento
            </Button>
          </Link>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="events">Todos los Eventos</TabsTrigger>
            <TabsTrigger value="upcoming">Próximos</TabsTrigger>
            <TabsTrigger value="active">En Curso</TabsTrigger>
            <TabsTrigger value="completed">Completados</TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="space-y-4">
            {events.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes eventos</h3>
                <p className="text-gray-500 mb-4">Crea tu primer evento para comenzar</p>
                <Link href="/events/new">
                  <Button className="bg-gradient-to-r from-violet-600 to-rose-500">
                    <Plus className="w-4 h-4 mr-2" />
                    Crear Evento
                  </Button>
                </Link>
              </Card>
            ) : (
              events.map((event) => (
                <Link key={event.id} href={`/events/${event.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer mb-4">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                            {getStatusBadge(event.status)}
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(event.event_date).toLocaleDateString('es-PY', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {event.start_time} - {event.end_time}
                            </span>
                            {event.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {event.location}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {event.expected_guests} invitados
                            </span>
                          </div>

                          {/* Progress */}
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-gray-500">Progreso de validación</span>
                                <span className="font-medium">{getEventProgress(event.id)}%</span>
                              </div>
                              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-violet-600 to-rose-500 transition-all"
                                  style={{ width: `${getEventProgress(event.id)}%` }}
                                />
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500">
                                {eventServices.filter(es => es.event_id === event.id && es.status === 'FULFILLED').length} / {eventServices.filter(es => es.event_id === event.id).length}
                              </span>
                              <span className="text-sm text-gray-400">servicios validados</span>
                            </div>
                          </div>
                        </div>

                        <ChevronRight className="w-5 h-5 text-gray-400 ml-4" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </TabsContent>

          <TabsContent value="upcoming">
            {events
              .filter(e => new Date(e.event_date) > new Date() && e.status !== 'CANCELLED')
              .map((event) => (
                <Card key={event.id} className="mb-4">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{event.title}</h3>
                        <p className="text-gray-500">
                          {new Date(event.event_date).toLocaleDateString('es-PY')}
                        </p>
                      </div>
                      <Link href={`/events/${event.id}`}>
                        <Button variant="outline">Ver detalles</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>

          <TabsContent value="active">
            {events
              .filter(e => ['IN_PROGRESS', 'CONFIRMED'].includes(e.status))
              .map((event) => (
                <Card key={event.id} className="mb-4 border-amber-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold">{event.title}</h3>
                          <Badge className="bg-amber-100 text-amber-700">En curso</Badge>
                        </div>
                        <p className="text-gray-500">{event.location}</p>
                      </div>
                      <Link href={`/events/${event.id}/qr-scan`}>
                        <Button className="bg-gradient-to-r from-violet-600 to-rose-500">
                          <QrCode className="w-4 h-4 mr-2" />
                          Escanear QR
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>

          <TabsContent value="completed">
            {events
              .filter(e => ['COMPLETED', 'FULLY_VALIDATED', 'PARTIALLY_VALIDATED'].includes(e.status))
              .map((event) => (
                <Card key={event.id} className="mb-4">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{event.title}</h3>
                        <p className="text-gray-500">
                          Completado el {new Date(event.event_date).toLocaleDateString('es-PY')}
                        </p>
                      </div>
                      <Link href={`/events/${event.id}`}>
                        <Button variant="outline">Ver resumen</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}


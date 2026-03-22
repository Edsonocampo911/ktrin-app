"use client";

import { use, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  MapPin, 
  Clock, 
  User, 
  CheckCircle2,
  Music,
  Camera,
  Utensils,
  Sparkles,
  PartyPopper
} from "lucide-react";
import toast from "react-hot-toast";

interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  start_time: string;
  end_time: string;
  location: string;
  status: string;
  cover_image_url: string | null;
  organizer: {
    full_name: string;
    avatar_url: string | null;
  };
}

interface EventService {
  id: string;
  status: string;
  service: {
    name: string;
    category: string;
    provider: {
      full_name: string;
      avatar_url: string | null;
      trust_score: number;
    };
  };
}

interface Guest {
  id: string;
  status: string;
  profile: {
    full_name: string;
    avatar_url: string | null;
  };
}

interface GuestEventPageProps {
  params: Promise<{ id: string }>;
}

export default function GuestEventPage({ params }: GuestEventPageProps) {
  const { id } = use(params);
  const [event, setEvent] = useState<Event | null>(null);
  const [services, setServices] = useState<EventService[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAttending, setIsAttending] = useState(false);

  useEffect(() => {
    fetchEventData();
  }, [id]);

  const fetchEventData = async () => {
    try {
      // Fetch event
      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .select(`
          *,
          organizer:profiles(full_name, avatar_url)
        `)
        .eq("id", id)
        .single();

      if (eventError) throw eventError;
      setEvent(eventData);

      // Fetch services
      const { data: servicesData, error: servicesError } = await supabase
        .from("service_requests")
        .select(`
          id,
          status,
          service:services(
            name,
            category,
            provider:profiles(full_name, avatar_url, trust_score)
          )
        `)
        .eq("event_id", id)
        .in("status", ["ACCEPTED", "CONFIRMED", "COMPLETED"]);

      if (servicesError) throw servicesError;
      setServices(servicesData || []);

      // Fetch guests
      const { data: guestsData, error: guestsError } = await supabase
        .from("event_guests")
        .select(`
          id,
          status,
          profile:profiles(full_name, avatar_url)
        `)
        .eq("event_id", id)
        .eq("status", "CONFIRMED");

      if (guestsError) throw guestsError;
      setGuests(guestsData || []);

      // Check if current user is attending
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: guestData } = await supabase
          .from("event_guests")
          .select("status")
          .eq("event_id", id)
          .eq("guest_id", user.id)
          .single();
        
        setIsAttending(guestData?.status === "CONFIRMED");
      }
    } catch (error) {
      console.error("Error fetching event:", error);
      toast.error("Error al cargar el evento");
    } finally {
      setLoading(false);
    }
  };

  const handleRSVP = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Debes iniciar sesión para confirmar asistencia");
        return;
      }

      const { error } = await supabase
        .from("event_guests")
        .upsert({
          event_id: id,
          guest_id: user.id,
          status: "CONFIRMED",
        }, {
          onConflict: "event_id,guest_id"
        });

      if (error) throw error;
      
      setIsAttending(true);
      toast.success("¡Asistencia confirmada!");
      fetchEventData();
    } catch (error) {
      console.error("Error confirming attendance:", error);
      toast.error("Error al confirmar asistencia");
    }
  };

  const getServiceIcon = (category: string) => {
    const icons: Record<string, React.ReactNode> = {
      música: <Music className="w-5 h-5" />,
      fotografía: <Camera className="w-5 h-5" />,
      catering: <Utensils className="w-5 h-5" />,
      decoración: <Sparkles className="w-5 h-5" />,
      entretenimiento: <PartyPopper className="w-5 h-5" />,
    };
    return icons[category.toLowerCase()] || <Sparkles className="w-5 h-5" />;
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      DRAFT: "bg-gray-100 text-gray-800",
      PUBLISHED: "bg-green-100 text-green-800",
      IN_PROGRESS: "bg-blue-100 text-blue-800",
      COMPLETED: "bg-violet-100 text-violet-800",
      CANCELLED: "bg-red-100 text-red-800",
    };
    const labels: Record<string, string> = {
      DRAFT: "Borrador",
      PUBLISHED: "Publicado",
      IN_PROGRESS: "En curso",
      COMPLETED: "Completado",
      CANCELLED: "Cancelado",
    };
    return (
      <Badge className={styles[status] || "bg-gray-100"}>
        {labels[status] || status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Evento no encontrado</h1>
          <p className="text-gray-600">El evento que buscas no existe o no está disponible</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Image */}
      <div 
        className="h-64 md:h-80 bg-gradient-to-br from-violet-600 via-purple-600 to-rose-500 relative"
        style={event.cover_image_url ? {
          backgroundImage: `url(${event.cover_image_url})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        } : {}}
      >
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
          <div className="max-w-4xl mx-auto">
            {getStatusBadge(event.status)}
            <h1 className="text-3xl md:text-4xl font-bold text-white mt-2 mb-2">
              {event.title}
            </h1>
            <p className="text-white/80 flex items-center gap-2">
              <User className="w-4 h-4" />
              Organizado por {event.organizer?.full_name}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Details Card */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-4">Detalles del Evento</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-violet-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Fecha</p>
                      <p className="font-medium">
                        {new Date(event.event_date).toLocaleDateString("es-PY", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-violet-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Horario</p>
                      <p className="font-medium">
                        {event.start_time?.slice(0, 5)} - {event.end_time?.slice(0, 5)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-violet-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Ubicación</p>
                      <p className="font-medium">{event.location}</p>
                    </div>
                  </div>
                </div>

                {event.description && (
                  <div className="mt-6 pt-6 border-t">
                    <p className="text-gray-700">{event.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Services */}
            {services.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Servicios Contratados</h2>
                  <div className="space-y-4">
                    {services.map((service) => (
                      <div 
                        key={service.id} 
                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="w-12 h-12 bg-violet-100 rounded-full flex items-center justify-center">
                          {getServiceIcon(service.service.category)}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{service.service.name}</p>
                          <p className="text-sm text-gray-500">
                            por {service.service.provider.full_name}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-amber-500">
                          <span className="text-sm font-medium">
                            {service.service.provider.trust_score.toFixed(1)}
                          </span>
                          <span className="text-xs">★</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* RSVP Card */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">¿Vas a asistir?</h3>
                
                {isAttending ? (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>
                    <p className="text-green-700 font-medium">¡Asistencia confirmada!</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Te esperamos en el evento
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="text-gray-600 text-sm mb-4">
                      Confirma tu asistencia para que el organizador pueda planificar mejor
                    </p>
                    <Button 
                      onClick={handleRSVP}
                      className="w-full bg-gradient-to-r from-violet-600 to-rose-500"
                    >
                      Confirmar Asistencia
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Attendees */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">
                  Asistentes ({guests.length})
                </h3>
                
                {guests.length === 0 ? (
                  <p className="text-gray-500 text-sm">
                    Aún no hay confirmados. ¡Sé el primero!
                  </p>
                ) : (
                  <div className="flex -space-x-2 overflow-hidden">
                    {guests.slice(0, 8).map((guest) => (
                      <div
                        key={guest.id}
                        className="inline-block w-10 h-10 rounded-full bg-violet-100 border-2 border-white flex items-center justify-center"
                        title={guest.profile.full_name}
                      >
                        {guest.profile.avatar_url ? (
                          <img
                            src={guest.profile.avatar_url}
                            alt={guest.profile.full_name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-medium text-violet-700">
                            {guest.profile.full_name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                    ))}
                    {guests.length > 8 && (
                      <div className="inline-block w-10 h-10 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
                        <span className="text-sm text-gray-600">+{guests.length - 8}</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

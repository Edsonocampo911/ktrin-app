"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Users,
  Loader2
} from "lucide-react";
import toast from "react-hot-toast";

const steps = [
  { number: 1, label: "Datos Básicos", description: "Información del evento" },
  { number: 2, label: "Sesiones", description: "Sub-eventos opcionales" },
  { number: 3, label: "Proveedores", description: "Contrata servicios" },
  { number: 4, label: "Publicar", description: "Revisa y confirma" },
];

export default function CreateEventPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    event_date: "",
    start_time: "",
    end_time: "",
    location: "",
    expected_guests: 50,
  });

  const [sessions, setSessions] = useState<Array<{ name: string; start_time: string; end_time: string }>>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEventData({ ...eventData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      router.push("/organizer/dashboard");
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Debes iniciar sesión");
        return;
      }

      // Get organizer ID
      const { data: profileData } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      const { data: organizerData } = await supabase
        .from("organizers")
        .select("id")
        .eq("profile_id", profileData.id)
        .single();

      // Create event
      const { data: event, error: eventError } = await supabase
        .from("events")
        .insert({
          organizer_id: organizerData.id,
          title: eventData.title,
          description: eventData.description,
          event_date: eventData.event_date,
          start_time: eventData.start_time,
          end_time: eventData.end_time,
          location: eventData.location,
          expected_guests: eventData.expected_guests,
          status: 'CONFIRMED',
        })
        .select()
        .single();

      if (eventError) throw eventError;

      // Create sessions if any
      if (sessions.length > 0) {
        const sessionsData = sessions.map(s => ({
          event_id: event.id,
          name: s.name,
          start_time: s.start_time,
          end_time: s.end_time,
        }));

        await supabase.from("event_sessions").insert(sessionsData);
      }

      toast.success("Evento creado exitosamente");
      router.push("/organizer/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Error al crear el evento");
    } finally {
      setIsLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return eventData.title && eventData.event_date && eventData.start_time && eventData.end_time;
      case 2:
        return true;
      case 3:
        return true;
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {currentStep === 1 ? 'Cancelar' : 'Atrás'}
            </Button>
            
            <div className="flex-1 mx-8">
              <div className="flex items-center justify-between mb-2">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex items-center">
                    <div 
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        currentStep >= step.number 
                          ? 'bg-violet-600 text-white' 
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {currentStep > step.number ? <CheckCircle2 className="w-4 h-4" /> : step.number}
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-16 sm:w-24 h-1 mx-2 ${
                        currentStep > step.number ? 'bg-violet-600' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="w-20" />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold">{steps[currentStep - 1].label}</h2>
            <p className="text-gray-500">{steps[currentStep - 1].description}</p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Paso 1: Datos Básicos */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Nombre del evento *</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Ej: Cumpleaños de 15 - María"
                    value={eventData.title}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe tu evento..."
                    value={eventData.description}
                    onChange={handleInputChange}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="event_date">Fecha *</Label>
                    <Input
                      id="event_date"
                      name="event_date"
                      type="date"
                      value={eventData.event_date}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="start_time">Hora inicio *</Label>
                    <Input
                      id="start_time"
                      name="start_time"
                      type="time"
                      value={eventData.start_time}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="end_time">Hora fin *</Label>
                    <Input
                      id="end_time"
                      name="end_time"
                      type="time"
                      value={eventData.end_time}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Ubicación</Label>
                  <Input
                    id="location"
                    name="location"
                    placeholder="Dirección o nombre del lugar"
                    value={eventData.location}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="guests">Cantidad estimada de invitados</Label>
                  <Input
                    id="guests"
                    name="expected_guests"
                    type="number"
                    min={1}
                    value={eventData.expected_guests}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            )}

            {/* Paso 2: Sesiones */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <p className="text-gray-600">
                  Agrega sesiones o sub-eventos opcionales (ceremonia, recepción, etc.)
                </p>
                
                {sessions.map((session, index) => (
                  <Card key={index} className="p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Input
                        placeholder="Nombre de la sesión"
                        value={session.name}
                        onChange={(e) => {
                          const newSessions = [...sessions];
                          newSessions[index].name = e.target.value;
                          setSessions(newSessions);
                        }}
                      />
                      <Input
                        type="time"
                        placeholder="Inicio"
                        value={session.start_time}
                        onChange={(e) => {
                          const newSessions = [...sessions];
                          newSessions[index].start_time = e.target.value;
                          setSessions(newSessions);
                        }}
                      />
                      <Input
                        type="time"
                        placeholder="Fin"
                        value={session.end_time}
                        onChange={(e) => {
                          const newSessions = [...sessions];
                          newSessions[index].end_time = e.target.value;
                          setSessions(newSessions);
                        }}
                      />
                    </div>
                  </Card>
                ))}
                
                <Button
                  variant="outline"
                  onClick={() => setSessions([...sessions, { name: '', start_time: '', end_time: '' }])}
                >
                  + Agregar sesión
                </Button>
              </div>
            )}

            {/* Paso 3: Proveedores */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <p className="text-gray-600">
                  En la próxima versión podrás buscar y contratar proveedores directamente desde aquí.
                </p>
                <p className="text-gray-500 text-sm">
                  Por ahora, puedes agregar proveedores después de crear el evento desde el detalle del evento.
                </p>
              </div>
            )}

            {/* Paso 4: Revisar y Publicar */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-violet-600" />
                  </div>
                  <h3 className="text-xl font-semibold">¡Todo listo!</h3>
                  <p className="text-gray-500">Revisa los detalles de tu evento</p>
                </div>

                <Card className="p-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Nombre del evento</p>
                      <p className="font-medium text-lg">{eventData.title}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Fecha</p>
                        <p className="font-medium">
                          {eventData.event_date && new Date(eventData.event_date).toLocaleDateString('es-PY')}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Horario</p>
                        <p className="font-medium">{eventData.start_time} - {eventData.end_time}</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Ubicación</p>
                      <p className="font-medium">{eventData.location || 'No especificada'}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-500">Invitados esperados</p>
                      <p className="font-medium">{eventData.expected_guests} personas</p>
                    </div>
                  </div>
                </Card>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm text-amber-800">
                    <strong>Nota:</strong> Al publicar, tu evento quedará en estado "Confirmado" 
                    y podrás comenzar a contratar proveedores.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t">
              <Button variant="outline" onClick={handleBack}>
                {currentStep === 1 ? 'Cancelar' : 'Atrás'}
              </Button>
              
              <Button
                onClick={handleNext}
                disabled={!canProceed() || isLoading}
                className="bg-gradient-to-r from-violet-600 to-rose-500 hover:from-violet-700 hover:to-rose-600"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creando...
                  </span>
                ) : currentStep === 4 ? (
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Crear Evento
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Siguiente
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}


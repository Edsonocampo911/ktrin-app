"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  MapPin, 
  Clock, 
  User,
  CheckCircle2,
  XCircle,
  AlertTriangle
} from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

interface InviteData {
  id: string;
  event_id: string;
  email: string;
  status: string;
  event: {
    title: string;
    event_date: string;
    start_time: string;
    end_time: string;
    location: string;
    description: string | null;
    organizer: {
      full_name: string;
    };
  };
}

interface InvitePageProps {
  params: Promise<{ token: string }>;
}

export default function InvitePage({ params }: InvitePageProps) {
  const { token } = use(params);
  const router = useRouter();
  const [invite, setInvite] = useState<InviteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchInvite();
  }, [token]);

  const fetchInvite = async () => {
    try {
      const { data, error } = await supabase
        .from("event_invites")
        .select(`
          *,
          event:events(
            title,
            event_date,
            start_time,
            end_time,
            location,
            description,
            organizer:profiles(full_name)
          )
        `)
        .eq("invite_token", token)
        .single();

      if (error) throw error;
      setInvite(data);
    } catch (error) {
      console.error("Error fetching invite:", error);
      toast.error("Invitación no válida o expirada");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    setProcessing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Redirect to login with redirect back
        router.push(`/login?redirect=/invite/${token}`);
        return;
      }

      // Accept invite
      const { error: inviteError } = await supabase
        .from("event_invites")
        .update({ status: "ACCEPTED" })
        .eq("id", invite?.id);

      if (inviteError) throw inviteError;

      // Add as guest
      const { error: guestError } = await supabase
        .from("event_guests")
        .upsert({
          event_id: invite?.event_id,
          guest_id: user.id,
          status: "CONFIRMED",
        }, {
          onConflict: "event_id,guest_id"
        });

      if (guestError) throw guestError;

      toast.success("¡Invitación aceptada!");
      router.push(`/event/${invite?.event_id}`);
    } catch (error) {
      console.error("Error accepting invite:", error);
      toast.error("Error al aceptar la invitación");
    } finally {
      setProcessing(false);
    }
  };

  const handleDecline = async () => {
    setProcessing(true);
    try {
      const { error } = await supabase
        .from("event_invites")
        .update({ status: "DECLINED" })
        .eq("id", invite?.id);

      if (error) throw error;

      toast.success("Invitación rechazada");
      router.push("/");
    } catch (error) {
      console.error("Error declining invite:", error);
      toast.error("Error al rechazar la invitación");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600" />
      </div>
    );
  }

  if (!invite) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Invitación no válida
            </h1>
            <p className="text-gray-600 mb-6">
              Esta invitación no existe o ha expirado. Contacta al organizador del evento.
            </p>
            <Link href="/">
              <Button className="w-full bg-gradient-to-r from-violet-600 to-rose-500">
                Volver al inicio
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (invite.status === "ACCEPTED") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              ¡Ya aceptaste!
            </h1>
            <p className="text-gray-600 mb-6">
              Ya habías aceptado esta invitación anteriormente.
            </p>
            <Link href={`/event/${invite.event_id}`}>
              <Button className="w-full bg-gradient-to-r from-violet-600 to-rose-500">
                Ver evento
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (invite.status === "DECLINED") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-10 h-10 text-gray-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Invitación rechazada
            </h1>
            <p className="text-gray-600 mb-6">
              Has rechazado esta invitación.
            </p>
            <Link href="/">
              <Button className="w-full bg-gradient-to-r from-violet-600 to-rose-500">
                Volver al inicio
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-rose-50 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardContent className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <p className="text-gray-600 mb-1">Has sido invitado a</p>
            <h1 className="text-2xl font-bold text-gray-900">
              {invite.event.title}
            </h1>
          </div>

          {/* Event Details */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-violet-600" />
                <div>
                  <p className="text-sm text-gray-500">Fecha</p>
                  <p className="font-medium">
                    {new Date(invite.event.event_date).toLocaleDateString("es-PY", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-violet-600" />
                <div>
                  <p className="text-sm text-gray-500">Horario</p>
                  <p className="font-medium">
                    {invite.event.start_time?.slice(0, 5)} - {invite.event.end_time?.slice(0, 5)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-violet-600" />
                <div>
                  <p className="text-sm text-gray-500">Ubicación</p>
                  <p className="font-medium">{invite.event.location}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-violet-600" />
                <div>
                  <p className="text-sm text-gray-500">Organizador</p>
                  <p className="font-medium">{invite.event.organizer.full_name}</p>
                </div>
              </div>
            </div>

            {invite.event.description && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-gray-700">{invite.event.description}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={handleAccept}
              disabled={processing}
              className="w-full bg-gradient-to-r from-violet-600 to-rose-500"
            >
              {processing ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Procesando...
                </span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Aceptar Invitación
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={handleDecline}
              disabled={processing}
              className="w-full"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Rechazar
            </Button>
          </div>

          {/* Note */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Al aceptar, serás agregado a la lista de invitados del evento
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

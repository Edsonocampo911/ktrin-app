"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Clock,
  CheckCircle2,
  AlertTriangle,
  Download,
  Share2,
  Calendar,
  MapPin
} from "lucide-react";
import toast from "react-hot-toast";

interface QRDisplayProps {
  serviceId?: string;
  onClose?: () => void;
}

export default function QRDisplay({ serviceId, onClose }: QRDisplayProps) {
  const router = useRouter();
  const [qrImage, setQrImage] = useState<string>("");
  const [service, setService] = useState<any>(null);
  const [event, setEvent] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (service?.qr_expires_at) {
      const updateTimeLeft = () => {
        const now = new Date();
        const expires = new Date(service.qr_expires_at);
        const diff = expires.getTime() - now.getTime();
        
        if (diff <= 0) {
          setTimeLeft("Expirado");
          return;
        }
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        if (days > 0) {
          setTimeLeft(`${days}d ${hours}h restantes`);
        } else {
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          setTimeLeft(`${hours}h ${minutes}m restantes`);
        }
      };
      
      updateTimeLeft();
      const interval = setInterval(updateTimeLeft, 60000);
      
      return () => clearInterval(interval);
    }
  }, [service]);

  const loadData = async () => {
    try {
      setIsLoading(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      // Get event service
      const { data: serviceData } = await supabase
        .from("event_services")
        .select("*, events(*)")
        .eq("id", serviceId)
        .single();

      if (serviceData) {
        setService(serviceData);
        setEvent(serviceData.events);

        // Generate QR code
        if (serviceData.qr_token) {
          const qrDataUrl = await QRCode.toDataURL(serviceData.qr_token, {
            width: 400,
            margin: 2,
            color: {
              dark: "#10B981", // Green for provider QR
              light: "#FFFFFF",
            },
          });
          setQrImage(qrDataUrl);
        }
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Error al cargar el QR");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (qrImage) {
      const link = document.createElement("a");
      link.href = qrImage;
      link.download = `qr-ktrin-${serviceId}.png`;
      link.click();
      toast.success("QR descargado");
    }
  };

  const handleShare = async () => {
    if (navigator.share && qrImage) {
      try {
        const response = await fetch(qrImage);
        const blob = await response.blob();
        const file = new File([blob], "qr-ktrin.png", { type: "image/png" });
        
        await navigator.share({
          title: "Mi QR de Validación KTRIN",
          text: `QR para el evento: ${event?.title}`,
          files: [file],
        });
      } catch (error) {
        toast.info("Compartir cancelado");
      }
    } else {
      toast.info("Compartir no disponible en este navegador");
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button variant="ghost" onClick={handleClose}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <h1 className="font-semibold">QR de Validación</h1>
            <div className="w-20" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-md mx-auto">
          {/* Event Info */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <h2 className="font-semibold text-lg mb-2">{event?.title}</h2>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {event && new Date(event.event_date).toLocaleDateString('es-PY')}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {event?.location}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* QR Card */}
          <Card className="border-emerald-500 border-2">
            <CardContent className="p-8 text-center">
              {/* Status Badge */}
              <div className="mb-4">
                {service?.qr_used ? (
                  <Badge className="bg-green-100 text-green-700 text-sm px-3 py-1">
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    QR Validado
                  </Badge>
                ) : (
                  <Badge className="bg-emerald-100 text-emerald-700 text-sm px-3 py-1">
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    QR Activo
                  </Badge>
                )}
              </div>

              {/* QR Code */}
              <div className="relative inline-block mb-6">
                <div className="bg-white p-4 rounded-xl shadow-lg border-4 border-emerald-500">
                  {qrImage && (
                    <img 
                      src={qrImage}
                      alt="QR de Validación"
                      className="w-64 h-64"
                    />
                  )}
                </div>
                
                {/* Logo overlay */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-md">
                  <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              {/* Token */}
              <p className="text-xs text-gray-400 mb-4 font-mono">
                {service?.qr_token}
              </p>

              {/* Timer */}
              {!service?.qr_used && (
                <div className="flex items-center justify-center gap-2 text-amber-600 mb-4">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">{timeLeft}</span>
                </div>
              )}

              {/* Instructions */}
              <div className="bg-emerald-50 p-4 rounded-lg mb-4">
                <p className="text-emerald-800 text-sm">
                  <strong>Instrucciones:</strong>
                </p>
                <ol className="text-emerald-700 text-sm text-left mt-2 space-y-1">
                  <li>1. Presenta este QR al organizador del evento</li>
                  <li>2. El organizador escaneará el código</li>
                  <li>3. Una vez validado, el servicio queda confirmado</li>
                </ol>
              </div>

              {/* Warning */}
              <div className="flex items-start gap-2 text-amber-600 text-sm">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p>
                  Este QR es de un solo uso. Una vez escaneado, no podrá ser utilizado nuevamente.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          {!service?.qr_used && (
            <div className="flex gap-3 mt-6">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={handleDownload}
              >
                <Download className="w-4 h-4 mr-2" />
                Guardar
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Compartir
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}


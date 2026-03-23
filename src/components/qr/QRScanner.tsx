"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Html5Qrcode } from "html5-qrcode";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Camera, 
  Flashlight,
  CheckCircle2,
  XCircle,
  RefreshCw
} from "lucide-react";
import toast from "react-hot-toast";

interface QRScannerProps {
  eventId?: string;
  onClose?: () => void;
}

export default function QRScanner({ eventId, onClose }: QRScannerProps) {
  const router = useRouter();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [scanning, setScanning] = useState(true);
  const [result, setResult] = useState<{
    success: boolean;
    error?: string;
    delay_minutes?: number;
    serviceName?: string;
  } | null>(null);
  const [flashlight, setFlashlight] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize scanner
    const scanner = new Html5Qrcode("qr-reader");
    scannerRef.current = scanner;

    const startScanning = async () => {
      try {
        // Request camera permissions
        await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            handleScan(decodedText);
          },
          () => {
            // QR not found - ignore
          }
        );
      } catch (error: any) {
        console.error("Error starting scanner:", error);
        let errorMessage = "Error al iniciar la cámara";
        
        if (error.name === "NotAllowedError") {
          errorMessage = "Debes permitir el acceso a la cámara";
        } else if (error.name === "NotFoundError") {
          errorMessage = "No se encontró cámara en este dispositivo";
        } else if (error.name === "NotReadableError") {
          errorMessage = "La cámara está siendo usada por otra aplicación";
        }
        
        setCameraError(errorMessage);
        toast.error(errorMessage);
      }
    };

    startScanning();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const handleScan = async (qrToken: string) => {
    if (!scanning) return;
    
    setScanning(false);
    
    // Stop scanner
    if (scannerRef.current) {
      await scannerRef.current.stop().catch(console.error);
    }

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Debes iniciar sesión");
        return;
      }

      // Call validate_qr_secure function
      const { data, error } = await supabase.rpc('validate_qr_secure', {
        p_qr_token: qrToken,
        p_validator_id: user.id,
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; delay_minutes?: number };
      
      setResult({
        ...result,
        serviceName: `Servicio`,
      });

      if (result.success) {
        toast.success("¡Servicio validado exitosamente!");
      }
    } catch (error: any) {
      console.error("Error validating QR:", error);
      setResult({
        success: false,
        error: error.message || "Error al validar el QR",
      });
    }
  };

  const handleRetry = () => {
    setResult(null);
    setScanning(true);
    
    // Restart scanner
    if (scannerRef.current) {
      scannerRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          handleScan(decodedText);
        },
        () => {}
      ).catch(console.error);
    }
  };

  const handleClose = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().catch(console.error);
    }
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10 p-4">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={handleClose}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver
          </Button>
          
          <h1 className="text-white font-medium">Escanear QR</h1>
          
          <Button 
            variant="ghost" 
            onClick={() => setFlashlight(!flashlight)}
            className="text-white hover:bg-white/20"
          >
            <Flashlight className={`w-5 h-5 ${flashlight ? 'text-yellow-400' : ''}`} />
          </Button>
        </div>
      </header>

      {/* Scanner Area */}
      <div className="flex-1 flex items-center justify-center relative">
        {scanning && !result && (
          <div className="relative w-full max-w-md aspect-square">
            <div id="qr-reader" className="w-full h-full" />
            
            {/* Corner markers */}
            <div className="absolute top-8 left-8 w-16 h-16 border-l-4 border-t-4 border-violet-500 rounded-tl-lg pointer-events-none" />
            <div className="absolute top-8 right-8 w-16 h-16 border-r-4 border-t-4 border-violet-500 rounded-tr-lg pointer-events-none" />
            <div className="absolute bottom-8 left-8 w-16 h-16 border-l-4 border-b-4 border-violet-500 rounded-bl-lg pointer-events-none" />
            <div className="absolute bottom-8 right-8 w-16 h-16 border-r-4 border-b-4 border-violet-500 rounded-br-lg pointer-events-none" />
            
            {/* Scanning line */}
            <div 
              className="absolute left-0 right-0 h-1 bg-violet-500/50 animate-pulse" 
              style={{ top: '50%' }}
            />
          </div>
        )}

        {result && (
          <div className="w-full max-w-md px-4">
            <Card className={result.success ? 'border-green-500' : 'border-red-500'}>
              <CardContent className="p-8 text-center">
                {result.success ? (
                  <>
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      ¡Servicio Validado!
                    </h2>
                    <p className="text-gray-600 mb-4">
                      {result.serviceName}
                    </p>
                    {result.delay_minutes !== undefined && result.delay_minutes > 0 && (
                      <Badge variant="secondary" className="mb-4">
                        Retraso: {result.delay_minutes} minutos
                      </Badge>
                    )}
                    <div className="bg-green-50 p-4 rounded-lg mb-6">
                      <p className="text-green-800 text-sm">
                        El proveedor ha sido validado exitosamente. 
                        El servicio queda registrado como cumplido.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <XCircle className="w-10 h-10 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Validación Fallida
                    </h2>
                    <p className="text-gray-600 mb-4">
                      {result.error === 'QR_NOT_FOUND' && 'QR no encontrado'}
                      {result.error === 'QR_ALREADY_USED' && 'Este QR ya fue utilizado'}
                      {result.error === 'QR_EXPIRED' && 'El QR ha expirado'}
                      {result.error === 'SERVICE_NOT_ACCEPTED' && 'El servicio no está aceptado'}
                      {!result.error && result.error}
                    </p>
                    <div className="bg-red-50 p-4 rounded-lg mb-6">
                      <p className="text-red-800 text-sm">
                        {result.error === 'QR_NOT_FOUND' 
                          ? 'El código QR escaneado no corresponde a ningún servicio válido.'
                          : result.error === 'QR_ALREADY_USED'
                          ? 'Este código QR ya fue utilizado anteriormente. Cada QR es de un solo uso.'
                          : result.error === 'QR_EXPIRED'
                          ? 'El código QR ha expirado. Contacta al proveedor para generar uno nuevo.'
                          : 'Hubo un problema al validar el servicio. Intenta nuevamente.'
                        }
                      </p>
                    </div>
                  </>
                )}
                
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={handleRetry}
                    className="flex-1"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Escanear otro
                  </Button>
                  <Button 
                    onClick={handleClose}
                    className="flex-1 bg-gradient-to-r from-violet-600 to-rose-500"
                  >
                    Volver al evento
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Footer Instructions or Error */}
      {cameraError ? (
        <div className="p-6">
          <Card className="border-red-500 bg-red-50">
            <CardContent className="p-6 text-center">
              <XCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-900 mb-2">Error de Cámara</h3>
              <p className="text-red-800 mb-6">{cameraError}</p>
              <Button 
                onClick={() => {
                  setCameraError(null);
                  window.location.reload();
                }}
                className="w-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reintentar
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        scanning && !result && (
          <div className="p-6 text-center">
            <p className="text-white/70 text-sm">
              Escanea el QR verde del proveedor para validar que cumplió con el servicio
            </p>
          </div>
        )
      )}
    </div>
  );
}


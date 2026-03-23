"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  ArrowLeft, 
  ArrowRight, 
  User, 
  Briefcase,
  CheckCircle2,
  Loader2
} from "lucide-react";
import toast from "react-hot-toast";
import type { UserRole } from "@/types/database";

const steps = [
  { number: 1, label: "Rol", description: "Selecciona tu rol" },
  { number: 2, label: "Datos", description: "Tu información" },
  { number: 3, label: "Cuenta", description: "Crea tu cuenta" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<UserRole>("organizer");
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    business_name: "",
    password: "",
    confirmPassword: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      return;
    }

    // Validar contraseñas
    if (formData.password !== formData.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.full_name,
            role: role,
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. Crear perfil
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .insert({
            user_id: authData.user.id,
            full_name: formData.full_name,
            email: formData.email,
            phone: formData.phone || null,
            role: role,
          } as any)
          .select()
          .single() as any;

        if (profileError) throw profileError;

        // 3. Crear organizador o proveedor según el rol
        if (role === "organizer") {
          const { error: organizerError } = await supabase
            .from("organizers")
            .insert({
              profile_id: profileData.id,
              business_name: formData.business_name || null,
            } as any);
          
          if (organizerError) throw organizerError;
        } else if (role === "provider") {
          const { error: providerError } = await supabase
            .from("providers")
            .insert({
              profile_id: profileData.id,
              business_name: formData.business_name,
              base_zone: "Asunción", // Default zone
              category: "OTROS",
            } as any);
          
          if (providerError) throw providerError;
        }

        toast.success("¡Cuenta creada exitosamente! Revisa tu email para confirmar.");
        router.push("/login");
      }
    } catch (error: any) {
      toast.error(error.message || "Error al crear la cuenta");
    } finally {
      setIsLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return true;
      case 2:
        return formData.full_name && formData.email;
      case 3:
        return formData.password && formData.confirmPassword;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 via-violet-700 to-rose-500 flex items-center justify-center p-6">
      <Card className="w-full max-w-lg bg-white/95 backdrop-blur-sm shadow-2xl border-0">
        <CardHeader className="text-center pb-2">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-rose-500 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-xl font-bold text-gray-900">KTRIN</h1>
              <p className="text-xs text-gray-500">Crear cuenta</p>
            </div>
          </div>
          
          {/* Progress */}
          <div className="flex items-center justify-center gap-4 mb-4">
            {steps.map((s, index) => (
              <div key={s.number} className="flex items-center">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= s.number 
                      ? "bg-violet-600 text-white" 
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {currentStep > s.number ? <CheckCircle2 className="w-4 h-4" /> : s.number}
                </div>
                <span className={`ml-2 text-sm ${currentStep >= s.number ? "text-gray-900" : "text-gray-400"}`}>
                  {s.label}
                </span>
                {index < steps.length - 1 && (
                  <div className="w-8 h-px bg-gray-300 mx-2" />
                )}
              </div>
            ))}
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Paso 1: Selección de Rol - Solo 2 opciones */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <p className="text-center text-gray-600 mb-4">¿Cómo vas a usar KTRIN?</p>
                
                <Tabs value={role} onValueChange={(v) => setRole(v as UserRole)}>
                  <TabsList className="grid grid-cols-2 w-full">
                    <TabsTrigger value="organizer" className="flex flex-col items-center gap-2 py-4">
                      <User className="w-6 h-6" />
                      <span className="text-sm">Organizador</span>
                      <span className="text-xs text-gray-500">Creo eventos</span>
                    </TabsTrigger>
                    <TabsTrigger value="provider" className="flex flex-col items-center gap-2 py-4">
                      <Briefcase className="w-6 h-6" />
                      <span className="text-sm">Proveedor</span>
                      <span className="text-xs text-gray-500">Ofrezco servicios</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="organizer" className="mt-4">
                    <div className="bg-violet-50 p-4 rounded-lg">
                      <h4 className="font-medium text-violet-900 mb-2">Como Organizador podrás:</h4>
                      <ul className="text-sm text-violet-700 space-y-1">
                        <li>• Crear y gestionar eventos</li>
                        <li>• Contratar proveedores verificados</li>
                        <li>• Validar servicios con QR</li>
                        <li>• Gestionar invitados</li>
                        <li>• <strong>Ser invitado de otros eventos</strong></li>
                      </ul>
                    </div>
                  </TabsContent>

                  <TabsContent value="provider" className="mt-4">
                    <div className="bg-violet-50 p-4 rounded-lg">
                      <h4 className="font-medium text-violet-900 mb-2">Como Proveedor podrás:</h4>
                      <ul className="text-sm text-violet-700 space-y-1">
                        <li>• Publicar tus servicios</li>
                        <li>• Recibir solicitudes de eventos</li>
                        <li>• Construir tu reputación</li>
                        <li>• Recibir pagos seguros</li>
                      </ul>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {/* Paso 2: Datos Personales */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nombre completo *</Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    placeholder="Tu nombre completo"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="+595 981 123456"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>

                {role === "provider" && (
                  <div className="space-y-2">
                    <Label htmlFor="business_name">Nombre del negocio *</Label>
                    <Input
                      id="business_name"
                      name="business_name"
                      placeholder="Tu empresa o marca"
                      value={formData.business_name}
                      onChange={handleInputChange}
                      required={role === "provider"}
                    />
                  </div>
                )}

                {role === "organizer" && (
                  <div className="space-y-2">
                    <Label htmlFor="business_name">Nombre del negocio (opcional)</Label>
                    <Input
                      id="business_name"
                      name="business_name"
                      placeholder="Tu empresa de eventos (opcional)"
                      value={formData.business_name}
                      onChange={handleInputChange}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Paso 3: Cuenta */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña *</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Mínimo 8 caracteres"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar contraseña *</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Repite tu contraseña"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="text-sm text-gray-500">
                  Al registrarte, aceptas los{" "}
                  <a href="#" className="text-violet-600 hover:underline">Términos y Condiciones</a>
                  {" "}y la{" "}
                  <a href="#" className="text-violet-600 hover:underline">Política de Privacidad</a>
                  {" "}de KTRIN.
                </div>
              </div>
            )}

            {/* Botones de navegación */}
            <div className="flex gap-3">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Atrás
                </Button>
              )}
              
              <Button 
                type="submit" 
                className="flex-1 bg-gradient-to-r from-violet-600 to-rose-500 hover:from-violet-700 hover:to-rose-600"
                disabled={!canProceed() || isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creando cuenta...
                  </span>
                ) : currentStep === 3 ? (
                  "Crear cuenta"
                ) : (
                  <>
                    Continuar
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Footer */}
          <div className="text-center text-sm mt-6">
            <span className="text-gray-500">¿Ya tienes cuenta? </span>
            <Link 
              href="/login"
              className="text-violet-600 hover:text-violet-700 font-medium"
            >
              Inicia sesión
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
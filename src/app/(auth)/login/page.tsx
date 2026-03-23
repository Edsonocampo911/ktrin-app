"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Star, 
  Shield, 
  QrCode, 
  TrendingUp,
  CheckCircle2,
  User,
  Briefcase,
  LogIn,
  Loader2,
  Heart
} from "lucide-react";
import toast from "react-hot-toast";
import type { UserRole } from "@/types/database";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("organizer");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Get user profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("user_id", data.user.id)
          .returns<{ role: string }[]>()
          .single();

        toast.success("¡Bienvenido a KTRIN!");
        
        // Redirect based on role
        if (profile?.role === "provider") {
          router.push("/provider-dashboard");
        } else if (profile?.role === "organizer") {
          router.push("/dashboard");
        } else {
          router.push("/");
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Error al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (role: UserRole) => {
    setIsLoading(true);
    
    try {
      // Demo credentials based on role
      const demoEmails: Record<UserRole, string> = {
        organizer: "demo-organizador@ktrin.com",
        provider: "demo-proveedor@ktrin.com",
        guest: "demo@guest.com",
        admin: "demo@admin.com",
      };

      const { data, error } = await supabase.auth.signInWithPassword({
        email: demoEmails[role],
        password: "Demo123456!",
      });

      if (error) {
        toast.error("Usuario demo no configurado. Ve a la documentación para configurar usuarios demo.");
        setIsLoading(false);
        return;
      }

      toast.success(`Modo Demo: ${role === "organizer" ? "Organizador" : "Proveedor"}`);
      
      if (role === "provider") {
        router.push("/provider-dashboard");
      } else if (role === "organizer") {
        router.push("/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch (error: any) {
      toast.error(error.message);
      setIsLoading(false);
    }
  };

  const features = [
    { icon: QrCode, text: "Validación QR verificable" },
    { icon: Shield, text: "Sistema de reputación digital" },
    { icon: Star, text: "Trust Score transparente" },
    { icon: TrendingUp, text: "Métricas en tiempo real" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 via-violet-700 to-rose-500 flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 text-white">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">KTRIN</h1>
              <p className="text-white/70 text-sm">Sistema Operativo de Eventos</p>
            </div>
          </div>
          
          <h2 className="text-5xl font-bold mb-6 leading-tight">
            Profesionalizando el mercado de eventos mediante{" "}
            <span className="text-rose-300">reglas digitales claras</span>
          </h2>
          
          <p className="text-xl text-white/80 mb-8 max-w-md">
            Infraestructura operativa con trazabilidad verificable para el sector de eventos en Paraguay.
          </p>

          <div className="space-y-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-rose-300" />
                </div>
                <span className="text-white/90 text-lg">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-white/60">
          <span>Hecho en Paraguay</span>
          <Heart className="w-4 h-4 text-rose-300 fill-rose-300" />
        </div>
      </div>

      {/* Right Panel - Login */}
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-2xl border-0">
          <CardHeader className="text-center pb-2">
            <div className="lg:hidden flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-rose-500 rounded-xl flex items-center justify-center">
                <Calendar className="w-7 h-7 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-bold text-gray-900">KTRIN</h1>
                <p className="text-xs text-gray-500">Sistema Operativo</p>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Bienvenido</h2>
            <p className="text-gray-500">
              Ingresa a tu cuenta o prueba el modo demo
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Role Selector - Solo 2 pestañas */}
            <Tabs value={selectedRole} onValueChange={(v) => setSelectedRole(v as UserRole)}>
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="organizer" className="flex flex-col items-center gap-1 py-2">
                  <User className="w-4 h-4" />
                  <span className="text-xs">Organizador</span>
                </TabsTrigger>
                <TabsTrigger value="provider" className="flex flex-col items-center gap-1 py-2">
                  <Briefcase className="w-4 h-4" />
                  <span className="text-xs">Proveedor</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 bg-gradient-to-r from-violet-600 to-rose-500 hover:from-violet-700 hover:to-rose-600"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Ingresando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <LogIn className="w-4 h-4" />
                    Ingresar
                  </span>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">O prueba el modo demo</span>
              </div>
            </div>

            {/* Demo Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => handleDemoLogin("organizer")}
                disabled={isLoading}
                className="h-11"
              >
                <User className="w-4 h-4 mr-1" />
                Demo Org
              </Button>
              <Button
                variant="outline"
                onClick={() => handleDemoLogin("provider")}
                disabled={isLoading}
                className="h-11"
              >
                <Briefcase className="w-4 h-4 mr-1" />
                Demo Prov
              </Button>
            </div>

            {/* Footer */}
            <div className="text-center text-sm">
              <span className="text-gray-500">¿No tienes cuenta? </span>
              <Link 
                href="/register" 
                className="text-violet-600 hover:text-violet-700 font-medium"
              >
                Regístrate
              </Link>
            </div>

            {/* Badges - Footer corregido */}
            <div className="flex justify-center gap-2 pt-2">
              <Badge variant="secondary" className="text-xs flex items-center gap-1">
                <span>Hecho en Paraguay</span>
                <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  PartyPopper,
  LogIn,
  Moon,
  Sun,
  Loader2
} from "lucide-react";
import { useTheme } from "next-themes";
import toast from "react-hot-toast";
import type { UserRole } from "@/types/database";

export default function LoginPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("organizer");

  useEffect(() => {
    setMounted(true);
  }, []);

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
          .single();

        toast.success("¡Bienvenido a KTRIN!");
        
        // Redirect based on role
        if (profile?.role === "provider") {
          router.push("/provider/dashboard");
        } else {
          router.push("/organizer/dashboard");
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
        organizer: "demo@organizer.com",
        provider: "demo@provider.com",
        guest: "demo@guest.com",
        admin: "demo@admin.com",
      };

      const { data, error } = await supabase.auth.signInWithPassword({
        email: demoEmails[role],
        password: "demo123456",
      });

      if (error) {
        // If demo user doesn't exist, show message
        toast.error("Usuario demo no configurado. Por favor regístrate primero.");
        setIsLoading(false);
        return;
      }

      toast.success(`Modo Demo: ${role === "organizer" ? "Organizador" : "Proveedor"}`);
      
      if (role === "provider") {
        router.push("/provider/dashboard");
      } else {
        router.push("/organizer/dashboard");
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

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 via-violet-700 to-rose-500 dark:from-violet-900 dark:via-violet-950 dark:to-rose-900 flex">
      {/* Theme Toggle */}
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
      >
        {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

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

        <div className="flex items-center gap-6 text-sm text-white/60">
          <span>v1.0.0</span>
          <span>•</span>
          <span>Paraguay</span>
          <span>•</span>
          <span>2026</span>
        </div>
      </div>

      {/* Right Panel - Login */}
      <div className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-2xl border-0">
          <CardHeader className="text-center pb-2">
            <div className="lg:hidden flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-rose-500 rounded-xl flex items-center justify-center">
                <Calendar className="w-7 h-7 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">KTRIN</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Sistema Operativo</p>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Bienvenido</h2>
            <p className="text-gray-500 dark:text-gray-400">
              Ingresa a tu cuenta o prueba el modo demo
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Role Selector */}
            <Tabs value={selectedRole} onValueChange={(v) => setSelectedRole(v as UserRole)}>
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="organizer" className="flex flex-col items-center gap-1 py-2">
                  <User className="w-4 h-4" />
                  <span className="text-xs">Organizador</span>
                </TabsTrigger>
                <TabsTrigger value="provider" className="flex flex-col items-center gap-1 py-2">
                  <Briefcase className="w-4 h-4" />
                  <span className="text-xs">Proveedor</span>
                </TabsTrigger>
                <TabsTrigger value="guest" className="flex flex-col items-center gap-1 py-2">
                  <PartyPopper className="w-4 h-4" />
                  <span className="text-xs">Invitado</span>
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
                <span className="w-full border-t dark:border-gray-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-gray-900 px-2 text-gray-500">O prueba el modo demo</span>
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
              <span className="text-gray-500 dark:text-gray-400">¿No tienes cuenta? </span>
              <a 
                href="/register" 
                className="text-violet-600 hover:text-violet-700 dark:text-violet-400 font-medium"
              >
                Regístrate
              </a>
            </div>

            {/* Badges */}
            <div className="flex justify-center gap-2 pt-2">
              <Badge variant="secondary" className="text-xs">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Fase 1 MVP
              </Badge>
              <Badge variant="outline" className="text-xs">
                Paraguay
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { t } from "@/lib/i18n";
import { useEffect } from "react";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

  // Usar useEffect para mostrar el toast, evitando actualizar componentes durante el renderizado
  useEffect(() => {
    if (user && user.role !== "admin") {
      toast({
        title: t("error"),
        description: t("adminAccessRequired"),
        variant: "destructive",
      });
    }
  }, [user, toast]);

  return (
    <Route path={path}>
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      ) : user && user.role === "admin" ? (
        <Component />
      ) : user ? (
        // Si el usuario está logueado pero no es admin, redirigir
        <Redirect to="/" />
      ) : (
        // Si no hay usuario logueado, redirigir a login
        <Redirect to="/auth" />
      )}
    </Route>
  );
}
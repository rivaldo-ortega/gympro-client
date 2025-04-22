import {
  Bell,
  Search,
  UserCircle,
  LogOut,
} from "lucide-react";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Header() {
  const { user, logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="flex h-16 items-center px-6 border-b">
      <div className="relative w-full flex items-center justify-between gap-4">
        {/* Espacio flexible para balancear el header */}
        <div className="flex-1"></div>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* User Info */}
          <span className="text-sm mr-2 hidden md:inline-block">
            Hola, {user?.name || "Usuario"}
          </span>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>

          {/* Profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full" aria-label="Perfil">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatarUrl || ""} alt={user?.name || "Usuario"} />
                  <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <UserCircle className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar Sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Language switcher */}
          <LanguageSwitcher />
          
          {/* Theme toggle */}
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
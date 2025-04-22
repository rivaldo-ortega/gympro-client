import { Link } from "wouter";
import { cn, getInitials } from "@/lib/utils";
import {
  Home,
  Users,
  CreditCard,
  Calendar,
  UserCog,
  Dumbbell,
  BarChart2,
  Bell,
  LogOut,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { t } from "@/lib/i18n";
import { isFeatureEnabled } from "@/lib/feature-flags";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

interface MobileMenuItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  onClick: () => void;
}

const MobileMenuItem = ({ icon, label, href, onClick }: MobileMenuItemProps) => {
  return (
    <Link href={href}>
      <div
        className="group flex items-center py-2 px-4 rounded-md text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800 font-medium cursor-pointer"
        onClick={onClick}
      >
        <div className="mr-3 text-gray-500 dark:text-gray-400">{icon}</div>
        {label}
      </div>
    </Link>
  );
};

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const { user, logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
    onClose();
  };

  return (
    <>
      {/* Mobile Menu Overlay */}
      <div
        className={cn(
          "md:hidden fixed inset-0 z-40 bg-gray-600 bg-opacity-75 transition-opacity",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Mobile Menu Sidebar */}
      <div
        className={cn(
          "md:hidden fixed inset-y-0 left-0 z-50 w-full bg-background dark:bg-gray-900 transform transition duration-300 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="pt-5 pb-6 px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center">
                <Dumbbell className="h-5 w-5 text-white" />
              </div>
              <h1 className="ml-3 text-xl font-semibold">{t('appName')}</h1>
            </div>
            <Button
              variant="ghost"
              className="rounded-md focus:outline-none"
              onClick={onClose}
            >
              <span className="sr-only">Close menu</span>
              <X className="h-6 w-6" />
            </Button>
          </div>
          <div className="mt-6">
            <nav className="grid gap-y-4">
              <MobileMenuItem
                icon={<Home size={18} />}
                label={t('dashboard')}
                href="/dashboard"
                onClick={onClose}
              />
              <MobileMenuItem
                icon={<Users size={18} />}
                label={t('members')}
                href="/members"
                onClick={onClose}
              />
              <MobileMenuItem
                icon={<CreditCard size={18} />}
                label={t('membershipPlans')}
                href="/membership-plans"
                onClick={onClose}
              />
              {isFeatureEnabled('classes') && (
                <MobileMenuItem
                  icon={<Calendar size={18} />}
                  label={t('classes')}
                  href="/classes"
                  onClick={onClose}
                />
              )}
              {isFeatureEnabled('trainers') && (
                <MobileMenuItem
                  icon={<UserCog size={18} />}
                  label={t('trainers')}
                  href="/trainers"
                  onClick={onClose}
                />
              )}
              {isFeatureEnabled('equipment') && (
                <MobileMenuItem
                  icon={<Dumbbell size={18} />}
                  label={t('equipment')}
                  href="/equipment"
                  onClick={onClose}
                />
              )}
              <MobileMenuItem
                icon={<BarChart2 size={18} />}
                label={t('reports')}
                href="/reports"
                onClick={onClose}
              />
              {isFeatureEnabled('announcements') && (
                <MobileMenuItem
                  icon={<Bell size={18} />}
                  label={t('announcements')}
                  href="/announcements"
                  onClick={onClose}
                />
              )}
              <MobileMenuItem
                icon={<CreditCard size={18} />}
                label={t('payments')}
                href="/payments"
                onClick={onClose}
              />
            </nav>
          </div>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatarUrl || ""} alt={user?.name || t('user')} />
              <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <p className="text-sm font-medium">{user?.name || t('user')}</p>
              <p className="text-xs text-muted-foreground">{user?.role || t('staff')}</p>
            </div>
            <Button 
              variant="ghost"
              className="ml-auto"
              onClick={handleLogout}
              disabled={logoutMutation.isPending}
              title={t('logout')}
              aria-label={t('logout')}
            >
              <LogOut size={18} />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

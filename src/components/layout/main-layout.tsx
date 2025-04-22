import { ReactNode, useState } from "react";
import { Sidebar } from "./sidebar";
import { MobileMenu } from "./mobile-menu";
import { Header } from "./header";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar (desktop) */}
      <Sidebar />

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-background dark:bg-gray-900 border-b">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6.7 6.7a8 8 0 1 0 10.6 0 8 8 0 0 0-10.6 0" />
                <path d="m5 5-4-4" />
                <path d="m19 5 4-4" />
                <path d="M9 17v-1" />
                <path d="M15 17v-1" />
                <path d="M9 8V7" />
                <path d="M15 8V7" />
              </svg>
            </div>
            <h1 className="ml-3 text-lg font-semibold">GymPro Admin</h1>
          </div>
          <Button
            variant="ghost"
            className="focus:outline-none"
            onClick={toggleMobileMenu}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <MobileMenu open={mobileMenuOpen} onClose={toggleMobileMenu} />

      <div className="flex flex-col flex-1 md:pl-64">
        {/* Header for desktop */}
        <div className="hidden md:block">
          <Header />
        </div>

        {/* Main Content */}
        <main className="flex-1 relative z-0 overflow-y-auto pt-5 pb-6 px-4 md:px-6 focus:outline-none">
          {children}
        </main>
      </div>
    </div>
  );
}

import { Switch, Route, Redirect } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Members from "@/pages/members";
import MemberProfile from "@/pages/member-profile";
import MembershipPlans from "@/pages/membership-plans";
import Classes from "@/pages/classes"; 
import Trainers from "@/pages/trainers";
import Equipment from "@/pages/equipment";
import Reports from "@/pages/reports";
import Announcements from "@/pages/announcements";
import Payments from "@/pages/payments";
import AuthPage from "@/pages/auth-page";
import { ProtectedRoute } from "./lib/protected-route";
import { MainLayout } from "./components/layout/main-layout";
import { isFeatureEnabled } from "./lib/feature-flags";

function Router() {
  return (
    <Switch>
      {/* Ruta de autenticación */}
      <Route path="/auth" component={AuthPage} />
      
      {/* Redirección de la ruta principal al dashboard */}
      <Route path="/">
        <Redirect to="/dashboard" />
      </Route>
      
      {/* Rutas administrativas protegidas */}
      <ProtectedRoute path="/dashboard" component={() => (
        <MainLayout>
          <Dashboard />
        </MainLayout>
      )} />
      <ProtectedRoute path="/members" component={() => (
        <MainLayout>
          <Members />
        </MainLayout>
      )} />
      <ProtectedRoute path="/members/:id" component={() => (
        <MainLayout>
          <MemberProfile />
        </MainLayout>
      )} />
      <ProtectedRoute path="/membership-plans" component={() => (
        <MainLayout>
          <MembershipPlans />
        </MainLayout>
      )} />
      {isFeatureEnabled('classes') && (
        <ProtectedRoute path="/classes" component={() => (
          <MainLayout>
            <Classes />
          </MainLayout>
        )} />
      )}
      {isFeatureEnabled('trainers') && (
        <ProtectedRoute path="/trainers" component={() => (
          <MainLayout>
            <Trainers />
          </MainLayout>
        )} />
      )}
      {isFeatureEnabled('equipment') && (
        <ProtectedRoute path="/equipment" component={() => (
          <MainLayout>
            <Equipment />
          </MainLayout>
        )} />
      )}
      <ProtectedRoute path="/reports" component={() => (
        <MainLayout>
          <Reports />
        </MainLayout>
      )} />
      {isFeatureEnabled('announcements') && (
        <ProtectedRoute path="/announcements" component={() => (
          <MainLayout>
            <Announcements />
          </MainLayout>
        )} />
      )}
      <ProtectedRoute path="/payments" component={() => (
        <MainLayout>
          <Payments />
        </MainLayout>
      )} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <>
      <Router />
      <Toaster />
    </>
  );
}

export default App;

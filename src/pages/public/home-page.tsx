import { Link } from "wouter";
import { ChevronRight, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { t } from "@/lib/i18n";

export default function PublicHomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between py-4">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center">
              <Dumbbell className="h-5 w-5 text-white" />
            </div>
            <h1 className="ml-3 text-xl font-semibold">{t('appName')}</h1>
          </div>
          <nav className="flex space-x-6">
            <Link href="/" className="text-sm font-medium text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400">
              {t('home')}
            </Link>
            <Link href="/plans" className="text-sm font-medium text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400">
              {t('membershipPlans')}
            </Link>
            <Link href="/public-announcements" className="text-sm font-medium text-gray-700 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400">
              {t('announcements')}
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 md:pr-10">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {t('heroTitle')}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                {t('heroSubtitle')}
              </p>
              <div className="space-x-4">
                <Button asChild size="lg">
                  <Link href="/plans">{t('explorePlans')}</Link>
                </Button>
              </div>
            </div>
            <div className="md:w-1/2 mt-10 md:mt-0">
              <div className="rounded-xl overflow-hidden shadow-xl">
                <img 
                  src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                  alt="Gym" 
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
            {t('featuresTitle')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mb-4">
                <Dumbbell className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                {t('feature1Title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('feature1Description')}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mb-4">
                <Dumbbell className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                {t('feature2Title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('feature2Description')}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mb-4">
                <Dumbbell className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                {t('feature3Title')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('feature3Description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            {t('ctaTitle')}
          </h2>
          <p className="text-lg text-primary-100 mb-8 max-w-2xl mx-auto">
            {t('ctaDescription')}
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/plans" className="flex items-center">
              {t('viewPlans')}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-900 py-12 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center">
                  <Dumbbell className="h-5 w-5 text-white" />
                </div>
                <h1 className="ml-3 text-xl font-semibold text-gray-900 dark:text-white">{t('appName')}</h1>
              </div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                {t('footerDescription')}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                {t('resources')}
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/plans" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                    {t('membershipPlans')}
                  </Link>
                </li>
                <li>
                  <Link href="/public-announcements" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                    {t('announcements')}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                {t('legal')}
              </h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                    {t('privacy')}
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                    {t('terms')}
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                {t('contact')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Lima, Perú<br />
                info@gympro.com<br />
                +51 987 654 321
              </p>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400 text-center">
              &copy; {new Date().getFullYear()} GymPro. {t('allRightsReserved')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
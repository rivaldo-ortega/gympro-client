import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Dumbbell, Calendar, User } from "lucide-react";
import { getQueryFn } from "@/lib/queryClient";
import { t } from "@/lib/i18n";
import { format } from "date-fns";
import { Announcement } from "@shared/schema";

export default function PublicAnnouncementsPage() {
  const { data: announcements = [], isLoading } = useQuery<Announcement[]>({
    queryKey: ['/api/announcements/public'],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

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
            <Link href="/public-announcements" className="text-sm font-medium text-primary-600 dark:text-primary-400">
              {t('announcements')}
            </Link>
          </nav>
        </div>
      </header>

      {/* Page Content */}
      <div className="py-12 bg-gray-50 dark:bg-gray-900 flex-grow">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {t('gymAnnouncements')}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {t('announcementsDescription')}
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {isLoading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
              </div>
            ) : announcements.length > 0 ? (
              <div className="space-y-8">
                {announcements.map((announcement) => (
                  <div 
                    key={announcement.id} 
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex items-center mb-4">
                        <span className="inline-flex items-center justify-center px-3 py-1 text-xs font-medium rounded-full bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                          {announcement.category}
                        </span>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 ml-4">
                          <Calendar className="h-4 w-4 mr-1" />
                          {format(new Date(announcement.publishDate), 'PPP')}
                        </div>
                      </div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                        {announcement.title}
                      </h2>
                      <div className="prose dark:prose-invert max-w-none">
                        <p className="text-gray-600 dark:text-gray-300">
                          {announcement.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Dumbbell className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {t('noAnnouncementsYet')}
                </h3>
                <p className="mt-2 text-gray-500 dark:text-gray-400">
                  {t('checkBackLater')}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-900 py-12 border-t">
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
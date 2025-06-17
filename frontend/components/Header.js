// components/Header.js
'use client';

import { useParams, usePathname, useRouter } from 'next/navigation';
import classNames from 'classnames';
import { useGetThemeQuery } from '@/features/themeApiSlice';

const navItems = [
  { id: 'configuration', label: 'Configuration' },
  { id: 'company-detail', label: 'Company Detail' },
  { id: 'manage-user', label: 'Manage User' },
  { id: 'profile', label: 'User Detail' },
];

const Header = () => {
  const { userId } = useParams();
  const router = useRouter();
  const pathname = usePathname();

  const { data: themeData , isLoading: isLoadingTheme } = useGetThemeQuery(userId);
  const theme = themeData?.theme || "light"; 

  // Extract last path segment after /setting/
  const activeTab = pathname.split('/')[3] || 'configuration';

  const handleNavigate = (id) => {
    router.push(`/${userId}/setting/${id}`);
  };

  if (isLoadingTheme) {
    return null; // Or a loading spinner if preferred
  }


  return (
    <header className={classNames(
      "shadow-sm border-b w-full",
      {
        "bg-white border-gray-200": theme === 'light',
        "bg-gray-800 border-gray-700": theme === 'dark',
      }
    )}>
      <nav className="flex justify-start space-x-6 px-6 py-4 overflow-x-auto whitespace-nowrap">
        {navItems.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => handleNavigate(id)}
            className={classNames(
              'text-sm font-medium px-2 pb-1 border-b-2 transition-colors duration-200 whitespace-nowrap',
              {
                 'border-indigo-600 text-indigo-600': activeTab === id && theme === 'light',
                'border-purple-400 text-purple-400': activeTab === id && theme === 'dark',
                'border-transparent text-gray-600 hover:text-indigo-500': activeTab !== id && theme === 'light',
                'border-transparent text-gray-300 hover:text-purple-300': activeTab !== id && theme === 'dark',
              }
            )}
          >
            {label}
          </button>
        ))}
      </nav>
    </header>
  );
};

export default Header;

// components/Header.js
'use client';

import { useParams, usePathname, useRouter } from 'next/navigation';
import classNames from 'classnames';

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

  // Extract last path segment after /setting/
  const activeTab = pathname.split('/')[3] || 'configuration';

  const handleNavigate = (id) => {
    router.push(`/${userId}/setting/${id}`);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 w-full">
      <nav className="flex justify-start space-x-6 px-6 py-4 overflow-x-auto whitespace-nowrap">
        {navItems.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => handleNavigate(id)}
            className={classNames(
              'text-sm font-medium px-2 pb-1 border-b-2 transition-colors duration-200 whitespace-nowrap',
              {
                'border-indigo-600 text-indigo-600': activeTab === id,
                'border-transparent text-gray-600 hover:text-indigo-500':
                  activeTab !== id,
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

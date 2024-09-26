"use client";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

const Sidebar = ({ isOpen }: { isOpen: boolean }) => {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Log Task', path: '/actions' },
    { name: 'Rewards', path: '/rewards' },
    { name: 'Admin', path: '/admin' },
  ];

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error signing out:', error)
    } else {
      router.push('/login')
    }
  }

  return (
    // Adjust the width based on the 'isOpen' state
    <nav className={`bg-gray-800 ${isOpen ? 'w-64' : 'w-16'} min-h-screen p-4 flex flex-col transition-all duration-300`}>
      {/* Show full title when open, only "ACE" when closed */}
      <div className={`text-white text-2xl font-bold mb-8 ${isOpen ? '' : 'text-center'}`}>
        {isOpen ? 'ACE Framework' : 'ACE'}
      </div>
      <ul className="flex-grow">
        {navItems.map((item) => (
          <li key={item.path} className="mb-4">
            <Link href={item.path}>
              <span className={`block p-2 rounded ${
                pathname === item.path ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700'
              } ${isOpen ? '' : 'text-center'}`}>
                {/* Show only first letter when closed */}
                {isOpen ? item.name : item.name[0]}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <button 
        className={`bg-gray-600 text-white p-2 rounded hover:bg-gray-700 mt-auto ${isOpen ? '' : 'text-center'}`}
        onClick={handleLogout}
      >
        {/* Show "Logout" when open, "L" when closed */}
        {isOpen ? 'Logout' : 'L'}
      </button>
    </nav>
  );
};

export default Sidebar;
"use client";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { FaTimes, FaBars } from 'react-icons/fa';

const Sidebar = ({ isOpen, toggleSidebar }: { isOpen: boolean, toggleSidebar: () => void }) => {
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
    <nav className={`fixed top-0 left-0 h-full bg-gray-800 z-30 transition-all duration-300 ease-in-out ${
      isOpen ? 'w-64' : 'w-0'
    } overflow-hidden`}>
      <div className="h-full flex flex-col p-4">
        <div className="flex justify-between items-center mb-8">
          <div className="text-white text-2xl font-bold">
            {isOpen ? 'ACE' : 'A'}
          </div>
          <button onClick={toggleSidebar} className="text-white">
            {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
        <ul className="flex-grow">
          {navItems.map((item) => (
            <li key={item.path} className="mb-4">
              <Link href={item.path}>
                <span className={`block p-2 rounded ${
                  pathname === item.path ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700'
                } ${isOpen ? '' : 'text-center'}`}>
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
          {isOpen ? 'Logout' : 'L'}
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;
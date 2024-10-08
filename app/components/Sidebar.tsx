"use client";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClientComponentClient();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Log Task', path: '/actions' },
    { name: 'Rewards', path: '/rewards' },
    { name: 'Admin', path: '/admin' },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <nav className="bg-gray-800 w-64 min-h-screen p-4 flex flex-col">
      <div className="text-white text-2xl font-bold mb-8">ACE Framework</div>
      <ul className="flex-grow">
        {navItems.map((item) => (
          <li key={item.path} className="mb-4">
            <Link href={item.path}>
              <span className={`block p-2 rounded ${
                pathname === item.path ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700'
              }`}>
                {item.name}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <button 
        className="bg-red-600 text-white p-2 rounded hover:bg-red-700 mt-auto"
        onClick={handleLogout}
      >
        Logout
      </button>
    </nav>
  );
};

export default Sidebar;
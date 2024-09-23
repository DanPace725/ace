// File path: app/layout.tsx

import './globals.css'
import { Inter } from 'next/font/google'
import { UserProvider } from '@/app/contexts/UserContext'
import ClientLayout from './components/ClientLayout'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'


const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'ACE Framework App',
  description: 'A modern app using the ACE Framework',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-900 text-white`}>
        <UserProvider>
          <ClientLayout>{children}</ClientLayout>
          <ToastContainer
           position="top-right"
           autoClose={3000}
           hideProgressBar={false}
           newestOnTop={false}
           closeOnClick
           rtl={false}
           pauseOnFocusLoss
           draggable
           pauseOnHover
         />
        </UserProvider>
      </body>
    </html>
  )
}
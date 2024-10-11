import './globals.css'
import { Inter } from 'next/font/google'
import ClientWrapper from './components/ClientWrapper'

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
        <ClientWrapper>{children}</ClientWrapper>
      </body>
    </html>
  )
}
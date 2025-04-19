import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SessionProvider } from "next-auth/react";
import Header from '@/components/ui/header';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Student Feedback Tracker App',
  description: 'Made by Ravi AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <SessionProvider>
        <body className={"light"}>
          <Header />
          {children}
        </body>
      </SessionProvider>
    </html>
  )
}

import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/Sidebar';
import { CaseProvider } from '@/context/CaseContext';
import { NavProvider } from '@/context/NavContext';

export const metadata: Metadata = {
  title: 'ResultFlow — School Result Processing & GPA Engine',
  description: 'Deterministic school grading, auditable GPA calculation, checking lists, and printable marksheets.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-background font-body-md text-on-surface antialiased min-h-screen">
        <CaseProvider>
          <NavProvider>
            <Sidebar />
            <div className="pl-0 lg:pl-72 flex flex-col min-h-screen transition-all duration-300">
              <main className="pt-20 sm:pt-24 lg:pt-24 px-4 sm:px-6 lg:px-8 pb-8 flex-1 w-full max-w-full overflow-x-hidden">
                {children}
              </main>
            </div>
          </NavProvider>
        </CaseProvider>
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/Sidebar';
import { CaseProvider } from '@/context/CaseContext';

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
          <Sidebar />
          <div className="pl-72 flex flex-col min-h-screen">
            <main className="pt-16 p-md flex-1">
              {children}
            </main>
          </div>
        </CaseProvider>
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BD Platform — Business Development Management',
  description: 'Business Development Portfolio Management System for Defence, Medical, Automotive, Climate Control, Electronics and Technology sectors',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

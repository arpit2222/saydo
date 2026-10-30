import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SayDo — Voice to AI Agent Skills & Policies',
  description: 'Record once by voice. Your web app works with every AI agent.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-[#090d16] text-slate-100">
        {children}
        <script
          src="/sdk.js"
          data-app="pk_demo_dehix"
          data-api="http://localhost:4000"
          defer
        ></script>
      </body>
    </html>
  );
}

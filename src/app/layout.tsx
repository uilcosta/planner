import type { Metadata } from 'next';
import { Geist_Mono, IBM_Plex_Sans } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { HideValuesProvider } from '@/components/providers/HideValuesProvider';
import './globals.css';

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const ibmPlexSans = IBM_Plex_Sans({
  variable: '--font-ibm-plex-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Meu Planner Financeiro',
  description:
    'Gerenciador financeiro pessoal com planejamento mensal, controle de gastos e caixinhas',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`${geistMono.variable} ${ibmPlexSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  var root = document.documentElement;
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    root.classList.add('dark');
                    root.classList.remove('light');
                  } else {
                    root.classList.add('light');
                    root.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="flex min-h-full flex-col">
        {/* Skip link for accessibility */}
        <a
          href="#main-content"
          className="focus:bg-surface focus:text-text sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:ring-2 focus:ring-[var(--color-focus)] focus:ring-offset-2 focus:outline-none"
        >
          Pular para o conteúdo principal
        </a>
        <ThemeProvider>
          <HideValuesProvider>{children}</HideValuesProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

import { Lora } from 'next/font/google';
import './globals.css';
import { AuthProvider } from './context/AuthContext';
import { EventProvider } from './context/EventContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastContainer } from './components/common/Toast';

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
});

export const metadata = {
  title: 'Event Mania - Discover & Manage College Events',
  description: 'Your ultimate platform for discovering and managing college events across India. Connect with students, organize events, and create memorable experiences.',
  keywords: 'college events, student events, event management, inter-college events, intra-college events, technical events, cultural events',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${lora.variable} font-serif antialiased`}>
        <ThemeProvider>
          <AuthProvider>
            <EventProvider>
              <NotificationProvider>
                {children}
                <ToastContainer />
              </NotificationProvider>
            </EventProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

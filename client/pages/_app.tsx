import type { AppProps } from 'next/app';
import Head from 'next/head';
import { AuthProvider } from '../context/AuthContext';
import DashboardLayout from '../components/DashboardLayout';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>MediMitra - Personal Health AI Assistant</title>
        <meta name="description" content="Track your health, get AI-powered insights, and take control of your wellness journey." />
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <AuthProvider>
        <DashboardLayout>
          <Component {...pageProps} />
        </DashboardLayout>
      </AuthProvider>
    </>
  );
}

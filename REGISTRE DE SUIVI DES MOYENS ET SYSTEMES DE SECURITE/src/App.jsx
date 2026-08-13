import React, { Suspense, lazy, useState, useCallback } from 'react';
import AppShell from './components/layout/AppShell';
import SplashScreen from './components/splash/SplashScreen';

const RegistreSecurite = lazy(() =>
  import('./modules/registre-securite/RegistreSecurite')
);

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-gardnet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600 font-bold">Chargement du module...</p>
      </div>
    </div>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
  }, []);

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <AppShell>
      <Suspense fallback={<LoadingFallback />}>
        <RegistreSecurite />
      </Suspense>
    </AppShell>
  );
}

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Header } from './components/Header';
import { SubmitDocument } from './components/SubmitDocument';
import { DocumentGallery } from './components/DocumentGallery';
import { VerifyDocument } from './components/VerifyDocument';
import { Dashboard } from './components/Dashboard';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { connected, connecting } = useWallet();

  // Debug wallet state changes
  useEffect(() => {
    console.log('App wallet state:', { connected, connecting });
  }, [connected, connecting]);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'submit':
        return <SubmitDocument />;
      case 'gallery':
        return <DocumentGallery />;
      case 'verify':
        return <VerifyDocument />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;

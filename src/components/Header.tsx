import { Shield, FileText, LayoutDashboard } from 'lucide-react';
import { WalletConnection } from './WalletConnection';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Header({ activeTab, onTabChange }: HeaderProps) {
  return (
    <header className="bg-gray-900 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-blue-400" />
            <div>
              <h1 className="text-2xl font-bold text-white">DocuSafe</h1>
              <span className="text-sm text-gray-400">Solana Document Storage</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-8">
            <nav className="flex space-x-2">
              <button
                onClick={() => onTabChange('dashboard')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'dashboard'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => onTabChange('submit')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'submit'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                <FileText className="h-4 w-4" />
                <span>Submit Document</span>
              </button>
              
              <button
                onClick={() => onTabChange('gallery')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'gallery'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                <span>Document Gallery</span>
              </button>
              
              <button
                onClick={() => onTabChange('verify')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'verify'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Shield className="h-4 w-4" />
                <span>Verify Document</span>
              </button>
            </nav>
            
            <WalletConnection />
          </div>
        </div>
      </div>
    </header>
  );
}

import { useWallet } from '@solana/wallet-adapter-react';
import { 
  BarChart3, 
  FileText, 
  Shield, 
  Clock, 
  Wallet as WalletIcon,
  Upload,
  Search,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { solanaContractService } from '../services/solanaContractService';

interface DashboardStats {
  totalDocuments: number;
  publicDocuments: number;
  privateDocuments: number;
  recentUploads: number;
}

interface RecentActivity {
  id: string;
  type: 'upload' | 'verify' | 'view';
  documentName: string;
  timestamp: string;
  status: 'success' | 'pending' | 'failed';
}

export function Dashboard() {
  const { publicKey, connected } = useWallet();
  const [balance, setBalance] = useState<number>(0);
  const [stats, setStats] = useState<DashboardStats>({
    totalDocuments: 0,
    publicDocuments: 0,
    privateDocuments: 0,
    recentUploads: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (publicKey && connected) {
        try {
          // Fetch wallet balance
          const balance = await solanaContractService.getWalletBalance(publicKey);
          setBalance(balance);

          // Fetch documents for stats
          const documents = await solanaContractService.getPublicDocuments();
          
          setStats({
            totalDocuments: documents.length,
            publicDocuments: documents.filter(doc => doc.isPublic).length,
            privateDocuments: documents.filter(doc => !doc.isPublic).length,
            recentUploads: documents.filter(doc => {
              const uploadDate = new Date(doc.dateUploaded);
              const now = new Date();
              const daysDiff = (now.getTime() - uploadDate.getTime()) / (1000 * 3600 * 24);
              return daysDiff <= 7;
            }).length
          });

          // Generate some sample recent activity
          const recentDocs = documents.slice(0, 5).map(doc => ({
            id: doc.id,
            type: 'upload' as const,
            documentName: doc.name,
            timestamp: doc.dateUploaded,
            status: 'success' as const
          }));

          setRecentActivity(recentDocs);
        } catch (error) {
          console.error('Error loading dashboard data:', error);
        }
      }
      setIsLoading(false);
    };

    loadDashboardData();
  }, [publicKey, connected]);

  if (!connected) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <WalletIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-200 mb-2">Connect Your Wallet</h2>
          <p className="text-gray-400">Please connect your Solana wallet to view your dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Documents</p>
              <h3 className="text-white text-2xl font-bold">{stats.totalDocuments}</h3>
            </div>
            <FileText className="h-8 w-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Public Documents</p>
              <h3 className="text-white text-2xl font-bold">{stats.publicDocuments}</h3>
            </div>
            <Shield className="h-8 w-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Private Documents</p>
              <h3 className="text-white text-2xl font-bold">{stats.privateDocuments}</h3>
            </div>
            <Search className="h-8 w-8 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Recent Uploads</p>
              <h3 className="text-white text-2xl font-bold">{stats.recentUploads}</h3>
            </div>
            <Clock className="h-8 w-8 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Wallet Info */}
      <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
          <WalletIcon className="h-5 w-5 mr-2 text-blue-400" />
          Wallet Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-700/50 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Wallet Address</p>
            <p className="text-gray-200 font-mono mt-1">
              {publicKey?.toString()}
            </p>
          </div>
          <div className="bg-gray-700/50 rounded-lg p-4">
            <p className="text-gray-400 text-sm">Balance</p>
            <p className="text-gray-200 font-mono mt-1">
              {balance.toFixed(4)} SOL
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
          <BarChart3 className="h-5 w-5 mr-2 text-blue-400" />
          Recent Activity
        </h2>
        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div 
              key={activity.id}
              className="bg-gray-700/50 rounded-lg p-4 flex items-center justify-between"
            >
              <div className="flex items-center space-x-4">
                {activity.type === 'upload' && (
                  <Upload className="h-5 w-5 text-blue-400" />
                )}
                {activity.type === 'verify' && (
                  <Shield className="h-5 w-5 text-green-400" />
                )}
                {activity.type === 'view' && (
                  <Search className="h-5 w-5 text-purple-400" />
                )}
                <div>
                  <p className="text-gray-200">{activity.documentName}</p>
                  <p className="text-gray-400 text-sm">
                    {new Date(activity.timestamp).toLocaleDateString()} at{' '}
                    {new Date(activity.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <div>
                {activity.status === 'success' && (
                  <CheckCircle className="h-5 w-5 text-green-400" />
                )}
                {activity.status === 'pending' && (
                  <Clock className="h-5 w-5 text-yellow-400" />
                )}
                {activity.status === 'failed' && (
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                )}
              </div>
            </div>
          ))}

          {recentActivity.length === 0 && (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-400">No recent activity</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
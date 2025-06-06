import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Calendar, Hash, Eye, Filter, RefreshCw, AlertCircle } from 'lucide-react';
import { Document, DOCUMENT_TYPES, DocumentType } from '../types/document';
import { solanaContractService } from '../services/solanaContractService';

export function DocumentGallery() {
  const { connected } = useWallet();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<DocumentType | 'All'>('All');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'type'>('date');

  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    filterAndSortDocuments();
  }, [documents, selectedType, sortBy]);

  const loadDocuments = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const publicDocs = await solanaContractService.getPublicDocuments();
      setDocuments(publicDocs);
    } catch (error) {
      console.error('Failed to load documents:', error);
      setError('Failed to load documents. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortDocuments = () => {
    let filtered = documents;

    if (selectedType !== 'All') {
      filtered = filtered.filter(doc => doc.type === selectedType);
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'type':
          return a.type.localeCompare(b.type);
        case 'date':
        default:
          return new Date(b.dateUploaded).getTime() - new Date(a.dateUploaded).getTime();
      }
    });

    setFilteredDocuments(filtered);
  };

  const handleRefresh = () => {
    loadDocuments();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
        <span className="ml-3 text-gray-300">Loading public documents...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Try Again</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
            <Eye className="h-6 w-6 text-blue-400" />
            <span>Public Documents</span>
          </h2>
          <span className="text-sm text-gray-400 bg-gray-700 px-2 py-1 rounded">
            {filteredDocuments.length} documents
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            title="Refresh documents"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as DocumentType | 'All')}
              className="px-3 py-1 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Types</option>
              {DOCUMENT_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'name' | 'type')}
            className="px-3 py-1 bg-gray-700 border border-gray-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
            <option value="type">Sort by Type</option>
          </select>
        </div>
      </div>

      {/* Connection status */}
      {!connected && (
        <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-yellow-400" />
            <p className="text-yellow-300">
              Connect your wallet to view the latest documents from the blockchain.
            </p>
          </div>
        </div>
      )}

      {/* Documents grid */}
      {filteredDocuments.length === 0 ? (
        <div className="text-center py-12">
          <Eye className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400 text-lg mb-2">No public documents found</p>
          <p className="text-gray-500 text-sm">
            {selectedType !== 'All' 
              ? `No documents of type "${selectedType}" are currently available.`
              : 'Be the first to upload a public document!'
            }
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredDocuments.map((document) => (
            <DocumentCard key={document.id} document={document} />
          ))}
        </div>
      )}
    </div>
  );
}

// Document card component
function DocumentCard({ document }: { document: Document }) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const truncateHash = (hash: string) => {
    return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
  };

  const getTypeColor = (type: DocumentType) => {
    const colors = {
      'Diploma': 'bg-purple-600 text-purple-100',
      'Driver License': 'bg-green-600 text-green-100',
      'IRS Tax Form': 'bg-red-600 text-red-100',
      'Health Record': 'bg-blue-600 text-blue-100',
      'Legal Contract': 'bg-orange-600 text-orange-100',
      'Other': 'bg-gray-600 text-gray-100'
    };
    return colors[type] || colors['Other'];
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-all duration-200 hover:shadow-lg">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
            {document.name}
          </h3>
          <span className={`inline-block px-2 py-1 text-xs rounded-full ${getTypeColor(document.type)}`}>
            {document.type}
          </span>
        </div>
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex items-center text-gray-300">
          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
          <span>Issued: {formatDate(document.dateIssued)}</span>
        </div>

        <div className="flex items-center text-gray-300">
          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
          <span>Uploaded: {formatDate(document.dateUploaded)}</span>
        </div>

        <div className="flex items-start text-gray-300">
          <Hash className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-gray-400" />
          <span className="font-mono text-xs break-all" title={document.hash}>
            {truncateHash(document.hash)}
          </span>
        </div>

        <div className="pt-3 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">
              ID: {document.id.slice(0, 12)}...
            </span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-xs text-green-400">Verified</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

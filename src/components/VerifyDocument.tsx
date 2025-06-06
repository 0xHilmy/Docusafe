import { useState } from 'react';
import { Search, Shield, CheckCircle, XCircle, Hash, Calendar, Lock } from 'lucide-react';
import { Document } from '../types/document';
import { solanaService } from '../services/solanaService';

export function VerifyDocument() {
  const [searchType, setSearchType] = useState<'hash' | 'id'>('hash');
  const [searchValue, setSearchValue] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<{
    found: boolean;
    document?: Document;
    error?: string;
  } | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setSearchResult(null);

    try {
      let document: Document | null = null;

      if (searchType === 'hash') {
        const result = await solanaService.verifyDocument(searchValue);
        document = result.document || null;
      } else {
        document = await solanaService.getDocumentById(searchValue, passphrase);
      }

      if (document) {
        setSearchResult({ found: true, document });
      } else {
        setSearchResult({ 
          found: false, 
          error: searchType === 'id' && passphrase 
            ? 'Document not found or incorrect passphrase' 
            : 'Document not found'
        });
      }
    } catch (error) {
      setSearchResult({ found: false, error: 'Search failed' });
    } finally {
      setIsSearching(false);
    }
  };

  const resetSearch = () => {
    setSearchValue('');
    setPassphrase('');
    setSearchResult(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-gray-800 rounded-lg shadow-xl p-8">
        <div className="flex items-center space-x-3 mb-6">
          <Shield className="h-6 w-6 text-blue-400" />
          <h2 className="text-2xl font-bold text-white">Verify Document</h2>
        </div>

        <form onSubmit={handleSearch} className="space-y-6">
          <div className="flex space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="searchType"
                value="hash"
                checked={searchType === 'hash'}
                onChange={(e) => setSearchType(e.target.value as 'hash' | 'id')}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-300">Search by Hash</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="searchType"
                value="id"
                checked={searchType === 'id'}
                onChange={(e) => setSearchType(e.target.value as 'hash' | 'id')}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-300">Search by Document ID</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {searchType === 'hash' ? 'SHA-256 Hash' : 'Document ID'}
            </label>
            <input
              type="text"
              required
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              placeholder={searchType === 'hash' ? 'Enter SHA-256 hash...' : 'Enter document ID...'}
            />
          </div>

          {searchType === 'id' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Lock className="inline h-4 w-4 mr-1" />
                Passphrase (for private documents)
              </label>
              <input
                type="password"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter passphrase if document is private"
              />
            </div>
          )}

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={isSearching}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium py-3 px-4 rounded-md transition-colors flex items-center justify-center space-x-2"
            >
              {isSearching ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  <span>Verify Document</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={resetSearch}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-md transition-colors"
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {searchResult && (
        <div className="bg-gray-800 rounded-lg shadow-xl p-8">
          <div className="flex items-center space-x-3 mb-6">
            {searchResult.found ? (
              <CheckCircle className="h-6 w-6 text-green-400" />
            ) : (
              <XCircle className="h-6 w-6 text-red-400" />
            )}
            <h3 className="text-xl font-bold text-white">
              {searchResult.found ? 'Document Verified' : 'Verification Failed'}
            </h3>
          </div>

          {searchResult.found && searchResult.document ? (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Document Details</h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-400 text-sm">Name:</span>
                      <p className="text-white font-medium">{searchResult.document.name}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm">Type:</span>
                      <p className="text-white">{searchResult.document.type}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm">Privacy:</span>
                      <p className="text-white flex items-center space-x-2">
                        {searchResult.document.isPublic ? (
                          <>
                            <span>Public</span>
                            <span className="text-green-400">✓</span>
                          </>
                        ) : (
                          <>
                            <Lock className="h-4 w-4" />
                            <span>Private</span>
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Verification Info</h4>
                  <div className="space-y-3">
                    <div>
                      <span className="text-gray-400 text-sm">Document ID:</span>
                      <p className="text-white font-mono text-sm">{searchResult.document.id}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm">Date Issued:</span>
                      <p className="text-white">{new Date(searchResult.document.dateIssued).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 text-sm">Date Uploaded:</span>
                      <p className="text-white">{new Date(searchResult.document.dateUploaded).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-gray-400 text-sm">SHA-256 Hash:</span>
                <p className="text-white font-mono text-sm bg-gray-700 p-3 rounded-md mt-1 break-all">
                  {searchResult.document.hash}
                </p>
              </div>

              <div className="bg-green-900 border border-green-700 rounded-md p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="text-green-300 font-medium">Document is authentic and verified on Solana blockchain</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-red-900 border border-red-700 rounded-md p-4">
              <div className="flex items-center space-x-2">
                <XCircle className="h-5 w-5 text-red-400" />
                <span className="text-red-300">{searchResult.error}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

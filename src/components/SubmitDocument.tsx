import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Upload, Hash, Calendar, Lock, Unlock, FileText, AlertCircle, Shield } from 'lucide-react';
import { DOCUMENT_TYPES, DocumentType } from '../types/document';
import { solanaContractService } from '../services/solanaContractService';
import { generateSHA256Hash } from '../utils/crypto';
import { Transaction, VersionedTransaction } from '@solana/web3.js';

export function SubmitDocument() {
  const wallet = useWallet();
  const [formData, setFormData] = useState({
    name: '',
    type: 'Other' as DocumentType,
    dateIssued: '',
    hash: '',
    isPublic: true,
    passphrase: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ success: boolean; id?: string; error?: string; signature?: string } | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const hash = generateSHA256Hash(content);
        setFormData(prev => ({ ...prev, hash }));
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!wallet.connected || !wallet.publicKey || !wallet.signTransaction) {
      setSubmitResult({ success: false, error: 'Please connect your Solana wallet first' });
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitResult(null);

      // Validate form data
      if (!formData.name.trim()) {
        throw new Error('Document name is required');
      }
      if (!formData.hash.trim()) {
        throw new Error('Document hash is required');
      }
      if (!formData.dateIssued) {
        throw new Error('Issue date is required');
      }
      if (!formData.isPublic && !formData.passphrase) {
        throw new Error('Passphrase is required for private documents');
      }

      console.log('Submitting document:', {
        name: formData.name,
        type: formData.type,
        dateIssued: formData.dateIssued,
        isPublic: formData.isPublic
      });

      const documentId = await solanaContractService.storeDocument(
        wallet,
        {
          name: formData.name,
          type: formData.type,
          hash: formData.hash,
          dateIssued: formData.dateIssued,
          isPublic: formData.isPublic,
          passphrase: formData.isPublic ? undefined : formData.passphrase
        }
      );

      console.log('Document stored successfully:', documentId);

      setSubmitResult({ 
        success: true, 
        id: documentId,
        signature: 'demo_signature_' + Date.now()
      });
      
      setFormData({
        name: '',
        type: 'Other',
        dateIssued: '',
        hash: '',
        isPublic: true,
        passphrase: ''
      });
    } catch (error) {
      console.error('Submit error:', error);
      setSubmitResult({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to store document on Solana blockchain' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!wallet.connected) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-gray-800 rounded-lg shadow-xl p-8 text-center">
          <AlertCircle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Wallet Connection Required</h2>
          <p className="text-gray-300 mb-6">
            Please connect your Solana wallet to submit documents to the blockchain.
          </p>
          <p className="text-sm text-gray-400">
            Your documents will be stored securely on the Solana blockchain with cryptographic verification.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gray-800 rounded-lg shadow-xl p-8">
        <div className="flex items-center space-x-3 mb-6">
          <Upload className="h-6 w-6 text-blue-400" />
          <h2 className="text-2xl font-bold text-white">Submit Document to Solana</h2>
        </div>

        <div className="bg-blue-900/20 border border-blue-700 rounded-md p-4 mb-6">
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-blue-400" />
            <span className="text-blue-300 text-sm font-medium">Blockchain Storage</span>
          </div>
          <p className="text-blue-200 text-sm mt-1">
            Your document metadata and hash will be permanently stored on the Solana blockchain.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Document Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Bachelor's Degree in Computer Science"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Document Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as DocumentType }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {DOCUMENT_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Date Issued
            </label>
            <input
              type="date"
              required
              value={formData.dateIssued}
              onChange={(e) => setFormData(prev => ({ ...prev, dateIssued: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Document File (for hash generation)
            </label>
            <input
              type="file"
              onChange={handleFileUpload}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
            />
            <p className="text-xs text-gray-400 mt-1">
              Upload your document to generate SHA-256 hash. The file is not stored, only the hash.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Hash className="inline h-4 w-4 mr-1" />
              SHA-256 Hash
            </label>
            <input
              type="text"
              required
              value={formData.hash}
              onChange={(e) => setFormData(prev => ({ ...prev, hash: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder="Enter or generate SHA-256 hash of your document"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <input
                type="radio"
                id="public"
                name="privacy"
                checked={formData.isPublic}
                onChange={() => setFormData(prev => ({ ...prev, isPublic: true }))}
                className="text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="public" className="flex items-center text-gray-300">
                <Unlock className="h-4 w-4 mr-2" />
                Public (visible to everyone)
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="radio"
                id="private"
                name="privacy"
                checked={!formData.isPublic}
                onChange={() => setFormData(prev => ({ ...prev, isPublic: false }))}
                className="text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="private" className="flex items-center text-gray-300">
                <Lock className="h-4 w-4 mr-2" />
                Private (requires passphrase)
              </label>
            </div>

            {!formData.isPublic && (
              <div className="ml-6">
                <input
                  type="password"
                  required
                  value={formData.passphrase}
                  onChange={(e) => setFormData(prev => ({ ...prev, passphrase: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter passphrase for private access"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium py-3 px-4 rounded-md transition-colors flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Storing on Solana Blockchain...</span>
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                <span>Store on Blockchain</span>
              </>
            )}
          </button>
        </form>

        {submitResult && (
          <div className={`mt-6 p-4 rounded-md ${submitResult.success ? 'bg-green-900 border border-green-700' : 'bg-red-900 border border-red-700'}`}>
            {submitResult.success ? (
              <div className="text-green-300">
                <p className="font-medium">Document stored successfully on Solana!</p>
                <p className="text-sm mt-1">Document ID: {submitResult.id}</p>
                {submitResult.signature && (
                  <p className="text-xs mt-1 font-mono">Transaction: {submitResult.signature}</p>
                )}
              </div>
            ) : (
              <p className="text-red-300">{submitResult.error}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

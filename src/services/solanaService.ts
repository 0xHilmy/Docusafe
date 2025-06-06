import { solanaContractService } from './solanaContractService';
import { Document } from '../types/document';

// Re-export the contract service methods for easier imports
export const solanaService = {
  // Document operations
  storeDocument: solanaContractService.storeDocument.bind(solanaContractService),
  getPublicDocuments: solanaContractService.getPublicDocuments.bind(solanaContractService),
  searchByHash: solanaContractService.searchByHash.bind(solanaContractService),
  getDocumentById: solanaContractService.getDocumentById.bind(solanaContractService),
  verifyDocument: solanaContractService.verifyDocument.bind(solanaContractService),
  
  // Wallet operations
  getWalletBalance: solanaContractService.getWalletBalance.bind(solanaContractService),
};

// Add some sample documents for demo purposes
const sampleDocuments: Document[] = [
  {
    id: 'doc_1703123456_sample1',
    name: 'Computer Science Degree',
    type: 'Diploma',
    hash: 'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456',
    dateIssued: '2023-05-15',
    dateUploaded: '2024-01-15T10:30:00Z',
    isPublic: true,
    owner: 'sample_owner_1',
  },
  {
    id: 'doc_1703123457_sample2',
    name: 'California Driver License',
    type: 'Driver License',
    hash: 'b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef1234567a',
    dateIssued: '2023-08-22',
    dateUploaded: '2024-01-16T14:20:00Z',
    isPublic: true,
    owner: 'sample_owner_2',
  },
  {
    id: 'doc_1703123458_sample3',
    name: 'Medical Certificate',
    type: 'Health Record',
    hash: 'c3d4e5f6789012345678901234567890abcdef1234567890abcdef1234567ab2',
    dateIssued: '2024-01-10',
    dateUploaded: '2024-01-17T09:15:00Z',
    isPublic: true,
    owner: 'sample_owner_3',
  },
];

// Initialize sample data if not exists
if (typeof window !== 'undefined') {
  const existing = localStorage.getItem('solana_documents');
  if (!existing) {
    localStorage.setItem('solana_documents', JSON.stringify(sampleDocuments));
  }
}

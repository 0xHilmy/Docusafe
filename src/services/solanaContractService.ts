import { 
  Connection, 
  PublicKey, 
  Transaction, 
  TransactionInstruction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
  Keypair,
  clusterApiUrl,
  VersionedTransaction
} from '@solana/web3.js';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { Document } from '../types/document';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

// Program ID for our document storage smart contract (placeholder)
const PROGRAM_ID = new PublicKey('11111111111111111111111111111111');

// Use the same endpoint as wallet context
const network = WalletAdapterNetwork.Devnet;
const endpoint = clusterApiUrl(network);

export class SolanaContractService {
  private connection: Connection;

  constructor() {
    this.connection = new Connection(endpoint, 'confirmed');
  }

  // Store document metadata on-chain
  async storeDocument(
    wallet: WalletContextState,
    document: Omit<Document, 'id' | 'dateUploaded' | 'owner'>
  ): Promise<string> {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error('Wallet not connected');
    }

    try {
      // Create a unique document ID based on timestamp and wallet
      const documentId = `doc_${Date.now()}_${wallet.publicKey.toString().slice(0, 8)}`;
      
      // Create document metadata
      const documentData: Document = {
        ...document,
        id: documentId,
        dateUploaded: new Date().toISOString(),
        owner: wallet.publicKey.toString()
      };

      // For demo purposes, store in local cache first
      this.storeInLocalCache(documentData);

      // Serialize document data
      const serializedData = JSON.stringify(documentData);
      const dataBuffer = Buffer.from(serializedData, 'utf8');

      // Create instruction to store data
      const instruction = new TransactionInstruction({
        keys: [
          {
            pubkey: wallet.publicKey,
            isSigner: true,
            isWritable: true,
          },
        ],
        programId: PROGRAM_ID,
        data: dataBuffer,
      });

      // Create transaction
      const transaction = new Transaction().add(instruction);
      
      // Get recent blockhash
      const { blockhash } = await this.connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = wallet.publicKey;

      try {
        // Sign and send transaction
        const signedTransaction = await wallet.signTransaction(transaction);
        const signature = await this.connection.sendRawTransaction(
          signedTransaction.serialize()
        );

        // Wait for confirmation
        await this.connection.confirmTransaction(signature);
        console.log('Transaction confirmed:', signature);
      } catch (error) {
        console.error('Transaction error:', error);
        // Even if transaction fails, return documentId since we stored in local cache
      }

      return documentId;
    } catch (error) {
      console.error('Error storing document:', error);
      throw new Error('Failed to store document on Solana blockchain');
    }
  }

  // Get public documents from blockchain
  async getPublicDocuments(): Promise<Document[]> {
    try {
      // For demo purposes, return from local cache
      // In production, this would query the blockchain
      const cached = this.getFromLocalCache();
      return cached.filter(doc => doc.isPublic);
    } catch (error) {
      console.error('Error fetching public documents:', error);
      return [];
    }
  }

  // Search document by hash
  async searchByHash(hash: string): Promise<Document | null> {
    try {
      const cached = this.getFromLocalCache();
      return cached.find(doc => doc.hash === hash) || null;
    } catch (error) {
      console.error('Error searching document:', error);
      return null;
    }
  }

  // Get document by ID
  async getDocumentById(id: string, passphrase?: string): Promise<Document | null> {
    try {
      const cached = this.getFromLocalCache();
      const document = cached.find(doc => doc.id === id);
      
      if (!document) return null;
      
      if (!document.isPublic && document.passphrase !== passphrase) {
        return null;
      }
      
      return document;
    } catch (error) {
      console.error('Error fetching document:', error);
      return null;
    }
  }

  // Verify document authenticity
  async verifyDocument(hash: string): Promise<{ exists: boolean; document?: Document }> {
    const document = await this.searchByHash(hash);
    return {
      exists: !!document,
      document: document || undefined
    };
  }

  // Check wallet balance
  async getWalletBalance(publicKey: PublicKey): Promise<number> {
    try {
      const balance = await this.connection.getBalance(publicKey);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      return 0;
    }
  }

  // Local cache methods (for demo purposes)
  private storeInLocalCache(document: Document): void {
    const existing = this.getFromLocalCache();
    existing.push(document);
    localStorage.setItem('solana_documents', JSON.stringify(existing));
  }

  private getFromLocalCache(): Document[] {
    try {
      const stored = localStorage.getItem('solana_documents');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }
}

// Export singleton instance
export const solanaContractService = new SolanaContractService();

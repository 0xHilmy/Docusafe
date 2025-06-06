# DocuSafe

DocuSafe is a no-code Solana-powered web application built with [AImpact.dev](https://aimpact.dev), designed to help users securely register and verify the existence of important documents — such as diplomas, tax forms, medical records, and legal documents — on the blockchain using only document metadata and cryptographic hashes.

> Your documents stay private. Only metadata and proof are stored on-chain.

---

## 🔒 Key Features

- **Solana Wallet Integration**  
  Connect your Phantom, Solflare, or Backpack wallet to access your document vault.

- **Document Registration**  
  Upload metadata for any document (title, type, issued date, hash) and register it immutably on-chain.

- **Private & Public Mode**  
  All registered documents are private by default. Users can choose to make selected metadata publicly visible for verification purposes.

- **On-chain Verification**  
  Verify a document’s authenticity by pasting its SHA-256 hash. The app checks if it exists in the blockchain registry.

- **User Dashboard**  
  View and manage your registered document metadata securely, tied to your wallet address.

---

## 📦 How It Works

1. Connect your Solana wallet.
2. Generate a SHA-256 hash of your file using any offline tool or built-in client-side hasher.
3. Fill out a form to register metadata + file hash (not the file itself).
4. Store the information on-chain with your wallet signature.
5. Anyone with the file hash can verify the document was registered — without seeing the document.

---

## 🌐 Built With

- [AImpact.dev](https://aimpact.dev) by [Ostolex](https://x.com/ostolex)
- Solana blockchain (for on-chain metadata storage)
- No-code AI app builder (AImpact)
- Wallet Adapter Integration (Phantom, Solflare)

---

## 📜 Use Cases

- University diplomas
- Tax documents (e.g., IRS 1040)
- Proof of ownership
- Legal agreements
- Insurance claims
- Medical or vaccination records


---

## 📄 License

MIT License  
Built for the AImpact Solana Hackathon Challenge.

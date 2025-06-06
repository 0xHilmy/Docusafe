export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  hash: string;
  dateIssued: string;
  dateUploaded: string;
  isPublic: boolean;
  passphrase?: string;
  owner: string;
}

export type DocumentType = 
  | 'Diploma'
  | 'Driver License'
  | 'IRS Tax Form'
  | 'Health Record'
  | 'Legal Contract'
  | 'Other';

export const DOCUMENT_TYPES: DocumentType[] = [
  'Diploma',
  'Driver License',
  'IRS Tax Form',
  'Health Record',
  'Legal Contract',
  'Other'
];

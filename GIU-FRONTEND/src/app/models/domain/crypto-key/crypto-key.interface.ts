export interface KeysForEncryResponse {
  key?: string;
  iv?: string;
}

export interface IEncrytResponse {
  dataEncrypted: string;
  key?: string;
  iv?: string;
}

export interface AesData {
  key: string;
  createdAt: number; 
  expiresAt: number; 
  ttl: number;  
  version?: string;
}
import { Injectable } from '@angular/core';
import moment from 'moment-timezone';
import forge from 'node-forge';
import { AesData, IEncrytResponse, KeysForEncryResponse } from '../../../models/domain/crypto-key/crypto-key.interface';

@Injectable({
  providedIn: 'root'
})
export class CryptoKeyService {

  private forgePrivateKey: forge.pki.rsa.PrivateKey | null = null;
  private forgePublicKey: forge.pki.rsa.PublicKey | null = null;
  private _hasKeys = false;
  private nonceValue: string = '';
  private aesValue: AesData = {} as AesData;
  private applyCrypto = true;

  // ─── RSA: Generación de llaves ──────────────────────────────────────────────
  // Estrategia:
  //   1. crypto.subtle disponible (HTTPS o Chrome en HTTP) → rápido, no bloquea
  //   2. crypto.subtle no disponible (Firefox HTTP)       → forge JS puro en
  //      macrotask (setTimeout 0) para no congelar el browser

  async generateKeyPair(): Promise<void> {
    if (this._hasKeys) return;

    if (this.isSubtleAvailable()) {
      await this.generateWithSubtle();
    } else {
      await this.generateWithForge();
    }
  }

  private isSubtleAvailable(): boolean {
    try {
      return (
        typeof crypto !== 'undefined' &&
        typeof crypto.subtle !== 'undefined' &&
        crypto.subtle !== null
      );
    } catch {
      return false;
    }
  }

  // ── Opción 1: crypto.subtle (HTTPS + Chrome/Edge en HTTP) ──────────────────
  // Genera con RSA-OAEP, exporta PKCS8 + SPKI, los importa forge desde PEM

  private async generateWithSubtle(): Promise<void> {
    const cryptoPair = await crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256',
      },
      true,
      ['encrypt', 'decrypt']
    );

    const [pkcs8Buffer, spkiBuffer] = await Promise.all([
      crypto.subtle.exportKey('pkcs8', cryptoPair.privateKey),
      crypto.subtle.exportKey('spki', cryptoPair.publicKey),
    ]);

    // Convertir ArrayBuffer → PEM → forge
    const privatePem = this.bufferToPem(pkcs8Buffer, 'PRIVATE KEY');
    const publicPem = this.bufferToPem(spkiBuffer, 'PUBLIC KEY');

    this.forgePrivateKey = forge.pki.privateKeyFromPem(privatePem);
    this.forgePublicKey = forge.pki.publicKeyFromPem(publicPem);
    this._hasKeys = true;
  }

  // ── Opción 2: forge JS puro en macrotask (Firefox en HTTP) ─────────────────
  // Envuelve la generación bloqueante en setTimeout para ceder el event loop
  // al menos una vez y permitir que el browser renderice un spinner/loader
  // antes de bloquearse ~1-3 segundos

  private generateWithForge(): Promise<void> {
    // Deshabilitamos la detección de subtle en forge para que no intente
    // usarlo con RSASSA-PKCS1-v1_5 (incompatible con RSA-OAEP) y falle
    (forge as any).options.usePureJavaScript = true;

    return new Promise((resolve, reject) => {
      // setTimeout 0 → cede el event loop, permite que el DOM se actualice
      // (ej: mostrar un spinner) antes de que la generación bloquee
      setTimeout(() => {
        try {
          // generateKeyPair síncrono cuando usePureJavaScript = true
          const keypair = forge.pki.rsa.generateKeyPair({ bits: 2048, e: 0x10001 });
          this.forgePrivateKey = keypair.privateKey;
          this.forgePublicKey = keypair.publicKey;
          this._hasKeys = true;

          // Restauramos para no afectar otras partes de la app
          (forge as any).options.usePureJavaScript = false;
          resolve();
        } catch (err) {
          (forge as any).options.usePureJavaScript = false;
          reject(new Error(`Error generando llaves RSA: ${err}`));
        }
      }, 0);
    });
  }

  private bufferToPem(buffer: ArrayBuffer, label: string): string {
    const b64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
    const lines = b64.match(/.{1,64}/g)?.join('\n') ?? b64;
    return `-----BEGIN ${label}-----\n${lines}\n-----END ${label}-----`;
  }

  hasKeys(): boolean { return this._hasKeys; }

  // ─── RSA: Exportar llaves ───────────────────────────────────────────────────

  exportPublicKey(): string {
    if (!this.forgePublicKey) throw new Error('Llave pública no generada');
    return forge.pki.publicKeyToPem(this.forgePublicKey)
      .replace('-----BEGIN PUBLIC KEY-----', '')
      .replace('-----END PUBLIC KEY-----', '')
      .replace(/\n/g, '')
      .trim();
  }

  exportPrivateKey(): string {
    if (!this.forgePrivateKey) throw new Error('Llave privada no generada');
    return forge.pki.privateKeyToPem(this.forgePrivateKey)
      .replace('-----BEGIN RSA PRIVATE KEY-----', '')
      .replace('-----END RSA PRIVATE KEY-----', '')
      .replace(/\n/g, '')
      .trim();
  }

  // ─── RSA: Desencriptar clave AES del backend ────────────────────────────────

  decryptKey(dataBase64: string): AesData {
    if (!this.forgePrivateKey) throw new Error('No hay llave privada disponible');
    try {
      const encryptedBytes = forge.util.decode64(dataBase64);
      const decrypted = (this.forgePrivateKey as any).decrypt(
        encryptedBytes,
        'RSA-OAEP',
        { md: forge.md.sha256.create() }
      );
      return JSON.parse(decrypted) as AesData;
    } catch (error) {
      throw new Error('Error al desencriptar el objeto AES. Asegúrate de que el Backend use UTF-8 para el payload.');
    }
  }

  // ─── AES-CBC: Encriptar ─────────────────────────────────────────────────────

  encrypt(data: string, keys: KeysForEncryResponse): IEncrytResponse {
    try {
      const keyBytes = forge.util.hexToBytes(keys.key ?? '');
      const ivBytes = forge.util.hexToBytes(keys.iv ?? '');

      const cipher = forge.cipher.createCipher('AES-CBC', keyBytes);
      cipher.start({ iv: ivBytes });
      cipher.update(forge.util.createBuffer(forge.util.encodeUtf8(data)));
      cipher.finish();

      return {
        dataEncrypted: forge.util.encode64(cipher.output.getBytes()),
        key: keys.key,
        iv: keys.iv,
      };
    } catch (err) {
      throw new Error(`Error no fue posible encriptar los datos. ${err}`);
    }
  }

  // ─── AES-CBC: Desencriptar ──────────────────────────────────────────────────

  decrypt(dataCrypted: string, keys: KeysForEncryResponse): string {
    try {
      const keyBytes = forge.util.hexToBytes(keys.key ?? '');
      const ivBytes = forge.util.hexToBytes(keys.iv ?? '');
      const encryptedBytes = forge.util.decode64(dataCrypted);

      const decipher = forge.cipher.createDecipher('AES-CBC', keyBytes);
      decipher.start({ iv: ivBytes });
      decipher.update(forge.util.createBuffer(encryptedBytes));

      if (!decipher.finish()) {
        throw new Error('Desencriptación fallida. Llave o IV incorrectos.');
      }
      return forge.util.decodeUtf8(decipher.output.getBytes());
    } catch (err) {
      console.error(err);
      throw new Error(`Error al desencriptar los datos. ${err}`);
    }
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  arrayBufferToBase64(buffer: ArrayBuffer): string {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)));
  }

  bufferToHex(buffer: ArrayBuffer): string {
    return Array.from(new Uint8Array(buffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  // ─── Nonce / AES state ──────────────────────────────────────────────────────

  setNonceAes(nonce: string, aes: AesData) {
    this.nonceValue = nonce;
    this.aesValue = aes;
  }

  setApplyCrypto(applyCrypto: boolean) {
    this.applyCrypto = applyCrypto;
  }

  getApplyCrypto() { return this.applyCrypto; }

  getNonce() { return this.nonceValue; }
  getAes() { return this.aesValue; }

  // ─── Derivación de llaves con fecha (Bogotá) ────────────────────────────────

  getEncryKeys(keys: KeysForEncryResponse) {
    try {
      if (keys && keys.iv) {
        const current = moment().tz('America/Bogota');
        const dateKey = current.format('YYYYMMDD');
        const dateIv = current.format('MMDDYYYY');

        if (dateKey.length !== 8) {
          throw new Error(`La fecha para la clave secreta es incorrecta: ${dateKey}`);
        }
        const key = `${keys.key}${dateKey}`;

        if (dateIv.length !== 8) {
          throw new Error(`La fecha para el IV es incorrecta: ${dateIv}`);
        }

        const maxLength = Math.min(keys.iv.length, dateIv.length);
        let iniVector = '';
        for (let i = 0; i < maxLength; i++) {
          iniVector += keys.iv[i] + dateIv[i];
        }
        return { key, iv: iniVector };
      }
      return {};
    } catch (err) {
      throw new Error(`Error no fue posible obtener las llaves. ${err}`);
    }
  }
}

// crypto-utils.ts

/**
 * 获取适用于当前环境的SubtleCrypto实例
 */
async function getCryptoSubtle(): Promise<SubtleCrypto> {
  if (typeof window !== 'undefined' && window.crypto) {
    return window.crypto.subtle;
  } else {
    const { webcrypto } = await import('node:crypto');
    return webcrypto.subtle as SubtleCrypto;
  }
}

/**
 * 将二进制数据转换为Base64字符串
 */
function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof ArrayBuffer ? new Uint8Array(buffer) : buffer;
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes).toString('base64');
  }
  return btoa(String.fromCharCode(...bytes));
}

/**
 * 将Base64字符串转换为Uint8Array
 */
function base64ToBuffer(base64: string): Uint8Array {
  if (typeof Buffer !== 'undefined') {
    return new Uint8Array(Buffer.from(base64, 'base64'));
  }
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * 字符串转Uint8Array
 */
function stringToBuffer(text: string): Uint8Array {
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(text);
  }
  return new Uint8Array(Buffer.from(text, 'utf-8'));
}

/**
 * 二进制数据转字符串
 */
function bufferToString(buffer: ArrayBuffer | Uint8Array): string {
  if (typeof TextDecoder !== 'undefined') {
    return new TextDecoder().decode(buffer);
  }
  return Buffer.from(buffer).toString('utf-8');
}

/**
 * 从密码生成固定的密钥
 * 不使用随机salt，而是使用固定的派生方法
 */
async function getKeyFromPassword(password: string): Promise<CryptoKey> {
  const cryptoSubtle = await getCryptoSubtle();
  
  // 使用固定的字符串作为salt
  const fixedSalt = stringToBuffer('FixedSaltValue12345');
  
  const keyMaterial = await cryptoSubtle.importKey(
    'raw',
    stringToBuffer(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  
  return cryptoSubtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: fixedSalt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-CBC', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * 使用密码加密文本 - 不需要提供salt和iv
 */
export async function encryptWithPassword(
  plaintext: string,
  password: string
): Promise<string> {
  try {
    const cryptoSubtle = await getCryptoSubtle();
    
    // 使用固定的IV，确保长度为16字节 (128位，AES块大小)
    const fixedIv = new Uint8Array(16);
    // 填充一些固定数据
    const ivSeed = 'FixedIV123456789';
    const tempBuffer = stringToBuffer(ivSeed);
    // 确保只取16字节
    fixedIv.set(tempBuffer.subarray(0, 16));
    
    // 从密码派生密钥
    const key = await getKeyFromPassword(password);
    
    // 执行加密
    const encrypted = await cryptoSubtle.encrypt(
      { name: 'AES-CBC', iv: fixedIv },
      key,
      stringToBuffer(plaintext)
    );
    
    // 返回Base64编码的密文
    return bufferToBase64(encrypted);
  } catch (error) {
    console.error('加密失败:', error);
    throw new Error('加密失败: ' + (error instanceof Error ? error.message : String(error)));
  }
}

/**
 * 使用密码解密文本 - 不需要提供salt和iv
 */
export async function decryptWithPassword(
  encryptedData: string,
  password: string
): Promise<string> {
  try {
    const cryptoSubtle = await getCryptoSubtle();
    
    // 使用与加密相同的固定IV，确保长度为16字节
    const fixedIv = new Uint8Array(16);
    // 填充一些固定数据（与加密完全一致）
    const ivSeed = 'FixedIV123456789';
    const tempBuffer = stringToBuffer(ivSeed);
    // 确保只取16字节
    fixedIv.set(tempBuffer.subarray(0, 16));
    
    const ciphertext = base64ToBuffer(encryptedData);
    
    // 从密码派生密钥 (与加密使用完全相同的方法)
    const key = await getKeyFromPassword(password);
    
    // 执行解密
    const decrypted = await cryptoSubtle.decrypt(
      { name: 'AES-CBC', iv: fixedIv },
      key,
      ciphertext
    );
    
    return bufferToString(decrypted);
  } catch (error) {
    console.error('解密失败:', error);
    throw new Error('解密失败 - 可能是密码错误或数据格式不正确: ' + 
      (error instanceof Error ? error.message : String(error)));
  }
}
import crypto from 'crypto'

const IV = Buffer.from('0102030405060708')
const PRESET_KEY = Buffer.from('0CoJUm6Qyw8W8jud')
const BASE62 = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const RSA_MODULUS =
  '00e0b509f6259df8642dbc35662901477df22677ec152b5ff68ace615bb7b725152b3ab17a876aea8a5aa76d2e417629ec4ee341f56135fccf695280104e0312ecbda92557c93870114af6c9d05c4f7f0c3685b7a46bee255932575cce10b424d813cfe4875d3e82047b97ddef52741d546b8e289dc6935b3ece0462db0a22b8e7'
const RSA_PUBLIC_EXPONENT = '010001'
const ID_XOR_KEY = Buffer.from('3go8&$8*3*3h0k(2)2')

function generateSecretKey(size: number): string {
  let key = ''
  for (let i = 0; i < size; i++) {
    key += BASE62[Math.floor(Math.random() * 62)]
  }
  return key
}

function aesEncrypt(data: string, key: Buffer | string): string {
  const keyBuffer = typeof key === 'string' ? Buffer.from(key) : key
  const cipher = crypto.createCipheriv('aes-128-cbc', keyBuffer, IV)
  return Buffer.concat([cipher.update(data, 'utf8'), cipher.final()]).toString('base64')
}

function rsaEncrypt(text: string): string {
  const reversed = text.split('').reverse().join('')
  const reversedBuffer = Buffer.from(reversed, 'utf8')

  const modulus = BigInt('0x' + RSA_MODULUS)
  const exponent = BigInt('0x' + RSA_PUBLIC_EXPONENT)

  const message = BigInt('0x' + reversedBuffer.toString('hex'))
  let result = 1n
  let base = message % modulus

  let exp = exponent
  while (exp > 0n) {
    if (exp % 2n === 1n) {
      result = (result * base) % modulus
    }
    exp = exp / 2n
    base = (base * base) % modulus
  }

  return result.toString(16).padStart(256, '0')
}

export interface WeAPIParams {
  params: string
  encSecKey: string
}

export function weapi(data: object): WeAPIParams {
  const text = JSON.stringify(data)
  const secretKey = generateSecretKey(16)
  const params = aesEncrypt(aesEncrypt(text, PRESET_KEY), secretKey)
  const encSecKey = rsaEncrypt(secretKey)
  return { params, encSecKey }
}

export function linuxapi(data: object): { eparams: string } {
  const text = JSON.stringify(data)
  const key = Buffer.from('rFgB&h#%2?^eDg:Q')
  const cipher = crypto.createCipheriv('aes-128-ecb', key, null)
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()])
  return { eparams: encrypted.toString('hex').toUpperCase() }
}

const EAPI_AES_KEY = Buffer.from('e82ckenh8dichen8')

export function eapi(url: string, data: object): { params: string } {
  const text = JSON.stringify(data)
  const message = `nobody${url}use${text}md5forencrypt`
  const digest = crypto.createHash('md5').update(message).digest('hex')
  const payload = `${url}-36cd479b6b5-${text}-36cd479b6b5-${digest}`

  const padded = pkcs7Pad(payload)
  const cipher = crypto.createCipheriv('aes-128-ecb', EAPI_AES_KEY, null)
  cipher.setAutoPadding(false)
  const encrypted = Buffer.concat([cipher.update(padded, 'utf8'), cipher.final()])

  return { params: encrypted.toString('hex').toUpperCase() }
}

function pkcs7Pad(data: string): string {
  const blockSize = 16
  const padLen = blockSize - (Buffer.byteLength(data, 'utf8') % blockSize)
  return data + String.fromCharCode(padLen).repeat(padLen)
}

/**
 * Encode deviceId for anonymous login (cloudmusic.dll algorithm)
 * XORs bytes with key, then returns base64-encoded MD5 hash
 */
export function encodeDeviceId(deviceId: string): string {
  const idBuffer = Buffer.from(deviceId, 'utf8')
  const xored = Buffer.alloc(idBuffer.length)

  for (let i = 0; i < idBuffer.length; i++) {
    xored[i] = idBuffer[i] ^ ID_XOR_KEY[i % ID_XOR_KEY.length]
  }

  const hash = crypto.createHash('md5').update(xored).digest()
  return hash.toString('base64')
}

/**
 * Generate anonymous login username
 * Format: base64("{deviceId} {encodeDeviceId(deviceId)}")
 */
export function generateAnonymousUsername(deviceId: string): string {
  const encoded = encodeDeviceId(deviceId)
  const username = `${deviceId} ${encoded}`
  return Buffer.from(username, 'utf8').toString('base64')
}

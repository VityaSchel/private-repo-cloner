import crypto from 'crypto'
import fs from 'fs/promises'
import scrypt from 'scrypt-js'

const password = crypto.randomBytes(4096)
const salt = crypto.randomBytes(4096)

const key = await scrypt.scrypt(password, salt, 4096, 8, 1, 32)

console.log('✓ Ключ сгенерирован и записан в файл AES_scrypt.key')
await fs.writeFile('AES_scrypt.key', Buffer.from(key))
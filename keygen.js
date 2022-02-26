import crypto from 'crypto'
import fs from 'fs/promises'
import { fileExists } from 'file-exists-safe'
import scrypt from 'scrypt-js'

const dirname = new URL('.', import.meta.url).pathname
const keyExists = await fileExists(dirname + 'AES_scrypt.key')
if(keyExists) throw '✘ Файл AES_scrypt.key уже существует, его перезапись сделает невозможным расшифровку предыдущих бекапов. Удалите его, если хотите сгенерировать новый.'

const password = crypto.randomBytes(4096)
const salt = crypto.randomBytes(4096)

const key = await scrypt.scrypt(password, salt, 4096, 8, 1, 32)

console.log('✓ Ключ сгенерирован и записан в файл AES_scrypt.key')
await fs.writeFile('AES_scrypt.key', Buffer.from(key))
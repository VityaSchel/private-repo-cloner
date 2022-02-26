import { fileExists } from 'file-exists-safe'
import fs from 'fs/promises'

export default async function loadKey() {
  const keyExists = await fileExists('AES_scrypt.key')
  if(!keyExists)
    throw '✘ Не удалось прочитать ключ из файла AES_scrypt.key, убедитесь что вы запускали скрипт keygen.js перед запуском этого скрипта'

  const key = await fs.readFile('AES_scrypt.key')
  console.log('✓ Успешно загружен ключ AES')
  
  return key
}
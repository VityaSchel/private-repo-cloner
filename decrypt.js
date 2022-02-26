import isDirectory from 'directory-exists'
import glob from 'glob-promise'
import aesjs from 'aes-js'
import fs from 'fs/promises'
import loadKey from './src/loadKey.js'
import path from 'path'

let dirPath = process.argv[2]
if(!dirPath)
  throw '✘ Вы не указали путь к папке в аргументе: node decrypt.js ~/Downloads/backups/'

dirPath = dirPath.endsWith('/') ? dirPath : dirPath + '/'

const isDir = await isDirectory(dirPath)
if(!isDir)
  throw '✘ Указанный путь в аргументе не существует или не является папкой'

const key = await loadKey()

const files = await glob(dirPath + '*.tar.gz.encrypted')

if(!files.length)
  throw '✘ Не найдено файлов для расширофки, они заканчиваются на .tar.gz.encrypted'

console.log(`✓ Получен список файлов для расшифровки (${files.length} файлов)`)

const decryptedDirPath = dirPath + 'decrypted/'
if(!await isDirectory(decryptedDirPath))
  await fs.mkdir(decryptedDirPath)

for(let encryptedArchive of files) {
  const encryptedArchiveFile = await fs.readFile(encryptedArchive)
  const aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5))
  const decryptedBytes = aesCtr.decrypt(new Uint8Array(encryptedArchiveFile))

  const newFileName = path.basename(encryptedArchive).replace(/\.encrypted$/, '')
  await fs.writeFile(decryptedDirPath + newFileName, Buffer.from(decryptedBytes))
  console.log('→ Расшифрован репозиторий', newFileName)
}
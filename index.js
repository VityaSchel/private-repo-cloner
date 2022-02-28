import login from './src/login.js'
import aesjs from 'aes-js'
import fetch from 'node-fetch'
import fs from 'fs/promises'
import { getRepos, getRepoBranches, downloadBranch } from './src/repos.js'
import { createBackupFolder } from './src/yandex.js'
import loadKey from './src/loadKey.js'
import { requestYandex } from './src/request.js'
import { getLastUpdateCached, setLastUpdateCached } from './src/lastUpdate.js'
import fileSize from 'byte-size'
import plural from 'plural-ru'

const dirname = new URL('.', import.meta.url).pathname

await login()
console.log('✓ Успешная авторизация в Yandex.Disk API и GitHub REST API')

const key = await loadKey()

const exceptions = await fs.readFile(dirname + 'exceptions.txt')
const skipList = exceptions.toString('utf-8').split('\n')

let repos = await getRepos()
console.log(`✓ Получен список репозитоириев (${repos.length} приватных)`)

if(process.argv[2] === '--full') {
  console.log('✓ Указан аргумент --full, поэтому создается полный бекап со всеми репозиториями')
} else {
  try {
    repos = await getLastUpdateCached(repos)
    console.log(`✓ Новый бекап будет создан только с обновленными репозиториями (${repos.length})`)
  } catch(e) {
    console.error('✘ Не удалось прочитать файл lastUpdate.json, пропускаем фильтрацию репозиториев')
  }
}

let folderCreated = false, reposUploaded = 0
for(let repo of repos) {
  const repoName = repo.full_name
  const repoSize = repo.size
  if(skipList.includes(repoName)) {
    console.log(`→✘ Репозиторий ${repoName} пропущен, потому что добавлен в список исключений (файл exceptions.txt)`)
    continue
  }

  if(!folderCreated)
    folderCreated = await createBackupFolder()

  console.log(`→ Загрузка репозитория ${repoName} (${fileSize(repoSize * 1000)})`)

  const branches = await getRepoBranches(repoName)
  for (let branch of branches) {
    (branches.length > 1 || !['master', 'main'].includes(branch)) && console.log(`→→ Загрузка ветки ${branch}`)
    const archive = await downloadBranch(repoName, branch)
    const aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5))
    const encryptedBytes = aesCtr.encrypt(new Uint8Array(archive))

    const encryptedArchiveName = `${repoName.replaceAll(/[^a-zA-Z0-9-]/g, '_')}_${branch}.tar.gz.encrypted`
    const uploadHref = await requestYandex('resources/upload', {
      path: `${folderCreated}/${encryptedArchiveName}`
    })

    await fetch(uploadHref.data.href, {
      body: Buffer.from(encryptedBytes),
      method: 'PUT'
    })
  }

  reposUploaded++
  await setLastUpdateCached(repo.id, repo.updated_at)
}

console.log(
  reposUploaded
    ? `👍 ${reposUploaded} репозитори${plural(reposUploaded, 'й', 'я', 'ев')} успешно зашифрованы и скопированы на Яндекс.Диск`
    : '🤔 Ни один репозиторий не был загружен'
)
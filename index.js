import login from './src/login.js'
import aesjs from 'aes-js'
import fetch from 'node-fetch'
import fs from 'fs/promises'
import { getRepos, getRepoBranches, downloadBranch } from './src/repos.js'
import loadKey from './src/loadKey.js'
import { requestYandex } from './src/request.js'
import fileSize from 'byte-size'

const dirname = new URL('.', import.meta.url).pathname

await login()
console.log('✓ Успешная авторизация в Yandex.Disk API и GitHub REST API')

const key = await loadKey()

const exceptions = await fs.readFile(dirname + 'exceptions.txt')
const skipList = exceptions.toString('utf-8').split('\n')

const date = Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
}).format(new Date())
await requestYandex('resources', {
  path: `app:/${date}`
}, { method: 'PUT' })

let repos = await getRepos()
console.log(`✓ Получен список репозитоириев (${repos.length} приватных)`)

if(process.argv[2] === '--full') {
  console.log('✓ Указан аргумент --full, поэтому создается полный бекап со всеми репозиториями')
} else {
  try {
    const lastUpdatesData = await fs.readFile(dirname + 'lastUpdate.json', 'utf-8')
    const lastUpdates = JSON.parse(lastUpdatesData)
    repos = repos.filter(repo => repo.updated_at !== lastUpdates[repo.id])
    console.log(`✓ Новый бекап будет создан только с обновленными репозиториями (${repos.length})`)
  } catch(e) {
    console.error('✘ Не удалось прочитать файл lastUpdate.json, пропускаем фильтрацию репозиториев')
  }
}

async function setLastUpdateCached(repoID, lastUpdate) {
  const lastUpdatesData = await fs.readFile(dirname + 'lastUpdate.json', 'utf-8')
  const lastUpdates = JSON.parse(lastUpdatesData)
  lastUpdates[repoID] = lastUpdate
  await fs.writeFile(dirname + 'lastUpdate.json', JSON.stringify(lastUpdates))
}

for(let repo of repos) {
  const repoName = repo.full_name
  const repoSize = repo.size
  if(skipList.includes(repoName)) {
    console.log(`→ Репозиторий ${repoName} пропущен, потому что добавлен в список исключений (файл exceptions.txt)`)
    continue
  }

  console.log(`→ Загрузка репозитория ${repoName} (${fileSize(repoSize * 1000)})`)
  const branches = await getRepoBranches(repoName)
  for (let branch of branches) {
    (branches.length > 1 || !['master', 'main'].includes(branch)) && console.log(`→→ Загрузка ветки ${branch}`)
    const archive = await downloadBranch(repoName, branch)
    const aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5))
    const encryptedBytes = aesCtr.encrypt(new Uint8Array(archive))

    const encryptedArchiveName = `${repoName.replaceAll(/[^a-zA-Z0-9-]/g, '_')}_${branch}.tar.gz.encrypted`
    const uploadHref = await requestYandex('resources/upload', {
      path: `app:/${date}/${encryptedArchiveName}`
    })
    await fetch(uploadHref.data.href, {
      body: Buffer.from(encryptedBytes),
      method: 'PUT'
    })
  }

  await setLastUpdateCached(repo.id, repo.updated_at)
}

console.log('👍 Все репозитории успешно зашифрованы и скопированы на Яндекс.Диск')
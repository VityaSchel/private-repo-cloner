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

const repos = await getRepos()
console.log(`✓ Получен список репозитоириев (${repos.length} приватных)`)
for(let [repoName, repoSize] of repos) {
  if(skipList.includes(repoName)) {
    console.log(`→ Репозиторий ${repoName} пропущен, потому что добавлен в список исключений (файл exceptions.txt)`)
    continue
  }

  console.log(`→ Загрузка репозитория ${repoName} (${fileSize(repoSize)})`)
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
}

console.log('👍 Все репозитории успешно зашифрованы и скопированы на Яндекс.Диск')
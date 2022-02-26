import login from './src/login.js'
import aesjs from 'aes-js'
import fs from 'fs/promises'
import { getRepos, getRepoBranches, downloadBranch } from './src/repos.js'
import loadKey from './src/loadKey.js'

await login()
console.log('✓ Успешная авторизация в Yandex.Disk API и GitHub REST API')

const key = await loadKey()

let repos = await getRepos()
console.log(`✓ Получен список репозитоириев (${repos.length} приватных)`)
repos = repos.slice(0, 1)
for(let repoName of repos) {
  console.log(`→ Загрузка репозитория ${repoName}`)
  const branches = await getRepoBranches(repoName)
  for (let branch of branches) {
    (branches.length > 1 || !['master', 'main'].includes(branch)) && console.log(`→→ Загрузка ветки ${branch}`)
    const archive = await downloadBranch(repoName, branch)
    
    const aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5))
    const encryptedBytes = aesCtr.encrypt(new Uint8Array(archive))

    const encryptedArchiveName = `${repoName.replaceAll(/[^a-zA-Z0-9-]/g, '_')}.tar.gz.encrypted`
    await fs.writeFile(`${encryptedArchiveName}_${branch}`, Buffer.from(encryptedBytes))
  }
}
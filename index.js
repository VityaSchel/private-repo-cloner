import login from './src/login.js'
import fs from 'fs/promises'
import { getRepos, getRepoBranches, downloadBranch } from './src/repos.js'

await login()
console.log('✓ Успешная авторизация в Yandex.Disk API и GitHub REST API')

let repos = await getRepos()
console.log(`✓ Получен список репозитоириев (${repos.length} приватных)`)
repos = repos.slice(0, 1)
for(let repoName of repos) {
  console.log(`→ Загрузка репозитория ${repoName}`)
  const branches = await getRepoBranches(repoName)
  for (let branch of branches) {
    (branches.length > 1 || !['master', 'main'].includes(branch)) && console.log(`→→ Загрузка ветки ${branch}`)
    const archive = await downloadBranch(repoName, branch)
    await fs.writeFile(`${repoName.replaceAll(/[^a-zA-Z0-9-]/g, '_')}.tar.gz`, Buffer.from(archive))
  }
}
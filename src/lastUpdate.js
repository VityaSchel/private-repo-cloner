import fs from 'fs/promises'
const dirname = new URL('.', import.meta.url).pathname

export async function setLastUpdateCached(repoID, lastUpdate) {
  const lastUpdatesData = await fs.readFile(dirname + '../lastUpdate.json', 'utf-8')
  const lastUpdates = JSON.parse(lastUpdatesData)
  lastUpdates[repoID] = lastUpdate
  await fs.writeFile(dirname + 'lastUpdate.json', JSON.stringify(lastUpdates))
}

export async function getLastUpdateCached(repos) {
  const lastUpdatesData = await fs.readFile(dirname + '../lastUpdate.json', 'utf-8')
  const lastUpdates = JSON.parse(lastUpdatesData)
  return repos.filter(repo => repo.updated_at !== lastUpdates[repo.id])
}
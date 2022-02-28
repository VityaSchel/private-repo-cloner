import { requestYandex } from './request.js'

export async function createBackupFolder() {
  const date = Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date())

  const folderPath = `app:/${date}`

  await requestYandex('resources', {
    path: folderPath
  }, { method: 'PUT' })

  return folderPath
}
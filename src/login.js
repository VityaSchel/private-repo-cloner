import open from 'open'
import fs from 'fs/promises'
import { requestYandex, requestGitHub } from './request.js'
import prompts from 'prompts'

const dirname = new URL('.', import.meta.url).pathname

async function parseAuthFile() {
  const auth = await fs.readFile(dirname + '../auth.json')
  try {
    return JSON.parse(auth)
  } catch(e) {
    return {}
  }
}

export default async function login() {
  await logInYandex()
  await logInGitHub()
}

export async function logInYandex() {
  const { yandex } = await parseAuthFile()
  global.yandexAPIToken = yandex
  const response = await requestYandex('resources', {
    path: 'app:/'
  })
  if(response.status !== 200) {
    switch(response.data?.error) {
      case 'UnauthorizedError':
        console.log(global.yandexAPIToken?.length ? 'Некорректный или устаревший токен' : 'Для начала работы необходим токен')
        await logInYandexWithOAuth()
        break

      default:
        console.error(response.status, response.data)
        throw 'Неизвестная ошибка во время проверки токена'
    }
  } else {
    return true
  }
}

async function logInYandexWithOAuth() {
  open('https://oauth.yandex.ru/authorize?response_type=token&client_id=767229d6d21d4feebb53c53709b888eb')
  const { token } = await prompts({
    type: 'text',
    name: 'token',
    message: 'Токен для работы с API Яндекс.Диска',
    validate: value => value?.length > 0
  })
  const file = await parseAuthFile()
  file.yandex = token
  await fs.writeFile('auth.json', JSON.stringify(file))
  await logInYandex()
}

export async function logInGitHub() {
  const { github } = await parseAuthFile()
  global.githubAPIToken = github
  const response = await requestGitHub('user/repos', { per_page: 1 })
  if(response.status === 401)
    await logInGithubWithPersonalToken()
}

async function logInGithubWithPersonalToken() {
  console.log('Создайте токен со scope=repo и без истечения срока годности')
  open('https://github.com/settings/tokens/new')
  const { token } = await prompts({
    type: 'text',
    name: 'token',
    message: 'Персональный access-токен для работы с API GitHub',
    validate: value => value?.length > 0 && value?.startsWith?.('ghp_')
  })
  const file = await parseAuthFile()
  file.github = token
  await fs.writeFile('auth.json', JSON.stringify(file))
  await logInGitHub()
}
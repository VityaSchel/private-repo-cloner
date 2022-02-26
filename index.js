import open from 'open'
import fs from 'fs/promises'
import request from './src/request.js'

const dirname = new URL('.', import.meta.url).pathname

global.yandexAPIToken = await fs.readFile(dirname + 'auth.txt')
const response = await request('resources', {
  path: 'app:/'
})

console.log(response.status, await response.json())
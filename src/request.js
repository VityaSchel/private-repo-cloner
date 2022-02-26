import fetch from 'node-fetch'

export default function request(endpoint, query) {
  return fetch(`https://cloud-api.yandex.net/v1/disk/${endpoint}?${new URLSearchParams(query)}`, {
    headers: {
      Authorization: `OAuth ${global.yandexAPIToken}`
    }
  })
}
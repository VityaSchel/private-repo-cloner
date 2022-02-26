import fetch from 'node-fetch'

export async function requestYandex(endpoint, query) {
  const response = await fetch(`https://cloud-api.yandex.net/v1/disk/${endpoint}?${new URLSearchParams(query)}`, {
    headers: {
      Authorization: `OAuth ${global.yandexAPIToken}`
    }
  })
  return {
    ...response,
    status: response.status,
    data: await response.json()
  }
}

export async function requestGitHub(endpoint, query) {
  const response = await fetch(`https://api.github.com/${endpoint}?${new URLSearchParams(query)}`, {
    headers: {
      Authorization: `Bearer ${global.githubAPIToken}`
    }
  })
  return {
    ...response,
    status: response.status,
    data: await response.json()
  }
}
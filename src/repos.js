import fetch from 'node-fetch'
import { requestGitHub } from './request.js'

export async function getRepos(offset = 0) {
  const response = await requestGitHub('user/repos', {
    visibility: 'private',
    affiliation: 'owner'
  })
  return response.data.slice(offset)
}

export async function getRepoBranches(repoName) {
  const branches = await requestGitHub(`repos/${repoName}/branches`)
  return branches.data.map(branch => branch.name)
}

export async function downloadBranch(repoName, branch) {
  const repoArchive = await fetch(`https://codeload.github.com/${repoName}/tar.gz/${branch}`, {
    headers: {
      Authorization: `Bearer ${global.githubAPIToken}`
    }
  })
  return await repoArchive.arrayBuffer()
}

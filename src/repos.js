import fetch from 'node-fetch'
import { requestGitHub } from './request.js'

export async function getRepos() {
  const response = await requestGitHub('user/repos')
  const repos = response.data
    .filter(repo => repo.private)
    .map(repo => repo.full_name)
  return repos
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
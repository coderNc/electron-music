import {
  type NeteaseTrack,
  type NeteasePlaylist,
  type NeteaseSongUrl,
  type NeteaseSongLyric,
  type NeteaseLoginStatus,
  extractPlaylistId
} from '@shared/types/netease'
import { weapi, eapi, generateAnonymousUsername } from './crypto'

const BASE_URL = 'https://music.163.com'
const DEFAULT_DEVICE_ID = 'pyncm!'

const DEFAULT_HEADERS = {
  'Content-Type': 'application/x-www-form-urlencoded',
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Referer: 'https://music.163.com',
  'X-Real-IP': '118.88.88.88'
}

let cookieJar: Map<string, string> = new Map()
let isLoggedIn = false
let loginPromise: Promise<void> | null = null
let userMusicUCookie: string | null = null

export function setCookie(cookie: string): void {
  const input = cookie.trim()
  const value = input.startsWith('MUSIC_U=')
    ? input.slice('MUSIC_U='.length).split(';')[0].trim()
    : input

  if (!value) {
    clearCookie()
    return
  }

  userMusicUCookie = value
  cookieJar.set('MUSIC_U', userMusicUCookie)
  isLoggedIn = true
  console.log('[NetEase] Cookie set, length:', userMusicUCookie.length)
}

export function clearCookie(): void {
  userMusicUCookie = null
  cookieJar = new Map()
  isLoggedIn = false
  loginPromise = null
  console.log('[NetEase] Cookie cleared')
}

export async function getLoginStatus(): Promise<NeteaseLoginStatus> {
  if (!userMusicUCookie) {
    return { isLoggedIn: false, isVip: false }
  }

  try {
    const response = await request<{
      code: number
      profile?: { userId: number; nickname: string; vipType: number }
    }>('/weapi/w/nuser/account/get', {})

    if (response.profile) {
      return {
        isLoggedIn: true,
        isVip: response.profile.vipType > 0,
        nickname: response.profile.nickname,
        userId: response.profile.userId
      }
    }

    return { isLoggedIn: false, isVip: false }
  } catch {
    console.log('[NetEase] Failed to get login status')
    return { isLoggedIn: false, isVip: false }
  }
}

function parseCookies(setCookieHeaders: string[]): void {
  for (const header of setCookieHeaders) {
    const parts = header.split(';')[0]
    const [name, value] = parts.split('=')
    if (name && value) {
      cookieJar.set(name.trim(), value.trim())
    }
  }
}

function getCookieHeader(): string {
  const cookies: string[] = []
  cookieJar.forEach((value, name) => {
    cookies.push(`${name}=${value}`)
  })
  return cookies.join('; ')
}

async function anonymousLogin(): Promise<void> {
  console.log('[NetEase] Starting anonymous login...')
  const username = generateAnonymousUsername(DEFAULT_DEVICE_ID)
  const encrypted = weapi({ username })
  const body = new URLSearchParams({
    params: encrypted.params,
    encSecKey: encrypted.encSecKey
  })

  const response = await fetch(`${BASE_URL}/weapi/register/anonimous`, {
    method: 'POST',
    headers: DEFAULT_HEADERS,
    body: body.toString()
  })

  if (!response.ok) {
    throw new Error(`Anonymous login failed: ${response.status}`)
  }

  const setCookies = response.headers.getSetCookie()
  console.log('[NetEase] Received', setCookies.length, 'cookies')
  parseCookies(setCookies)

  const json = (await response.json()) as { code: number; userId?: number }
  console.log('[NetEase] Login response code:', json.code, 'userId:', json.userId)
  if (json.code !== 200) {
    throw new Error(`Anonymous login returned code ${json.code}`)
  }

  isLoggedIn = true
  console.log('[NetEase] Anonymous login successful')
}

async function ensureLoggedIn(): Promise<void> {
  if (isLoggedIn) return

  if (loginPromise) {
    await loginPromise
    return
  }

  loginPromise = anonymousLogin()
  try {
    await loginPromise
  } finally {
    loginPromise = null
  }
}

async function request<T>(path: string, data: object): Promise<T> {
  await ensureLoggedIn()

  const encrypted = weapi(data)
  const body = new URLSearchParams({
    params: encrypted.params,
    encSecKey: encrypted.encSecKey
  })

  const headers: Record<string, string> = {
    ...DEFAULT_HEADERS
  }

  const cookieHeader = getCookieHeader()
  if (cookieHeader) {
    headers['Cookie'] = cookieHeader
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers,
    body: body.toString()
  })

  const setCookies = response.headers.getSetCookie()
  if (setCookies.length > 0) {
    parseCookies(setCookies)
  }

  if (!response.ok) {
    throw new Error(`NetEase API error: ${response.status} ${response.statusText}`)
  }

  const json = (await response.json()) as { code: number; [key: string]: unknown }
  if (json.code !== 200) {
    throw new Error(`NetEase API returned code ${json.code}`)
  }

  return json as T
}

async function eapiRequest<T>(apiPath: string, data: object): Promise<T> {
  await ensureLoggedIn()

  const encrypted = eapi(apiPath, data)
  const body = new URLSearchParams({
    params: encrypted.params
  })

  const headers: Record<string, string> = {
    ...DEFAULT_HEADERS
  }

  const cookieHeader = getCookieHeader()
  if (cookieHeader) {
    headers['Cookie'] = cookieHeader
  }

  const response = await fetch(`${BASE_URL}${apiPath.replace('/api/', '/eapi/')}`, {
    method: 'POST',
    headers,
    body: body.toString()
  })

  const setCookies = response.headers.getSetCookie()
  if (setCookies.length > 0) {
    parseCookies(setCookies)
  }

  if (!response.ok) {
    throw new Error(`NetEase EAPI error: ${response.status} ${response.statusText}`)
  }

  const json = (await response.json()) as { code: number; [key: string]: unknown }
  if (json.code !== 200) {
    throw new Error(`NetEase EAPI returned code ${json.code}`)
  }

  return json as T
}

async function apiRequest<T>(apiPath: string, data: Record<string, string>): Promise<T> {
  await ensureLoggedIn()

  const body = new URLSearchParams(data)
  const headers: Record<string, string> = {
    ...DEFAULT_HEADERS
  }

  const cookieHeader = getCookieHeader()
  headers['Cookie'] = cookieHeader ? `${cookieHeader}; os=ios` : 'os=ios'

  const response = await fetch(`${BASE_URL}${apiPath}`, {
    method: 'POST',
    headers,
    body: body.toString()
  })

  const setCookies = response.headers.getSetCookie()
  if (setCookies.length > 0) {
    parseCookies(setCookies)
  }

  if (!response.ok) {
    throw new Error(`NetEase API error: ${response.status} ${response.statusText}`)
  }

  const json = (await response.json()) as { code: number; [key: string]: unknown }
  if (json.code !== 200) {
    throw new Error(`NetEase API returned code ${json.code}`)
  }

  return json as T
}

interface PlaylistDetailResponse {
  code: number
  playlist: {
    id: number
    name: string
    description: string | null
    coverImgUrl: string
    trackCount: number
    playCount: number
    creator: {
      userId: number
      nickname: string
      avatarUrl: string
    }
    trackIds: Array<{ id: number }>
    tracks: Array<{
      id: number
      name: string
      ar: Array<{ id: number; name: string }>
      al: { id: number; name: string; picUrl: string }
      dt: number
    }> | null
  }
}

interface SongDetailResponse {
  code: number
  songs: Array<{
    id: number
    name: string
    ar: Array<{ id: number; name: string }>
    al: { id: number; name: string; picUrl: string }
    dt: number
  }>
}

interface SongUrlResponse {
  code: number
  data: Array<{
    id: number
    url: string | null
    br: number
    type: string
    expi: number
  }>
}

interface SongLyricResponse {
  code: number
  lrc?: { lyric?: string }
  tlyric?: { lyric?: string }
}

function mapTrack(raw: SongDetailResponse['songs'][0]): NeteaseTrack {
  return {
    id: raw.id,
    name: raw.name,
    artists: raw.ar.map((a) => ({ id: a.id, name: a.name })),
    album: {
      id: raw.al.id,
      name: raw.al.name,
      picUrl: raw.al.picUrl
    },
    duration: raw.dt
  }
}

export async function getPlaylistDetail(input: string): Promise<NeteasePlaylist> {
  const id = extractPlaylistId(input)
  if (!id) {
    throw new Error(`Invalid playlist URL or ID: ${input}`)
  }

  const response = await request<PlaylistDetailResponse>('/weapi/v6/playlist/detail', {
    id,
    n: 100000,
    s: 0
  })

  const playlist = response.playlist
  let tracks: NeteaseTrack[] = []

  if (playlist.trackIds && playlist.trackIds.length > 0) {
    const ids = playlist.trackIds.map((t) => t.id)
    tracks = await getSongDetail(ids)
  } else if (playlist.tracks && playlist.tracks.length > 0) {
    tracks = playlist.tracks.map(mapTrack)
  }

  return {
    id: playlist.id,
    name: playlist.name,
    description: playlist.description,
    coverUrl: playlist.coverImgUrl,
    trackCount: playlist.trackCount,
    playCount: playlist.playCount,
    creator: {
      userId: playlist.creator.userId,
      nickname: playlist.creator.nickname,
      avatarUrl: playlist.creator.avatarUrl
    },
    tracks
  }
}

export async function getSongDetail(ids: number[]): Promise<NeteaseTrack[]> {
  if (ids.length === 0) return []

  const BATCH_SIZE = 500
  const allTracks: NeteaseTrack[] = []

  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    const batchIds = ids.slice(i, i + BATCH_SIZE)
    const response = await request<SongDetailResponse>('/weapi/v3/song/detail', {
      c: JSON.stringify(batchIds.map((id) => ({ id })))
    })
    allTracks.push(...response.songs.map(mapTrack))
  }

  const trackById = new Map(allTracks.map((track) => [track.id, track]))
  return ids.map((id) => trackById.get(id)).filter((track): track is NeteaseTrack => Boolean(track))
}

export async function getSongUrl(id: number): Promise<NeteaseSongUrl> {
  const result = await getSongUrls([id])
  return result[0]
}

export async function getSongUrls(ids: number[]): Promise<NeteaseSongUrl[]> {
  console.log('[NetEase] Getting URLs for song IDs:', ids)

  const response = await eapiRequest<SongUrlResponse>('/api/song/enhance/player/url', {
    ids: ids,
    br: 320000,
    encodeType: 'aac'
  })

  const results = response.data.map((item) => ({
    id: item.id,
    url: item.url,
    br: item.br,
    type: item.type || 'mp3',
    expi: item.expi
  }))

  console.log(
    '[NetEase] URL results:',
    results.map((r) => ({ id: r.id, hasUrl: !!r.url, br: r.br }))
  )
  return results
}

export async function getSongLyric(id: number): Promise<NeteaseSongLyric> {
  const response = await apiRequest<SongLyricResponse>('/api/song/lyric?_nmclfl=1', {
    id: String(id),
    lv: '-1',
    tv: '-1',
    rv: '-1',
    kv: '-1'
  })

  return {
    id,
    lyric: response.lrc?.lyric ?? null,
    translatedLyric: response.tlyric?.lyric ?? null
  }
}

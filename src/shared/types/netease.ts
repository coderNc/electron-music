// NetEase Cloud Music types and IPC channels

/**
 * NetEase track information
 */
export interface NeteaseTrack {
  id: number
  name: string
  artists: Array<{ id: number; name: string }>
  album: {
    id: number
    name: string
    picUrl: string
  }
  duration: number // in milliseconds
  // Resolved at play time
  playUrl?: string
}

/**
 * NetEase playlist information
 */
export interface NeteasePlaylist {
  id: number
  name: string
  description: string | null
  coverUrl: string
  trackCount: number
  playCount: number
  creator: {
    userId: number
    nickname: string
    avatarUrl: string
  }
  tracks: NeteaseTrack[]
}

/**
 * Result of parsing a playlist URL
 */
export interface NeteasePlaylistResult {
  playlist: NeteasePlaylist
}

/**
 * Song URL response
 */
export interface NeteaseSongUrl {
  id: number
  url: string | null
  br: number // bitrate
  type: string // format: mp3, m4a, etc.
  expi: number // expiration time in seconds
}

export interface NeteaseSongLyric {
  id: number
  lyric: string | null
  translatedLyric: string | null
}

// ============================================
// IPC Channel Definitions for NetEase
// ============================================

export const NETEASE_IPC_CHANNELS = {
  PARSE_PLAYLIST: 'netease:parse-playlist',
  GET_SONG_URL: 'netease:get-song-url',
  GET_SONG_URLS: 'netease:get-song-urls',
  GET_SONG_DETAIL: 'netease:get-song-detail',
  GET_SONG_LYRIC: 'netease:get-song-lyric',
  SET_COOKIE: 'netease:set-cookie',
  CLEAR_COOKIE: 'netease:clear-cookie',
  GET_LOGIN_STATUS: 'netease:get-login-status'
} as const

export type NeteaseIPCChannel = (typeof NETEASE_IPC_CHANNELS)[keyof typeof NETEASE_IPC_CHANNELS]

/**
 * IPC request types
 */
export interface NeteaseIPCRequestMap {
  [NETEASE_IPC_CHANNELS.PARSE_PLAYLIST]: { input: string }
  [NETEASE_IPC_CHANNELS.GET_SONG_URL]: { id: number }
  [NETEASE_IPC_CHANNELS.GET_SONG_URLS]: { ids: number[] }
  [NETEASE_IPC_CHANNELS.GET_SONG_DETAIL]: { ids: number[] }
  [NETEASE_IPC_CHANNELS.GET_SONG_LYRIC]: { id: number }
  [NETEASE_IPC_CHANNELS.SET_COOKIE]: { cookie: string }
  [NETEASE_IPC_CHANNELS.CLEAR_COOKIE]: Record<string, never>
  [NETEASE_IPC_CHANNELS.GET_LOGIN_STATUS]: Record<string, never>
}

/**
 * IPC response types
 */
export interface NeteaseLoginStatus {
  isLoggedIn: boolean
  isVip: boolean
  nickname?: string
  userId?: number
}

export interface NeteaseIPCResponseMap {
  [NETEASE_IPC_CHANNELS.PARSE_PLAYLIST]: NeteasePlaylistResult
  [NETEASE_IPC_CHANNELS.GET_SONG_URL]: NeteaseSongUrl
  [NETEASE_IPC_CHANNELS.GET_SONG_URLS]: NeteaseSongUrl[]
  [NETEASE_IPC_CHANNELS.GET_SONG_DETAIL]: NeteaseTrack[]
  [NETEASE_IPC_CHANNELS.GET_SONG_LYRIC]: NeteaseSongLyric
  [NETEASE_IPC_CHANNELS.SET_COOKIE]: NeteaseLoginStatus
  [NETEASE_IPC_CHANNELS.CLEAR_COOKIE]: NeteaseLoginStatus
  [NETEASE_IPC_CHANNELS.GET_LOGIN_STATUS]: NeteaseLoginStatus
}

/**
 * Extract playlist ID from various URL formats
 * Supports:
 * - https://music.163.com/playlist?id=786919799
 * - https://music.163.com/#/playlist?id=786919799
 * - 786919799 (plain ID)
 */
export function extractPlaylistId(input: string): number | null {
  // Plain number
  if (/^\d+$/.test(input.trim())) {
    return parseInt(input.trim(), 10)
  }

  // URL with id parameter
  const urlMatch = input.match(/[?&]id=(\d+)/)
  if (urlMatch) {
    return parseInt(urlMatch[1], 10)
  }

  return null
}

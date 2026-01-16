import { describe, it, expect } from 'vitest'
import type { TrackMetadata, FolderInfo, Playlist } from './index'

describe('Type Definitions', () => {
  it('should create a valid TrackMetadata object', () => {
    const track: TrackMetadata = {
      id: 'test-id',
      filePath: '/path/to/file.mp3',
      title: 'Test Song',
      artist: 'Test Artist',
      album: 'Test Album',
      duration: 180,
      format: 'mp3',
      addedAt: Date.now(),
      folderId: 'folder-1'
    }

    expect(track.id).toBe('test-id')
    expect(track.title).toBe('Test Song')
    expect(track.duration).toBe(180)
  })

  it('should create a valid FolderInfo object', () => {
    const folder: FolderInfo = {
      id: 'folder-1',
      path: '/path/to/music',
      name: 'My Music',
      addedAt: Date.now(),
      trackCount: 10,
      lastScanTime: Date.now()
    }

    expect(folder.id).toBe('folder-1')
    expect(folder.name).toBe('My Music')
    expect(folder.trackCount).toBe(10)
  })

  it('should create a valid Playlist object', () => {
    const playlist: Playlist = {
      id: 'playlist-1',
      name: 'My Playlist',
      trackIds: ['track-1', 'track-2'],
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    expect(playlist.id).toBe('playlist-1')
    expect(playlist.name).toBe('My Playlist')
    expect(playlist.trackIds).toHaveLength(2)
  })
})

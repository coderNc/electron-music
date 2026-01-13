import { ElectronAPI } from '@electron-toolkit/preload'
import type { IPCAPI } from './index'

declare global {
  interface Window {
    electron: ElectronAPI
    api: IPCAPI
  }
}

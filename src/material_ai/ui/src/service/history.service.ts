import { type ChatItem } from '../schema'

export class HistoryService {
  private setHistory: React.Dispatch<React.SetStateAction<ChatItem[]>>
  constructor(setHistory: React.Dispatch<React.SetStateAction<ChatItem[]>>) {
    this.setHistory = setHistory
  }

  add_history(history: ChatItem) {
    this.setHistory((prevHistory) => {
      if (!prevHistory || !prevHistory.length) return [history]
      return [...prevHistory, history]
    })
  }

  delete_history(id: string) {
    this.setHistory((prevHistory) => {
      return [...prevHistory.filter((history) => history.id !== id)]
    })
  }

  update_history(id: string, updates: Partial<ChatItem>) {
    this.setHistory((prevHistory) => {
      return [
        ...prevHistory.map((hist) => {
          if (hist.id !== id) return hist
          return { ...hist, ...updates }
        }),
      ]
    })
  }

  clear_history() {
    this.setHistory([])
  }
}

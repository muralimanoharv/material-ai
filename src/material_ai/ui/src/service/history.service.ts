import { type ChatItem } from '../schema'

export class HistoryService {
  private getHistory: () => ChatItem[]
  private setHistory: React.Dispatch<React.SetStateAction<ChatItem[]>>
  constructor(
    getHistory: () => ChatItem[],
    setHistory: React.Dispatch<React.SetStateAction<ChatItem[]>>,
  ) {
    this.setHistory = setHistory
    this.getHistory = getHistory
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

  get(idx: number): ChatItem | undefined {
    const history = this.getHistory()
    return history[idx]
  }

  clear_history() {
    this.setHistory([])
  }
}

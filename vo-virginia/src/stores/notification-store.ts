import { create } from "zustand"

export interface NotificationItem {
  id: string
  type: string
  data: Record<string, unknown>
  status: string
  readAt: string | null
  createdAt: string
  sender: { id: string; name: string; role: string }
}

interface NotificationStore {
  unreadCount: number
  notifications: NotificationItem[]
  isDropdownOpen: boolean

  setUnreadCount: (count: number) => void
  setNotifications: (items: NotificationItem[]) => void
  toggleDropdown: () => void
  closeDropdown: () => void
  optimisticRemove: (id: string) => void
  decrementUnread: () => void
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  unreadCount: 0,
  notifications: [],
  isDropdownOpen: false,

  setUnreadCount: (count) => set({ unreadCount: count }),
  setNotifications: (items) => set({ notifications: items }),
  toggleDropdown: () => set((s) => ({ isDropdownOpen: !s.isDropdownOpen })),
  closeDropdown: () => set({ isDropdownOpen: false }),
  optimisticRemove: (id) =>
    set((s) => ({
      notifications: s.notifications.filter((n) => n.id !== id),
    })),
  decrementUnread: () =>
    set((s) => ({ unreadCount: Math.max(0, s.unreadCount - 1) })),
}))

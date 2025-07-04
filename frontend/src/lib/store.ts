import { create } from 'zustand'
import { TokenInfo, UserStats, GlobalStats } from '@/types'

interface TokenStore {
    // User data
    userTokens: TokenInfo[]
    userStats: UserStats

    // Global data
    allTokens: TokenInfo[]
    globalStats: GlobalStats

    // Loading states
    loading: boolean

    // Actions
    setUserTokens: (tokens: TokenInfo[]) => void
    setUserStats: (stats: UserStats) => void
    setAllTokens: (tokens: TokenInfo[]) => void
    setGlobalStats: (stats: GlobalStats) => void
    setLoading: (loading: boolean) => void

    // Async actions
    fetchUserData: () => Promise<void>
    fetchGlobalData: () => Promise<void>
}

export const useTokenStore = create<TokenStore>((set) => ({
    // Initial state
    userTokens: [],
    userStats: {
        total_tokens_created: 0,
        erc20_tokens: 0,
        erc721_tokens: 0,
        total_transactions: 0
    },
    allTokens: [],
    globalStats: {
        total_tokens: 0,
        total_erc20: 0,
        total_erc721: 0,
        total_transactions: 0,
        active_users: 0
    },
    loading: false,

    // Sync actions
    setUserTokens: (tokens) => set({ userTokens: tokens }),
    setUserStats: (stats) => set({ userStats: stats }),
    setAllTokens: (tokens) => set({ allTokens: tokens }),
    setGlobalStats: (stats) => set({ globalStats: stats }),
    setLoading: (loading) => set({ loading }),

    // Async actions
    fetchUserData: async () => {
        set({ loading: true })
        try {
            // Real data will be fetched via useUserTokens hook
            // This store method is now deprecated in favor of hooks
            set({ loading: false })
        } catch (error) {
            console.error('Failed to fetch user data:', error)
            set({ loading: false })
        }
    },

    fetchGlobalData: async () => {
        set({ loading: true })
        try {
            // Real data will be fetched via useGlobalTokens hook
            // This store method is now deprecated in favor of hooks
            set({ loading: false })
        } catch (error) {
            console.error('Failed to fetch global data:', error)
            set({ loading: false })
        }
    }
}))
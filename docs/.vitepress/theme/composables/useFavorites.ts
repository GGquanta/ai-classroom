import { ref, computed, onMounted } from 'vue'
import { useArticles, type Article } from './useArticles'

const STORAGE_KEY = 'ai-classroom-favorites'

export interface FavoriteEntry {
  id: string
  savedAt: string
}

const favorites = ref<FavoriteEntry[]>([])
const hydrated = ref(false)
let hydrateStarted = false

function readFromStorage(): FavoriteEntry[] {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as FavoriteEntry[]
    if (!Array.isArray(parsed)) return []
    return parsed.filter((e) => typeof e?.id === 'string' && typeof e?.savedAt === 'string')
  } catch {
    return []
  }
}

function persist(entries: FavoriteEntry[]) {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

function pruneInvalidIds(validIds: Set<string>) {
  const pruned = favorites.value.filter((e) => validIds.has(e.id))
  if (pruned.length !== favorites.value.length) {
    favorites.value = pruned
    persist(favorites.value)
  }
}

function hydrate(validIds?: Set<string>) {
  if (hydrated.value) return
  favorites.value = readFromStorage()
  if (validIds) pruneInvalidIds(validIds)
  hydrated.value = true
}

export function useFavorites() {
  const { articles } = useArticles()

  const validIds = computed(() => new Set(articles.value.map((a) => a.id)))

  if (!hydrateStarted && typeof window !== 'undefined') {
    hydrateStarted = true
    onMounted(() => hydrate(validIds.value))
  }

  const count = computed(() => favorites.value.length)

  function isFavorite(id: string): boolean {
    return favorites.value.some((e) => e.id === id)
  }

  function toggle(id: string) {
    hydrate(validIds.value)
    const idx = favorites.value.findIndex((e) => e.id === id)
    if (idx >= 0) {
      favorites.value = favorites.value.filter((e) => e.id !== id)
    } else {
      favorites.value = [{ id, savedAt: new Date().toISOString() }, ...favorites.value]
    }
    persist(favorites.value)
  }

  function remove(id: string) {
    hydrate(validIds.value)
    if (!isFavorite(id)) return
    favorites.value = favorites.value.filter((e) => e.id !== id)
    persist(favorites.value)
  }

  const favoriteArticles = computed((): Article[] => {
    const articleMap = new Map(articles.value.map((a) => [a.id, a]))

    return favorites.value
      .filter((e) => articleMap.has(e.id))
      .sort((a, b) => b.savedAt.localeCompare(a.savedAt))
      .map((e) => articleMap.get(e.id)!)
  })

  return {
    favorites,
    count,
    isFavorite,
    toggle,
    remove,
    favoriteArticles,
    hydrated,
  }
}

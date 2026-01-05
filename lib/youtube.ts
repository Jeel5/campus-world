import axios from "axios"
import { getCachedYouTubeVideos, cacheYouTubeVideos, type YouTubeVideo } from "./firestore"

const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || ""
const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3"

export interface YouTubeSearchResult {
  videos: YouTubeVideo[]
  totalResults: number
}

/**
 * Search for educational videos on a topic
 */
export async function searchEducationalVideos(topic: string, maxResults: number = 10): Promise<YouTubeVideo[]> {
  try {
    // Check cache first
    const cached = await getCachedYouTubeVideos(topic)
    if (cached && cached.videos.length > 0) {
      return cached.videos.slice(0, maxResults)
    }

    // Search YouTube
    const searchQuery = `${topic} tutorial lecture explained`
    const response = await axios.get(`${YOUTUBE_API_BASE}/search`, {
      params: {
        key: YOUTUBE_API_KEY,
        q: searchQuery,
        part: "snippet",
        type: "video",
        maxResults,
        videoDuration: "medium", // 4-20 minutes
        videoEmbeddable: true,
        relevanceLanguage: "en",
        order: "relevance",
      },
    })

    const videoIds = response.data.items.map((item: any) => item.id.videoId).join(",")

    // Get video details including duration
    const detailsResponse = await axios.get(`${YOUTUBE_API_BASE}/videos`, {
      params: {
        key: YOUTUBE_API_KEY,
        id: videoIds,
        part: "snippet,contentDetails,statistics",
      },
    })

    const videos: YouTubeVideo[] = detailsResponse.data.items.map((item: any) => ({
      id: item.id,
      videoId: item.id,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.high.url,
      duration: formatDuration(item.contentDetails.duration),
    }))

    // Cache the results
    if (videos.length > 0) {
      await cacheYouTubeVideos(topic, videos)
    }

    return videos
  } catch (error) {
    console.error("Error searching YouTube:", error)
    
    // Return fallback educational channels if API fails
    return getFallbackVideos(topic)
  }
}

/**
 * Search for playlists on a topic
 */
export async function searchPlaylists(topic: string, maxResults: number = 5): Promise<any[]> {
  try {
    const searchQuery = `${topic} complete course playlist`
    const response = await axios.get(`${YOUTUBE_API_BASE}/search`, {
      params: {
        key: YOUTUBE_API_KEY,
        q: searchQuery,
        part: "snippet",
        type: "playlist",
        maxResults,
        relevanceLanguage: "en",
        order: "relevance",
      },
    })

    return response.data.items.map((item: any) => ({
      id: item.id.playlistId,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.high.url,
      description: item.snippet.description,
    }))
  } catch (error) {
    console.error("Error searching playlists:", error)
    return []
  }
}

/**
 * Get videos from a specific playlist
 */
export async function getPlaylistVideos(playlistId: string, maxResults: number = 20): Promise<YouTubeVideo[]> {
  try {
    const response = await axios.get(`${YOUTUBE_API_BASE}/playlistItems`, {
      params: {
        key: YOUTUBE_API_KEY,
        playlistId,
        part: "snippet,contentDetails",
        maxResults,
      },
    })

    return response.data.items.map((item: any) => ({
      id: item.contentDetails.videoId,
      videoId: item.contentDetails.videoId,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.high.url,
      duration: "N/A",
    }))
  } catch (error) {
    console.error("Error getting playlist videos:", error)
    return []
  }
}

/**
 * Format ISO 8601 duration to readable format
 */
function formatDuration(duration: string): string {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/)
  if (!match) return "N/A"

  const hours = match[1] ? parseInt(match[1]) : 0
  const minutes = match[2] ? parseInt(match[2]) : 0
  const seconds = match[3] ? parseInt(match[3]) : 0

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

/**
 * Get fallback videos when API fails
 */
function getFallbackVideos(topic: string): YouTubeVideo[] {
  // Popular educational channels as fallback
  const fallbackChannels = [
    "3Blue1Brown",
    "Khan Academy",
    "Crash Course",
    "MIT OpenCourseWare",
    "Stanford Online",
  ]

  return fallbackChannels.map((channel, idx) => ({
    id: `fallback-${idx}`,
    videoId: `fallback-${idx}`,
    title: `${topic} - ${channel}`,
    channelTitle: channel,
    thumbnail: "/placeholder.svg",
    duration: "15:00",
  }))
}

/**
 * Search for topic-specific channels
 */
export async function searchChannels(topic: string, maxResults: number = 5): Promise<any[]> {
  try {
    const searchQuery = `${topic} education channel`
    const response = await axios.get(`${YOUTUBE_API_BASE}/search`, {
      params: {
        key: YOUTUBE_API_KEY,
        q: searchQuery,
        part: "snippet",
        type: "channel",
        maxResults,
        relevanceLanguage: "en",
        order: "relevance",
      },
    })

    return response.data.items.map((item: any) => ({
      id: item.id.channelId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.high.url,
      description: item.snippet.description,
    }))
  } catch (error) {
    console.error("Error searching channels:", error)
    return []
  }
}

/**
 * Get recommended videos based on topic and difficulty
 */
export async function getRecommendedVideos(
  topic: string,
  difficulty: "beginner" | "intermediate" | "advanced",
  maxResults: number = 5,
): Promise<YouTubeVideo[]> {
  const difficultyTerms = {
    beginner: "introduction basics tutorial for beginners",
    intermediate: "intermediate tutorial course",
    advanced: "advanced deep dive masterclass",
  }

  const searchQuery = `${topic} ${difficultyTerms[difficulty]}`
  return searchEducationalVideos(searchQuery, maxResults)
}

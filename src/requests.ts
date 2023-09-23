import axios from "axios"
import { parseChatData, getOptionsFromLivePage } from "./parser"
import { FetchOptions } from "./types/yt-response"
import { ChatItem, YoutubeId } from "./types/data"
import { Agent } from "http"
import crypto from "crypto";

axios.defaults.headers.common["Accept-Encoding"] = "utf-8"

export async function fetchChat(options: FetchOptions, agents: { httpAgent: Agent, httpsAgent: Agent }, httpsAgent?: Agent): Promise<[ChatItem[], string]> {
  const url = `https://www.youtube.com/youtubei/v1/live_chat/get_live_chat?key=${options.apiKey}`

  const start = Date.now();
  const res = await axios.post(url, {
    context: {
      client: {
        clientVersion: options.clientVersion,
        clientName: "WEB",
      },
    },
    httpsAgent,
    continuation: options.continuation,
  }, 
  )
  const durationRequest = Date.now() - start;
  const requestId = crypto.randomUUID()
  return parseChatData(res.data, requestId, durationRequest)
}

export async function fetchLivePage(id: { channelId: string } | { liveId: string } | { handle: string }) {
  const url = generateLiveUrl(id)
  if (!url) {
    throw TypeError("not found id")
  }
  const res = await axios.get(url)
  return getOptionsFromLivePage(res.data.toString())
}

function generateLiveUrl(id: YoutubeId) {
  if ("channelId" in id) {
    return `https://www.youtube.com/channel/${id.channelId}/live`
  } else if ("liveId" in id) {
    return `https://www.youtube.com/watch?v=${id.liveId}`
  } else if ("handle" in id) {
    let handle = id.handle
    if (!handle.startsWith("@")) {
      handle = "@" + handle
    }
    return `https://www.youtube.com/${handle}/live`
  }
  return ""
}

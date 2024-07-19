import axios from "axios"
import { parseChatData, getOptionsFromLivePage } from "./parser"
import { FetchOptions } from "./types/yt-response"
import { ChatItem, YoutubeId } from "./types/data"
import { HttpsProxyAgent } from 'https-proxy-agent'
import crypto from "crypto";

axios.defaults.headers.common["Accept-Encoding"] = "utf-8"

export async function fetchChat(options: FetchOptions, proxy_url: string): Promise<[ChatItem[], string]> {
  const url = `https://www.youtube.com/youtubei/v1/live_chat/get_live_chat?key=${options.apiKey}`
  const httpsAgent = new HttpsProxyAgent(proxy_url);
  const start = Date.now();
  const res = await axios.post(url, 
    {
      context: {
        client: {
          clientVersion: options.clientVersion,
          clientName: "WEB",
        },
      },
      continuation: options.continuation,
    }, 
    {
      httpsAgent
    } 
  )
  const durationRequest = Date.now() - start;
  const requestId = crypto.randomUUID()
  return parseChatData(res.data, requestId, durationRequest)
}

export async function fetchLivePage(id: { channelId: string } | { liveId: string } | { handle: string }, proxy_url: string) {
  const url = generateLiveUrl(id)
  if (!url) {
    throw TypeError("not found id")
  }
  const httpsAgent = new HttpsProxyAgent(proxy_url);
  const res = await axios.get(url, { httpsAgent })
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

import { EventEmitter } from "events"
import TypedEmitter from "typed-emitter"
import { ChatItem, ProxyItem, YoutubeId } from "./types/data"
import { FetchOptions } from "./types/yt-response"
import { fetchChat, fetchLivePage } from "./requests"
import { HttpsProxyAgent } from "https-proxy-agent"
import { SocksProxyAgent } from 'socks-proxy-agent'
import { Agent } from "http"
import crypto from "crypto";

type LiveChatEvents = {
  start: (liveId: string) => void
  end: (reason?: string) => void
  chat: (chatItem: ChatItem) => void
  error: (err: Error | unknown) => void
  proxyUpdate: (list: ProxyItem[]) => void
}

/**
 * YouTubeライブチャット取得イベント
 */
export class LiveChat extends (EventEmitter as new () => TypedEmitter<LiveChatEvents>) {
  instanceId: string
  liveId?: string
  #observer?: NodeJS.Timer
  #options?: FetchOptions
  readonly #interval: number = 1000
  readonly #id: YoutubeId
  #agents: Agent[] = [];

  constructor(id: YoutubeId, proxyList: ProxyItem[] = [], interval = 1000) {
    super()
    if (!id || (!("channelId" in id) && !("liveId" in id) && !("handle" in id))) {
      throw TypeError("Required channelId or liveId or handle.")
    } else if ("liveId" in id) {
      this.liveId = id.liveId
    }
    this.instanceId = crypto.randomUUID()
    this.#id = id
    this.#interval = interval
    this.#agents = this.createAgents(proxyList)
  }

  async start(): Promise<boolean> {
    if (this.#observer) {
      return false
    }
    try {
      const options = await fetchLivePage(this.#id)
      this.liveId = options.liveId
      this.#options = options

      this.#observer = setInterval(() => this.#execute(), this.#interval)

      this.emit("start", this.liveId)
      return true
    } catch (err) {
      this.emit("error", err)
      return false
    }
  }

  stop(reason?: string) {
    if (this.#observer) {
      clearInterval(this.#observer)
      this.#observer = undefined
      this.emit("end", reason)
    }
  }

  proxyUpdate( list: ProxyItem[] ) {
    this.#agents = this.createAgents(list)
  }

  async #execute() {
    if (!this.#options) {
      const message = "Not found options"
      this.emit("error", new Error(message))
      this.stop(message)
      return
    }

    try {
      const agent = this.getRandomProxyAgetn();
      const [chatItems, continuation] = await fetchChat(this.#options, agent)
      chatItems.forEach((chatItem) => {
        chatItem.instanceId = this.instanceId
        this.emit("chat", chatItem)
      })

      this.#options.continuation = continuation
    } catch (err) {
      this.emit("error", err)
    }
  }

  private createAgents(proxyList: ProxyItem[]) {
    return proxyList.filter(p => [ "http", "https", "socks", "socks4", "socks4a", "socks5", "socks5h" ].includes(p.protocol)).map(p => {
      const auth = p.auth && p.auth.username && p.auth.password 
        ? `${p.auth.username}:${p.auth.password}@` 
        : "";

      return p.protocol == "http" || p.protocol == "https" 
        ? new HttpsProxyAgent(`${p.protocol}://${auth}${p.host}:${p.port}`) 
        : new SocksProxyAgent(`${p.protocol}://${auth}${p.host}:${p.port}`);
    })
  }

  private getRandomProxyAgetn() {
    if (this.#agents.length === 0) return;
  
    const index = Math.floor(Math.random() * this.#agents.length);
    return this.#agents[index];
  }
}

import TypedEmitter from "typed-emitter";
import { ChatItem, ProxyItem, YoutubeId } from "./types/data";
type LiveChatEvents = {
    start: (liveId: string) => void;
    end: (reason?: string) => void;
    chat: (chatItem: ChatItem) => void;
    error: (err: Error | unknown) => void;
    proxyUpdate: (list: ProxyItem[]) => void;
};
declare const LiveChat_base: new () => TypedEmitter<LiveChatEvents>;
/**
 * YouTubeライブチャット取得イベント
 */
export declare class LiveChat extends LiveChat_base {
    #private;
    instanceId: string;
    liveId?: string;
    constructor(id: YoutubeId, proxyList?: ProxyItem[], interval?: number);
    start(): Promise<boolean>;
    stop(reason?: string): void;
    proxyUpdate(list: ProxyItem[]): void;
    private createAgents;
    private getRandomProxyAgetn;
}
export {};

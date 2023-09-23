/// <reference types="node" />
import TypedEmitter from "typed-emitter";
import { ChatItem, ProxyItem, YoutubeId } from "./types/data";
import { Agent } from "http";
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
    httpAgents: {
        httpAgent: Agent;
        httpsAgent: Agent;
    };
    constructor(id: YoutubeId, proxyList: ProxyItem[] | undefined, httpAgents: {
        httpAgent: Agent;
        httpsAgent: Agent;
    }, interval?: number);
    start(): Promise<boolean>;
    stop(reason?: string): void;
    proxyUpdate(list: ProxyItem[]): void;
    private createAgents;
    private getRandomProxyAgetn;
}
export {};

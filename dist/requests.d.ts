/// <reference types="node" />
import { FetchOptions } from "./types/yt-response";
import { ChatItem } from "./types/data";
import { Agent } from "http";
export declare function fetchChat(options: FetchOptions, agents: {
    httpAgent: Agent;
    httpsAgent: Agent;
}, httpsAgent?: Agent): Promise<[ChatItem[], string]>;
export declare function fetchLivePage(id: {
    channelId: string;
} | {
    liveId: string;
} | {
    handle: string;
}): Promise<FetchOptions & {
    liveId: string;
}>;

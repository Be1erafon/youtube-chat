import { FetchOptions } from "./types/yt-response";
import { ChatItem } from "./types/data";
export declare function fetchChat(options: FetchOptions, proxy_url: string): Promise<[ChatItem[], string]>;
export declare function fetchLivePage(id: {
    channelId: string;
} | {
    liveId: string;
} | {
    handle: string;
}, proxy_url: string): Promise<FetchOptions & {
    liveId: string;
}>;

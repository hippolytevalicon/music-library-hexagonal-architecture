import { Media, MediaQuality } from '@domain/entities/Media';

export interface MediaStoragePort {
    //online content operations
    fetchAvailableMedia(): Promise<Media[]>;
    fetchMediaDetails(mediaId: string): Promise<Media | null>;
    searchOnlineMedia(query: string): Promise<Media[]>;

    //offline storage operations
    saveMediaLocally(mediaId: string, quality: MediaQuality): Promise<boolean>;
    removeLocalMedia(mediaId: string): Promise<void>;
    getLocallyStoredMedia(): Promise<Media[]>;
    isMediaDownloaded(mediaId: string): Promise<boolean>;
    
    //download management
    getDownloadProgress(mediaId: string): Promise<number>;
    cancelDownload(mediaId: string): Promise<void>;
    
    //storage management
    getAvailableStorage(): Promise<number>; // in bytes
    getTotalStorageUsed(): Promise<number>; // in bytes
}
import { Media, MediaType, MediaQuality } from '@domain/entities/Media';

export interface MediaLibraryPort {
    //query operations
    getAllMedia(): Promise<Media[]>;
    getMediaById(id: string): Promise<Media | null>;
    searchMedia(query: string, type?: MediaType): Promise<Media[]>;
    
    //download operations
    downloadMedia(mediaId: string, quality: MediaQuality): Promise<boolean>;
    cancelDownload(mediaId: string): Promise<void>;
    getDownloadProgress(mediaId: string): Promise<number>; // 0-100
    
    //playback operations
    startPlayback(mediaId: string, quality?: MediaQuality): Promise<void>;
    pausePlayback(mediaId: string): Promise<void>;
    resumePlayback(mediaId: string): Promise<void>;
    
    //quality management
    getAvailableQualities(mediaId: string): Promise<MediaQuality[]>;
    setPlaybackQuality(mediaId: string, quality: MediaQuality): Promise<void>;
}

//optional ConnectionAware interface that can be implemented by adapters, currently unused
export interface ConnectionAware {
    getCurrentConnectionSpeed(): Promise<number>;
    isOnline(): Promise<boolean>;
}
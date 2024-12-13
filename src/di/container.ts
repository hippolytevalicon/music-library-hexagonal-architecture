import { Media, MediaQuality } from '@domain/entities/Media';
import { MediaService } from '@domain/services/MediaService';
import { InternetArchiveAdapter } from '@adapters/secondary/content/InternetArchiveAdapter';
import { FreeMusicArchiveAdapter } from '@adapters/secondary/content/FreeMusicArchiveAdapter';
import { IndexedDBAdapter } from '@adapters/secondary/storage/IndexedDBAdapter';
import { StreamingServiceAdapter } from '@adapters/secondary/streaming/StreamingServiceAdapter';
import { MediaLibraryPort } from '@ports/primary/MediaLibraryPort';
import { MediaStoragePort } from '@ports/secondary/MediaStoragePort';

export type ContentSource = 'internetArchive' | 'freeMusic' | 'all';

export class Container {
    private static instance: Container;
    private mediaLibrary: MediaLibraryPort | null = null;
    private currentSource: ContentSource = 'freeMusic'; //change this to internetArchive when you want to switch data source in the development process (we could even add a button so the user can change it)

    private constructor() {}

    static getInstance(): Container {
        if (!Container.instance) {
            Container.instance = new Container();
        }
        return Container.instance;
    }

    setContentSource(source: ContentSource) {
        this.currentSource = source;
        this.mediaLibrary = null;
    }

    private getStorageAdapter(): MediaStoragePort {
        switch (this.currentSource) {
            case 'internetArchive':
                return new InternetArchiveAdapter();
            case 'freeMusic':
                return new FreeMusicArchiveAdapter();
            case 'all':
                return new CompositeStorageAdapter([
                    new InternetArchiveAdapter(),
                    new FreeMusicArchiveAdapter()
                ]);
        }
    }

    getMediaLibrary(): MediaLibraryPort {
        if (!this.mediaLibrary) {
            const mediaStorage = this.getStorageAdapter();
            const userRepository = new IndexedDBAdapter();
            const streamingService = new StreamingServiceAdapter(mediaStorage);

            this.mediaLibrary = new MediaService(
                mediaStorage,
                streamingService,
                userRepository
            );
        }

        return this.mediaLibrary;
    }
}

//helper class to combine multiple storage adapters
class CompositeStorageAdapter implements MediaStoragePort {
    constructor(private adapters: MediaStoragePort[]) {}

    async fetchAvailableMedia(): Promise<Media[]> {
        const results = await Promise.all(
            this.adapters.map(adapter => 
                adapter.fetchAvailableMedia().catch(() => [])
            )
        );
        return results.flat();
    }

    async fetchMediaDetails(id: string): Promise<Media | null> {
        for (const adapter of this.adapters) {
            const result = await adapter.fetchMediaDetails(id).catch(() => null);
            if (result) return result;
        }
        return null;
    }

    async searchOnlineMedia(query: string): Promise<Media[]> {
        const results = await Promise.all(
            this.adapters.map(adapter => 
                adapter.searchOnlineMedia(query).catch(() => [])
            )
        );
        return results.flat();
    }

    async saveMediaLocally(mediaId: string, quality: MediaQuality): Promise<boolean> {
        return this.adapters[0].saveMediaLocally(mediaId, quality);
    }

    async removeLocalMedia(mediaId: string): Promise<void> {
        await this.adapters[0].removeLocalMedia(mediaId);
    }

    async getLocallyStoredMedia(): Promise<Media[]> {
        return this.adapters[0].getLocallyStoredMedia();
    }

    async isMediaDownloaded(mediaId: string): Promise<boolean> {
        return this.adapters[0].isMediaDownloaded(mediaId);
    }

    async getDownloadProgress(mediaId: string): Promise<number> {
        return this.adapters[0].getDownloadProgress(mediaId);
    }

    async cancelDownload(mediaId: string): Promise<void> {
        await this.adapters[0].cancelDownload(mediaId);
    }

    async getAvailableStorage(): Promise<number> {
        return this.adapters[0].getAvailableStorage();
    }

    async getTotalStorageUsed(): Promise<number> {
        return this.adapters[0].getTotalStorageUsed();
    }
}
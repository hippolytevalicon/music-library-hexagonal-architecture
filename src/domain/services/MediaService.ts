import { Media, MediaType, MediaQuality } from '@domain/entities/Media';
import { MediaLibraryPort, ConnectionAware } from '@ports/primary/MediaLibraryPort';
import { MediaStoragePort } from '@ports/secondary/MediaStoragePort';
import { StreamingServicePort } from '@ports/secondary/StreamingServicePort';
import { UserRepositoryPort } from '@ports/secondary/UserRepositoryPort';

export class MediaService implements MediaLibraryPort, ConnectionAware {
    constructor(
        private mediaStorage: MediaStoragePort,
        private streamingService: StreamingServicePort,
        private userRepository: UserRepositoryPort
    ) {}

    async getAllMedia(): Promise<Media[]> {
        const [onlineMedia, offlineMedia] = await Promise.all([
            this.mediaStorage.fetchAvailableMedia(),
            this.mediaStorage.getLocallyStoredMedia()
        ]);

        //merge and deduplicate media items
        const mediaMap = new Map<string, Media>();
        [...onlineMedia, ...offlineMedia].forEach(media => {
            mediaMap.set(media.id, media);
        });

        return Array.from(mediaMap.values());
    }

    async getMediaById(id: string): Promise<Media | null> {
        //first check local storage
        const localMedia = await this.mediaStorage.getLocallyStoredMedia();
        const localResult = localMedia.find(m => m.id === id);
        if (localResult) return localResult;

        //if not found locally, fetch from online storage
        return this.mediaStorage.fetchMediaDetails(id);
    }

    async searchMedia(query: string, type?: MediaType): Promise<Media[]> {
        const results = await this.mediaStorage.searchOnlineMedia(query);
        if (type) {
            return results.filter(media => media.type === type);
        }
        return results;
    }

    async downloadMedia(mediaId: string, quality: MediaQuality): Promise<boolean> {
        //check if we have enough storage space
        const mediaDetails = await this.getMediaById(mediaId);
        if (!mediaDetails) throw new Error('Media not found');

        const availableStorage = await this.mediaStorage.getAvailableStorage();
        if (mediaDetails.metadata.fileSize > availableStorage) {
            throw new Error('Insufficient storage space');
        }

        return this.mediaStorage.saveMediaLocally(mediaId, quality);
    }

    async cancelDownload(mediaId: string): Promise<void> {
        await this.mediaStorage.cancelDownload(mediaId);
    }

    async getDownloadProgress(mediaId: string): Promise<number> {
        return this.mediaStorage.getDownloadProgress(mediaId);
    }

    async startPlayback(mediaId: string, quality?: MediaQuality): Promise<void> {
        console.group('MediaService - startPlayback');
        const media = await this.getMediaById(mediaId);
        console.log('Media found:', media);
        if (!media) throw new Error('Media not found');

        //if quality is not specified, determine optimal quality based on connection (future feature)
        if (!quality) {
            console.log('No quality specified, determining optimal quality');
            const connectionSpeed = await this.getCurrentConnectionSpeed();
            quality = media.determineOptimalQuality(connectionSpeed);
        }
        console.log('Using quality:', quality);

        //verify the requested quality is available
        if (!media.canPlayAtQuality(quality)) {
            console.error('Quality not available:', quality);
            console.error('Available qualities:', media.availableQualities);
            throw new Error(`Quality ${quality} not available for this media`);
        }

        console.log('Starting playback with StreamingService');
        await this.streamingService.startPlayback(mediaId, quality);
        console.groupEnd();
    }

    async pausePlayback(mediaId: string): Promise<void> {
        await this.streamingService.pausePlayback();
    }

    async resumePlayback(mediaId: string): Promise<void> {
        await this.streamingService.resumePlayback();
    }

    async getAvailableQualities(mediaId: string): Promise<MediaQuality[]> {
        return this.streamingService.getAvailableQualities(mediaId);
    }

    async setPlaybackQuality(mediaId: string, quality: MediaQuality): Promise<void> {
        //verify if media exists and if quality is available
        const media = await this.getMediaById(mediaId);
        if (!media) throw new Error('Media not found');
        
        if (!media.canPlayAtQuality(quality)) {
            throw new Error(`Quality ${quality} not available for this media`);
        }

        await this.streamingService.changePlaybackQuality(quality);
    }

    // ConnectionAware implementation
    async getCurrentConnectionSpeed(): Promise<number> {
        const health = await this.streamingService.getStreamHealth();
        return health.bitrate / 1000000;
    }

    async isOnline(): Promise<boolean> {
        try {
            await this.mediaStorage.fetchAvailableMedia();
            return true;
        } catch {
            return false;
        }
    }
}
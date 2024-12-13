import { MediaQuality } from '@domain/entities/Media';
import { StreamingServicePort, StreamHealth } from '@ports/secondary/StreamingServicePort';
import { MediaStoragePort } from '@ports/secondary/MediaStoragePort';

export class StreamingServiceAdapter implements StreamingServicePort {
    private audio: HTMLAudioElement | null = null;
    private mediaStorage: MediaStoragePort | null = null;

    constructor(mediaStorage?: MediaStoragePort) {
        this.mediaStorage = mediaStorage || null;
    }

    async startPlayback(mediaId: string, quality?: MediaQuality): Promise<void> {
        try {
            const media = await this.mediaStorage?.fetchMediaDetails(mediaId);
            
            if (!media?.metadata.streamingUrl) {
                throw new Error('No streaming URL available');
            }

            if (!this.audio) {
                this.audio = new Audio();
            }

            this.audio.src = media.metadata.streamingUrl;
            await this.audio.play();
        } catch (error) {
            console.error('Error starting playback:', error);
            throw error;
        }
    }

    async pausePlayback(): Promise<void> {
        if (this.audio) {
            await this.audio.pause();
        }
    }

    async resumePlayback(): Promise<void> {
        if (this.audio) {
            await this.audio.play();
        }
    }

    async stopPlayback(): Promise<void> {
        if (this.audio) {
            await this.audio.pause();
            this.audio.currentTime = 0;
        }
    }

    async getCurrentPlaybackTime(): Promise<number> {
        return this.audio?.currentTime || 0;
    }

    async getDuration(): Promise<number> {
        return this.audio?.duration || 0;
    }

    async getBufferStatus(): Promise<number> {
        if (!this.audio || !this.audio.buffered.length) return 0;
        return (this.audio.buffered.end(0) / this.audio.duration) * 100;
    }

    async getAvailableQualities(): Promise<MediaQuality[]> {
        return [MediaQuality.HIGH];
    }

    async changePlaybackQuality(): Promise<void> {
       
    }

    async getStreamHealth(): Promise<StreamHealth> {
        return {
            bitrate: 320000,
            buffering: false,
            droppedFrames: 0,
            latency: 0
        };
    }
}
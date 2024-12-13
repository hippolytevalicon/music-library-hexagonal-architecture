// src/adapters/secondary/content/FreeMusicArchiveAdapter.ts

import { Media, MediaType, MediaQuality } from '@domain/entities/Media';
import { MediaStoragePort } from '@ports/secondary/MediaStoragePort';

export class FreeMusicArchiveAdapter implements MediaStoragePort {
    private readonly API_URL = 'https://api.jamendo.com/v3.0';
    private readonly CLIENT_ID = 'e4eedf6a';

    async fetchAvailableMedia(): Promise<Media[]> {
        try {
            console.group('FreeMusicArchiveAdapter - fetchAvailableMedia');
            
            const url = `${this.API_URL}/tracks/?client_id=${this.CLIENT_ID}&format=json&limit=20&include=musicinfo&audioformat=mp32`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error('Failed to fetch from API');
            }

            const data = await response.json();
            
            if (!data.results) {
                return [];
            }

            const media = data.results.map((track: { id: { toString: () => string; }; name: string; duration: any; audio: any; image: any; }) => new Media(
                track.id.toString(),
                track.name,
                MediaType.MUSIC,
                {
                    duration: track.duration || 0,
                    quality: MediaQuality.HIGH,
                    fileSize: Math.round((track.duration || 0) * 320000 / 8),
                    format: 'mp3',
                    streamingUrl: track.audio
                },
                track.image || '/api/placeholder/400/225',
                false,
                [MediaQuality.MEDIUM, MediaQuality.HIGH]
            ));

            console.groupEnd();
            return media;

        } catch (error) {
            console.error('Error in fetchAvailableMedia:', error);
            console.groupEnd();
            return [];
        }
    }

    async searchOnlineMedia(query: string): Promise<Media[]> {
        try {
            const response = await fetch(
                `${this.API_URL}/tracks/?client_id=${this.CLIENT_ID}&format=json&search=${query}&limit=20`
            );
            
            if (!response.ok) throw new Error('Search failed');

            const data = await response.json();
            return data.results.map((track: { id: { toString: () => string; }; name: string; duration: number; audio: any; image: any; }) => new Media(
                track.id.toString(),
                track.name,
                MediaType.MUSIC,
                {
                    duration: track.duration,
                    quality: MediaQuality.HIGH,
                    fileSize: Math.round(track.duration * 320000 / 8),
                    format: 'mp3',
                    streamingUrl: track.audio
                },
                track.image || '/api/placeholder/400/225',
                false,
                [MediaQuality.MEDIUM, MediaQuality.HIGH]
            ));
        } catch (error) {
            console.error('Search error:', error);
            return [];
        }
    }

    async fetchMediaDetails(id: string): Promise<Media | null> {
        try {
            const response = await fetch(
                `${this.API_URL}/tracks/?client_id=${this.CLIENT_ID}&format=json&id=${id}`
            );
            
            if (!response.ok) return null;

            const data = await response.json();
            if (!data.results.length) return null;

            const track = data.results[0];
            return new Media(
                track.id.toString(),
                track.name,
                MediaType.MUSIC,
                {
                    duration: track.duration,
                    quality: MediaQuality.HIGH,
                    fileSize: Math.round(track.duration * 320000 / 8),
                    format: 'mp3',
                    streamingUrl: track.audio
                },
                track.image || '/api/placeholder/400/225',
                false,
                [MediaQuality.MEDIUM, MediaQuality.HIGH]
            );
        } catch {
            return null;
        }
    }

    //required stubs for MediaStoragePort interface
    async getLocallyStoredMedia(): Promise<Media[]> { return []; }
    async saveMediaLocally(): Promise<boolean> { return false; }
    async removeLocalMedia(): Promise<void> {}
    async isMediaDownloaded(): Promise<boolean> { return false; }
    async getDownloadProgress(): Promise<number> { return 0; }
    async cancelDownload(): Promise<void> {}
    async getAvailableStorage(): Promise<number> { return 1024 * 1024 * 1024; }
    async getTotalStorageUsed(): Promise<number> { return 0; }
}
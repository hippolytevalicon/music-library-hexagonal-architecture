import { Media, MediaType, MediaQuality } from '@domain/entities/Media';

export class DatabaseAdapter {
    private readonly API_URL = 'http://localhost:3001/api';

    async saveDownload(media: Media, quality: MediaQuality): Promise<boolean> {
        try {
            console.group('DatabaseAdapter - saveDownload');
            console.log('Saving download:', media);

            const response = await fetch(`${this.API_URL}/downloads`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    mediaId: media.id,
                    title: media.title,
                    type: media.type,
                    quality: quality,
                    streamingUrl: media.metadata.streamingUrl,
                    thumbnailUrl: media.thumbnail,
                    duration: media.metadata.duration,
                    fileSize: media.metadata.fileSize,
                    format: media.metadata.format
                })
            });

            if (!response.ok) {
                throw new Error('Failed to save to database');
            }

            const result = await response.json();
            console.log('Save result:', result);
            console.groupEnd();
            return true;
        } catch (error) {
            console.error('Failed to save download:', error);
            console.groupEnd();
            return false;
        }
    }

    async getDownloads(): Promise<Media[]> {
        try {
            console.group('DatabaseAdapter - getDownloads');
            const response = await fetch(`${this.API_URL}/downloads`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch downloads');
            }

            const data = await response.json();
            console.log('Fetched downloads:', data);
            console.groupEnd();
            return data.map(this.convertToMedia);
        } catch (error) {
            console.error('Failed to get downloads:', error);
            console.groupEnd();
            return [];
        }
    }

    private convertToMedia(dbData: any): Media {
        return new Media(
            dbData.media_id,
            dbData.title,
            dbData.type,
            {
                duration: dbData.duration || 0,
                quality: dbData.quality || MediaQuality.HIGH,
                fileSize: dbData.file_size || 0,
                format: dbData.format || 'mp3',
                streamingUrl: dbData.streaming_url
            },
            dbData.thumbnail_url || '/api/placeholder/400/225',
            true,
            [MediaQuality.HIGH]
        );
    }
}
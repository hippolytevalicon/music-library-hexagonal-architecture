import { Media, MediaType, MediaQuality } from '@domain/entities/Media';
import { MediaStoragePort } from '@ports/secondary/MediaStoragePort';

export class InternetArchiveAdapter implements MediaStoragePort {
    private readonly SEARCH_URL = 'https://archive.org/advancedsearch.php';
    private readonly DETAILS_URL = 'https://archive.org/metadata';

    async fetchAvailableMedia(): Promise<Media[]> {
        try {
            console.group('InternetArchiveAdapter - fetchAvailableMedia');
            
            //query for live music archive recordings in internet archive
            const searchParams = new URLSearchParams({
                q: 'collection:(etree) AND format:(MP3)',
                fl: ['identifier', 'title', 'creator', 'date', 'format'].join(','),
                output: 'json',
                rows: '20',
                sort: ['-downloads'].join(',')
            });

            console.log('Fetching from URL:', `${this.SEARCH_URL}?${searchParams}`);

            const response = await fetch(`${this.SEARCH_URL}?${searchParams}`);
            console.log('Search response status:', response.status);
            
            if (!response.ok) {
                throw new Error('Failed to fetch from Internet Archive');
            }

            const data = await response.json();
            console.log('Search response data:', data);

            const media = await Promise.all(
                data.response.docs.map(async (item: any) => {
                    const details = await this.getItemDetails(item.identifier);
                    console.log(`Details for ${item.identifier}:`, details);

                    return new Media(
                        item.identifier,
                        `${item.creator || 'Unknown Artist'} - ${item.title} (${item.date || 'Unknown Date'})`,
                        MediaType.MUSIC,
                        {
                            duration: 180, //default duration
                            quality: MediaQuality.HIGH,
                            fileSize: 1024 * 1024 * 10,
                            format: 'mp3',
                            streamingUrl: details?.mp3Url
                        },
                        details?.thumbnailUrl || '/api/placeholder/400/225',
                        false,
                        [MediaQuality.HIGH]
                    );
                })
            );

            const validMedia = media.filter(m => m.metadata.streamingUrl);
            console.log('Valid media objects:', validMedia);
            console.groupEnd();
            return validMedia;
        } catch (error) {
            console.error('Error fetching from Internet Archive:', error);
            console.groupEnd();
            return [];
        }
    }

    private async getItemDetails(identifier: string): Promise<{ mp3Url: string, thumbnailUrl?: string } | null> {
        try {
            console.log(`Getting details for item: ${identifier}`);
            const response = await fetch(`${this.DETAILS_URL}/${identifier}`);
            if (!response.ok) return null;

            const data = await response.json();
            console.log('Raw item details:', data);

            //find a mp3 file (vbr mp3 is even better they are the full tracks)
            const mp3File = data.files?.find((f: any) => 
                (f.format?.toLowerCase() === 'vbr mp3' || f.format?.toLowerCase() === 'mp3') &&
                !f.name?.toLowerCase().includes('64kbps') && //skip low quality files
                !f.name?.toLowerCase().includes('sample') //skip sample files
            );

            if (!mp3File) {
                console.log('No suitable MP3 file found');
                return null;
            }

            //construct URLs
            const mp3Url = `https://archive.org/download/${identifier}/${mp3File.name}`;
            console.log('MP3 URL:', mp3Url);

            //find a thumbnail (either jpg or png)
            const imageFile = data.files?.find((f: any) => 
                f.name?.toLowerCase().endsWith('.jpg') ||
                f.name?.toLowerCase().endsWith('.png')
            );

            const thumbnailUrl = imageFile 
                ? `https://archive.org/download/${identifier}/${imageFile.name}`
                : undefined;

            console.log('Thumbnail URL:', thumbnailUrl);

            return { mp3Url, thumbnailUrl };
        } catch (error) {
            console.error('Error getting item details:', error);
            return null;
        }
    }

    async searchOnlineMedia(query: string): Promise<Media[]> {
        try {
            console.group('InternetArchiveAdapter - searchOnlineMedia');
            
            const searchParams = new URLSearchParams({
                q: `mediatype:(audio) AND format:(MP3) AND (${query})`,
                fl: ['identifier', 'title', 'length', 'description', 'format'].join(','),
                output: 'json',
                rows: '20'
            });

            const response = await fetch(`${this.SEARCH_URL}?${searchParams}`);
            const data = await response.json();
            
            const media = await Promise.all(
                data.response.docs.map(async (item: any) => {
                    const details = await this.getItemDetails(item.identifier);
                    return new Media(
                        item.identifier,
                        item.title,
                        MediaType.MUSIC,
                        {
                            duration: parseInt(item.length || '180', 10),
                            quality: MediaQuality.HIGH,
                            fileSize: 1024 * 1024 * 10,
                            format: 'mp3',
                            streamingUrl: details?.mp3Url
                        },
                        details?.thumbnailUrl || '/api/placeholder/400/225',
                        false,
                        [MediaQuality.HIGH]
                    );
                })
            );

            console.log('Search results:', media);
            console.groupEnd();
            return media;
        } catch (error) {
            console.error('Search error:', error);
            console.groupEnd();
            return [];
        }
    }

    async fetchMediaDetails(id: string): Promise<Media | null> {
        console.group('InternetArchiveAdapter - fetchMediaDetails');
        console.log('Fetching details for ID:', id);
        try {
            const response = await fetch(`${this.DETAILS_URL}/${id}`);
            if (!response.ok) return null;

            const data = await response.json();
            console.log('Fetched metadata:', data);

            const details = await this.getItemDetails(id);
            if (!details) {
                console.log('No playable MP3 found');
                console.groupEnd();
                return null;
            }

            const media = new Media(
                id,
                data.metadata.title?.[0] || 'Unknown Title',
                MediaType.MUSIC,
                {
                    duration: parseInt(data.metadata.length?.[0] || '180', 10),
                    quality: MediaQuality.HIGH,
                    fileSize: 1024 * 1024 * 10,
                    format: 'mp3',
                    streamingUrl: details.mp3Url
                },
                details.thumbnailUrl || '/api/placeholder/400/225',
                false,
                [MediaQuality.HIGH]
            );

            console.log('Created media object:', media);
            console.groupEnd();
            return media;
        } catch (error) {
            console.error('Error fetching details:', error);
            console.groupEnd();
            return null;
        }
    }

    //stub implementations for storage-related methods
    async getLocallyStoredMedia(): Promise<Media[]> { return []; }
    async saveMediaLocally(mediaId: string, quality: MediaQuality): Promise<boolean> { return false; }
    async removeLocalMedia(mediaId: string): Promise<void> {}
    async isMediaDownloaded(mediaId: string): Promise<boolean> { return false; }
    async getDownloadProgress(mediaId: string): Promise<number> { return 0; }
    async cancelDownload(mediaId: string): Promise<void> {}
    async getAvailableStorage(): Promise<number> { return 1024 * 1024 * 1024; }
    async getTotalStorageUsed(): Promise<number> { return 0; }
}
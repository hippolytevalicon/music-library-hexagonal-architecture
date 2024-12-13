import React, { useEffect, useState } from 'react';
import { useMediaLibrary } from '@/di';
import { Media, MediaQuality } from '@domain/entities/Media';
import { DatabaseAdapter } from '@adapters/secondary/storage/DatabaseAdapter';

export const MediaDownloadManager: React.FC = () => {
    const mediaLibrary = useMediaLibrary();
    const [downloadedMedia, setDownloadedMedia] = useState<Media[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null);

    const databaseAdapter = new DatabaseAdapter();

    useEffect(() => {
        const loadDownloadedMedia = async () => {
            try {
                setLoading(true);
                //get our downloads from aws db
                const media = await databaseAdapter.getDownloads();
                setDownloadedMedia(media);
                setError(null);
            } catch (e) {
                setError(e instanceof Error ? e.message : 'Failed to load downloads');
            } finally {
                setLoading(false);
            }
        };

        loadDownloadedMedia();
    }, []);

    const handlePlay = async (mediaId: string) => {
        try {
            if (currentlyPlayingId === mediaId) {
                await mediaLibrary.pausePlayback(mediaId);
                setCurrentlyPlayingId(null);
            } else {
                await mediaLibrary.startPlayback(mediaId, MediaQuality.HIGH);
                setCurrentlyPlayingId(mediaId);
            }
        } catch (e) {
            console.error('Playback error:', e);
            setError(e instanceof Error ? e.message : 'Failed to play media');
        }
    };

    if (loading) {
        return <div className="p-4">Loading downloads...</div>;
    }

    if (error) {
        return <div className="p-4 text-red-500">{error}</div>;
    }

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Downloads</h2>
            <div className="space-y-4">
                {downloadedMedia.map(media => (
                    <div key={media.id} className="border rounded p-4">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-bold">{media.title}</h3>
                            <button
                                onClick={() => handlePlay(media.id)}
                                className="text-blue-500 hover:underline"
                            >
                                {currentlyPlayingId === media.id ? 'Stop' : 'Play'}
                            </button>
                        </div>
                        <div className="text-sm text-gray-600">
                            {media.metadata.quality}
                        </div>
                    </div>
                ))}
                {downloadedMedia.length === 0 && (
                    <div className="text-center text-gray-500">
                        No downloads found
                    </div>
                )}
            </div>
        </div>
    );
};
import React, { useEffect, useState } from 'react';
import { MediaLibraryPort } from '@ports/primary/MediaLibraryPort';
import { Media, MediaQuality } from '@domain/entities/Media';

interface MediaPlayerProps {
    mediaLibrary: MediaLibraryPort;
    mediaId: string;
}

export const MediaPlayer: React.FC<MediaPlayerProps> = ({ mediaLibrary, mediaId }) => {
    const [media, setMedia] = useState<Media | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentQuality, setCurrentQuality] = useState<MediaQuality>(MediaQuality.HIGH);
    const [availableQualities, setAvailableQualities] = useState<MediaQuality[]>([]);
    const [error, setError] = useState<string | null>(null);

    //fetch media details and quality
    useEffect(() => {
        const loadMedia = async () => {
            try {
                const [mediaDetails, qualities] = await Promise.all([
                    mediaLibrary.getMediaById(mediaId),
                    mediaLibrary.getAvailableQualities(mediaId)
                ]);

                if (!mediaDetails) {
                    throw new Error('Media not found');
                }

                setMedia(mediaDetails);
                setAvailableQualities(qualities);
                setError(null);
            } catch (e) {
                setError(e instanceof Error ? e.message : 'Failed to load media');
            }
        };

        loadMedia();
    }, [mediaId, mediaLibrary]);

    const handlePlay = async () => {
        try {
            await mediaLibrary.startPlayback(mediaId, currentQuality);
            setIsPlaying(true);
            setError(null);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to start playback');
        }
    };

    const handlePause = async () => {
        try {
            await mediaLibrary.pausePlayback(mediaId);
            setIsPlaying(false);
            setError(null);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to pause playback');
        }
    };

    const handleQualityChange = async (quality: MediaQuality) => {
        try {
            await mediaLibrary.setPlaybackQuality(mediaId, quality);
            setCurrentQuality(quality);
            setError(null);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to change quality');
        }
    };

    if (!media) {
        return <div className="p-4">Loading...</div>;
    }

    if (error) {
        return <div className="p-4 text-red-500">{error}</div>;
    }

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">{media.title}</h2>
            
            <div className="flex gap-4 mb-4">
                <button
                    onClick={isPlaying ? handlePause : handlePlay}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    {isPlaying ? 'Pause' : 'Play'}
                </button>

                <select
                    value={currentQuality}
                    onChange={(e) => handleQualityChange(e.target.value as MediaQuality)}
                    className="px-4 py-2 border rounded"
                    disabled={isPlaying}
                >
                    {availableQualities.map(quality => (
                        <option key={quality} value={quality}>
                            {quality.charAt(0).toUpperCase() + quality.slice(1)}
                        </option>
                    ))}
                </select>
            </div>

            {/*placeholder for a future eventual video player*/}
            <div className="w-full aspect-video bg-gray-900 rounded flex items-center justify-center text-white">
                {isPlaying ? (
                    <span>Playing {media.title} at {currentQuality} quality</span>
                ) : (
                    <span>Press play to start</span>
                )}
            </div>
        </div>
    );
};
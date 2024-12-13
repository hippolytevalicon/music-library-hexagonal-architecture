import React, { useEffect, useState } from 'react';
import { useMediaLibrary } from '@/di';
import { MediaPlayer } from './MediaPlayer';
import { Media, MediaQuality } from '@domain/entities/Media';
import { DatabaseAdapter } from '@adapters/secondary/storage/DatabaseAdapter';

export const MediaLibrary: React.FC = () => {
    const mediaLibrary = useMediaLibrary();
    const [media, setMedia] = useState<Media[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null);

    const databaseAdapter = new DatabaseAdapter();

    useEffect(() => {
        loadMedia();
    }, []);

    const loadMedia = async () => {
        try {
            setLoading(true);
            const allMedia = await mediaLibrary.getAllMedia();
            setMedia(allMedia);
            setError(null);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to load media');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (query: string) => {
        setSearchTerm(query);
        if (!query) {
            loadMedia();
            return;
        }

        try {
            setLoading(true);
            const results = await mediaLibrary.searchMedia(query);
            setMedia(results);
            setError(null);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Search failed');
        } finally {
            setLoading(false);
        }
    };

    const handlePlayClick = async (mediaId: string) => {
        try {
            console.group('Play Button Clicked');
            console.log('MediaID:', mediaId);
            
            //logs used for debugging to check if we're correctly receiving the music from the API
            const mediaToPlay = media.find(m => m.id === mediaId);
            console.log('Media object:', mediaToPlay);
            console.log('Streaming URL:', mediaToPlay?.metadata.streamingUrl);
            console.log('Available qualities:', mediaToPlay?.availableQualities);
            console.log('Duration:', mediaToPlay?.metadata.duration);
            console.log('File size:', mediaToPlay?.metadata.fileSize);
            console.log('Format:', mediaToPlay?.metadata.format);
            
            await mediaLibrary.startPlayback(mediaId, MediaQuality.HIGH);
            console.log('Successfully started playback');
            setCurrentlyPlayingId(mediaId);
            
            console.groupEnd();
        } catch (error) {
            console.error('Playback error:', error);
            setError('Failed to play track');
        }
    };

    const handleStopClick = async () => {
        try {
            await mediaLibrary.pausePlayback('');
            setCurrentlyPlayingId(null);
        } catch (error) {
            console.error('Stop error:', error);
        }
    };

    const handleDownload = async (mediaId: string) => {
        try {
            console.group('Download Button Clicked');
            console.log('Starting download for mediaId:', mediaId);
            
            const mediaToDownload = media.find(m => m.id === mediaId);
            if (!mediaToDownload) {
                throw new Error('Media not found');
            }
    
            //save to db (aws)
            const success = await databaseAdapter.saveDownload(mediaToDownload, MediaQuality.HIGH);
            
            if (success) {
                console.log('Successfully saved to database');
                setMedia(prevMedia => 
                    prevMedia.map(m => {
                        if (m.id === mediaId) {
                            return new Media(
                                m.id,
                                m.title,
                                m.type,
                                m.metadata,
                                m.thumbnail,
                                true,
                                [...m.availableQualities]
                            );
                        }
                        return m;
                    })
                );
            } else {
                throw new Error('Failed to save to database');
            }
            
            console.groupEnd();
        } catch (error) {
            console.error('Download error:', error);
            setError('Failed to save download');
        }
    };

    

    if (loading) {
        return <div className="p-4">Loading music library...</div>;
    }

    if (error) {
        return <div className="p-4 text-red-500">{error}</div>;
    }

    return (
        <div className="p-4 pb-24">
            <input
                type="text"
                placeholder="Search music..."
                className="w-full px-4 py-2 mb-4 border rounded"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {media.map(item => (
                    <div key={item.id} className="border rounded-lg overflow-hidden shadow-lg">
                        <img 
                            src={item.thumbnail || '/api/placeholder/400/225'}
                            alt={item.title}
                            className="w-full h-48 object-cover"
                        />
                        <div className="p-4">
                            <h3 className="font-bold truncate">{item.title}</h3>
                            <div className="mt-2 flex justify-between items-center">
                                <span className="text-sm text-gray-600">
                                    {Math.floor(item.metadata.duration / 60)}:{String(item.metadata.duration % 60).padStart(2, '0')}
                                </span>
                                <span className="text-sm text-gray-600">
                                    {(item.metadata.fileSize / (1024 * 1024)).toFixed(1)} MB
                                </span>
                            </div>
                            <div className="mt-2 flex gap-2">
                                <button 
                                    className={`flex-1 px-4 py-2 ${
                                        currentlyPlayingId === item.id 
                                            ? 'bg-red-500 hover:bg-red-600' 
                                            : 'bg-blue-500 hover:bg-blue-600'
                                    } text-white rounded transition`}
                                    onClick={() => {
                                        if (currentlyPlayingId === item.id) {
                                            handleStopClick();
                                        } else {
                                            handlePlayClick(item.id);
                                        }
                                    }}
                                >
                                    {currentlyPlayingId === item.id ? 'Stop' : 'Play'}
                                </button>
                                <button 
                                    className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded transition"
                                    onClick={() => handleDownload(item.id)}
                                    disabled={item.isDownloaded}
                                >
                                    {item.isDownloaded ? 'Downloaded' : 'Download'}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {media.length === 0 && (
                <div className="text-center text-gray-500 mt-8">
                    No music found{searchTerm ? ` for "${searchTerm}"` : ''}
                </div>
            )}

            {currentlyPlayingId && (
                <MediaPlayer 
                    mediaLibrary={mediaLibrary}
                    mediaId={currentlyPlayingId}
                />
            )}
        </div>
    );
};
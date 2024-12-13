import { MediaQuality } from '@domain/entities/Media';

export interface StreamingServicePort {
    // Playback control
    startPlayback(mediaId: string, quality: MediaQuality): Promise<void>;
    pausePlayback(): Promise<void>;
    resumePlayback(): Promise<void>;
    stopPlayback(): Promise<void>;
    
    // Playback information
    getCurrentPlaybackTime(): Promise<number>;
    getDuration(): Promise<number>;
    getBufferStatus(): Promise<number>; // percentage buffered
    
    // Quality management
    getAvailableQualities(mediaId: string): Promise<MediaQuality[]>;
    changePlaybackQuality(quality: MediaQuality): Promise<void>;
    
    // Stream health
    getStreamHealth(): Promise<StreamHealth>;
}

export interface StreamHealth {
    bitrate: number;         // current bitrate in bits per second
    buffering: boolean;      // whether currently buffering
    droppedFrames: number;   // number of dropped frames (for video)
    latency: number;         // current latency in milliseconds
}
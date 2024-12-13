export enum MediaType {
    MOVIE = 'movie',
    SHOW = 'show',
    MUSIC = 'music'
}

export enum MediaQuality {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    ULTRA = 'ultra'
}

export interface MediaMetadata {
    duration: number;
    quality: MediaQuality;
    fileSize: number;
    format: string;
    streamingUrl?: string;
}

export class Media {
    constructor(
        public readonly id: string,
        public readonly title: string,
        public readonly type: MediaType,
        public readonly metadata: MediaMetadata,
        public readonly thumbnail: string,
        private _isDownloaded: boolean = false,
        private _availableQualities: MediaQuality[] = []
    ) {}

    get isDownloaded(): boolean {
        return this._isDownloaded;
    }

    get availableQualities(): ReadonlyArray<MediaQuality> {
        return this._availableQualities;
    }

    setDownloaded(status: boolean): void {
        this._isDownloaded = status;
    }

    updateAvailableQualities(qualities: MediaQuality[]): void {
        this._availableQualities = [...qualities];
    }

    //potential feature for determining playback quality based on connection speed, currently unused. Useless if we query the data from a database
    determineOptimalQuality(connectionSpeedMbps: number): MediaQuality {
        if (connectionSpeedMbps >= 25) return MediaQuality.ULTRA;
        if (connectionSpeedMbps >= 10) return MediaQuality.HIGH;
        if (connectionSpeedMbps >= 5) return MediaQuality.MEDIUM;
        return MediaQuality.LOW;
    }

    //validate if media can be played at requested quality
    canPlayAtQuality(quality: MediaQuality): boolean {
        return this._availableQualities.includes(quality);
    }
}
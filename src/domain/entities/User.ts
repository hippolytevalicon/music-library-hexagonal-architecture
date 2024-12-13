import { MediaQuality } from '@domain/entities/Media';

export interface UserPreferences {
    preferredQuality: MediaQuality;
    //potential future preferences:
    // autoDownload: boolean;
    // offlineMode: boolean;
}

export class User {
    constructor(
        public readonly id: string,
        public readonly username: string,
        private _preferences: UserPreferences
    ) {}

    get preferences(): Readonly<UserPreferences> {
        return this._preferences;
    }

    updatePreferences(newPreferences: Partial<UserPreferences>): void {
        this._preferences = {
            ...this._preferences,
            ...newPreferences
        };
    }

    /*potential future features:
    
    //favorites Management
    private _favorites: Set<string> = new Set();

    addToFavorites(mediaId: string): void {
        this._favorites.add(mediaId);
    }

    removeFromFavorites(mediaId: string): void {
        this._favorites.delete(mediaId);
    }

    isFavorite(mediaId: string): boolean {
        return this._favorites.has(mediaId);
    }

    get favorites(): ReadonlySet<string> {
        return new Set(this._favorites);
    }

    //playlist Management
    private _playlists: Map<string, string[]> = new Map();

    createPlaylist(playlistId: string, name: string): void {
        if (!this._playlists.has(playlistId)) {
            this._playlists.set(playlistId, []);
        }
    }

    addToPlaylist(playlistId: string, mediaId: string): void {
        const playlist = this._playlists.get(playlistId);
        if (playlist && !playlist.includes(mediaId)) {
            playlist.push(mediaId);
        }
    }

    removeFromPlaylist(playlistId: string, mediaId: string): void {
        const playlist = this._playlists.get(playlistId);
        if (playlist) {
            const index = playlist.indexOf(mediaId);
            if (index !== -1) {
                playlist.splice(index, 1);
            }
        }
    }

    getPlaylist(playlistId: string): ReadonlyArray<string> {
        return [...(this._playlists.get(playlistId) || [])];
    }

    getAllPlaylists(): ReadonlyMap<string, ReadonlyArray<string>> {
        const readOnlyPlaylists = new Map<string, ReadonlyArray<string>>();
        this._playlists.forEach((value, key) => {
            readOnlyPlaylists.set(key, [...value]);
        });
        return readOnlyPlaylists;
    }
    */
}
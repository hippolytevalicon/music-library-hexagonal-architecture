import { User, UserPreferences } from '@domain/entities/User';
import { MediaQuality } from '@domain/entities/Media';
import { UserRepositoryPort } from '@ports/secondary/UserRepositoryPort';

interface UserRecord {
    id: string;
    username: string;
    preferences: UserPreferences;
}

export class IndexedDBAdapter implements UserRepositoryPort {
    private readonly DB_NAME = 'media-library';
    private readonly DB_VERSION = 1;
    private db: IDBDatabase | null = null;

    constructor() {
        this.initializeDB().catch(console.error);
    }
    getFavorites(userId: string): Promise<string[]> {
        throw new Error('Method not implemented.');
    }
    addToFavorites(userId: string, mediaId: string): Promise<void> {
        throw new Error('Method not implemented.');
    }
    removeFromFavorites(userId: string, mediaId: string): Promise<void> {
        throw new Error('Method not implemented.');
    }
    getPlaylists(userId: string): Promise<Map<string, string[]>> {
        throw new Error('Method not implemented.');
    }
    createPlaylist(userId: string, playlistId: string, name: string): Promise<void> {
        throw new Error('Method not implemented.');
    }
    addToPlaylist(userId: string, playlistId: string, mediaId: string): Promise<void> {
        throw new Error('Method not implemented.');
    }
    removeFromPlaylist(userId: string, playlistId: string, mediaId: string): Promise<void> {
        throw new Error('Method not implemented.');
    }
    deletePlaylist(userId: string, playlistId: string): Promise<void> {
        throw new Error('Method not implemented.');
    }

    private async initializeDB(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
                const db = (event.target as IDBOpenDBRequest).result;

                //create users store
                if (!db.objectStoreNames.contains('users')) {
                    db.createObjectStore('users', { keyPath: 'id' });
                }

                /* potential future feature, unused:
                // Favorites store
                if (!db.objectStoreNames.contains('favorites')) {
                    db.createObjectStore('favorites', { keyPath: ['userId', 'mediaId'] });
                }

                //playlists store
                if (!db.objectStoreNames.contains('playlists')) {
                    db.createObjectStore('playlists', { keyPath: ['userId', 'playlistId'] });
                }
                */
            };
        });
    }

    private async ensureDB(): Promise<IDBDatabase> {
        if (!this.db) {
            await this.initializeDB();
        }
        if (!this.db) throw new Error('Failed to initialize database');
        return this.db;
    }

    //user management
    async getCurrentUser(): Promise<User | null> {
        //for now return a default user with basic preferences
        return new User('default-user', 'Default User', {
            preferredQuality: MediaQuality.HIGH,
        });
    }

    async updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<void> {
        const db = await this.ensureDB();
        const tx = db.transaction('users', 'readwrite');
        const store = tx.objectStore('users');

        return new Promise((resolve, reject) => {
            const getRequest = store.get(userId);

            getRequest.onsuccess = () => {
                const user = getRequest.result;
                if (user) {
                    user.preferences = { ...user.preferences, ...preferences };
                    store.put(user);
                }
            };

            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }

    /*potential future features:
    
    //favorites management
    async getFavorites(userId: string): Promise<string[]> {
        return [];
    }

    async addToFavorites(userId: string, mediaId: string): Promise<void> {
    }

    async removeFromFavorites(userId: string, mediaId: string): Promise<void> {
    }

    //playlist management
    async getPlaylists(userId: string): Promise<Map<string, string[]>> {
        return new Map();
    }

    async createPlaylist(userId: string, playlistId: string, name: string): Promise<void> {
    }

    async addToPlaylist(userId: string, playlistId: string, mediaId: string): Promise<void> {
    }

    async removeFromPlaylist(userId: string, playlistId: string, mediaId: string): Promise<void> {
    }

    async deletePlaylist(userId: string, playlistId: string): Promise<void> {
    }
    */
}
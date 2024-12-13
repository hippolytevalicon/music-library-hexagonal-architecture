import { User, UserPreferences } from '@domain/entities/User';

export interface UserRepositoryPort {
    //user management
    getCurrentUser(): Promise<User | null>;
    updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<void>;
    
    //favorites management (potential future feature)
    getFavorites?(userId: string): Promise<string[]>;
    addToFavorites?(userId: string, mediaId: string): Promise<void>;
    removeFromFavorites?(userId: string, mediaId: string): Promise<void>;
    
    /* Potential future playlist feature
    getPlaylists(userId: string): Promise<Map<string, string[]>>;
    createPlaylist(userId: string, playlistId: string, name: string): Promise<void>;
    addToPlaylist(userId: string, playlistId: string, mediaId: string): Promise<void>;
    removeFromPlaylist(userId: string, playlistId: string, mediaId: string): Promise<void>;
    deletePlaylist(userId: string, playlistId: string): Promise<void>;
    */
}
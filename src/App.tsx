import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { DIProvider } from './di';
import { MediaPlayer } from './adapters/primary/web/components/MediaPlayer';
import { MediaLibrary } from './adapters/primary/web/components/MediaLibrary';
import { MediaDownloadManager } from './adapters/primary/web/components/MediaDownloadManager';
import { useMediaLibrary } from './di';

const MediaPlayerContainer: React.FC<{ mediaId: string }> = ({ mediaId }) => {
    const mediaLibrary = useMediaLibrary();
    return <MediaPlayer mediaLibrary={mediaLibrary} mediaId={mediaId} />;
};

const Navigation: React.FC = () => (
    <nav className="bg-gray-800 text-white p-4">
        <div className="container mx-auto flex gap-4">
            <Link to="/" className="hover:text-gray-300">Library</Link>
            <Link to="/downloads" className="hover:text-gray-300">Downloads</Link>
        </div>
    </nav>
);

const App: React.FC = () => {
    return (
        <DIProvider>
            <BrowserRouter>
                <div className="min-h-screen bg-gray-100">
                    <Navigation />
                    <main className="container mx-auto py-4">
                        <Routes>
                            <Route path="/" element={<MediaLibrary />} />
                            <Route path="/media/:id" element={<MediaPlayerContainer mediaId="example-media-1" />} />
                            <Route path="/downloads" element={<MediaDownloadManager />} />
                        </Routes>
                    </main>
                </div>
            </BrowserRouter>
        </DIProvider>
    );
};

export default App;
# Music Library - Hexagonal Architecture Demo

## Features
- Fetch a list of musics from FreeMusicArchive AND/OR InternetArchive (2 different APIs). To change the feature, modify currentSource to either "freeMusic" or "internetArchive" in src/di/container.ts
- Play tracks in browser
- Download functionality with persistent storage (AWS database)
- Built using hexagonal architecture principles

## Architecture
```
├── Domain Layer (Core)
│   ├── Entities (Media, User)
│   └── Services (MediaService)
├── Ports
│   ├── Primary (MediaLibraryPort)
│   └── Secondary (MediaStoragePort, StreamingServicePort)
└── Adapters
    ├── Primary (react components)
    └── Secondary (FreeMusicArchive/InternetArchive, Database)
```

## Quick Start

1. Clone the repository:
```bash
git clone https://github.com/hippolytevalicon/music-library-hexagonal-architecture.git
cd music-library-hexagonal-architecture
```

2. Install dependencies:
```bash
#frontend
npm install

#server
cd server
npm install
```

3. Start the application:
```bash
#start server in your first terminal
cd server
npm start

#start the frontend
npm start
```

The application will run on `http://localhost:3000`
Server is on port 3001.
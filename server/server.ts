// server.ts
import express from 'express';
import mysql, { ResultSetHeader } from 'mysql2/promise';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
    host: 'database-1.chom2wgke146.eu-north-1.rds.amazonaws.com',
    port: 3306,
    user: 'admin',
    password: 'medialibrary123#',
    database: 'media_library'
});

// GET downloads
app.get('/api/downloads', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM downloads ORDER BY download_date DESC');
        res.json(rows);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Failed to fetch downloads' });
    }
});

// POST new download
app.post('/api/downloads', async (req, res) => {
    try {
        const { 
            mediaId, 
            title, 
            type, 
            quality, 
            streamingUrl, 
            thumbnailUrl,
            duration,
            fileSize,
            format 
        } = req.body;

        const [result] = await pool.query<ResultSetHeader>(
            `INSERT INTO downloads (
                media_id, title, type, quality, streaming_url, 
                thumbnail_url, duration, file_size, format
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [mediaId, title, type, quality, streamingUrl, thumbnailUrl, duration, fileSize, format]
        );

        res.json({ success: true, id: result.insertId });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Failed to save download' });
    }
});

const port = 3001;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve static files for subjects
app.use('/subjects', express.static(path.join(__dirname, 'subjects')));

// Endpoint to list files in the images folder
app.get('/list-images', (req, res) => {
    const imagesDir = path.join(__dirname, 'images');
    fs.readdir(imagesDir, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Unable to list images' });
        }
        res.json(files);
    });
});

// Endpoint to list files in the pdfs folder
app.get('/list-pdfs', (req, res) => {
    const pdfsDir = path.join(__dirname, 'pdfs');
    fs.readdir(pdfsDir, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Unable to list PDFs' });
        }
        res.json(files);
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

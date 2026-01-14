
import express from 'express';
import axios from 'axios';
import { client } from '../../db.js';

const seedRouter = express.Router();

// Configuration
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
const TELEPORT_API_URL = 'https://api.teleport.org/api/urban_areas/';

async function getUrbanAreas() {
    try {
        const response = await axios.get(TELEPORT_API_URL);
        return response.data._links['ua:item'].slice(0, 10); // Get top 10
    } catch (error) {
        console.error("Error fetching Teleport data:", error.message);
        return [];
    }
}

async function getUnsplashImage(query) {
    if (!UNSPLASH_ACCESS_KEY) {
        // Fallback if no key provided
        return `https://loremflickr.com/640/480/${encodeURIComponent(query)},city`;
    }

    try {
        const response = await axios.get(`https://api.unsplash.com/search/photos`, {
            params: { query, per_page: 1, orientation: 'landscape' },
            headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` }
        });
        if (response.data.results.length > 0) {
            return response.data.results[0].urls.regular;
        }
    } catch (error) {
        console.error(`Error fetching Unsplash image for ${query}:`, error.message);
    }
    return `https://loremflickr.com/640/480/${encodeURIComponent(query)},city`;
}

seedRouter.get("/", async (req, res) => {
    try {
        console.log("Starting seed process...");
        const areas = await getUrbanAreas();
        let citiesToProcess = [];

        if (areas.length === 0) {
            citiesToProcess = ['Paris', 'London', 'New York', 'Tokyo', 'Rome', 'Dubai', 'Barcelona', 'Madrid'];
        } else {
            citiesToProcess = areas.map(a => a.name);
        }

        const results = [];
        for (const cityName of citiesToProcess) {
            console.log(`Processing ${cityName}...`);
            const imageUrl = await getUnsplashImage(cityName);

            // Check if exists in DESTINOS
            const [existing] = await client.query("SELECT ID FROM DESTINOS WHERE NOMBRE = ?", [cityName]);

            if (existing.length > 0) {
                await client.query("UPDATE DESTINOS SET IMAGE_URL = ? WHERE ID = ?", [imageUrl, existing[0].ID]);
                results.push({ city: cityName, status: 'updated', image: imageUrl });
            } else {
                await client.query("INSERT INTO DESTINOS (NOMBRE, IMAGE_URL) VALUES (?, ?)", [cityName, imageUrl]);
                results.push({ city: cityName, status: 'created', image: imageUrl });
            }

            // Also seed ORIGEN
            const [existingOrigin] = await client.query("SELECT id FROM ORIGEN WHERE nombre = ?", [cityName]);
            if (existingOrigin.length > 0) {
                await client.query("UPDATE ORIGEN SET image_url = ? WHERE id = ?", [imageUrl, existingOrigin[0].id]);
            } else {
                await client.query("INSERT INTO ORIGEN (nombre, image_url) VALUES (?, ?)", [cityName, imageUrl]);
            }
        }

        res.status(200).json({ message: "Seeding complete", details: results });
    } catch (error) {
        console.error("Seeding failed:", error);
        res.status(500).json({ message: "Seeding failed", error: error.message });
    }
});

export default seedRouter;

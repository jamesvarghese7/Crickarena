// Quick diagnostic script - checks gallery data in MongoDB
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

async function diagnose() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const GalleryItem = (await import('./models/GalleryItem.js')).default;

        const items = await GalleryItem.find({}).select('club caption category status image.contentType uploadedBy createdAt');

        console.log(`\nTotal gallery items: ${items.length}\n`);

        for (const item of items) {
            // Check if image data actually exists (without loading full binary)
            const full = await GalleryItem.findById(item._id).select('image');
            const hasData = !!(full.image && full.image.data);
            const dataSize = hasData ? full.image.data.length : 0;

            console.log(`ID: ${item._id}`);
            console.log(`  Caption: ${item.caption || '(none)'}`);
            console.log(`  Category: ${item.category}`);
            console.log(`  Status: ${item.status}`);
            console.log(`  ContentType: ${item.image?.contentType || '(none)'}`);
            console.log(`  Has image data: ${hasData}`);
            console.log(`  Image size: ${dataSize} bytes (${(dataSize / 1024).toFixed(1)} KB)`);
            console.log(`  Image URL would be: /api/gallery/${item._id}/image`);
            console.log(`  Full URL: http://localhost:4000/api/gallery/${item._id}/image`);
            console.log('');
        }

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

diagnose();

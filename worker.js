// worker.js
const Bull = require('bull');
const imageThumbnail = require('image-thumbnail');
const dbClient = require('./utils/db'); // Assuming you have a dbClient to interact with your DB
const fs = require('fs');
const path = require('path');

const fileQueue = new Bull('fileQueue');

fileQueue.process(async (job, done) => {
    const { fileId, userId } = job.data;

    if (!fileId) throw new Error('Missing fileId');
    if (!userId) throw new Error('Missing userId');

    const file = await dbClient.collection('files').findOne({ _id: fileId, userId: userId });
    if (!file) throw new Error('File not found');

    const filePath = path.join('/tmp/files_manager', file.localPath);

    try {
        // Generate thumbnails
        const options500 = { width: 500 };
        const options250 = { width: 250 };
        const options100 = { width: 100 };

        const thumbnail500 = await imageThumbnail(filePath, options500);
        const thumbnail250 = await imageThumbnail(filePath, options250);
        const thumbnail100 = await imageThumbnail(filePath, options100);

        // Save thumbnails
        fs.writeFileSync(`${filePath}_500`, thumbnail500);
        fs.writeFileSync(`${filePath}_250`, thumbnail250);
        fs.writeFileSync(`${filePath}_100`, thumbnail100);

        done();
    } catch (error) {
        done(error);
    }
});

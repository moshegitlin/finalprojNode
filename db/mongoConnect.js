// getting-started.js
const mongoose = require('mongoose');
const { config } = require('../middlewares/secret');

main().catch(err => console.log(err));

async function main() {
    mongoose.set('strictQuery', false);
    await mongoose.connect(config.db_url);
    console.log('mongo connected');
}
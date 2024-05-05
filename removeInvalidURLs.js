require('dotenv').config(); // โหลดตัวแปรสภาพแวดล้อมจากไฟล์ .env
const axios = require("axios");
const cheerio = require("cheerio");
const { MongoClient } = require("mongodb");

async function removeInvalidURLs() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MongoDB URI is not defined in .env");
    return;
  }
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const database = client.db("projectCPE");
    const urlsCollection = database.collection("URLs");

    const urls = await urlsCollection.find({}).toArray();
    const removePromises = [];

    for (const url of urls) {
      try {
        const response = await axios.get(url.url);
        if (response.status < 200 || response.status >= 300) {
          console.log(`Removing URL due to invalid status code: ${url.url}`);
          removePromises.push(urlsCollection.deleteOne({ url: url.url }));
        }
      } catch (error) {
        console.log(`Removing URL due to access error: ${url.url}`);
        removePromises.push(urlsCollection.deleteOne({ url: url.url }));
      }
    }

    await Promise.all(removePromises);
    console.log(`Removed ${removePromises.length} invalid URLs.`);
  } catch (error) {
    console.error("Error cleaning up URLs:", error);
  } finally {
    await client.close();
  }
}

removeInvalidURLs().then(() => console.log("Cleanup completed."));

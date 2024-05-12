require("dotenv").config();
const axios = require("axios");
const cheerio = require("cheerio");
const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;

async function scrapeAndStoreURLs(baseURL) {
  const client = new MongoClient(uri);
  await client.connect();
  const database = client.db("projectCPE");
  const urlsCollection = database.collection("URLs");

  try {
    console.log(`Starting to scrape: ${baseURL}`);
    const response = await axios.get(baseURL, { timeout: 5000 });

    if (response.status >= 200 && response.status < 300) {
      const $ = cheerio.load(response.data);
      const urlPromises = [];

      $("a").each((index, element) => {
        const link = $(element).attr("href");
        if (link) {
          const fullUrl = new URL(link, baseURL).href;
          if (fullUrl.startsWith("http")) {
            console.log(`Processing URL: ${fullUrl}`);
            urlPromises.push(
              urlsCollection.updateOne(
                { url: fullUrl },
                { $setOnInsert: { url: fullUrl } },
                { upsert: true }
              )
            );
          }
        }
      });

      await Promise.all(urlPromises);
      console.log("All scraping tasks completed.");
    } else {
      console.log(`Failed to fetch ${baseURL}: HTTP status code ${response.status}`);
    }
  } catch (error) {
    console.error(`Error scraping ${baseURL}:`, error.message);
  } finally {
    await client.close();  // Ensure the client is closed in the finally block
  }
}

// Scrape English and Thai versions of the website
scrapeAndStoreURLs("https://www.kmutt.ac.th/")
  .then(() => console.log("Scraping and storing URLs for Thai version completed."))
  .catch((err) => console.error("Error during scraping and storing URLs for Thai version:", err));

scrapeAndStoreURLs("https://www.kmutt.ac.th/en/")
  .then(() => console.log("Scraping and storing URLs for English version completed."))
  .catch((err) => console.error("Error during scraping and storing URLs for English version:", err));

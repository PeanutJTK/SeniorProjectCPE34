const axios = require("axios");
const cheerio = require("cheerio");
const { MongoClient } = require("mongodb");

async function findURLWithKeywordInContent(keyword) {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);
  await client.connect();
  const database = client.db("projectCPE");
  const urlsCollection = database.collection("URLs");

  try {
    const urls = await urlsCollection.find({}).toArray();
    const matches = [];

    // ตัวอย่าง regular expression ที่ปรับปรุงเพื่อรองรับภาษาไทย
    const spacedKeyword = keyword.replace(/\s+/g, '[\\s\\-\\_]*');
    const regex = new RegExp(`(${spacedKeyword})`, "i");

    for (const url of urls) {
      try {
        const response = await axios.get(url.url);
        if (response.status >= 200 && response.status < 300) {
          const $ = cheerio.load(response.data);
          let textContent = $("body").text();

          // Consider other attributes that might contain relevant text
          $("a, img, p, h1, h2, h3, h4, h5, h6").each((i, elem) => {
            textContent += " " + $(elem).text();
          });

          if (regex.test(textContent)) {
            matches.push(url.url);
          }
        } else {
          console.log(`Skipping ${url.url}: HTTP status code ${response.status}`);
        }
      } catch (error) {
        console.error(`Error accessing ${url.url}:`, error.message);
      }
    }
    return matches;
  } catch (error) {
    console.error("Error searching in HTML content:", error);
    return [];
  } finally {
    await client.close();
  }
}

module.exports = { findURLWithKeywordInContent };

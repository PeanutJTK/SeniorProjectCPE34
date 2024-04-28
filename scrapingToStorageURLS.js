// require("dotenv").config(); // โหลดตัวแปรสภาพแวดล้อมจากไฟล์ .env
// const axios = require("axios");
// const cheerio = require("cheerio");
// const { MongoClient } = require("mongodb");

// const uri = process.env.MONGODB_URI;
// const client = new MongoClient(uri);

// async function scrapeAndStoreURLs(url, depth = 1) {
//   if (depth < 0) {
//     return; // หยุดหากถึงความลึกสูงสุด
//   }

//   try {
//     const response = await axios.get(url); // ดึงหน้าเว็บจาก URL
//     const $ = cheerio.load(response.data);

//     const urls = new Set(); // เก็บ URL โดยไม่ซ้ำ
//     $("a").each((index, element) => {
//       const link = $(element).attr("href");
//       if (link && !urls.has(link)) {
//         urls.add(link); // เก็บ URL จากลิงก์
//       }
//     });

//     await client.connect(); // เชื่อมต่อกับ MongoDB
//     const database = client.db("projectCPE");
//     const urlsCollection = database.collection("URLs"); // เลือก Collection ที่เก็บ URL
    
//     // เก็บ URL ใน MongoDB
//     await urlsCollection.insertMany(Array.from(urls).map((link) => ({ url: link }))); 

//     // สแครปปิ้งลิงก์ที่ถูกเก็บมาเพื่อหาลิงก์เพิ่มเติม
//     for (const link of urls) {
//       await scrapeAndStoreURLs(link, depth - 1); // สแครปปิ้งลิงก์ที่เกี่ยวข้อง
//     }
//   } catch (error) {
//     console.error(`Error scraping ${url}:`, error); // จัดการข้อผิดพลาด
//   } finally {
//     await client.close(); // ปิดการเชื่อมต่อ
//   }
// }

// scrapeAndStoreURLs("https://www.kmutt.ac.th/", 2); // สแครปปิ้งเริ่มต้นที่ความลึก 2

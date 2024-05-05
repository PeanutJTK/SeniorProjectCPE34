// const axios = require("axios");
// const { MongoClient } = require("mongodb"); // เชื่อมต่อกับ MongoDB
// const cheerio = require("cheerio");

// async function findURLsWithKeywords(keywords) {
//   const client = new MongoClient(process.env.MONGODB_URI); // URI ของ MongoDB
//   const matchingURLs = [];

//   try {
//     await client.connect(); // เชื่อมต่อกับ MongoDB
//     const database = client.db("projectCPE");
//     const urlsCollection = database.collection("URLs");

//     // ดึง URL จาก MongoDB
//     const urls = await urlsCollection.find({}).toArray();

//     // ค้นหา URL ตามคำหลัก
//     for (const { url } of urls) {
//       const response = await axios.get(url); // ดึงข้อมูลเว็บ
//       const $ = cheerio.load(response.data); // วิเคราะห์เนื้อหา HTML
//       const textContent = $("body").text(); // เนื้อหาที่เป็นข้อความ

//       for (const keyword of keywords) {
//         if (textContent.includes(keyword)) { // ตรวจสอบคีย์เวิร์ด
//           matchingURLs.push(url); // เก็บ URL ที่เกี่ยวข้อง
//           break; // หลีกเลี่ยงการเพิ่ม URL ซ้ำ
//         }
//       }
//     }
//   } catch (error) {
//     console.error("Error finding URLs with keywords:", error); // จัดการข้อผิดพลาด
//   } finally {
//     client.close(); // ปิดการเชื่อมต่อ
//   }

//   return matchingURLs; // ส่งคืน URL ที่มีคำหลัก
// }

// module.exports = { findURLsWithKeywords }; // ส่งออกฟังก์ชัน

require("dotenv").config(); // โหลดตัวแปรสภาพแวดล้อมจากไฟล์ .env
const restify = require("restify");
const { BotFrameworkAdapter, ActivityHandler } = require("botbuilder");
const { MongoClient } = require("mongodb");
const { FAQHandler } = require("./faqHandler.js");
const { UnansweredQuestionHandler } = require("./unansweredQuestionHandler.js");
const { connectToDatabase } = require("./database.js");
const {
  findURLWithKeywordInContent,
} = require("./findURLWithKeywordInContent.js"); // เพิ่ม import function นี้

const uri = process.env.MONGODB_URI; // URI ของ MongoDB
const client = new MongoClient(uri);

const server = restify.createServer();
const adapter = new BotFrameworkAdapter({
  appId: process.env.MicrosoftAppId,
  appPassword: process.env.MicrosoftAppPassword,
});

class UniversityBot extends ActivityHandler {
  constructor() {
    super();
    this.faqHandler = new FAQHandler(); // จัดการกับคำถาม FAQs
    this.unansweredHandler = new UnansweredQuestionHandler(); // จัดการกับคำถามที่ยังไม่มีคำตอบ

    this.onMembersAdded(async (context, next) => {
      const membersAdded = context.activity.membersAdded;
      for (const member of membersAdded) {
        if (member.id !== context.activity.recipient.id) {
          await context.sendActivity(
            "สวัสดี! ฉันสามารถช่วยให้ข้อมูลเกี่ยวกับการลงทะเบียน, กิจกรรมมหาวิทยาลัย หรือหากมีข้อสงสัยเบื้องต้น ท่านสามารถใช้คีย์เวิร์ดในการค้นหาคำสั้นๆ หรือใช้คำสั่ง 'Show FAQs' ได้"
          );
        }
      }
      await next();
    });

    this.onMessage(async (context, next) => {
      const text = context.activity.text.trim().toLowerCase(); // ข้อความที่ได้รับ

      if (text === "show faqs") {
        await this.faqHandler.handleShowFAQs(context);
      } else {
        await this.faqHandler.handleMessage(context, text); // พยายามค้นหาคำตอบใน FAQ ก่อน
        if (!context.activity.isResponded) {
          const urls = await findURLWithKeywordInContent(text); // ถ้าไม่พบใน FAQ, ค้นหา URL ที่เกี่ยวข้อง
          if (urls && urls.length > 0) {
            await context.sendActivity(
              `คำตอบสำหรับคำถามของคุณอาจมีอยู่ที่: ${urls.join(", ")}`
            );
          } else {
            await this.unansweredHandler.handleMessage(context, text); // ถ้าไม่พบทั้งใน FAQ และ URL, จัดเก็บคำถามที่ไม่มีคำตอบ
          }
        }
      }
      await next(); // ดำเนินการต่อ
    });
  }
}

server.listen(process.env.PORT || 3978, async function () {
  console.log(`${server.name} listening to ${server.url}`);
  await connectToDatabase(); // เชื่อมต่อกับ MongoDB
});

server.post("/api/messages", async (req, res) => {
  try {
    await adapter.processActivity(req, res, async (context) => {
      const bot = new UniversityBot();
      await bot.run(context);
    });
  } catch (error) {
    console.error("Error handling message:", error);
    res
      .status(500)
      .send({ error: "เกิดข้อผิดพลาดระหว่างการประมวลผลข้อความของคุณ." });
  }
});

module.exports = { UniversityBot };

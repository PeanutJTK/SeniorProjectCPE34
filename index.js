require("dotenv").config(); // โหลดตัวแปรสภาพแวดล้อมจากไฟล์ .env
const restify = require("restify");
const { BotFrameworkAdapter, ActivityHandler } = require("botbuilder");
const { MongoClient } = require("mongodb");
const { FAQHandler } = require("./faqHandler.js");
const { UnansweredQuestionHandler } = require("./unansweredQuestionHandler.js");
const { connectToDatabase } = require("./database.js");

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

      // แสดง FAQs ทั้งหมดหากผู้ใช้ร้องขอ
      if (text === "show faqs") {
        await this.faqHandler.handleShowFAQs(context);
      } else {
        // ค้นหาใน FAQs ตามข้อความที่ได้รับ
        await this.faqHandler.handleMessage(context, text);

        // หากไม่พบคำตอบใน FAQs
        if (!context.activity.isResponded) {
          await this.unansweredHandler.handleMessage(context, text); // จัดเก็บคำถามที่ไม่มีคำตอบ
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
    console.error("Error handling message:", error); // จัดการข้อผิดพลาด
    res.status(500).send({ error: "เกิดข้อผิดพลาดระหว่างการประมวลผลข้อความของคุณ." });
  }
});

module.exports = { UniversityBot }; // ส่งออกคลาสแชทบอท

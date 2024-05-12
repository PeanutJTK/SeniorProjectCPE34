require("dotenv").config(); // Load environment variables
const restify = require("restify");
const { BotFrameworkAdapter, ActivityHandler } = require("botbuilder");
const { MongoClient } = require("mongodb");
const { FAQHandler } = require("./faqHandler.js");
const { UnansweredQuestionHandler } = require("./unansweredQuestionHandler.js");
const { connectToDatabase } = require("./database.js");

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

const server = restify.createServer();
const adapter = new BotFrameworkAdapter({
  appId: process.env.MicrosoftAppId,
  appPassword: process.env.MicrosoftAppPassword,
});

class UniversityBot extends ActivityHandler {
  constructor() {
    super();
    this.faqHandler = new FAQHandler();
    this.unansweredHandler = new UnansweredQuestionHandler();

    this.onMembersAdded(async (context, next) => {
      const membersAdded = context.activity.membersAdded;
      for (const member of membersAdded) {
        if (member.id !== context.activity.recipient.id) {
          await context.sendActivity(
            "สวัสดี! ฉันสามารถช่วยให้ข้อมูลเกี่ยวกับการลงทะเบียน, กิจกรรมมหาวิทยาลัย ท่านสามารถใช้Keywordหรือคำในการค้นหาสั้นๆ หรือใช้คำสั่ง 'Show FAQs' ได้"
          );
        }
      }
      await next();
    });

    this.onMessage(async (context, next) => {
      const text = context.activity.text.trim().toLowerCase();

      if (text === "show faqs") {
        await this.faqHandler.handleShowFAQs(context);
      } else {
        const faqResults = await this.faqHandler.handleMessage(context, text); // Try to find answer in FAQs
        if (!faqResults || faqResults.length === 0) {
          await this.unansweredHandler.handleMessage(context, text); // If no answer in FAQ, check for URLs or save as unanswered
        }
      }
      await next();
    });
  }
}

server.listen(process.env.PORT || 3978, async function () {
  console.log(`${server.name} listening to ${server.url}`);
  await connectToDatabase();
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
      .send({ error: "An error occurred while processing your message." });
  }
});

module.exports = { UniversityBot };

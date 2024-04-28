const { searchFAQs, saveUnansweredQuestion } = require("./database.js"); // ฟังก์ชันสำหรับค้นหา FAQs และเก็บคำถามที่ไม่มีคำตอบ

class UnansweredQuestionHandler {
  async handleMessage(context, text) {
    const faqResults = await searchFAQs(text);
    if (faqResults.length === 0) {
      await saveUnansweredQuestion(text); // เก็บคำถามที่ไม่มีคำตอบ
      await context.sendActivity("ไม่พบคำตอบสำหรับคำถามของคุณในขณะนี้"); // ส่งข้อความตอบกลับ
    }
  }
}

module.exports = { UnansweredQuestionHandler }; // ส่งออกคลาส

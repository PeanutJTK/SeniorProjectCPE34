const { getFAQs, searchFAQs } = require("./database.js"); // ฟังก์ชันสำหรับจัดการกับ FAQs

class FAQHandler {
  async handleShowFAQs(context) {
    const faqs = await getFAQs(); // ดึงข้อมูล FAQs ทั้งหมด
    if (faqs && faqs.length > 0) {
      let response = "FAQs:\n\n"; // เริ่มต้นข้อความ
      faqs.forEach((faq, index) => {
        response += `${index + 1}. Q: ${faq.question}\nA: ${faq.answer}\n\n`;
      });
      await context.sendActivity(response); // ส่งคำตอบกลับ
    } else {
      await context.sendActivity("ไม่มี FAQs ในขณะนี้."); // หากไม่มี FAQs
    }
  }

  async handleMessage(context, text) {
    const faqResults = await searchFAQs(text); // ค้นหาใน FAQs ตามข้อความที่ได้รับ
    if (faqResults && faqResults.length > 0) {
      const selectedFAQ = faqResults[0]; // เลือกคำถามที่เกี่ยวข้อง
      await context.sendActivity(
        `Q: ${selectedFAQ.question}\nA: ${selectedFAQ.answer}`
      );
    } else {
      await context.sendActivity("ไม่พบคำตอบที่เกี่ยวข้องในFAQ กรุณารอสักครู่เพื่อทำการค้นหาเพิ่มเติม."); // หากไม่มีคำตอบที่เกี่ยวข้อง
    }
  }
}

module.exports = { FAQHandler };

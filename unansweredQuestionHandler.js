const { searchFAQs, saveUnansweredQuestion, storeRepeatedQuestion } = require("./database.js");
const { findURLWithKeywordInContent } = require("./findURLWithKeywordInContent.js");


class UnansweredQuestionHandler {
  async handleMessage(context, text) {
    const faqResults = await searchFAQs(text);
    if (faqResults.length === 0) {
      const urls = await findURLWithKeywordInContent(text);
      if (urls.length > 0) {
        await storeRepeatedQuestion(text, urls); // Store the question for admin review
        await context.sendActivity(`Possible answers might be found at: ${urls.join(", ")}`);
      } else {
        await saveUnansweredQuestion(text); // Store unanswered question
        await context.sendActivity("Your question has been saved for review.");
      }
    }
  }
}

module.exports = { UnansweredQuestionHandler };

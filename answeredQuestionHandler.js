const { storeRepeatedQuestion } = require("./database.js");

class AnsweredQuestionHandler {
  async handleAnsweredQuestion(question, sources) {
    await storeRepeatedQuestion(question, sources);
  }
}

module.exports = { AnsweredQuestionHandler };

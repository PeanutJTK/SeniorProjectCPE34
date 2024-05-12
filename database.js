const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function connectToDatabase() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Could not connect to MongoDB:", error);
    throw new Error("Database connection error");
  }
}

async function getFAQs() {
  try {
    const database = client.db("projectCPE");
    const faqsCollection = database.collection("FAQs");
    return await faqsCollection.find({}).toArray();
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    return [];
  }
}

async function searchFAQs(question) {
  try {
    const database = client.db("projectCPE");
    const faqsCollection = database.collection("FAQs");
    return await faqsCollection.find({ question: { $regex: question, $options: "i" } }).toArray();
  } catch (error) {
    console.error("Error searching FAQs:", error);
    return [];
  }
}

async function saveUnansweredQuestion(question) {
  try {
    const unansweredQuestionsCollection = client.db("projectCPE").collection("UnansweredQuestions");
    await unansweredQuestionsCollection.insertOne({ question });
  } catch (error) {
    console.error("Error saving unanswered question:", error);
  }
}

async function storeRepeatedQuestion(question, urls) {
  const repeatedQuestionsCollection = client.db("projectCPE").collection("RepeatedQuestions");
  await repeatedQuestionsCollection.updateOne(
    { question: question },
    { $inc: { count: 1 }, $setOnInsert: { question: question, urls: urls, answers: [] } },
    { upsert: true }
  );
}

module.exports = {
  connectToDatabase,
  getFAQs,
  searchFAQs,
  saveUnansweredQuestion,
  storeRepeatedQuestion
};

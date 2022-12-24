const { ObjectId } = require("bson");

const questionCollection = (req) => req.db.collection("questions");
const attemptCollection = (req) => req.db.collection("attempts");

exports.attempt = async (req, res) => {
  const questions = await questionCollection(req)
    .aggregate([{ $sample: { size: 10 } }])
    .toArray();
  const attemptQuestions = {};
  questions.forEach((question) => {
    attemptQuestions[question._id] = {
      correct: question.correctAnswer,
    };
  });

  const attempt = {
    questions: attemptQuestions,
    completed: false,
    score: 0,
    startAt: new Date(),
  };
  await attemptCollection(req).insertOne(attempt);
  attempt.questions = questions.map((e) => {
    delete e.correctAnswer;
    return e;
  });
  res.status(200).json(attempt);
};

exports.submit = async (req, res) => {
  const { body, params } = req;
  const { answers } = body;
  const id = params.id;
  const attempt = await attemptCollection(req).findOne({ _id: ObjectId(id) });
  if (!attempt) res.end();
  if (attempt.completed) return res.status(200).json(attempt);
  let score = 0;
  for (key in answers) {
    const answer = answers[key];
    const question = attempt.questions[key];
    question.userAnswer = answer;
    if (answer === question.correct) score++;
  }
  attempt.score = score;
  attempt.completed = true;
  await attemptCollection(req).updateOne(
    { _id: new ObjectId(id) },
    { $set: attempt },
    { upsert: false }
  );
  const questionIds = Object.keys(attempt.questions).map(
    (e) => new ObjectId(e)
  );
  const questions = await questionCollection(req)
    .find({ _id: { $in: questionIds } })
    .toArray();
  const correctAnswers = {};
  for (key in attempt.questions) {
    correctAnswers[key] = attempt.questions[key].correct;
  }
  attempt.answers = answers;
  attempt.correctAnswers = correctAnswers;
  attempt.questions = questions;
  attempt.scoreText = getScoreText(score);
  res.json(attempt);
};

const getScoreText = (score) => {
  if (score < 5) return "Practice more to improve it :D";
  if (score < 7) return "Good, keep up!";
  if (score < 9) return "Well done!";
  return "Perfect!!";
};

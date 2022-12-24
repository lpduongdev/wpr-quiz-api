const BASE_URL = "http://localhost:3000/";

//____________ Networking ____________
const fetchQuestions = () =>
  fetch(`${BASE_URL}attempts`, {
    method: "POST",
  });

const submitAnswers = ({ attemptId, answers }) =>
  fetch(`${BASE_URL}attempts/${attemptId}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers }),
  });

//____________ Introduction ____________
const btnStart = document.querySelector("#btn-start");
const onClickStart = async (event) => {
  const response = await fetchQuestions();
  if (!response.ok) return;
  const data = await response.json();
  const { questions, _id } = data;
  answers = {};
  attemptId = _id;
  populateQuestions(questions, "#attempt-quiz > .questions");
  navigate("#attempt-quiz");
};
btnStart.addEventListener("click", onClickStart);

//____________ Quiz Attempt ____________
let answers = {};
let attemptId;
const btnSubmit = document.querySelector("#btn-submit");

const populateQuestions = (questions, selector) => {
  const listQuestionsView = document.querySelector(selector);
  clear(listQuestionsView);
  questions.forEach((question, index) => {
    const questionView = renderQuestion({ question, index });
    listQuestionsView.appendChild(questionView);
  });
};

// render view
const renderQuestion = ({ question, index }) =>
  createElement({
    tag: "li",
    style: "question",
    children: [
      createElement({
        tag: "h2",
        style: "question__index",
        child: `Question ${index + 1} of 10`,
      }),
      createElement({
        tag: "p",
        style: "question__title",
        child: question.text,
      }),
      createElement({
        tag: "form",
        style: "choices",
        children: question.answers.map((answer, i) =>
          renderAnswer({
            text: answer,
            questionId: question._id,
            index: i,
            checked: answers[question._id] === i,
            correct: question.correct === i,
          })
        ),
      }),
    ],
  });
const renderAnswer = ({
  text,
  questionId,
  index,
  checked = false,
  correct = false,
}) => {
  const onChange = (e) => {
    answers[questionId] = index;
    onChoicePicked(e);
  };
  const style = checked
    ? correct
      ? "choice--correct"
      : "choice--wrong"
    : correct
    ? "choice--right"
    : "choice--un-selected";
  const radioRef = useRef();
  const e = createElement({
    tag: "label",
    styles: ["choice", style],
    children: [
      createElement({
        tag: "input",
        id: `${questionId}__${index}`,
        style: "choice__radio",
        attributes: {
          name: questionId,
          type: "radio",
        },
        events: {
          change: onChange,
        },
        ref: radioRef,
      }),
      createElement({
        tag: "p",
        style: "choice__value",
        child: text,
      }),
    ],
  });
  if (checked) {
    radioRef.ref.checked = true;
  }
  return e;
};
const onClickSubmit = async (event) => {
  if (window.confirm("Are you sure you want to finish this quiz?")) {
    const response = await submitAnswers({ attemptId, answers });
    if (!response.ok) return;
    const data = await response.json();
    console.log(data);
    const { questions, score, correctAnswers, scoreText } = data;
    questions.forEach((q) => {
      q.correct = correctAnswers[q._id];
    });

    populateQuestions(questions, "#review-quiz > .questions");
    const cardResultView = document.querySelector("#review-quiz > .card");
    cardResultView.querySelector(".result__score").innerText = `${score}/10`;
    cardResultView.querySelector(".result__percent").innerText = `${
      (score / 10) * 100
    }%`;
    cardResultView.querySelector(".card__description").innerText = scoreText;

    navigate("#review-quiz", false);
  }
};

const onChoicePicked = (e) => {
  const selected = e.currentTarget;
  const selectedLabel = selected.parentNode;
  const containerForm = selectedLabel.parentNode;

  const lastSelected = containerForm.querySelector(".choice--selected");
  if (lastSelected) {
    lastSelected.classList.add("choice--un-selected");
    lastSelected.classList.remove("choice--selected");
  }
  selectedLabel.classList.remove("choice--un-selected");
  selectedLabel.classList.add("choice--selected");
};

btnSubmit.addEventListener("click", onClickSubmit);

//____________ Quiz Review ____________
const btnRetry = document.querySelector("#btn-retry");
const onClickRetry = (event) => {
  navigate("#introduction");
};
btnRetry.addEventListener("click", onClickRetry);

//____________Lib____________________
const navigate = (destination, scrollToTop = true) => {
  const container = document.querySelector("#nav-container");

  const lastScreen = container.querySelector(".visible");
  lastScreen?.classList.remove("visible");
  lastScreen?.classList.add("hidden");

  const shownScreen = container.querySelector(destination);
  shownScreen?.classList.remove("hidden");
  shownScreen?.classList.add("visible");
  if (scrollToTop) document.body.scrollIntoView(true);
};
const clear = (element) => {
  while (element.firstChild) element.removeChild(element.lastChild);
};

const createElement = ({
  tag = "div",
  id = null,
  style = null,
  styles = [],
  child = null,
  children = [],
  attributes = [],
  events = [],
  ref = null,
}) => {
  const element = document.createElement(tag);
  if (id) element.id = id;

  if (style) element.classList.add(style);
  styles.forEach((s) => {
    element.classList.add(s);
  });

  if (child) {
    if (typeof child === "string") {
      element.innerText = child;
    } else if (typeof child === "HTMLElement") {
      element.appendChild(child);
    }
  }
  children.forEach((child) => {
    element.appendChild(child);
  });
  for (const a in attributes) {
    element.setAttribute(a, attributes[a]);
  }

  for (const e in events) {
    element.addEventListener(e, events[e]);
  }
  if (ref != null) ref.ref = element;
  return element;
};

const useRef = () => ({
  ref: undefined,
});

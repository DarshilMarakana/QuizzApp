import React, { useEffect, useState } from "react";
import "./App.css";

const API_URL = "https://opentdb.com/api.php?amount=10&category=9&difficulty=medium&type=multiple&encode=url3986";

function decode(str) {
  try {
    return decodeURIComponent(str);
  } catch {
    return str;
  }
}

// Simulated explanations for known answers
const EXPLANATIONS = {
  "Clyde": "The River Clyde flows through the city of Glasgow, Scotland, and was vital during the Industrial Revolution.",
  "George Washington": "George Washington was the first president of the United States, serving from 1789 to 1797.",
  "Einstein": "Albert Einstein developed the theory of relativity and won the Nobel Prize in Physics in 1921."
};

export default function App() {
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => {
        const formatted = data.results.map((q) => {
          const question = decode(q.question);
          const correct_answer = decode(q.correct_answer);
          const incorrect_answers = q.incorrect_answers.map(decode);
          const options = [...incorrect_answers, correct_answer].sort(() => Math.random() - 0.5);
          const explanation = EXPLANATIONS[correct_answer] || null;
          return { question, options, answer: correct_answer, explanation };
        });
        setQuestions(formatted);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const current = questions[index];

  const handleOptionClick = (option) => {
    if (showFeedback) return;
    setSelected(option);
    if (option === current.answer) setScore(s => s + 1);
    setShowFeedback(true);
  };

  const handleNext = () => {
    if (index + 1 < questions.length) {
      setIndex(index + 1);
      setSelected(null);
      setShowFeedback(false);
    } else {
      setFinished(true);
    }
  };

  const restartQuiz = () => {
    window.location.reload(); // Reload to fetch new data
  };

  if (loading) return <div className="container">Loading quiz...</div>;
  if (!questions.length) return <div className="container">No questions available.</div>;

  return (
    <div className="container">
      <div className="quiz-card">
        <h1 className="title">General Knowledge Quiz</h1>

        {finished ? (
          <>
            <h2 className="finished-title">🎉 Quiz Finished!</h2>
            <p className="score-text">
              Your Score: <strong>{score}</strong> / {questions.length}
            </p>
            <button onClick={restartQuiz} className="btn">
              Restart Quiz
            </button>
          </>
        ) : (
          <>
            <div className="question">
              <strong>Q{index + 1}:</strong> {current.question}
            </div>

            <div className="options">
              {current.options.map((option, i) => {
                const isCorrect = option === current.answer;
                const isSelected = option === selected;

                let className = "option-btn";
                if (showFeedback) {
                  if (isCorrect) className += " correct";
                  else if (isSelected) className += " incorrect";
                }

                return (
                  <button
                    key={i}
                    className={className}
                    onClick={() => handleOptionClick(option)}
                    disabled={showFeedback}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            {showFeedback && (
              <div className="explanation">
                <strong>Correct Answer:</strong> {current.answer}
                <br />
                {current.explanation && (
                  <em>{current.explanation}</em>
                )}
              </div>
            )}

            {showFeedback && (
              <button onClick={handleNext} className="btn">
                {index + 1 === questions.length ? "Finish" : "Next"}
              </button>
            )}

            <div className="score">Score: {score}</div>
          </>
        )}
      </div>
    </div>
  );
}

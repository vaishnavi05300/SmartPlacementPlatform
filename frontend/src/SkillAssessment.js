import React, { useEffect, useState } from "react";

const API_URL = "https://smartplacementplatform.onrender.com";

const questions = [
  {
    question: "Which keyword is used to define a function in Python?",
    options: ["function", "def", "fun", "define"],
    answer: "def",
  },
  {
    question: "What is the output of print(2 ** 3) in Python?",
    options: ["6", "8", "9", "5"],
    answer: "8",
  },
  {
    question: "Which HTML tag is used to create a hyperlink?",
    options: ["<link>", "<href>", "<a>", "<url>"],
    answer: "<a>",
  },
  {
    question: "Which CSS property changes the text color?",
    options: ["font-style", "background", "text-style", "color"],
    answer: "color",
  },
  {
    question: "Which JavaScript keyword declares a block-scoped variable?",
    options: ["var", "let", "define", "int"],
    answer: "let",
  },
];

function SkillAssessment({ token }) {
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState("");
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [started, setStarted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadStudents() {
      setLoading(true);
      setMessage("");

      try {
        if (!token) {
          throw new Error(
            "Login token is missing. Please log in again."
          );
        }

        const response = await fetch(`${API_URL}/api/students`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();

          throw new Error(
            errorText ||
              `Unable to load students (HTTP ${response.status}).`
          );
        }

        const data = await response.json();

        if (!cancelled) {
          const studentList = Array.isArray(data) ? data : [];
          setStudents(studentList);
        }
      } catch (error) {
        if (!cancelled) {
          setMessage(
            error.message || "Unable to load students."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadStudents();

    return () => {
      cancelled = true;
    };
  }, [token]);

  function startAssessment() {
    if (!studentId) {
      setMessage("Please select a student before starting.");
      return;
    }

    setMessage("");
    setAnswers({});
    setCurrentQuestion(0);
    setScore(0);
    setSubmitted(false);
    setStarted(true);
  }

  function selectAnswer(answer) {
    setAnswers((previous) => ({
      ...previous,
      [currentQuestion]: answer,
    }));
  }

  function goToPrevious() {
    if (currentQuestion > 0) {
      setCurrentQuestion((previous) => previous - 1);
    }
  }

  function goToNext() {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((previous) => previous + 1);
    }
  }

  async function submitAssessment() {
    const unanswered = questions.some(
      (_, index) => answers[index] === undefined
    );

    if (unanswered) {
      setMessage("Please answer all questions before submitting.");
      return;
    }

    if (!token) {
      setMessage("Login token is missing. Please log in again.");
      return;
    }

    const calculatedScore = questions.reduce(
      (total, question, index) =>
        total + (answers[index] === question.answer ? 1 : 0),
      0
    );

    setSubmitting(true);
    setMessage("");

    try {
      const payload = {
        studentId: Number(studentId),
        skillCategory: "Programming & Web Development",
        totalQuestions: questions.length,
        correctAnswers: calculatedScore,
      };

      const response = await fetch(`${API_URL}/api/assessments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
          errorText ||
            `Assessment submission failed (HTTP ${response.status}).`
        );
      }

      setScore(calculatedScore);
      setSubmitted(true);
      setMessage("Assessment submitted successfully!");
    } catch (error) {
      setMessage(
        error.message || "Could not submit your assessment."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <p>Loading students...</p>;
  }

  const question = questions[currentQuestion];
  const percentage = Math.round((score / questions.length) * 100);

  return (
    <div className="quiz-container">
      {message && (
        <p className="message" role="status">
          {message}
        </p>
      )}

      {!started && !submitted && (
        <div className="quiz-start">
          <h3>Programming & Web Development Assessment</h3>

          <p>
            Test your basic programming and web development knowledge.
          </p>

          <p>
            Total Questions: {questions.length}
          </p>

          <label htmlFor="studentId">
            Select Student
          </label>

          <select
            id="studentId"
            value={studentId}
            onChange={(event) => {
              setStudentId(event.target.value);
              setMessage("");
            }}
          >
            <option value="">-- Select a student --</option>

            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.fullName || student.name} - {student.email}
              </option>
            ))}
          </select>

          {students.length === 0 && (
            <p>
              No students found. Please register a student first.
            </p>
          )}

          <button
            type="button"
            onClick={startAssessment}
            disabled={students.length === 0}
          >
            Start Assessment
          </button>
        </div>
      )}

      {started && !submitted && (
        <div className="quiz-question">
          <div className="quiz-progress">
            <p>
              Question {currentQuestion + 1} of {questions.length}
            </p>

            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${
                    ((currentQuestion + 1) / questions.length) * 100
                  }%`,
                }}
              />
            </div>
          </div>

          <h3>{question.question}</h3>

          <div className="quiz-options">
            {question.options.map((option) => (
              <label
                key={option}
                className={`quiz-option ${
                  answers[currentQuestion] === option
                    ? "selected"
                    : ""
                }`}
              >
                <input
                  type="radio"
                  name={`question-${currentQuestion}`}
                  value={option}
                  checked={answers[currentQuestion] === option}
                  onChange={() => selectAnswer(option)}
                />

                <span>{option}</span>
              </label>
            ))}
          </div>

          <div className="quiz-actions">
            <button
              type="button"
              onClick={goToPrevious}
              disabled={currentQuestion === 0}
            >
              Previous
            </button>

            {currentQuestion < questions.length - 1 ? (
              <button
                type="button"
                onClick={goToNext}
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={submitAssessment}
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit Assessment"}
              </button>
            )}
          </div>
        </div>
      )}

      {submitted && (
        <div className="quiz-result">
          <h3>Assessment Completed!</h3>

          <p>
            Student:{" "}
            {(() => {
              const student = students.find(
                (item) => String(item.id) === String(studentId)
              );

              return student
                ? student.fullName || student.name
                : "Selected student";
            })()}
          </p>

          <p>
            Score: {score} / {questions.length}
          </p>

          <p>Percentage: {percentage}%</p>

          <p>
            {percentage >= 80
              ? "Excellent work!"
              : percentage >= 60
              ? "Good job! Keep practicing."
              : "Keep learning and try again."}
          </p>

          <button
            type="button"
            onClick={() => {
              setStarted(false);
              setSubmitted(false);
              setAnswers({});
              setCurrentQuestion(0);
              setScore(0);
              setMessage("");
            }}
          >
            Take Assessment Again
          </button>
        </div>
      )}
    </div>
  );
}

export default SkillAssessment;
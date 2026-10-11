import React, { useEffect, useState } from "react";

const API_URL = "http://localhost:8080";

function AssessmentResults({ token }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadResults() {
      setLoading(true);
      setError("");

      try {
        if (!token) {
          throw new Error("Login token is missing. Please log in again.");
        }

        const response = await fetch(`${API_URL}/api/assessments`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(
            text || `Unable to load results (HTTP ${response.status}).`
          );
        }

        const data = await response.json();

        if (!cancelled) {
          setResults(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to load assessment results.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadResults();

    return () => {
      cancelled = true;
    };
  }, [token]);

  function getPercentage(result) {
    if (result.percentage != null) {
      return Number(result.percentage);
    }

    const total = Number(result.totalQuestions || 0);
    const correct = Number(result.correctAnswers || 0);

    return total > 0 ? (correct / total) * 100 : 0;
  }

  function getDate(result) {
  const value = result.assessedAt;

  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

  const average =
    results.length > 0
      ? results.reduce((sum, result) => sum + getPercentage(result), 0) /
        results.length
      : 0;

  if (loading) {
    return (
      <div className="results-page">
        <p>Loading assessment results...</p>
      </div>
    );
  }

  return (
    <div className="results-page">
      <div className="results-heading">
        <div>
          <h2>Assessment Results</h2>
          <p>Review student performance and assessment scores.</p>
        </div>

        <button
          type="button"
          className="results-refresh"
          onClick={() => window.location.reload()}
        >
          Refresh Results
        </button>
      </div>

      {error && (
        <p className="results-error" role="alert">
          {error}
        </p>
      )}

      {!error && (
        <>
          <div className="results-summary">
            <div className="result-summary-card">
              <span>Total Assessments</span>
              <strong>{results.length}</strong>
              <small>Assessments completed</small>
            </div>

            <div className="result-summary-card">
              <span>Average Score</span>
              <strong>{average.toFixed(1)}%</strong>
              <small>Across all assessments</small>
            </div>

            <div className="result-summary-card">
              <span>Highest Score</span>
              <strong>
                {results.length
                  ? `${Math.max(...results.map(getPercentage)).toFixed(1)}%`
                  : "—"}
              </strong>
              <small>Best assessment result</small>
            </div>
          </div>

          <div className="results-table-card">
            <div className="results-table-heading">
              <h3>Assessment History</h3>
              <span>{results.length} records</span>
            </div>

            {results.length === 0 ? (
              <div className="results-empty">
                <h3>No results yet</h3>
                <p>Complete a skill assessment to see results here.</p>
              </div>
            ) : (
              <div className="results-table-container">
                <table className="results-table">
                  <thead>
                    <tr>
                      <th>Result ID</th>
                      <th>Student ID</th>
                      <th>Skill Category</th>
                      <th>Score</th>
                      <th>Percentage</th>
                      <th>Date</th>
                    </tr>
                  </thead>

                  <tbody>
                    {results.map((result, index) => {
                      const percentage = getPercentage(result);

                      return (
                        <tr
                          key={
                            result.id ??
                            result.assessmentId ??
                            index
                          }
                        >
                          <td>
                            <span className="result-id">
                              #{result.id ?? result.assessmentId ?? "—"}
                            </span>
                          </td>

                          <td>
                            {result.studentId ?? result.student?.id ?? "—"}
                          </td>

                          <td>
                            {result.skillCategory || "—"}
                          </td>

                          <td>
                            {result.correctAnswers ?? 0} /{" "}
                            {result.totalQuestions ?? 0}
                          </td>

                          <td>
                            <span
                              className={`score-badge ${
                                percentage >= 75
                                  ? "score-high"
                                  : percentage >= 50
                                  ? "score-medium"
                                  : "score-low"
                              }`}
                            >
                              {percentage.toFixed(1)}%
                            </span>
                          </td>

                          <td>{getDate(result)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default AssessmentResults;
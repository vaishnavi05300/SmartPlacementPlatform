import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
  Outlet,
  useNavigate,
  useLocation,
} from "react-router-dom";

import "./App.css";
import Login from "./Login";
import Register from "./Register";
import SkillAssessment from "./SkillAssessment";
import AssessmentResults from "./AssessmentResults";

const API_URL = "https://smartplacementplatform.onrender.com/api/students";

const emptyForm = {
  fullName: "",
  email: "",
  department: "",
  skills: "",
};

function readSavedAuth() {
  try {
    const saved = sessionStorage.getItem("authData");
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

function AppRoutes() {
  const [authData, setAuthData] = useState(readSavedAuth);

  function handleLogin(data) {
    sessionStorage.setItem("authData", JSON.stringify(data));
    setAuthData(data);
  }

  function handleLogout() {
    sessionStorage.removeItem("authData");
    setAuthData(null);
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          authData ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Login
              onLogin={handleLogin}
              onShowRegister={() => {
                window.location.href = "/register";
              }}
            />
          )
        }
      />

      <Route
        path="/register"
        element={
          authData ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Register
              onRegistered={() => {
                window.location.href = "/login";
              }}
              onShowLogin={() => {
                window.location.href = "/login";
              }}
            />
          )
        }
      />

      <Route
        element={
          authData ? (
            <MainLayout
              authData={authData}
              onLogout={handleLogout}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      >
        <Route
          path="/dashboard"
          element={<DashboardPage token={authData?.token} />}
        />

        <Route
          path="/register-student"
          element={
            <StudentRegistrationPage token={authData?.token} />
          }
        />

        <Route
          path="/students"
          element={<StudentsPage token={authData?.token} />}
        />

        <Route
          path="/quiz"
          element={<QuizPage token={authData?.token} />}
        />

        <Route
          path="/results"
          element={<ResultsPage token={authData?.token} />}
        />
      </Route>

      <Route
        path="/"
        element={
          <Navigate
            to={authData ? "/dashboard" : "/login"}
            replace
          />
        }
      />

      <Route
        path="*"
        element={
          <Navigate
            to={authData ? "/dashboard" : "/login"}
            replace
          />
        }
      />
    </Routes>
  );
}

function MainLayout({ authData, onLogout }) {
  const navigate = useNavigate();

  function logout() {
    onLogout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div>
            <h1>Smart Placement Platform</h1>
            <p>Skill Assessment and Student Management</p>
          </div>

          <div className="header-actions">
            <span>
              Welcome, {authData.name || authData.email}
            </span>

            <button
              className="logout-button"
              type="button"
              onClick={logout}
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <nav className="navbar">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/register-student">Register Student</Link>
        <Link to="/students">Students</Link>
        <Link to="/quiz">Skill Assessment</Link>
        <Link to="/results">Assessment Results</Link>
      </nav>

      <main className="main-content">
        <Outlet />
      </main>

      <footer className="app-footer">
        <p>Smart Placement and Skill Assessment Platform</p>
      </footer>
    </div>
  );
}

function authHeaders(token, extraHeaders = {}) {
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extraHeaders,
  };
}

async function readError(response, fallback) {
  const text = await response.text();

  if (!text) {
    return `${fallback} (HTTP ${response.status})`;
  }

  try {
    const data = JSON.parse(text);
    return data.message || data.error || text;
  } catch {
    return text;
  }
}

function DashboardPage({ token }) {
  const [studentCount, setStudentCount] = useState(0);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadCount() {
      try {
        const response = await fetch(API_URL, {
          headers: authHeaders(token),
        });

        if (!response.ok) {
          throw new Error(
            await readError(response, "Unable to load students")
          );
        }

        const data = await response.json();

        if (!cancelled) {
          setStudentCount(
            Array.isArray(data) ? data.length : 0
          );
        }
      } catch (error) {
        if (!cancelled) {
          setMessage(
            error.message || "Unable to load students."
          );
        }
      }
    }

    loadCount();

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <>
      <section className="hero">
        <h2>Build Your Career. Measure Your Skills.</h2>
        <p>
          Manage student profiles, assess technical skills, and review
          assessment performance in one place.
        </p>
      </section>

      <section className="stats">
        <div className="stat-card">
          <h3>{studentCount}</h3>
          <p>Registered Students</p>
        </div>

        <div className="stat-card">
          <h3>5</h3>
          <p>Quiz Questions</p>
        </div>

        <div className="stat-card">
          <h3>24/7</h3>
          <p>Learning Access</p>
        </div>
      </section>

      {message && (
        <p className="message">{message}</p>
      )}

      <section className="form-section">
        <h2>Welcome to Your Dashboard</h2>
        <p>
          Select a section from the navigation menu to get started.
        </p>

        <div className="form-actions">
          <Link
            className="page-link-button"
            to="/register-student"
          >
            Register Student
          </Link>

          <Link
            className="page-link-button"
            to="/students"
          >
            View Students
          </Link>

          <Link
            className="page-link-button"
            to="/quiz"
          >
            Start Skill Assessment
          </Link>

          <Link
            className="page-link-button"
            to="/results"
          >
            View Results
          </Link>
        </div>
      </section>
    </>
  );
}

function StudentRegistrationPage({ token }) {
  const navigate = useNavigate();
  const location = useLocation();

  const editingStudent = location.state?.student || null;

  const [form, setForm] = useState(() =>
    editingStudent
      ? {
          fullName:
            editingStudent.fullName ||
            editingStudent.name ||
            "",
          email: editingStudent.email || "",
          department: editingStudent.department || "",
          skills: editingStudent.skills || "",
        }
      : emptyForm
  );

  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const student = location.state?.student;

    setForm(
      student
        ? {
            fullName:
              student.fullName || student.name || "",
            email: student.email || "",
            department: student.department || "",
            skills: student.skills || "",
          }
        : emptyForm
    );

    setMessage("");
  }, [location.state]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setSaving(true);
    setMessage("");

    try {
      if (!token) {
        throw new Error(
          "Login token is missing. Please log in again."
        );
      }

      const isEditing = Boolean(editingStudent?.id);

      const response = await fetch(
        isEditing
          ? `${API_URL}/${editingStudent.id}`
          : API_URL,
        {
          method: isEditing ? "PUT" : "POST",
          headers: authHeaders(token, {
            "Content-Type": "application/json",
          }),
          body: JSON.stringify(form),
        }
      );

      if (!response.ok) {
        throw new Error(
          await readError(
            response,
            "Student registration failed."
          )
        );
      }

      setMessage(
        isEditing
          ? "Student details updated successfully!"
          : "Student registered successfully!"
      );

      setForm(emptyForm);

      if (isEditing) {
        navigate("/students", { replace: true });
      }
    } catch (error) {
      setMessage(
        error.message || "Could not register student."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="form-section">
      <h2>
        {editingStudent
          ? "Edit Student"
          : "Register a Student"}
      </h2>

      <p>Add student details to the placement platform.</p>

      <form
        onSubmit={handleSubmit}
        className="student-form"
      >
        <label htmlFor="fullName">Full Name</label>
        <input
          id="fullName"
          name="fullName"
          value={form.fullName}
          onChange={handleChange}
          placeholder="Enter full name"
          required
        />

        <label htmlFor="email">Email Address</label>
        <input
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Enter email address"
          required
        />

        <label htmlFor="department">Department</label>
        <input
          id="department"
          name="department"
          value={form.department}
          onChange={handleChange}
          placeholder="Example: CSE"
          required
        />

        <label htmlFor="skills">Skills</label>
        <input
          id="skills"
          name="skills"
          value={form.skills}
          onChange={handleChange}
          placeholder="Python, Java, SQL"
        />

        <div className="form-actions">
          <button type="submit" disabled={saving}>
            {saving
              ? "Saving..."
              : editingStudent
              ? "Update Student"
              : "Register Student"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/students")}
          >
            View Students
          </button>
        </div>
      </form>

      {message && (
        <p role="status" className="message">
          {message}
        </p>
      )}
    </section>
  );
}

function StudentsPage({ token }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  const navigate = useNavigate();

  async function loadStudents() {
    setLoading(true);
    setMessage("");

    try {
      if (!token) {
        throw new Error(
          "Login token is missing. Please log in again."
        );
      }

      const response = await fetch(API_URL, {
        headers: authHeaders(token),
      });

      if (!response.ok) {
        throw new Error(
          await readError(
            response,
            "Unable to load students."
          )
        );
      }

      const data = await response.json();

      setStudents(
        Array.isArray(data) ? data : []
      );
    } catch (error) {
      setMessage(
        error.message || "Unable to load students."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStudents();

    // Refresh the list when the token changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function deleteStudent(id) {
    if (!window.confirm("Delete this student?")) {
      return;
    }

    setDeletingId(id);
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/${id}`,
        {
          method: "DELETE",
          headers: authHeaders(token),
        }
      );

      if (!response.ok) {
        throw new Error(
          await readError(
            response,
            "Unable to delete student."
          )
        );
      }

      setMessage("Student deleted successfully.");

      await loadStudents();
    } catch (error) {
      setMessage(
        error.message || "Unable to delete student."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="students-section">
      <h2>Registered Students</h2>

      {message && (
        <p role="status" className="message">
          {message}
        </p>
      )}

      {loading ? (
        <p>Loading students...</p>
      ) : students.length === 0 ? (
        !message && <p>No students registered yet.</p>
      ) : (
        <div className="students-grid">
          {students.map((student) => (
            <article
              className="student-card"
              key={student.id}
            >
              <h3>
                {student.fullName || student.name}
              </h3>

              <p>
                <strong>Email:</strong> {student.email}
              </p>

              <p>
                <strong>Department:</strong>{" "}
                {student.department}
              </p>

              <p>
                <strong>Skills:</strong>{" "}
                {student.skills || "Not specified"}
              </p>

              <div className="student-actions">
                <button
                  type="button"
                  onClick={() =>
                    navigate("/register-student", {
                      state: { student },
                    })
                  }
                >
                  Edit
                </button>

                <button
                  type="button"
                  disabled={deletingId === student.id}
                  onClick={() =>
                    deleteStudent(student.id)
                  }
                >
                  {deletingId === student.id
                    ? "Deleting..."
                    : "Delete"}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <Link
        className="page-link-button"
        to="/register-student"
      >
        Register Another Student
      </Link>
    </section>
  );
}

function QuizPage({ token }) {
  return (
    <section className="form-section">
      <h2>Skill Assessment</h2>
      <SkillAssessment token={token} />
    </section>
  );
}

function ResultsPage({ token }) {
  return (
    <section className="form-section">
      <h2>Assessment Results</h2>
      <AssessmentResults token={token} />
    </section>
  );
}

export default App;
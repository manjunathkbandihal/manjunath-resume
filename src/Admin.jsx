import React, { useEffect, useState } from "react";
import {
  LogIn,
  LogOut,
  Save,
  User,
  Briefcase,
  Code,
  FolderKanban,
  Award,
  Mail,
  Phone,
  Linkedin,
} from "lucide-react";

import { supabase } from "./supabase";

const emptyContent = {
  name: "Manjunath Bandihal",
  title: "Data Annotation Team Lead",
  about: "",
  experience: [
    {
      role: "",
      company: "",
      description: "",
    },
  ],
  skills: [],
  projects: [],
  achievements: [],
  education: [],
  contact: {
    email: "",
    phone: "",
    linkedin: "",
  },
};

export default function Admin() {
  const [session, setSession] = useState(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [content, setContent] = useState(emptyContent);

  const [checkingSession, setCheckingSession] =
    useState(true);

  const [loadingContent, setLoadingContent] =
    useState(false);

  const [loggingIn, setLoggingIn] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      try {
        const {
          data,
          error,
        } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (!mounted) return;

        if (data?.session) {
          setSession(data.session);
          loadContent();
        }

      } catch (err) {
        console.error(err);

        if (mounted) {
          setError(
            err?.message ||
              "Unable to check login session."
          );
        }
      } finally {
        if (mounted) {
          setCheckingSession(false);
        }
      }
    }

    checkSession();

    const {
      data: listener,
    } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        if (!mounted) return;

        setSession(newSession);

        if (newSession) {
          loadContent();
        }
      }
    );

    return () => {
      mounted = false;

      listener?.subscription?.unsubscribe();
    };
  }, []);

  async function loadContent() {
    try {
      setLoadingContent(true);
      setError("");

      const {
        data,
        error,
      } = await supabase
        .from("site_content")
        .select("content")
        .eq("id", "main")
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (data?.content) {
        const saved = data.content;

        setContent({
          ...emptyContent,
          ...saved,

          experience:
            saved.experience?.length
              ? saved.experience
              : emptyContent.experience,

          skills:
            saved.skills || [],

          projects:
            saved.projects || [],

          achievements:
            saved.achievements || [],

          contact: {
            ...emptyContent.contact,
            ...(saved.contact || {}),
          },
        });
      }

    } catch (err) {
      console.error(err);

      setError(
        err?.message ||
          "Unable to load website content."
      );
    } finally {
      setLoadingContent(false);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();

    setError("");
    setMessage("");
    setLoggingIn(true);

    try {
      if (!email.trim() || !password) {
        throw new Error(
          "Please enter your email and password."
        );
      }

      const {
        data,
        error,
      } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        throw error;
      }

      if (!data?.session) {
        throw new Error(
          "Login succeeded but no session was created."
        );
      }

      setSession(data.session);

      await loadContent();

    } catch (err) {
      console.error(err);

      setError(
        err?.message ||
          "Login failed."
      );
    } finally {
      setLoggingIn(false);
    }
  }

  async function handleLogout() {
    setError("");
    setMessage("");

    await supabase.auth.signOut();

    setSession(null);
    setPassword("");
  }

  function updateField(field, value) {
    setContent((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updateContact(field, value) {
    setContent((current) => ({
      ...current,

      contact: {
        ...current.contact,
        [field]: value,
      },
    }));
  }

  function updateExperience(field, value) {
    setContent((current) => {
      const experience = [
        ...(current.experience || []),
      ];

      experience[0] = {
        ...(experience[0] || {}),
        [field]: value,
      };

      return {
        ...current,
        experience,
      };
    });
  }

  function updateSkills(value) {
    const skills = value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    updateField("skills", skills);
  }

  function updateAchievements(value) {
    const achievements = value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

    updateField(
      "achievements",
      achievements
    );
  }

  function updateProjects(value) {
    const projects = value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const separator = line.indexOf(":");

        if (separator === -1) {
          return {
            title: line,
            description: "",
          };
        }

        return {
          title: line
            .slice(0, separator)
            .trim(),

          description: line
            .slice(separator + 1)
            .trim(),
        };
      });

    updateField("projects", projects);
  }

  async function saveChanges() {
    try {
      setSaving(true);
      setError("");
      setMessage("");

      const {
        error,
      } = await supabase
        .from("site_content")
        .update({
          content,
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", "main");

      if (error) {
        throw error;
      }

      setMessage(
        "Changes saved successfully! 🎉"
      );

    } catch (err) {
      console.error(err);

      setError(
        err?.message ||
          "Unable to save changes."
      );
    } finally {
      setSaving(false);
    }
  }

  if (checkingSession) {
    return (
      <div className="admin-page">
        <div className="admin-card">
          <div className="admin-spinner">
            Loading...
          </div>

          <h2>Checking login...</h2>

          <p>
            Please wait while we connect to
            your account.
          </p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="admin-page">
        <div className="admin-login-card">

          <div className="admin-logo">
            MB
          </div>

          <div className="editor-label">
            PRIVATE ADMIN AREA
          </div>

          <h1>
            Welcome Back
          </h1>

          <p className="admin-subtitle">
            Login to edit your resume website.
          </p>

          <form
            onSubmit={handleLogin}
            className="admin-login-form"
          >

            <label>
              Email
            </label>

            <input
              type="email"
              placeholder="Enter admin email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              autoComplete="email"
            />

            <label>
              Password
            </label>

            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              autoComplete="current-password"
            />

            {error && (
              <div className="admin-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="admin-login-btn"
              disabled={loggingIn}
            >
              <LogIn size={18} />

              {loggingIn
                ? "Logging in..."
                : "Login"}
            </button>

          </form>

          <button
            className="back-home"
            onClick={() => {
              window.location.href = "/";
            }}
          >
            ← Back to Website
          </button>

        </div>
      </div>
    );
  }

  return (
    <div className="editor-page">

      <header className="editor-header">

        <div>
          <div className="editor-label">
            ADMIN PANEL
          </div>

          <h1>
            Edit My Website
          </h1>

          <p>
            Logged in as{" "}
            {session.user?.email}
          </p>
        </div>

        <button
          className="logout-btn"
          onClick={handleLogout}
        >
          <LogOut size={18} />
          Logout
        </button>

      </header>

      <main className="editor-container">

        {loadingContent && (
          <div className="admin-info">
            Loading your website content...
          </div>
        )}

        {error && (
          <div className="admin-error">
            {error}
          </div>
        )}

        {message && (
          <div className="admin-success">
            {message}
          </div>
        )}

        <section className="editor-card">

          <div className="editor-card-title">
            <User size={20} />
            <h2>
              Profile
            </h2>
          </div>

          <label>
            Name
          </label>

          <input
            value={content.name}
            onChange={(e) =>
              updateField(
                "name",
                e.target.value
              )
            }
          />

          <label>
            Professional Title
          </label>

          <input
            value={content.title}
            onChange={(e) =>
              updateField(
                "title",
                e.target.value
              )
            }
          />

          <label>
            About Me
          </label>

          <textarea
            rows="7"
            value={content.about}
            onChange={(e) =>
              updateField(
                "about",
                e.target.value
              )
            }
          />

        </section>

        <section className="editor-card">

          <div className="editor-card-title">
            <Briefcase size={20} />
            <h2>
              Experience
            </h2>
          </div>

          <label>
            Job Role
          </label>

          <input
            value={
              content.experience?.[0]?.role ||
              ""
            }
            onChange={(e) =>
              updateExperience(
                "role",
                e.target.value
              )
            }
          />

          <label>
            Company
          </label>

          <input
            value={
              content.experience?.[0]?.company ||
              ""
            }
            onChange={(e) =>
              updateExperience(
                "company",
                e.target.value
              )
            }
          />

          <label>
            Experience Description
          </label>

          <textarea
            rows="7"
            value={
              content.experience?.[0]
                ?.description || ""
            }
            onChange={(e) =>
              updateExperience(
                "description",
                e.target.value
              )
            }
          />

        </section>

        <section className="editor-card">

          <div className="editor-card-title">
            <Code size={20} />
            <h2>
              Skills
            </h2>
          </div>

          <label>
            Skills
          </label>

          <textarea
            rows="5"
            placeholder="Data Annotation, QA, Team Management..."
            value={(
              content.skills || []
            ).join(", ")}
            onChange={(e) =>
              updateSkills(
                e.target.value
              )
            }
          />

        </section>

        <section className="editor-card">

          <div className="editor-card-title">
            <FolderKanban size={20} />
            <h2>
              Projects
            </h2>
          </div>

          <label>
            Projects
          </label>

          <p className="field-help">
            One project per line.
            Format:
            Project Name: Description
          </p>

          <textarea
            rows="8"
            value={(
              content.projects || []
            )
              .map(
                (project) =>
                  `${project.title || ""}: ${
                    project.description ||
                    project.text ||
                    ""
                  }`
              )
              .join("\n")}
            onChange={(e) =>
              updateProjects(
                e.target.value
              )
            }
          />

        </section>

        <section className="editor-card">

          <div className="editor-card-title">
            <Award size={20} />
            <h2>
              Achievements
            </h2>
          </div>

          <label>
            Achievements
          </label>

          <p className="field-help">
            One achievement per line.
          </p>

          <textarea
            rows="7"
            value={(
              content.achievements || []
            ).join("\n")}
            onChange={(e) =>
              updateAchievements(
                e.target.value
              )
            }
          />

        </section>

        <section className="editor-card">

          <div className="editor-card-title">
            <Mail size={20} />
            <h2>
              Contact
            </h2>
          </div>

          <label>
            Email
          </label>

          <input
            type="email"
            value={
              content.contact?.email ||
              ""
            }
            onChange={(e) =>
              updateContact(
                "email",
                e.target.value
              )
            }
          />

          <label>
            Phone
          </label>

          <input
            type="text"
            value={
              content.contact?.phone ||
              ""
            }
            onChange={(e) =>
              updateContact(
                "phone",
                e.target.value
              )
            }
          />

          <label>
            LinkedIn
          </label>

          <input
            type="text"
            value={
              content.contact?.linkedin ||
              ""
            }
            onChange={(e) =>
              updateContact(
                "linkedin",
                e.target.value
              )
            }
          />

        </section>

        <section className="save-area">

          <button
            className="save-btn"
            onClick={saveChanges}
            disabled={
              saving ||
              loadingContent
            }
          >

            <Save size={20} />

            {saving
              ? "Saving..."
              : "Save Changes"}

          </button>

        </section>

      </main>
    </div>
  );
}

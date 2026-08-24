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
  MapPin,
  GraduationCap,
  Camera,
} from "lucide-react";

import { supabase } from "./supabase";

const emptyContent = {
  name: "Manjunath Bandihal",
  title: "Data Annotation Team Lead",
  photo: "",
  about: "",

  personal: {
    location: "",
    education: "",
  },

  experience: [
    {
      role: "",
      company: "",
      period: "",
      description: "",
    },
  ],

  skills: [],

  projects: [],

  achievements: [],

  contact: {
    email: "",
    phone: "",
    linkedin: "",
  },
};

function mergeContent(saved) {
  if (!saved) {
    return emptyContent;
  }

  return {
    ...emptyContent,
    ...saved,

    personal: {
      ...emptyContent.personal,
      ...(saved.personal || {}),
    },

    contact: {
      ...emptyContent.contact,
      ...(saved.contact || {}),
    },

    experience:
      saved.experience && saved.experience.length
        ? saved.experience
        : emptyContent.experience,

    skills: Array.isArray(saved.skills)
      ? saved.skills
      : [],

    projects: Array.isArray(saved.projects)
      ? saved.projects
      : [],

    achievements: Array.isArray(saved.achievements)
      ? saved.achievements
      : [],
  };
}

export default function Admin() {
  const [session, setSession] = useState(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [content, setContent] =
    useState(emptyContent);

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

  /*
   * LOAD WEBSITE CONTENT
   */
  async function loadContent() {
    try {
      setLoadingContent(true);
      setError("");

      console.log(
        "Loading content from Supabase..."
      );

      const {
        data,
        error,
      } = await supabase
        .from("site_content")
        .select("content")
        .eq("id", "main")
        .maybeSingle();

      if (error) {
        console.error(
          "Supabase load error:",
          error
        );

        throw new Error(
          `Supabase error: ${
            error.message || "Unable to load content"
          } | Code: ${
            error.code || "N/A"
          } | Details: ${
            error.details || "N/A"
          } | Hint: ${
            error.hint || "N/A"
          }`
        );
      }

      console.log(
        "Website content loaded:",
        data
      );

      if (data?.content) {
        setContent(
          mergeContent(data.content)
        );
      }
    } catch (err) {
      console.error(
        "FULL LOAD ERROR:",
        err
      );

      if (
        err?.message ===
          "Failed to fetch" ||
        err?.name === "TypeError"
      ) {
        setError(
          "Unable to connect to Supabase. Please check your Supabase URL, publishable key, and Data API settings."
        );
      } else {
        setError(
          err?.message ||
            "Unable to load website content."
        );
      }
    } finally {
      setLoadingContent(false);
    }
  }

  /*
   * CHECK LOGIN SESSION
   */
  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      try {
        console.log(
          "Checking Supabase session..."
        );

        const {
          data,
          error,
        } =
          await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (!mounted) {
          return;
        }

        console.log(
          "Current session:",
          data?.session
        );

        if (data?.session) {
          setSession(data.session);

          await loadContent();
        }
      } catch (err) {
        console.error(
          "Session error:",
          err
        );

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
    } =
      supabase.auth.onAuthStateChange(
        async (_event, newSession) => {
          if (!mounted) {
            return;
          }

          console.log(
            "Auth state changed:",
            _event,
            newSession
          );

          setSession(newSession);

          if (newSession) {
            await loadContent();
          }
        }
      );

    return () => {
      mounted = false;

      listener?.subscription?.unsubscribe();
    };
  }, []);

  /*
   * LOGIN
   */
  async function handleLogin(e) {
    e.preventDefault();

    setError("");
    setMessage("");
    setLoggingIn(true);

    try {
      if (!email.trim()) {
        throw new Error(
          "Please enter your email."
        );
      }

      if (!password) {
        throw new Error(
          "Please enter your password."
        );
      }

      console.log(
        "Attempting Supabase login..."
      );

      const {
        data,
        error,
      } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (error) {
        console.error(
          "Login error:",
          error
        );

        throw new Error(
          `Login error: ${
            error.message ||
            "Login failed"
          }`
        );
      }

      if (!data?.session) {
        throw new Error(
          "Login succeeded but no session was created."
        );
      }

      console.log(
        "Login successful."
      );

      setSession(data.session);

      await loadContent();
    } catch (err) {
      console.error(
        "FULL LOGIN ERROR:",
        err
      );

      if (
        err?.message ===
          "Failed to fetch" ||
        err?.name === "TypeError"
      ) {
        setError(
          "Unable to connect to Supabase. Please check your Supabase configuration."
        );
      } else {
        setError(
          err?.message ||
            "Login failed."
        );
      }
    } finally {
      setLoggingIn(false);
    }
  }

  /*
   * LOGOUT
   */
  async function handleLogout() {
    setError("");
    setMessage("");

    try {
      const {
        error,
      } =
        await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      setSession(null);
      setPassword("");
    } catch (err) {
      console.error(
        "Logout error:",
        err
      );

      setError(
        err?.message ||
          "Unable to logout."
      );
    }
  }

  /*
   * UPDATE MAIN FIELD
   */
  function updateField(field, value) {
    setContent((current) => ({
      ...current,
      [field]: value,
    }));
  }

  /*
   * UPDATE PERSONAL INFORMATION
   */
  function updatePersonal(
    field,
    value
  ) {
    setContent((current) => ({
      ...current,

      personal: {
        ...current.personal,
        [field]: value,
      },
    }));
  }

  /*
   * UPDATE CONTACT INFORMATION
   */
  function updateContact(
    field,
    value
  ) {
    setContent((current) => ({
      ...current,

      contact: {
        ...current.contact,
        [field]: value,
      },
    }));
  }

  /*
   * UPDATE EXPERIENCE
   */
  function updateExperience(
    field,
    value
  ) {
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

  /*
   * UPDATE SKILLS
   */
  function updateSkills(value) {
    const skills = value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    updateField(
      "skills",
      skills
    );
  }

  /*
   * UPDATE ACHIEVEMENTS
   */
  function updateAchievements(
    value
  ) {
    const achievements = value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);

    updateField(
      "achievements",
      achievements
    );
  }

  /*
   * UPDATE PROJECTS
   */
  function updateProjects(value) {
    const projects = value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const separator =
          line.indexOf(":");

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

    updateField(
      "projects",
      projects
    );
  }

  /*
   * SAVE CHANGES
   */
  async function saveChanges() {
    if (saving) {
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      console.log(
        "Starting save..."
      );

      /*
       * Check current login session
       */
      const {
        data: sessionData,
        error: sessionError,
      } =
        await supabase.auth.getSession();

      console.log(
        "Session before save:",
        sessionData
      );

      if (sessionError) {
        throw sessionError;
      }

      if (!sessionData?.session) {
        throw new Error(
          "Your login session has expired. Please login again."
        );
      }

      /*
       * Make sure the content is valid
       */
      const contentToSave = {
        ...content,

        personal: {
          ...(content.personal || {}),
        },

        contact: {
          ...(content.contact || {}),
        },

        experience:
          Array.isArray(
            content.experience
          )
            ? content.experience
            : [],

        skills:
          Array.isArray(
            content.skills
          )
            ? content.skills
            : [],

        projects:
          Array.isArray(
            content.projects
          )
            ? content.projects
            : [],

        achievements:
          Array.isArray(
            content.achievements
          )
            ? content.achievements
            : [],
      };

      console.log(
        "Content being saved:",
        contentToSave
      );

      /*
       * UPDATE SUPABASE
       */
      const {
        data,
        error,
      } =
        await supabase
          .from("site_content")
          .update({
            content: contentToSave,
            updated_at:
              new Date().toISOString(),
          })
          .eq("id", "main")
          .select("id, content, updated_at");

      console.log(
        "Supabase save response:",
        data
      );

      console.log(
        "Supabase save error:",
        error
      );

      if (error) {
        throw new Error(
          `Supabase error: ${
            error.message ||
            "Unable to save changes"
          } | Code: ${
            error.code || "N/A"
          } | Details: ${
            error.details || "N/A"
          } | Hint: ${
            error.hint || "N/A"
          }`
        );
      }

      /*
       * If no row was updated
       */
      if (
        !data ||
        data.length === 0
      ) {
        throw new Error(
          "No data was updated. Please make sure the site_content row with id 'main' exists and your UPDATE policy allows authenticated users."
        );
      }

      /*
       * Update local state with
       * returned Supabase data
       */
      if (data[0]?.content) {
        setContent(
          mergeContent(
            data[0].content
          )
        );
      }

      setMessage(
        "Changes saved successfully! 🎉"
      );

      console.log(
        "SAVE SUCCESSFUL"
      );
    } catch (err) {
      console.error(
        "FULL SAVE ERROR:",
        err
      );

      console.error(
        "Error name:",
        err?.name
      );

      console.error(
        "Error message:",
        err?.message
      );

      console.error(
        "Error stack:",
        err?.stack
      );

      if (
        err?.message ===
          "Failed to fetch" ||
        err?.name === "TypeError" ||
        String(
          err?.message || ""
        ).includes(
          "Failed to fetch"
        )
      ) {
        setError(
          "TypeError: Failed to fetch. The browser cannot connect to Supabase. Please check the Supabase URL, publishable key, and Data API configuration."
        );
      } else {
        setError(
          err?.message ||
            "Unable to save changes."
        );
      }
    } finally {
      setSaving(false);
    }
  }

  /*
   * CHECKING SESSION SCREEN
   */
  if (checkingSession) {
    return (
      <div className="admin-page">
        <div className="admin-card">

          <div className="admin-spinner">
            Loading...
          </div>

          <h2>
            Checking login...
          </h2>

          <p>
            Please wait while we connect
            to your account.
          </p>

        </div>
      </div>
    );
  }

  /*
   * LOGIN SCREEN
   */
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
            Login to edit your resume
            website.
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
                setEmail(
                  e.target.value
                )
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
                setPassword(
                  e.target.value
                )
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
              window.location.href =
                "/";
            }}
          >
            ← Back to Website
          </button>

        </div>

      </div>
    );
  }

  /*
   * ADMIN EDITOR
   */
  return (
    <div className="editor-page">

      {/* HEADER */}

      <header className="editor-header">

        <div>

          <div className="editor-label">
            ADMIN PANEL
          </div>

          <h1>
            Edit My Website
          </h1>

          <p>
            Logged in as:{" "}
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

        {/* LOADING */}

        {loadingContent && (
          <div className="admin-info">
            Loading your website
            content...
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div className="admin-error">

            {error}

          </div>
        )}

        {/* SUCCESS */}

        {message && (
          <div className="admin-success">

            {message}

          </div>
        )}

        {/* PROFILE */}

        <section className="editor-card">

          <div className="editor-card-title">

            <User size={20} />

            <h2>
              Profile
            </h2>

          </div>

          <div className="profile-preview">

            {content.photo ? (
              <img
                src={content.photo}
                alt="Profile"
                onError={(e) => {
                  e.currentTarget.style.display =
                    "none";
                }}
              />
            ) : (
              <div className="profile-placeholder">
                {content.name
                  ? content.name
                      .split(" ")
                      .map(
                        (word) =>
                          word[0]
                      )
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()
                  : "MB"}
              </div>
            )}

          </div>

          <label>
            <Camera size={14} />
            Profile Photo URL
          </label>

          <input
            type="url"
            placeholder="Paste your profile photo URL"
            value={
              content.photo || ""
            }
            onChange={(e) =>
              updateField(
                "photo",
                e.target.value
              )
            }
          />

          <p className="field-help">
            Paste a public image URL.
            The image will appear on
            your public website.
          </p>

          <label>
            Full Name
          </label>

          <input
            value={
              content.name || ""
            }
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
            value={
              content.title || ""
            }
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
            value={
              content.about || ""
            }
            onChange={(e) =>
              updateField(
                "about",
                e.target.value
              )
            }
          />

        </section>

        {/* PERSONAL INFORMATION */}

        <section className="editor-card">

          <div className="editor-card-title">

            <User size={20} />

            <h2>
              Personal Information
            </h2>

          </div>

          <label>
            <MapPin size={14} />
            Location
          </label>

          <input
            placeholder="Example: Bengaluru, India"
            value={
              content.personal
                ?.location || ""
            }
            onChange={(e) =>
              updatePersonal(
                "location",
                e.target.value
              )
            }
          />

          <label>
            <GraduationCap
              size={14}
            />
            Education
          </label>

          <input
            placeholder="Example: Diploma in Civil Engineering"
            value={
              content.personal
                ?.education || ""
            }
            onChange={(e) =>
              updatePersonal(
                "education",
                e.target.value
              )
            }
          />

        </section>

        {/* CONTACT */}

        <section className="editor-card">

          <div className="editor-card-title">

            <Mail size={20} />

            <h2>
              Contact Information
            </h2>

          </div>

          <label>
            <Mail size={14} />
            Email
          </label>

          <input
            type="email"
            placeholder="your@email.com"
            value={
              content.contact
                ?.email || ""
            }
            onChange={(e) =>
              updateContact(
                "email",
                e.target.value
              )
            }
          />

          <label>
            <Phone size={14} />
            Phone
          </label>

          <input
            type="text"
            placeholder="Your phone number"
            value={
              content.contact
                ?.phone || ""
            }
            onChange={(e) =>
              updateContact(
                "phone",
                e.target.value
              )
            }
          />

          <label>
            <Linkedin size={14} />
            LinkedIn URL
          </label>

          <input
            type="url"
            placeholder="https://www.linkedin.com/in/..."
            value={
              content.contact
                ?.linkedin || ""
            }
            onChange={(e) =>
              updateContact(
                "linkedin",
                e.target.value
              )
            }
          />

        </section>

        {/* EXPERIENCE */}

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
              content.experience?.[0]
                ?.role || ""
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
              content.experience?.[0]
                ?.company || ""
            }
            onChange={(e) =>
              updateExperience(
                "company",
                e.target.value
              )
            }
          />

          <label>
            Period
          </label>

          <input
            placeholder="Example: 2023 - Present"
            value={
              content.experience?.[0]
                ?.period || ""
            }
            onChange={(e) =>
              updateExperience(
                "period",
                e.target.value
              )
            }
          />

          <label>
            Description
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

        {/* SKILLS */}

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
            placeholder="Data Annotation, QA, Team Management, Segmentation..."
            value={
              (
                content.skills || []
              ).join(", ")
            }
            onChange={(e) =>
              updateSkills(
                e.target.value
              )
            }
          />

          <p className="field-help">
            Separate each skill with a
            comma.
          </p>

        </section>

        {/* PROJECTS */}

        <section className="editor-card">

          <div className="editor-card-title">

            <FolderKanban
              size={20}
            />

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
            <br />
            Project Name: Description
          </p>

          <textarea
            rows="8"
            value={
              (
                content.projects || []
              )
                .map(
                  (project) =>
                    `${project.title || ""}: ${
                      project.description ||
                      ""
                    }`
                )
                .join("\n")
            }
            onChange={(e) =>
              updateProjects(
                e.target.value
              )
            }
          />

        </section>

        {/* ACHIEVEMENTS */}

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
            value={
              (
                content.achievements ||
                []
              ).join("\n")
            }
            onChange={(e) =>
              updateAchievements(
                e.target.value
              )
            }
          />

        </section>

        {/* SAVE */}

        <div className="save-area">

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

        </div>

      </main>

    </div>
  );
}

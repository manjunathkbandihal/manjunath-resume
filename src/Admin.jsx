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

        if (!mounted) {
          return;
        }

        if (data?.session) {
          setSession(data.session);

          await loadContent();
        }
      } catch (err) {
        console.error(
          "SESSION CHECK ERROR:",
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

  async function loadContent() {
    try {
      setLoadingContent(true);
      setError("");

      console.log(
        "=== LOADING CONTENT ==="
      );

      const {
        data,
        error,
      } = await supabase
        .from("site_content")
        .select("content")
        .eq("id", "main")
        .maybeSingle();

      console.log(
        "LOAD RESPONSE:",
        {
          data,
          error,
        }
      );

      if (error) {
        throw error;
      }

      if (data?.content) {
        const saved = data.content;

        setContent({
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
            saved.experience?.length
              ? saved.experience
              : emptyContent.experience,

          skills:
            saved.skills || [],

          projects:
            saved.projects || [],

          achievements:
            saved.achievements || [],
        });
      }
    } catch (err) {
      console.error(
        "LOAD CONTENT ERROR:",
        err
      );

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

      console.log(
        "=== LOGIN START ==="
      );

      const {
        data,
        error,
      } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      console.log(
        "LOGIN RESPONSE:",
        {
          data,
          error,
        }
      );

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
      console.error(
        "LOGIN ERROR:",
        err
      );

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

    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error(
        "LOGOUT ERROR:",
        err
      );
    }

    setSession(null);
    setPassword("");
  }

  function updateField(field, value) {
    setContent((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function updatePersonal(field, value) {
    setContent((current) => ({
      ...current,

      personal: {
        ...current.personal,
        [field]: value,
      },
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

    updateField(
      "skills",
      skills
    );
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

  async function saveChanges() {
    try {
      setSaving(true);
      setError("");
      setMessage("");

      console.log(
        "=============================="
      );

      console.log(
        "=== SAVE START ==="
      );

      console.log(
        "Supabase URL:",
        import.meta.env.VITE_SUPABASE_URL
      );

      console.log(
        "Supabase key exists:",
        Boolean(
          import.meta.env
            .VITE_SUPABASE_ANON_KEY
        )
      );

      console.log(
        "Current session:",
        session
      );

      console.log(
        "Current user:",
        session?.user
      );

      console.log(
        "Current user ID:",
        session?.user?.id
      );

      console.log(
        "Content being saved:",
        content
      );

      if (!session?.user) {
        throw new Error(
          "You are not logged in. Please logout and login again."
        );
      }

      if (
        !import.meta.env
          .VITE_SUPABASE_URL
      ) {
        throw new Error(
          "VITE_SUPABASE_URL is missing from the deployed website."
        );
      }

      if (
        !import.meta.env
          .VITE_SUPABASE_ANON_KEY
      ) {
        throw new Error(
          "VITE_SUPABASE_ANON_KEY is missing from the deployed website."
        );
      }

      console.log(
        "Sending UPDATE request to Supabase..."
      );

      const {
        data,
        error,
      } = await supabase
        .from("site_content")
        .update({
          content: content,

          updated_at:
            new Date().toISOString(),
        })
        .eq("id", "main")
        .select(
          "id, updated_at"
        );

      console.log(
        "Supabase UPDATE response:",
        {
          data,
          error,
        }
      );

      if (error) {
        console.error(
          "SUPABASE UPDATE ERROR:",
          error
        );

        throw new Error(
          `Supabase error: ${
            error.message ||
            "Unknown error"
          } | Code: ${
            error.code ||
            "N/A"
          } | Details: ${
            error.details ||
            "N/A"
          } | Hint: ${
            error.hint ||
            "N/A"
          }`
        );
      }

      if (
        !data ||
        data.length === 0
      ) {
        throw new Error(
          "The request completed, but no row was updated. The main row or UPDATE policy may be blocking the update."
        );
      }

      console.log(
        "=== SAVE SUCCESS ==="
      );

      console.log(
        "Updated row:",
        data
      );

      console.log(
        "=============================="
      );

      setMessage(
        "Changes saved successfully! 🎉"
      );
    } catch (err) {
      console.error(
        "=============================="
      );

      console.error(
        "=== SAVE FAILED ==="
      );

      console.error(
        "Error:",
        err
      );

      console.error(
        "Error message:",
        err?.message
      );

      console.error(
        "Error name:",
        err?.name
      );

      console.error(
        "Error stack:",
        err?.stack
      );

      console.error(
        "=============================="
      );

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
              />
            ) : (
              <div className="profile-placeholder">
                MB
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
            The image will appear on your
            public website.
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
              content.personal?.location ||
              ""
            }
            onChange={(e) =>
              updatePersonal(
                "location",
                e.target.value
              )
            }
          />

          <label>
            <GraduationCap size={14} />
            Education
          </label>

          <input
            placeholder="Example: Diploma in Civil"
            value={
              content.personal?.education ||
              ""
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
            <Phone size={14} />
            Phone
          </label>

          <input
            type="text"
            placeholder="Your phone number"
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
            <Linkedin size={14} />
            LinkedIn URL
          </label>

          <input
            type="url"
            placeholder="https://www.linkedin.com/in/..."
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
              (content.skills || [])
                .join(", ")
            }
            onChange={(e) =>
              updateSkills(
                e.target.value
              )
            }
          />

        </section>

        {/* PROJECTS */}

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
            value={
              (content.projects || [])
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
              (content.achievements || [])
                .join("\n")
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

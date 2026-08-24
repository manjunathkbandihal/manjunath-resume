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

  about:
    "Dedicated and result-driven professional with experience in data annotation, segmentation annotation, quality control, team coordination and project management.",

  personal: {
    location: "India",
    education: "Diploma in Civil Engineering",
  },

  experience: [
    {
      role: "Data Annotation Team Lead",
      company: "Annotation / Data Operations",
      period: "Present",
      description:
        "Led annotation teams across multiple projects.\nManaged daily targets, deadlines and overall performance.\nEnsured high-quality annotations through reviews and quality checks.\nConducted calibration sessions and training for team members.\nCoordinated with QA teams to improve quality and reduce escalations.",
    },
  ],

  skills: [
    "Data Annotation",
    "Segmentation Annotation",
    "Quality Control / QA",
    "Team Management",
    "Project Management",
    "Calibration & Training",
    "Excel / Data Management",
    "Communication",
  ],

  projects: [
    {
      title: "PCI_Annotations",
      description:
        "Segmentation annotation for pavement, light poles, fencing, chimneys, electrical wires and other objects.",
      tag: "Segmentation",
    },
    {
      title: "hase2_july_data_1",
      description:
        "Checked model predictions, corrected wrong labels and added missing annotations where required.",
      tag: "QA & Correction",
    },
    {
      title: "Object Annotation Projects",
      description:
        "Worked on umbrellas, tents, electrical units and other street-level objects from frames.",
      tag: "Object Annotation",
    },
    {
      title: "Multiple Concurrent Projects",
      description:
        "Managed and delivered multiple projects simultaneously with focus on quality and deadlines.",
      tag: "Team Management",
    },
  ],

  achievements: [
    "Best Performer",
    "Quality Improvement",
    "Team Leadership",
    "Process Improvement",
  ],

  contact: {
    email: "",
    phone: "",
    linkedin: "",
  },
};

function normalizeContent(saved) {
  if (!saved || typeof saved !== "object") {
    return {
      ...emptyContent,
      personal: { ...emptyContent.personal },
      contact: { ...emptyContent.contact },
      experience: [...emptyContent.experience],
      skills: [...emptyContent.skills],
      projects: [...emptyContent.projects],
      achievements: [...emptyContent.achievements],
    };
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
      Array.isArray(saved.experience) &&
      saved.experience.length > 0
        ? saved.experience
        : [...emptyContent.experience],

    skills:
      Array.isArray(saved.skills)
        ? saved.skills
        : [...emptyContent.skills],

    projects:
      Array.isArray(saved.projects)
        ? saved.projects
        : [...emptyContent.projects],

    achievements:
      Array.isArray(saved.achievements)
        ? saved.achievements
        : [...emptyContent.achievements],
  };
}

export default function Admin() {
  const [session, setSession] = useState(null);

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [content, setContent] =
    useState(normalizeContent(null));

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
   * LOAD CONTENT
   */
  async function loadContent() {
    try {
      setLoadingContent(true);
      setError("");
      setMessage("");

      const {
        data,
        error: supabaseError,
      } = await supabase
        .from("site_content")
        .select("id, content, updated_at")
        .eq("id", "main")
        .maybeSingle();

      if (supabaseError) {
        throw supabaseError;
      }

      if (data?.content) {
        setContent(
          normalizeContent(data.content)
        );
      } else {
        setContent(
          normalizeContent(null)
        );
      }
    } catch (err) {
      console.error(
        "LOAD CONTENT ERROR:",
        err
      );

      setError(
        `Unable to load website content. ${
          err?.message || "Unknown error"
        }`
      );
    } finally {
      setLoadingContent(false);
    }
  }

  /*
   * CHECK EXISTING SESSION
   */
  useEffect(() => {
    let mounted = true;

    async function initialize() {
      try {
        setCheckingSession(true);
        setError("");

        const {
          data,
          error: sessionError,
        } =
          await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
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
          "SESSION ERROR:",
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

    initialize();

    const {
      data: authListener,
    } =
      supabase.auth.onAuthStateChange(
        (event, newSession) => {
          if (!mounted) {
            return;
          }

          setSession(newSession);

          if (event === "SIGNED_OUT") {
            setContent(
              normalizeContent(null)
            );
          }
        }
      );

    return () => {
      mounted = false;

      authListener?.subscription?.unsubscribe();
    };
  }, []);

  /*
   * LOGIN
   */
  async function handleLogin(event) {
    event.preventDefault();

    setError("");
    setMessage("");
    setLoggingIn(true);

    try {
      const cleanEmail =
        email.trim();

      if (!cleanEmail) {
        throw new Error(
          "Please enter your email address."
        );
      }

      if (!password) {
        throw new Error(
          "Please enter your password."
        );
      }

      const {
        data,
        error: loginError,
      } =
        await supabase.auth.signInWithPassword(
          {
            email: cleanEmail,
            password,
          }
        );

      if (loginError) {
        throw loginError;
      }

      if (!data?.session) {
        throw new Error(
          "Login succeeded, but Supabase did not return a session."
        );
      }

      setSession(data.session);

      setPassword("");

      await loadContent();
    } catch (err) {
      console.error(
        "LOGIN ERROR:",
        err
      );

      setError(
        err?.message ||
          "Login failed. Please check your email and password."
      );
    } finally {
      setLoggingIn(false);
    }
  }

  /*
   * LOGOUT
   */
  async function handleLogout() {
    try {
      setError("");
      setMessage("");

      const {
        error: logoutError,
      } = await supabase.auth.signOut();

      if (logoutError) {
        throw logoutError;
      }

      setSession(null);
      setPassword("");
    } catch (err) {
      console.error(
        "LOGOUT ERROR:",
        err
      );

      setError(
        err?.message ||
          "Unable to logout."
      );
    }
  }

  /*
   * UPDATE BASIC FIELD
   */
  function updateField(field, value) {
    setContent((current) => ({
      ...current,
      [field]: value,
    }));
  }

  /*
   * UPDATE PERSONAL
   */
  function updatePersonal(
    field,
    value
  ) {
    setContent((current) => ({
      ...current,

      personal: {
        ...(current.personal || {}),
        [field]: value,
      },
    }));
  }

  /*
   * UPDATE CONTACT
   */
  function updateContact(
    field,
    value
  ) {
    setContent((current) => ({
      ...current,

      contact: {
        ...(current.contact || {}),
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

    updateField("skills", skills);
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
            tag: "Project",
          };
        }

        return {
          title: line
            .slice(0, separator)
            .trim(),

          description: line
            .slice(separator + 1)
            .trim(),

          tag: "Project",
        };
      });

    updateField(
      "projects",
      projects
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
   * SAVE
   */
  async function saveChanges() {
    if (!session) {
      setError(
        "You must be logged in to save changes."
      );

      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const updatedContent =
        normalizeContent(content);

      const {
        data,
        error: updateError,
      } = await supabase
        .from("site_content")
        .update({
          content: updatedContent,

          updated_at:
            new Date().toISOString(),
        })
        .eq("id", "main")
        .select("id, updated_at")
        .maybeSingle();

      if (updateError) {
        throw updateError;
      }

      if (!data) {
        throw new Error(
          "Nothing was updated. The site_content row with id 'main' was not found or you do not have permission to update it."
        );
      }

      setContent(updatedContent);

      setMessage(
        "Changes saved successfully! 🎉"
      );
    } catch (err) {
      console.error(
        "SAVE ERROR:",
        err
      );

      let detailedMessage =
        err?.message ||
        "Unable to save changes.";

      if (
        err?.code === "42501"
      ) {
        detailedMessage =
          "Permission denied. Your logged-in user does not have permission to update site_content.";
      }

      setError(
        `Save failed: ${detailedMessage}`
      );
    } finally {
      setSaving(false);
    }
  }

  /*
   * LOADING SESSION
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
   * LOGIN PAGE
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
              onChange={(event) =>
                setEmail(
                  event.target.value
                )
              }
              autoComplete="email"
              disabled={loggingIn}
            />

            <label>
              Password
            </label>

            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
              autoComplete="current-password"
              disabled={loggingIn}
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
            Loading your website content...
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
                onError={(event) => {
                  event.currentTarget.style.display =
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
            placeholder="Paste your public profile photo URL"
            value={
              content.photo || ""
            }
            onChange={(event) =>
              updateField(
                "photo",
                event.target.value
              )
            }
          />

          <p className="field-help">
            Paste a public image URL.
            The image will appear on
            your public website after
            saving.
          </p>

          <label>
            Full Name
          </label>

          <input
            value={
              content.name || ""
            }
            onChange={(event) =>
              updateField(
                "name",
                event.target.value
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
            onChange={(event) =>
              updateField(
                "title",
                event.target.value
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
            onChange={(event) =>
              updateField(
                "about",
                event.target.value
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
            onChange={(event) =>
              updatePersonal(
                "location",
                event.target.value
              )
            }
          />

          <label>
            <GraduationCap size={14} />
            Education
          </label>

          <input
            placeholder="Example: Diploma in Civil Engineering"
            value={
              content.personal
                ?.education || ""
            }
            onChange={(event) =>
              updatePersonal(
                "education",
                event.target.value
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
            onChange={(event) =>
              updateContact(
                "email",
                event.target.value
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
            onChange={(event) =>
              updateContact(
                "phone",
                event.target.value
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
            onChange={(event) =>
              updateContact(
                "linkedin",
                event.target.value
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
            onChange={(event) =>
              updateExperience(
                "role",
                event.target.value
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
            onChange={(event) =>
              updateExperience(
                "company",
                event.target.value
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
            onChange={(event) =>
              updateExperience(
                "period",
                event.target.value
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
            onChange={(event) =>
              updateExperience(
                "description",
                event.target.value
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

          <p className="field-help">
            Separate each skill with a
            comma.
          </p>

          <textarea
            rows="5"
            placeholder="Data Annotation, QA, Team Management, Segmentation..."
            value={
              (
                content.skills || []
              ).join(", ")
            }
            onChange={(event) =>
              updateSkills(
                event.target.value
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
            Use this format:
            <br />
            <strong>
              Project Name: Description
            </strong>
          </p>

          <textarea
            rows="10"
            value={(
              content.projects || []
            )
              .map(
                (project) =>
                  `${project.title || ""}: ${
                    project.description ||
                    ""
                  }`
              )
              .join("\n")}
            onChange={(event) =>
              updateProjects(
                event.target.value
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
            value={(
              content.achievements ||
              []
            ).join("\n")}
            onChange={(event) =>
              updateAchievements(
                event.target.value
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

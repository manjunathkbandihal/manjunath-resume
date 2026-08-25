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
  FileText,
  ExternalLink,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

import { supabase } from "./supabase";

const PHOTO_BUCKET = "profile-photos";
const RESUME_BUCKET = "resume";

const emptyExperience = {
  role: "",
  company: "",
  period: "",
  description: "",
};

const emptyContent = {
  name: "Manjunath Bandihal",
  title: "Data Annotation Team Lead",
  photo: "",
  resume: "",
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

function normalizeExperience(item) {
  return {
    role:
      typeof item?.role === "string"
        ? item.role
        : "",

    company:
      typeof item?.company === "string"
        ? item.company
        : "",

    period:
      typeof item?.period === "string"
        ? item.period
        : "",

    description:
      typeof item?.description === "string"
        ? item.description
        : "",
  };
}

function mergeContent(saved) {
  if (!saved) {
    return {
      ...emptyContent,
      personal: {
        ...emptyContent.personal,
      },
      contact: {
        ...emptyContent.contact,
      },
      experience: [
        {
          ...emptyExperience,
        },
      ],
      skills: [],
      projects: [],
      achievements: [],
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
        ? saved.experience.map(
            normalizeExperience
          )
        : [
            {
              ...emptyExperience,
            },
          ],

    skills: Array.isArray(saved.skills)
      ? saved.skills
      : [],

    projects: Array.isArray(saved.projects)
      ? saved.projects.map((project) => ({
          title:
            typeof project?.title === "string"
              ? project.title
              : "",

          description:
            typeof project?.description ===
            "string"
              ? project.description
              : "",

          tag:
            typeof project?.tag === "string"
              ? project.tag
              : "",

          url:
            typeof project?.url === "string"
              ? project.url
              : "",
        }))
      : [],

    achievements: Array.isArray(
      saved.achievements
    )
      ? saved.achievements
      : [],

    resume:
      typeof saved.resume === "string"
        ? saved.resume
        : "",
  };
}

export default function Admin() {
  const [session, setSession] = useState(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [content, setContent] = useState(
    mergeContent(null)
  );

  const [checkingSession, setCheckingSession] =
    useState(true);

  const [loadingContent, setLoadingContent] =
    useState(false);

  const [loggingIn, setLoggingIn] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [uploadingPhoto, setUploadingPhoto] =
    useState(false);

  const [uploadingResume, setUploadingResume] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  /*
   * ============================================================
   * CHECK LOGIN SESSION
   * ============================================================
   */

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      try {
        setError("");

        const result =
          await supabase.auth.getSession();

        if (result.error) {
          throw result.error;
        }

        if (!mounted) {
          return;
        }

        const currentSession =
          result.data?.session || null;

        setSession(currentSession);

        if (currentSession) {
          await loadContent();
        }
      } catch (err) {
        console.error(
          "Session check failed:",
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

    const authListener =
      supabase.auth.onAuthStateChange(
        (_event, newSession) => {
          if (!mounted) {
            return;
          }

          setSession(newSession);

          if (newSession) {
            setTimeout(() => {
              if (mounted) {
                loadContent();
              }
            }, 0);
          }
        }
      );

    return () => {
      mounted = false;

      authListener?.data?.subscription?.unsubscribe();
    };
  }, []);

  /*
   * ============================================================
   * LOAD CONTENT
   * ============================================================
   */

  async function loadContent() {
    try {
      setLoadingContent(true);
      setError("");

      const result = await supabase
        .from("site_content")
        .select("content")
        .eq("id", "main")
        .maybeSingle();

      if (result.error) {
        throw result.error;
      }

      if (result.data?.content) {
        setContent(
          mergeContent(result.data.content)
        );
      }
    } catch (err) {
      console.error(
        "Load content failed:",
        err
      );

      setError(
        "Unable to load website content: " +
          (err?.message ||
            "Unknown error")
      );
    } finally {
      setLoadingContent(false);
    }
  }

  /*
   * ============================================================
   * LOGIN
   * ============================================================
   */

  async function handleLogin(event) {
    event.preventDefault();

    setError("");
    setMessage("");
    setLoggingIn(true);

    try {
      if (!email.trim() || !password) {
        throw new Error(
          "Please enter your email and password."
        );
      }

      const result =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

      if (result.error) {
        throw result.error;
      }

      if (!result.data?.session) {
        throw new Error(
          "Login succeeded but no session was created."
        );
      }

      setSession(result.data.session);

      await loadContent();
    } catch (err) {
      console.error(
        "Login failed:",
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

  /*
   * ============================================================
   * LOGOUT
   * ============================================================
   */

  async function handleLogout() {
    try {
      setError("");
      setMessage("");

      const result =
        await supabase.auth.signOut();

      if (result.error) {
        throw result.error;
      }

      setSession(null);
      setPassword("");
    } catch (err) {
      console.error(
        "Logout failed:",
        err
      );

      setError(
        err?.message ||
          "Logout failed."
      );
    }
  }

  /*
   * ============================================================
   * GENERIC FIELD UPDATE
   * ============================================================
   */

  function updateField(field, value) {
    setContent((current) => ({
      ...current,
      [field]: value,
    }));
  }

  /*
   * ============================================================
   * PERSONAL INFORMATION
   * ============================================================
   */

  function updatePersonal(field, value) {
    setContent((current) => ({
      ...current,

      personal: {
        ...(current.personal || {}),
        [field]: value,
      },
    }));
  }

  /*
   * ============================================================
   * CONTACT
   * ============================================================
   */

  function updateContact(field, value) {
    setContent((current) => ({
      ...current,

      contact: {
        ...(current.contact || {}),
        [field]: value,
      },
    }));
  }

  /*
   * ============================================================
   * EXPERIENCE MANAGEMENT
   * ============================================================
   */

  function addExperience() {
    setContent((current) => ({
      ...current,

      experience: [
        ...(current.experience || []),
        {
          ...emptyExperience,
        },
      ],
    }));

    setMessage(
      "New experience added. Fill in the details and click Save Changes."
    );
  }

  function updateExperience(
    index,
    field,
    value
  ) {
    setContent((current) => {
      const experience = [
        ...(current.experience || []),
      ];

      experience[index] = {
        ...(experience[index] || {}),
        [field]: value,
      };

      return {
        ...current,
        experience,
      };
    });
  }

  function deleteExperience(index) {
    setContent((current) => {
      const experience = [
        ...(current.experience || []),
      ];

      experience.splice(index, 1);

      if (experience.length === 0) {
        experience.push({
          ...emptyExperience,
        });
      }

      return {
        ...current,
        experience,
      };
    });

    setMessage(
      "Experience removed. Click Save Changes to publish the change."
    );
  }

  /*
   * MOVE EXPERIENCE UP
   */

  function moveExperienceUp(index) {
    if (index <= 0) {
      return;
    }

    setContent((current) => {
      const experience = [
        ...(current.experience || []),
      ];

      [
        experience[index - 1],
        experience[index],
      ] = [
        experience[index],
        experience[index - 1],
      ];

      return {
        ...current,
        experience,
      };
    });

    setMessage(
      "Experience order changed. Click Save Changes to publish the change."
    );
  }

  /*
   * MOVE EXPERIENCE DOWN
   */

  function moveExperienceDown(index) {
    setContent((current) => {
      const experience = [
        ...(current.experience || []),
      ];

      if (
        index < 0 ||
        index >= experience.length - 1
      ) {
        return current;
      }

      [
        experience[index],
        experience[index + 1],
      ] = [
        experience[index + 1],
        experience[index],
      ];

      return {
        ...current,
        experience,
      };
    });

    setMessage(
      "Experience order changed. Click Save Changes to publish the change."
    );
  }

  /*
   * ============================================================
   * SKILLS
   * ============================================================
   */

  function updateSkills(value) {
    const skills = value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    updateField("skills", skills);
  }

  /*
   * ============================================================
   * ACHIEVEMENTS
   * ============================================================
   */

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

  /*
   * ============================================================
   * PROJECT MANAGEMENT
   * ============================================================
   */

  function addProject() {
    setContent((current) => ({
      ...current,

      projects: [
        ...(current.projects || []),

        {
          title: "",
          description: "",
          tag: "",
          url: "",
        },
      ],
    }));

    setMessage(
      "New project added. Fill in the details and click Save Changes."
    );
  }

  function updateProject(
    index,
    field,
    value
  ) {
    setContent((current) => {
      const projects = [
        ...(current.projects || []),
      ];

      projects[index] = {
        ...(projects[index] || {}),
        [field]: value,
      };

      return {
        ...current,
        projects,
      };
    });
  }

  function deleteProject(index) {
    setContent((current) => {
      const projects = [
        ...(current.projects || []),
      ];

      projects.splice(index, 1);

      return {
        ...current,
        projects,
      };
    });

    setMessage(
      "Project removed. Click Save Changes to publish the change."
    );
  }

  /*
   * ============================================================
   * PROFILE PHOTO UPLOAD
   * ============================================================
   */

  async function handlePhotoUpload(event) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setError("");
      setMessage("");
      setUploadingPhoto(true);

      if (!session) {
        throw new Error(
          "You are not logged in. Please login again."
        );
      }

      if (!file.type.startsWith("image/")) {
        throw new Error(
          "Please select an image file."
        );
      }

      const maxSize =
        5 * 1024 * 1024;

      if (file.size > maxSize) {
        throw new Error(
          "Photo must be smaller than 5 MB."
        );
      }

      const extensionMap = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
        "image/gif": "gif",
      };

      const extension =
        extensionMap[file.type] || "jpg";

      const fileName =
        "profile-" +
        Date.now() +
        "." +
        extension;

      const uploadResult =
        await supabase.storage
          .from(PHOTO_BUCKET)
          .upload(
            fileName,
            file,
            {
              cacheControl: "3600",
              upsert: true,
              contentType: file.type,
            }
          );

      if (uploadResult.error) {
        throw new Error(
          "Storage upload failed: " +
            uploadResult.error.message
        );
      }

      const publicUrlResult =
        supabase.storage
          .from(PHOTO_BUCKET)
          .getPublicUrl(fileName);

      const publicUrl =
        publicUrlResult?.data?.publicUrl;

      if (!publicUrl) {
        throw new Error(
          "Photo uploaded, but Supabase did not return a public URL."
        );
      }

      setContent((current) => ({
        ...current,
        photo: String(publicUrl),
      }));

      setMessage(
        "Photo uploaded successfully. Now click Save Changes."
      );
    } catch (err) {
      console.error(
        "Photo upload failed:",
        err
      );

      setError(
        "Photo upload failed: " +
          (err?.message ||
            "Unknown error")
      );
    } finally {
      setUploadingPhoto(false);

      if (event.target) {
        event.target.value = "";
      }
    }
  }

  function removePhoto() {
    setContent((current) => ({
      ...current,
      photo: "",
    }));

    setMessage(
      "Photo removed. Click Save Changes to publish the change."
    );
  }

  /*
   * ============================================================
   * RESUME PDF UPLOAD
   * ============================================================
   */

  async function handleResumeUpload(event) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      setError("");
      setMessage("");
      setUploadingResume(true);

      if (!session) {
        throw new Error(
          "You are not logged in. Please login again."
        );
      }

      if (
        file.type !==
        "application/pdf"
      ) {
        throw new Error(
          "Please select a PDF resume file."
        );
      }

      const maxSize =
        10 * 1024 * 1024;

      if (file.size > maxSize) {
        throw new Error(
          "Resume must be smaller than 10 MB."
        );
      }

      const fileName =
        "resume-" +
        Date.now() +
        ".pdf";

      const uploadResult =
        await supabase.storage
          .from(RESUME_BUCKET)
          .upload(
            fileName,
            file,
            {
              cacheControl: "3600",
              upsert: true,
              contentType:
                "application/pdf",
            }
          );

      if (uploadResult.error) {
        throw new Error(
          "Resume storage upload failed: " +
            uploadResult.error.message
        );
      }

      const publicUrlResult =
        supabase.storage
          .from(RESUME_BUCKET)
          .getPublicUrl(fileName);

      const publicUrl =
        publicUrlResult?.data?.publicUrl;

      if (!publicUrl) {
        throw new Error(
          "Resume uploaded, but Supabase did not return a public URL."
        );
      }

      setContent((current) => ({
        ...current,
        resume: String(publicUrl),
      }));

      setMessage(
        "Resume uploaded successfully. Now click Save Changes."
      );
    } catch (err) {
      console.error(
        "Resume upload failed:",
        err
      );

      setError(
        "Resume upload failed: " +
          (err?.message ||
            "Unknown error")
      );
    } finally {
      setUploadingResume(false);

      if (event.target) {
        event.target.value = "";
      }
    }
  }

  function removeResume() {
    setContent((current) => ({
      ...current,
      resume: "",
    }));

    setMessage(
      "Resume removed from the profile. Click Save Changes to publish the change."
    );
  }

  /*
   * ============================================================
   * SAVE CHANGES
   * ============================================================
   */

  async function saveChanges() {
    try {
      setSaving(true);
      setError("");
      setMessage("");

      if (!session) {
        throw new Error(
          "You are not logged in. Please login again."
        );
      }

      if (uploadingPhoto) {
        throw new Error(
          "Please wait until the photo upload finishes."
        );
      }

      if (uploadingResume) {
        throw new Error(
          "Please wait until the resume upload finishes."
        );
      }

      /*
       * CLEAN EXPERIENCE DATA
       *
       * Empty experience cards are ignored when saving,
       * except that the editor itself always keeps one card.
       */

      const cleanExperience =
        Array.isArray(content.experience)
          ? content.experience
              .map(normalizeExperience)
              .map((item) => ({
                role: item.role.trim(),
                company: item.company.trim(),
                period: item.period.trim(),
                description:
                  item.description.trim(),
              }))
              .filter(
                (item) =>
                  item.role ||
                  item.company ||
                  item.period ||
                  item.description
              )
          : [];

      const cleanContent = {
        name:
          typeof content.name === "string"
            ? content.name.trim()
            : "",

        title:
          typeof content.title === "string"
            ? content.title.trim()
            : "",

        photo:
          typeof content.photo === "string"
            ? content.photo
            : "",

        resume:
          typeof content.resume === "string"
            ? content.resume
            : "",

        about:
          typeof content.about === "string"
            ? content.about.trim()
            : "",

        personal: {
          location:
            typeof content.personal
              ?.location === "string"
              ? content.personal.location.trim()
              : "",

          education:
            typeof content.personal
              ?.education === "string"
              ? content.personal.education.trim()
              : "",
        },

        /*
         * EXPERIENCE
         *
         * Order is preserved exactly as shown
         * in the Admin panel.
         */
        experience: cleanExperience,

        skills:
          Array.isArray(content.skills)
            ? content.skills
                .filter(
                  (item) =>
                    typeof item === "string"
                )
                .map((item) =>
                  item.trim()
                )
                .filter(Boolean)
            : [],

        projects:
          Array.isArray(content.projects)
            ? content.projects.map(
                (project) => ({
                  title:
                    typeof project?.title ===
                    "string"
                      ? project.title.trim()
                      : "",

                  description:
                    typeof project?.description ===
                    "string"
                      ? project.description.trim()
                      : "",

                  tag:
                    typeof project?.tag ===
                    "string"
                      ? project.tag.trim()
                      : "",

                  url:
                    typeof project?.url ===
                    "string"
                      ? project.url.trim()
                      : "",
                })
              )
            : [],

        achievements:
          Array.isArray(
            content.achievements
          )
            ? content.achievements
                .map((item) => {
                  if (
                    typeof item ===
                    "string"
                  ) {
                    return item.trim();
                  }

                  return {
                    title:
                      typeof item?.title ===
                      "string"
                        ? item.title.trim()
                        : "",

                    description:
                      typeof item?.description ===
                      "string"
                        ? item.description.trim()
                        : "",
                  };
                })
                .filter(Boolean)
            : [],

        contact: {
          email:
            typeof content.contact
              ?.email === "string"
              ? content.contact.email.trim()
              : "",

          phone:
            typeof content.contact
              ?.phone === "string"
              ? content.contact.phone.trim()
              : "",

          linkedin:
            typeof content.contact
              ?.linkedin === "string"
              ? content.contact.linkedin.trim()
              : "",
        },
      };

      /*
       * VALIDATE PHOTO URL
       */

      if (
        cleanContent.photo &&
        !cleanContent.photo.startsWith(
          "http"
        )
      ) {
        throw new Error(
          "The profile photo URL is invalid."
        );
      }

      /*
       * VALIDATE RESUME URL
       */

      if (
        cleanContent.resume &&
        !cleanContent.resume.startsWith(
          "http"
        )
      ) {
        throw new Error(
          "The resume URL is invalid."
        );
      }

      /*
       * VALIDATE PROJECT URLS
       */

      for (
        const project of cleanContent.projects
      ) {
        if (
          project.url &&
          !project.url.startsWith("http")
        ) {
          throw new Error(
            `Project "${project.title || "Untitled"}" has an invalid URL.`
          );
        }
      }

      /*
       * VALIDATE LINKEDIN
       */

      if (
        cleanContent.contact.linkedin &&
        !cleanContent.contact.linkedin.startsWith(
          "http"
        )
      ) {
        throw new Error(
          "LinkedIn URL must start with http or https."
        );
      }

      /*
       * UPDATE SUPABASE
       */

      const result = await supabase
        .from("site_content")
        .update({
          content: cleanContent,
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", "main");

      if (result.error) {
        throw new Error(
          "Supabase UPDATE failed: " +
            result.error.message
        );
      }

      /*
       * VERIFY SAVE
       */

      const verify =
        await supabase
          .from("site_content")
          .select(
            "content, updated_at"
          )
          .eq("id", "main")
          .maybeSingle();

      if (verify.error) {
        console.warn(
          "Save succeeded but verification failed:",
          verify.error
        );

        setMessage(
          "Changes saved successfully! 🎉"
        );

        return;
      }

      if (!verify.data) {
        throw new Error(
          "Save request completed, but the website content could not be verified."
        );
      }

      setContent(
        mergeContent(
          verify.data.content
        )
      );

      setMessage(
        "Changes saved successfully! 🎉"
      );
    } catch (err) {
      console.error(
        "Save failed:",
        err
      );

      setError(
        "Save failed: " +
          (err?.message ||
            "Unknown error")
      );
    } finally {
      setSaving(false);
    }
  }

  /*
   * ============================================================
   * SESSION CHECK SCREEN
   * ============================================================
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
   * ============================================================
   * LOGIN SCREEN
   * ============================================================
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

  const experiences =
    Array.isArray(content.experience)
      ? content.experience
      : [];

  /*
   * ============================================================
   * ADMIN EDITOR
   * ============================================================
   */

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

        {/* =====================================================
            PROFILE
            ===================================================== */}

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
            Upload Profile Photo
          </label>

          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handlePhotoUpload}
            disabled={
              uploadingPhoto ||
              saving ||
              uploadingResume
            }
          />

          {uploadingPhoto && (
            <p className="field-help">
              Uploading photo to Supabase Storage...
            </p>
          )}

          {content.photo && (
            <button
              type="button"
              className="back-home"
              onClick={removePhoto}
              disabled={
                uploadingPhoto ||
                saving ||
                uploadingResume
              }
            >
              Remove Photo
            </button>
          )}

          <p className="field-help">
            Select a JPG, PNG, WEBP or GIF
            image. Maximum size: 5 MB.
          </p>

          <label>
            Full Name
          </label>

          <input
            value={content.name || ""}
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
            value={content.title || ""}
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
            value={content.about || ""}
            onChange={(event) =>
              updateField(
                "about",
                event.target.value
              )
            }
          />

        </section>

        {/* =====================================================
            RESUME
            ===================================================== */}

        <section className="editor-card">

          <div className="editor-card-title">
            <FileText size={20} />

            <h2>
              Resume / CV
            </h2>
          </div>

          <label>
            <FileText size={14} />
            Upload Resume PDF
          </label>

          <input
            type="file"
            accept="application/pdf,.pdf"
            onChange={handleResumeUpload}
            disabled={
              uploadingResume ||
              saving ||
              uploadingPhoto
            }
          />

          {uploadingResume && (
            <p className="field-help">
              Uploading resume to Supabase Storage...
            </p>
          )}

          {content.resume &&
            !uploadingResume && (
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  flexWrap: "wrap",
                  marginTop: "12px",
                }}
              >

                <a
                  href={content.resume}
                  target="_blank"
                  rel="noreferrer"
                  className="back-home"
                  style={{
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <ExternalLink size={16} />
                  View Current Resume
                </a>

                <button
                  type="button"
                  className="back-home"
                  onClick={removeResume}
                  disabled={
                    uploadingResume ||
                    saving ||
                    uploadingPhoto
                  }
                >
                  Remove Resume
                </button>

              </div>
            )}

          <p className="field-help">
            Upload your resume as a PDF.
            Maximum size: 10 MB.
          </p>

          {!content.resume && (
            <p className="field-help">
              No resume uploaded yet.
            </p>
          )}

        </section>

        {/* =====================================================
            PERSONAL INFORMATION
            ===================================================== */}

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
            placeholder="Example: Diploma in Civil"
            value={
              content.personal?.education ||
              ""
            }
            onChange={(event) =>
              updatePersonal(
                "education",
                event.target.value
              )
            }
          />

        </section>

        {/* =====================================================
            CONTACT
            ===================================================== */}

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
              content.contact?.phone ||
              ""
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
              content.contact?.linkedin ||
              ""
            }
            onChange={(event) =>
              updateContact(
                "linkedin",
                event.target.value
              )
            }
          />

        </section>

        {/* =====================================================
            EXPERIENCE MANAGEMENT
            ===================================================== */}

        <section className="editor-card">

          <div className="editor-card-title">

            <Briefcase size={20} />

            <h2>
              Experience
            </h2>

          </div>

          <p className="field-help">
            Manage your complete work history.
            The order below is the same order
            that will appear on your public website.
          </p>

          {experiences.map(
            (experience, index) => (
              <div
                key={index}
                style={{
                  border:
                    "1px solid rgba(127, 127, 127, 0.25)",
                  borderRadius: "14px",
                  padding: "18px",
                  marginTop: "18px",
                }}
              >

                {/* EXPERIENCE HEADER */}

                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems: "flex-start",
                    gap: "12px",
                    marginBottom: "16px",
                    flexWrap: "wrap",
                  }}
                >

                  <div>

                    <h3
                      style={{
                        margin: 0,
                      }}
                    >
                      Experience{" "}
                      {index + 1}
                    </h3>

                    <p
                      className="field-help"
                      style={{
                        marginTop: "5px",
                        marginBottom: 0,
                      }}
                    >
                      {experience.role ||
                        "New experience"}

                      {experience.company
                        ? ` • ${experience.company}`
                        : ""}

                      {experience.period
                        ? ` • ${experience.period}`
                        : ""}
                    </p>

                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "6px",
                      flexWrap: "wrap",
                    }}
                  >

                    {/* MOVE UP */}

                    <button
                      type="button"
                      className="back-home"
                      onClick={() =>
                        moveExperienceUp(
                          index
                        )
                      }
                      disabled={
                        saving ||
                        index === 0
                      }
                      title="Move experience up"
                      style={{
                        display:
                          "inline-flex",
                        alignItems:
                          "center",
                        gap: "5px",
                      }}
                    >
                      <ArrowUp size={15} />
                      Up
                    </button>

                    {/* MOVE DOWN */}

                    <button
                      type="button"
                      className="back-home"
                      onClick={() =>
                        moveExperienceDown(
                          index
                        )
                      }
                      disabled={
                        saving ||
                        index ===
                          experiences.length -
                            1
                      }
                      title="Move experience down"
                      style={{
                        display:
                          "inline-flex",
                        alignItems:
                          "center",
                        gap: "5px",
                      }}
                    >
                      <ArrowDown size={15} />
                      Down
                    </button>

                    {/* DELETE */}

                    <button
                      type="button"
                      className="back-home"
                      onClick={() =>
                        deleteExperience(
                          index
                        )
                      }
                      disabled={saving}
                      style={{
                        display:
                          "inline-flex",
                        alignItems:
                          "center",
                        gap: "6px",
                      }}
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>

                  </div>

                </div>

                {/* JOB ROLE */}

                <label>
                  Job Role
                </label>

                <input
                  type="text"
                  placeholder="Example: Data Annotation Team Lead"
                  value={
                    experience.role ||
                    ""
                  }
                  onChange={(event) =>
                    updateExperience(
                      index,
                      "role",
                      event.target.value
                    )
                  }
                />

                {/* COMPANY */}

                <label>
                  Company
                </label>

                <input
                  type="text"
                  placeholder="Example: ABC Company"
                  value={
                    experience.company ||
                    ""
                  }
                  onChange={(event) =>
                    updateExperience(
                      index,
                      "company",
                      event.target.value
                    )
                  }
                />

                {/* PERIOD */}

                <label>
                  Period
                </label>

                <input
                  type="text"
                  placeholder="Example: 2023 - Present"
                  value={
                    experience.period ||
                    ""
                  }
                  onChange={(event) =>
                    updateExperience(
                      index,
                      "period",
                      event.target.value
                    )
                  }
                />

                {/* DESCRIPTION */}

                <label>
                  Description
                </label>

                <p className="field-help">
                  Add one responsibility or
                  achievement per line.
                </p>

                <textarea
                  rows="8"
                  placeholder={
                    "Led annotation teams across multiple projects.\nManaged daily targets and deadlines.\nEnsured high-quality annotations through reviews."
                  }
                  value={
                    experience.description ||
                    ""
                  }
                  onChange={(event) =>
                    updateExperience(
                      index,
                      "description",
                      event.target.value
                    )
                  }
                />

                {/* EXPERIENCE PREVIEW */}

                {(experience.role ||
                  experience.company ||
                  experience.period ||
                  experience.description) && (
                  <div
                    style={{
                      marginTop: "18px",
                      padding: "14px",
                      borderRadius: "10px",
                      background:
                        "rgba(127, 127, 127, 0.07)",
                    }}
                  >

                    <strong>
                      Website Preview
                    </strong>

                    <p
                      style={{
                        margin:
                          "8px 0 3px",
                      }}
                    >
                      {experience.role ||
                        "Job Role"}
                    </p>

                    <p
                      className="field-help"
                      style={{
                        margin: 0,
                      }}
                    >
                      {experience.company ||
                        "Company"}

                      {experience.period
                        ? ` • ${experience.period}`
                        : ""}
                    </p>

                  </div>
                )}

              </div>
            )
          )}

          {/* ADD EXPERIENCE */}

          <button
            type="button"
            className="save-btn"
            onClick={addExperience}
            disabled={saving}
            style={{
              marginTop: "18px",
              display:
                "inline-flex",
              alignItems:
                "center",
              gap: "8px",
            }}
          >
            <Plus size={18} />

            Add Experience
          </button>

        </section>

        {/* =====================================================
            SKILLS
            ===================================================== */}

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
            onChange={(event) =>
              updateSkills(
                event.target.value
              )
            }
          />

        </section>

        {/* =====================================================
            PROJECTS MANAGEMENT
            ===================================================== */}

        <section className="editor-card">

          <div className="editor-card-title">

            <FolderKanban size={20} />

            <h2>
              Projects
            </h2>

          </div>

          <p className="field-help">
            Add your professional projects below.
            Each project can have a title,
            description, technology/tag and project URL.
          </p>

          {(content.projects || []).map(
            (project, index) => (
              <div
                key={index}
                style={{
                  border:
                    "1px solid rgba(127, 127, 127, 0.25)",
                  borderRadius: "14px",
                  padding: "18px",
                  marginTop: "16px",
                }}
              >

                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "16px",
                  }}
                >

                  <h3
                    style={{
                      margin: 0,
                    }}
                  >
                    Project {index + 1}
                  </h3>

                  <button
                    type="button"
                    className="back-home"
                    onClick={() =>
                      deleteProject(index)
                    }
                    disabled={saving}
                    style={{
                      display:
                        "inline-flex",
                      alignItems:
                        "center",
                      gap: "6px",
                    }}
                  >
                    <Trash2 size={16} />

                    Delete
                  </button>

                </div>

                <label>
                  Project Title
                </label>

                <input
                  type="text"
                  placeholder="Example: AnnotatePro Team Dashboard"
                  value={
                    project.title || ""
                  }
                  onChange={(event) =>
                    updateProject(
                      index,
                      "title",
                      event.target.value
                    )
                  }
                />

                <label>
                  Description
                </label>

                <textarea
                  rows="5"
                  placeholder="Describe what you built, what problem it solves and your role."
                  value={
                    project.description ||
                    ""
                  }
                  onChange={(event) =>
                    updateProject(
                      index,
                      "description",
                      event.target.value
                    )
                  }
                />

                <label>
                  Technology / Tag
                </label>

                <input
                  type="text"
                  placeholder="Example: React, Vite, Supabase"
                  value={
                    project.tag || ""
                  }
                  onChange={(event) =>
                    updateProject(
                      index,
                      "tag",
                      event.target.value
                    )
                  }
                />

                <label>
                  Project URL
                </label>

                <input
                  type="url"
                  placeholder="https://your-project.vercel.app"
                  value={
                    project.url || ""
                  }
                  onChange={(event) =>
                    updateProject(
                      index,
                      "url",
                      event.target.value
                    )
                  }
                />

                {project.url && (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noreferrer"
                    className="back-home"
                    style={{
                      marginTop: "10px",
                      textDecoration:
                        "none",
                      display:
                        "inline-flex",
                      alignItems:
                        "center",
                      gap: "6px",
                    }}
                  >
                    <ExternalLink size={16} />

                    Test Project Link
                  </a>
                )}

              </div>
            )
          )}

          {(content.projects || []).length ===
            0 && (
            <div
              style={{
                padding: "24px",
                marginTop: "16px",
                borderRadius: "12px",
                textAlign: "center",
                border:
                  "1px dashed rgba(127, 127, 127, 0.4)",
              }}
            >
              <p className="field-help">
                No projects added yet.
              </p>
            </div>
          )}

          <button
            type="button"
            className="save-btn"
            onClick={addProject}
            disabled={saving}
            style={{
              marginTop: "18px",
              display:
                "inline-flex",
              alignItems:
                "center",
              gap: "8px",
            }}
          >
            <Plus size={18} />

            Add Project
          </button>

        </section>

        {/* =====================================================
            ACHIEVEMENTS
            ===================================================== */}

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
                .map((item) => {
                  if (
                    typeof item ===
                    "string"
                  ) {
                    return item;
                  }

                  return (
                    item.title || ""
                  );
                })
                .join("\n")
            }
            onChange={(event) =>
              updateAchievements(
                event.target.value
              )
            }
          />

        </section>

        {/* =====================================================
            SAVE
            ===================================================== */}

        <div className="save-area">

          <button
            className="save-btn"
            onClick={saveChanges}
            disabled={
              saving ||
              loadingContent ||
              uploadingPhoto ||
              uploadingResume
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

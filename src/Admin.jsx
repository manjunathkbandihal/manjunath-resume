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
  BarChart3,
  LayoutDashboard,
  Settings,
  CheckCircle2,
  Globe2,
  Menu,
  X,
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

const emptyProject = {
  title: "",
  description: "",
  tag: "",
  url: "",
};

const emptyAchievement = {
  title: "",
  description: "",
  year: "",
  organization: "",
};

const emptyStat = {
  value: "",
  label: "",
};

const defaultStats = [
  {
    value: "18+",
    label: "Projects handled concurrently",
  },
  {
    value: "90%",
    label: "Reduction in escalations",
  },
  {
    value: "100%",
    label: "Focus on on-time delivery",
  },
  {
    value: "10+",
    label: "Team members supported",
  },
];

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
      ...emptyExperience,
    },
  ],

  skills: [],

  projects: [],

  achievements: [],

  stats: defaultStats,

  contact: {
    email: "",
    phone: "",
    linkedin: "",
  },
};

function normalizeAchievement(item) {
  if (typeof item === "string") {
    return {
      title: item.trim(),
      description: "",
      year: "",
      organization: "",
    };
  }

  return {
    title:
      typeof item?.title === "string"
        ? item.title
        : "",

    description:
      typeof item?.description === "string"
        ? item.description
        : "",

    year:
      typeof item?.year === "string"
        ? item.year
        : "",

    organization:
      typeof item?.organization === "string"
        ? item.organization
        : "",
  };
}

function mergeContent(saved) {
  if (!saved) {
    return {
      ...emptyContent,
      personal: { ...emptyContent.personal },
      contact: { ...emptyContent.contact },
      experience: [{ ...emptyExperience }],
      projects: [],
      skills: [],
      achievements: [],
      stats: defaultStats.map((item) => ({
        ...item,
      })),
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
        ? saved.experience.map((item) => ({
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
          }))
        : [{ ...emptyExperience }],

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
            typeof project?.description === "string"
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

    achievements: Array.isArray(saved.achievements)
      ? saved.achievements.map(normalizeAchievement)
      : [],

    stats:
      Array.isArray(saved.stats) &&
      saved.stats.length > 0
        ? saved.stats.map((stat) => ({
            value:
              typeof stat?.value === "string"
                ? stat.value
                : "",

            label:
              typeof stat?.label === "string"
                ? stat.label
                : "",
          }))
        : defaultStats.map((item) => ({
            ...item,
          })),

    resume:
      typeof saved.resume === "string"
        ? saved.resume
        : "",

    photo:
      typeof saved.photo === "string"
        ? saved.photo
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

  const [activeSection, setActiveSection] =
    useState("dashboard");

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

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

        if (!mounted) return;

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
          if (!mounted) return;

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

  useEffect(() => {
    if (!session) return;

    const sectionIds = [
      "dashboard",
      "profile",
      "resume",
      "personal",
      "contact",
      "experience",
      "stats",
      "skills",
      "projects",
      "achievements",
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              a.boundingClientRect.top -
              b.boundingClientRect.top
          );

        if (visibleEntries.length > 0) {
          setActiveSection(
            visibleEntries[0].target.id
          );
        }
      },
      {
        rootMargin: "-20% 0px -65% 0px",
        threshold: 0,
      }
    );

    sectionIds.forEach((id) => {
      const element =
        document.getElementById(id);

      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [session]);

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
          (err?.message || "Unknown error")
      );
    } finally {
      setLoadingContent(false);
    }
  }

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
        err?.message || "Login failed."
      );
    } finally {
      setLoggingIn(false);
    }
  }

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
        err?.message || "Logout failed."
      );
    }
  }

  function scrollToSection(id) {
    const element =
      document.getElementById(id);

    if (!element) return;

    setActiveSection(id);
    setSidebarOpen(false);

    element.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
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
        ...(current.personal || {}),
        [field]: value,
      },
    }));
  }

  function updateContact(field, value) {
    setContent((current) => ({
      ...current,
      contact: {
        ...(current.contact || {}),
        [field]: value,
      },
    }));
  }

  /* EXPERIENCE */

  function addExperience() {
    setContent((current) => ({
      ...current,
      experience: [
        ...(current.experience || []),
        { ...emptyExperience },
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

  /* STATS */

  function addStat() {
    setContent((current) => ({
      ...current,
      stats: [
        ...(current.stats || []),
        { ...emptyStat },
      ],
    }));

    setMessage(
      "New stat added. Fill in the value and description, then save."
    );
  }

  function updateStat(index, field, value) {
    setContent((current) => {
      const stats = [
        ...(current.stats || []),
      ];

      stats[index] = {
        ...(stats[index] || {}),
        [field]: value,
      };

      return {
        ...current,
        stats,
      };
    });
  }

  function deleteStat(index) {
    setContent((current) => {
      const stats = [
        ...(current.stats || []),
      ];

      stats.splice(index, 1);

      return {
        ...current,
        stats,
      };
    });

    setMessage(
      "Stat removed. Click Save Changes to publish the change."
    );
  }

  /* SKILLS */

  function updateSkills(value) {
    const skills = value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    updateField("skills", skills);
  }

  /* ACHIEVEMENTS */

  function addAchievement() {
    setContent((current) => ({
      ...current,
      achievements: [
        ...(current.achievements || []),
        { ...emptyAchievement },
      ],
    }));

    setMessage(
      "New achievement added. Fill in the details and click Save Changes."
    );
  }

  function updateAchievement(
    index,
    field,
    value
  ) {
    setContent((current) => {
      const achievements = [
        ...(current.achievements || []),
      ].map(normalizeAchievement);

      achievements[index] = {
        ...(achievements[index] || {
          ...emptyAchievement,
        }),
        [field]: value,
      };

      return {
        ...current,
        achievements,
      };
    });
  }

  function deleteAchievement(index) {
    setContent((current) => {
      const achievements = [
        ...(current.achievements || []),
      ];

      achievements.splice(index, 1);

      return {
        ...current,
        achievements,
      };
    });

    setMessage(
      "Achievement removed. Click Save Changes to publish the change."
    );
  }

  /* PROJECTS */

  function addProject() {
    setContent((current) => ({
      ...current,
      projects: [
        ...(current.projects || []),
        { ...emptyProject },
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

  /* PHOTO */

  async function handlePhotoUpload(event) {
    const file =
      event.target.files?.[0];

    if (!file) return;

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

      if (file.size > 5 * 1024 * 1024) {
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
          (err?.message || "Unknown error")
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

  /* RESUME */

  async function handleResumeUpload(event) {
    const file =
      event.target.files?.[0];

    if (!file) return;

    try {
      setError("");
      setMessage("");
      setUploadingResume(true);

      if (!session) {
        throw new Error(
          "You are not logged in. Please login again."
        );
      }

      if (file.type !== "application/pdf") {
        throw new Error(
          "Please select a PDF resume file."
        );
      }

      if (file.size > 10 * 1024 * 1024) {
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
          (err?.message || "Unknown error")
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

  /* SAVE */

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
            ? content.about
            : "",

        personal: {
          location:
            typeof content.personal?.location ===
            "string"
              ? content.personal.location.trim()
              : "",

          education:
            typeof content.personal?.education ===
            "string"
              ? content.personal.education.trim()
              : "",
        },

        experience:
          Array.isArray(content.experience)
            ? content.experience.map((item) => ({
                role:
                  typeof item?.role === "string"
                    ? item.role.trim()
                    : "",

                company:
                  typeof item?.company === "string"
                    ? item.company.trim()
                    : "",

                period:
                  typeof item?.period === "string"
                    ? item.period.trim()
                    : "",

                description:
                  typeof item?.description ===
                  "string"
                    ? item.description.trim()
                    : "",
              }))
            : [],

        skills:
          Array.isArray(content.skills)
            ? content.skills
                .filter(
                  (item) =>
                    typeof item === "string"
                )
                .map((item) => item.trim())
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
          Array.isArray(content.achievements)
            ? content.achievements
                .map(normalizeAchievement)
                .map((achievement) => ({
                  title:
                    achievement.title.trim(),

                  description:
                    achievement.description.trim(),

                  year:
                    achievement.year.trim(),

                  organization:
                    achievement.organization.trim(),
                }))
                .filter(
                  (achievement) =>
                    achievement.title ||
                    achievement.description ||
                    achievement.year ||
                    achievement.organization
                )
            : [],

        stats:
          Array.isArray(content.stats)
            ? content.stats
                .map((stat) => ({
                  value:
                    typeof stat?.value ===
                    "string"
                      ? stat.value.trim()
                      : "",

                  label:
                    typeof stat?.label ===
                    "string"
                      ? stat.label.trim()
                      : "",
                }))
                .filter(
                  (stat) =>
                    stat.value ||
                    stat.label
                )
            : [],

        contact: {
          email:
            typeof content.contact?.email ===
            "string"
              ? content.contact.email.trim()
              : "",

          phone:
            typeof content.contact?.phone ===
            "string"
              ? content.contact.phone.trim()
              : "",

          linkedin:
            typeof content.contact?.linkedin ===
            "string"
              ? content.contact.linkedin.trim()
              : "",
        },
      };

      if (
        cleanContent.photo &&
        !cleanContent.photo.startsWith("http")
      ) {
        throw new Error(
          "The profile photo URL is invalid."
        );
      }

      if (
        cleanContent.resume &&
        !cleanContent.resume.startsWith("http")
      ) {
        throw new Error(
          "The resume URL is invalid."
        );
      }

      for (const project of cleanContent.projects) {
        if (
          project.url &&
          !project.url.startsWith("http")
        ) {
          throw new Error(
            `Project "${project.title || "Untitled"}" has an invalid URL.`
          );
        }
      }

      if (cleanContent.contact.linkedin) {
        if (
          !cleanContent.contact.linkedin.startsWith(
            "http"
          )
        ) {
          throw new Error(
            "The LinkedIn URL is invalid."
          );
        }
      }

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
          (err?.message || "Unknown error")
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

          <h1>Welcome Back</h1>

          <p className="admin-subtitle">
            Login to edit your resume
            website.
          </p>

          <form
            onSubmit={handleLogin}
            className="admin-login-form"
          >
            <label>Email</label>

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

            <label>Password</label>

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

  const stats =
    Array.isArray(content.stats)
      ? content.stats
      : [];

  const achievements =
    Array.isArray(content.achievements)
      ? content.achievements.map(
          normalizeAchievement
        )
      : [];

  const projects =
    Array.isArray(content.projects)
      ? content.projects
      : [];

  const skills =
    Array.isArray(content.skills)
      ? content.skills
      : [];

  const sidebarItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "profile",
      label: "Profile",
      icon: User,
    },
    {
      id: "resume",
      label: "Resume / CV",
      icon: FileText,
    },
    {
      id: "personal",
      label: "Personal Info",
      icon: MapPin,
    },
    {
      id: "contact",
      label: "Contact",
      icon: Mail,
    },
    {
      id: "experience",
      label: "Experience",
      icon: Briefcase,
    },
    {
      id: "stats",
      label: "Professional Stats",
      icon: BarChart3,
    },
    {
      id: "skills",
      label: "Skills",
      icon: Code,
    },
    {
      id: "projects",
      label: "Projects",
      icon: FolderKanban,
    },
    {
      id: "achievements",
      label: "Achievements",
      icon: Award,
    },
  ];

  return (
    <div className="editor-page">
      {/* MOBILE OVERLAY */}

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() =>
            setSidebarOpen(false)
          }
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 80,
            border: 0,
            background:
              "rgba(0,0,0,0.55)",
            cursor: "pointer",
          }}
        />
      )}

      {/* SIDEBAR */}

      <aside
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 90,
          width: "270px",
          padding: "24px 16px",
          background:
            "linear-gradient(180deg, #07131f 0%, #040b13 100%)",
          borderRight:
            "1px solid rgba(120,150,165,0.15)",
          boxSizing: "border-box",
          transform:
            sidebarOpen
              ? "translateX(0)"
              : "translateX(0)",
          overflowY: "auto",
        }}
        className="admin-sidebar"
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent:
              "space-between",
            marginBottom: "28px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "11px",
            }}
          >
            {/* ADMIN PROFILE PHOTO */}

            <div
              style={{
                width: "42px",
                height: "42px",
                borderRadius: "13px",
                overflow: "hidden",
                display: "grid",
                placeItems: "center",
                background:
                  "linear-gradient(135deg,#e9f8f0,#bff0d2)",
                flexShrink: 0,
              }}
            >
              {content.photo ? (
                <img
                  src={content.photo}
                  alt={
                    content.name ||
                    "Profile"
                  }
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              ) : (
                <span
                  style={{
                    color: "#159154",
                    fontWeight: 900,
                    fontSize: "14px",
                  }}
                >
                  MB
                </span>
              )}
            </div>

            <div>
              <strong
                style={{
                  display: "block",
                  fontSize: "14px",
                }}
              >
                Admin Control
              </strong>

              <span
                style={{
                  display: "block",
                  marginTop: "3px",
                  color: "#72818c",
                  fontSize: "10px",
                }}
              >
                WEBSITE MANAGER
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              setSidebarOpen(false)
            }
            style={{
              display: "none",
              border: 0,
              background: "transparent",
              color: "#8e9ba5",
              cursor: "pointer",
            }}
            className="admin-mobile-close"
          >
            <X size={20} />
          </button>
        </div>

        <div
          style={{
            padding: "12px",
            borderRadius: "13px",
            background:
              "rgba(55,200,120,0.06)",
            border:
              "1px solid rgba(55,200,120,0.13)",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              color: "#73dc9a",
              fontSize: "11px",
              fontWeight: 700,
            }}
          >
            <CheckCircle2 size={14} />
            Website Online
          </div>

          <div
            style={{
              marginTop: "5px",
              color: "#72818c",
              fontSize: "10px",
            }}
          >
            Content system connected
          </div>
        </div>

        <div
          style={{
            color: "#596974",
            fontSize: "9px",
            fontWeight: 800,
            letterSpacing: "0.14em",
            padding:
              "0 10px 10px",
          }}
        >
          CONTENT MANAGEMENT
        </div>

        <nav>
          {sidebarItems.map((item) => {
            const Icon = item.icon;

            const active =
              activeSection === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  scrollToSection(
                    item.id
                  )
                }
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: "11px",
                  border: 0,
                  borderRadius: "10px",
                  padding: "11px 12px",
                  marginBottom: "4px",
                  background: active
                    ? "rgba(55,200,120,0.11)"
                    : "transparent",
                  color: active
                    ? "#5bdd91"
                    : "#91a0aa",
                  fontSize: "12px",
                  fontWeight: active
                    ? 800
                    : 600,
                  textAlign: "left",
                  cursor: "pointer",
                  transition:
                    "all 0.2s ease",
                }}
              >
                <Icon size={17} />

                <span>
                  {item.label}
                </span>

                {active && (
                  <span
                    style={{
                      width: "4px",
                      height: "20px",
                      borderRadius:
                        "999px",
                      background:
                        "#37c878",
                      marginLeft:
                        "auto",
                    }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        <div
          style={{
            marginTop: "28px",
            paddingTop: "18px",
            borderTop:
              "1px solid rgba(120,150,165,0.1)",
          }}
        >
          <button
            type="button"
            onClick={() => {
              window.location.href =
                "/";
            }}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 12px",
              border: 0,
              background:
                "transparent",
              color: "#82909a",
              cursor: "pointer",
              fontSize: "12px",
              textAlign: "left",
            }}
          >
            <Globe2 size={17} />
            View Website
          </button>

          <button
            type="button"
            onClick={handleLogout}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "10px 12px",
              border: 0,
              background:
                "transparent",
              color: "#82909a",
              cursor: "pointer",
              fontSize: "12px",
              textAlign: "left",
            }}
          >
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </aside>

      {/* MOBILE MENU BUTTON */}

      <button
        type="button"
        onClick={() =>
          setSidebarOpen(true)
        }
        className="admin-mobile-menu"
        style={{
          display: "none",
          position: "fixed",
          top: "15px",
          left: "15px",
          zIndex: 70,
          width: "42px",
          height: "42px",
          border: "1px solid rgba(120,150,165,0.2)",
          borderRadius: "11px",
          background: "#07131f",
          color: "#fff",
          placeItems: "center",
          cursor: "pointer",
        }}
      >
        <Menu size={20} />
      </button>

      {/* MAIN AREA */}

      <div
        style={{
          marginLeft: "270px",
          minHeight: "100vh",
        }}
        className="admin-main-with-sidebar"
      >
        {/* CONTROL CENTER HEADER */}

        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent:
              "space-between",
            gap: "20px",
            padding:
              "18px clamp(22px,4vw,55px)",
            background:
              "rgba(6,16,27,0.88)",
            borderBottom:
              "1px solid rgba(120,150,165,0.15)",
            backdropFilter:
              "blur(18px)",
          }}
        >
          <div>
            <div
              className="editor-label"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "7px",
              }}
            >
              <Settings size={12} />
              ADMIN CONTROL CENTER
            </div>

            <h1
              style={{
                margin:
                  "5px 0 3px",
                fontSize:
                  "clamp(22px,3vw,30px)",
                letterSpacing:
                  "-0.04em",
              }}
            >
              Manage Your Website
            </h1>

            <p
              style={{
                margin: 0,
                color: "#83909a",
                fontSize: "11px",
              }}
            >
              Edit your portfolio content,
              resume and professional
              information from one place.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding:
                  "9px 12px",
                borderRadius: "10px",
                border:
                  "1px solid rgba(55,200,120,0.15)",
                background:
                  "rgba(55,200,120,0.05)",
              }}
            >
              <span
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius:
                    "50%",
                  background:
                    "#37c878",
                  boxShadow:
                    "0 0 10px #37c878",
                }}
              />

              <span
                style={{
                  color: "#7be09e",
                  fontSize: "10px",
                  fontWeight: 700,
                }}
              >
                ONLINE
              </span>
            </div>

            <button
              className="logout-btn"
              onClick={handleLogout}
            >
              <LogOut size={17} />
              Logout
            </button>
          </div>
        </header>

        <main
          className="editor-container"
          style={{
            maxWidth: "1050px",
          }}
        >
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

          {/* DASHBOARD */}

          <section
            id="dashboard"
            className="editor-card"
            style={{
              scrollMarginTop:
                "100px",
            }}
          >
            <div className="editor-card-title">
              <LayoutDashboard size={20} />
              <h2>Dashboard Overview</h2>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit,minmax(180px,1fr))",
                gap: "14px",
              }}
            >
              {[
                {
                  icon: User,
                  label: "Profile",
                  value:
                    content.name ||
                    "Not set",
                  section:
                    "profile",
                },
                {
                  icon: Briefcase,
                  label: "Experience",
                  value:
                    `${experiences.length} ${
                      experiences.length === 1
                        ? "entry"
                        : "entries"
                    }`,
                  section:
                    "experience",
                },
                {
                  icon: FolderKanban,
                  label: "Projects",
                  value:
                    `${projects.length} ${
                      projects.length === 1
                        ? "project"
                        : "projects"
                    }`,
                  section:
                    "projects",
                },
                {
                  icon: Award,
                  label: "Achievements",
                  value:
                    `${achievements.length} ${
                      achievements.length === 1
                        ? "achievement"
                        : "achievements"
                    }`,
                  section:
                    "achievements",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() =>
                      scrollToSection(
                        item.section
                      )
                    }
                    style={{
                      textAlign:
                        "left",
                      border:
                        "1px solid rgba(120,150,165,0.14)",
                      borderRadius:
                        "14px",
                      padding:
                        "18px",
                      background:
                        "rgba(6,16,27,0.55)",
                      color: "#fff",
                      cursor:
                        "pointer",
                      transition:
                        "all 0.2s ease",
                    }}
                  >
                    <Icon
                      size={19}
                      color="#37c878"
                    />

                    <div
                      style={{
                        marginTop:
                          "13px",
                        color:
                          "#778690",
                        fontSize:
                          "10px",
                        fontWeight:
                          700,
                        textTransform:
                          "uppercase",
                        letterSpacing:
                          "0.08em",
                      }}
                    >
                      {item.label}
                    </div>

                    <div
                      style={{
                        marginTop:
                          "6px",
                        fontSize:
                          "15px",
                        fontWeight:
                          700,
                      }}
                    >
                      {item.value}
                    </div>
                  </button>
                );
              })}
            </div>

            <div
              style={{
                marginTop: "18px",
                padding: "14px 16px",
                borderRadius: "12px",
                background:
                  "rgba(55,200,120,0.05)",
                border:
                  "1px solid rgba(55,200,120,0.12)",
                display: "flex",
                alignItems: "center",
                gap: "9px",
                color: "#8fe2ab",
                fontSize: "11px",
              }}
            >
              <CheckCircle2 size={16} />

              Your admin panel is connected
              to Supabase and ready to manage
              your website content.
            </div>
          </section>

          {/* PROFILE */}

          <section
            id="profile"
            className="editor-card"
            style={{
              scrollMarginTop:
                "100px",
            }}
          >
            <div className="editor-card-title">
              <User size={20} />
              <h2>Profile</h2>
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
              onChange={
                handlePhotoUpload
              }
              disabled={
                uploadingPhoto ||
                saving ||
                uploadingResume
              }
            />

            {uploadingPhoto && (
              <p className="field-help">
                Uploading photo to Supabase
                Storage...
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
              JPG, PNG, WEBP or GIF.
              Maximum size: 5 MB.
            </p>

            <label>Full Name</label>

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

            <label>About Me</label>

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

          {/* RESUME */}

          <section
            id="resume"
            className="editor-card"
            style={{
              scrollMarginTop:
                "100px",
            }}
          >
            <div className="editor-card-title">
              <FileText size={20} />
              <h2>Resume / CV</h2>
            </div>

            <label>
              <FileText size={14} />
              Upload Resume PDF
            </label>

            <input
              type="file"
              accept="application/pdf,.pdf"
              onChange={
                handleResumeUpload
              }
              disabled={
                uploadingResume ||
                saving ||
                uploadingPhoto
              }
            />

            {uploadingResume && (
              <p className="field-help">
                Uploading resume to Supabase
                Storage...
              </p>
            )}

            {content.resume &&
              !uploadingResume && (
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    flexWrap:
                      "wrap",
                    marginTop:
                      "12px",
                  }}
                >
                  <a
                    href={
                      content.resume
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="back-home"
                    style={{
                      textDecoration:
                        "none",
                      display:
                        "inline-flex",
                      alignItems:
                        "center",
                      gap: "6px",
                    }}
                  >
                    <ExternalLink
                      size={16}
                    />
                    View Current
                    Resume
                  </a>

                  <button
                    type="button"
                    className="back-home"
                    onClick={
                      removeResume
                    }
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
              Upload your resume as a
              PDF. Maximum size: 10 MB.
            </p>

            {!content.resume && (
              <p className="field-help">
                No resume uploaded yet.
              </p>
            )}
          </section>

          {/* PERSONAL */}

          <section
            id="personal"
            className="editor-card"
            style={{
              scrollMarginTop:
                "100px",
            }}
          >
            <div className="editor-card-title">
              <MapPin size={20} />
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
              placeholder="Example: Diploma in Civil"
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

          <section
            id="contact"
            className="editor-card"
            style={{
              scrollMarginTop:
                "100px",
            }}
          >
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

          <section
            id="experience"
            className="editor-card"
            style={{
              scrollMarginTop:
                "100px",
            }}
          >
            <div className="editor-card-title">
              <Briefcase size={20} />
              <h2>Experience</h2>
            </div>

            <p className="field-help">
              Add and manage all your
              professional experiences.
              The order here is the order
              shown on your website.
            </p>

            {experiences.map(
              (
                experience,
                index
              ) => (
                <div
                  key={index}
                  style={{
                    border:
                      "1px solid rgba(127,127,127,0.25)",
                    borderRadius:
                      "14px",
                    padding:
                      "18px",
                    marginTop:
                      "18px",
                  }}
                >
                  <div
                    style={{
                      display:
                        "flex",
                      justifyContent:
                        "space-between",
                      alignItems:
                        "center",
                      gap: "12px",
                      marginBottom:
                        "16px",
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

                      {experience.role && (
                        <p
                          className="field-help"
                          style={{
                            marginTop:
                              "5px",
                          }}
                        >
                          {
                            experience.role
                          }

                          {experience.company
                            ? ` • ${experience.company}`
                            : ""}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      className="back-home"
                      onClick={() =>
                        deleteExperience(
                          index
                        )
                      }
                      disabled={
                        saving
                      }
                      style={{
                        display:
                          "inline-flex",
                        alignItems:
                          "center",
                        gap: "6px",
                      }}
                    >
                      <Trash2
                        size={16}
                      />
                      Delete
                    </button>
                  </div>

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
                    onChange={(
                      event
                    ) =>
                      updateExperience(
                        index,
                        "role",
                        event.target
                          .value
                      )
                    }
                  />

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
                    onChange={(
                      event
                    ) =>
                      updateExperience(
                        index,
                        "company",
                        event.target
                          .value
                      )
                    }
                  />

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
                    onChange={(
                      event
                    ) =>
                      updateExperience(
                        index,
                        "period",
                        event.target
                          .value
                      )
                    }
                  />

                  <label>
                    Description
                  </label>

                  <p className="field-help">
                    Add one responsibility
                    or achievement per
                    line.
                  </p>

                  <textarea
                    rows="8"
                    placeholder={
                      "Led annotation teams across multiple projects.\nManaged daily targets and deadlines.\nEnsured high-quality annotations."
                    }
                    value={
                      experience.description ||
                      ""
                    }
                    onChange={(
                      event
                    ) =>
                      updateExperience(
                        index,
                        "description",
                        event.target
                          .value
                      )
                    }
                  />
                </div>
              )
            )}

            <button
              type="button"
              className="save-btn"
              onClick={
                addExperience
              }
              disabled={saving}
              style={{
                marginTop:
                  "18px",
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

          {/* STATS */}

          <section
            id="stats"
            className="editor-card"
            style={{
              scrollMarginTop:
                "100px",
            }}
          >
            <div className="editor-card-title">
              <BarChart3 size={20} />
              <h2>
                Professional Stats
              </h2>
            </div>

            <p className="field-help">
              These statistics are
              displayed in the Experience
              section of your website.
            </p>

            {stats.map(
              (stat, index) => (
                <div
                  key={index}
                  style={{
                    border:
                      "1px solid rgba(127,127,127,0.25)",
                    borderRadius:
                      "14px",
                    padding:
                      "18px",
                    marginTop:
                      "16px",
                  }}
                >
                  <div
                    style={{
                      display:
                        "flex",
                      justifyContent:
                        "space-between",
                      alignItems:
                        "center",
                      gap: "12px",
                      marginBottom:
                        "16px",
                    }}
                  >
                    <h3
                      style={{
                        margin: 0,
                      }}
                    >
                      Stat{" "}
                      {index + 1}
                    </h3>

                    <button
                      type="button"
                      className="back-home"
                      onClick={() =>
                        deleteStat(
                          index
                        )
                      }
                      disabled={
                        saving
                      }
                      style={{
                        display:
                          "inline-flex",
                        alignItems:
                          "center",
                        gap: "6px",
                      }}
                    >
                      <Trash2
                        size={16}
                      />
                      Delete
                    </button>
                  </div>

                  <label>
                    Stat Value
                  </label>

                  <input
                    type="text"
                    placeholder="Example: 18+"
                    value={
                      stat.value ||
                      ""
                    }
                    onChange={(
                      event
                    ) =>
                      updateStat(
                        index,
                        "value",
                        event.target
                          .value
                      )
                    }
                  />

                  <label>
                    Stat Description
                  </label>

                  <input
                    type="text"
                    placeholder="Example: Projects handled concurrently"
                    value={
                      stat.label ||
                      ""
                    }
                    onChange={(
                      event
                    ) =>
                      updateStat(
                        index,
                        "label",
                        event.target
                          .value
                      )
                    }
                  />
                </div>
              )
            )}

            {stats.length === 0 && (
              <div
                style={{
                  padding:
                    "24px",
                  marginTop:
                    "16px",
                  borderRadius:
                    "12px",
                  textAlign:
                    "center",
                  border:
                    "1px dashed rgba(127,127,127,0.4)",
                }}
              >
                <p className="field-help">
                  No professional stats
                  added.
                </p>
              </div>
            )}

            <button
              type="button"
              className="save-btn"
              onClick={
                addStat
              }
              disabled={saving}
              style={{
                marginTop:
                  "18px",
                display:
                  "inline-flex",
                alignItems:
                  "center",
                gap: "8px",
              }}
            >
              <Plus size={18} />
              Add Stat
            </button>
          </section>

          {/* SKILLS */}

          <section
            id="skills"
            className="editor-card"
            style={{
              scrollMarginTop:
                "100px",
            }}
          >
            <div className="editor-card-title">
              <Code size={20} />
              <h2>Skills</h2>
            </div>

            <label>Skills</label>

            <textarea
              rows="5"
              placeholder="Data Annotation, QA, Team Management, Segmentation..."
              value={skills.join(
                ", "
              )}
              onChange={(event) =>
                updateSkills(
                  event.target.value
                )
              }
            />
          </section>

          {/* PROJECTS */}

          <section
            id="projects"
            className="editor-card"
            style={{
              scrollMarginTop:
                "100px",
            }}
          >
            <div className="editor-card-title">
              <FolderKanban size={20} />
              <h2>Projects</h2>
            </div>

            <p className="field-help">
              Add your professional
              projects.
            </p>

            {projects.map(
              (
                project,
                index
              ) => (
                <div
                  key={index}
                  style={{
                    border:
                      "1px solid rgba(127,127,127,0.25)",
                    borderRadius:
                      "14px",
                    padding:
                      "18px",
                    marginTop:
                      "16px",
                  }}
                >
                  <div
                    style={{
                      display:
                        "flex",
                      justifyContent:
                        "space-between",
                      alignItems:
                        "center",
                      gap: "12px",
                      marginBottom:
                        "16px",
                    }}
                  >
                    <h3
                      style={{
                        margin: 0,
                      }}
                    >
                      Project{" "}
                      {index + 1}
                    </h3>

                    <button
                      type="button"
                      className="back-home"
                      onClick={() =>
                        deleteProject(
                          index
                        )
                      }
                      disabled={
                        saving
                      }
                      style={{
                        display:
                          "inline-flex",
                        alignItems:
                          "center",
                        gap: "6px",
                      }}
                    >
                      <Trash2
                        size={16}
                      />
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
                      project.title ||
                      ""
                    }
                    onChange={(
                      event
                    ) =>
                      updateProject(
                        index,
                        "title",
                        event.target
                          .value
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
                    onChange={(
                      event
                    ) =>
                      updateProject(
                        index,
                        "description",
                        event.target
                          .value
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
                      project.tag ||
                      ""
                    }
                    onChange={(
                      event
                    ) =>
                      updateProject(
                        index,
                        "tag",
                        event.target
                          .value
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
                      project.url ||
                      ""
                    }
                    onChange={(
                      event
                    ) =>
                      updateProject(
                        index,
                        "url",
                        event.target
                          .value
                      )
                    }
                  />

                  {project.url && (
                    <a
                      href={
                        project.url
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="back-home"
                      style={{
                        marginTop:
                          "10px",
                        textDecoration:
                          "none",
                        display:
                          "inline-flex",
                        alignItems:
                          "center",
                        gap: "6px",
                      }}
                    >
                      <ExternalLink
                        size={16}
                      />
                      Test Project
                      Link
                    </a>
                  )}
                </div>
              )
            )}

            {projects.length ===
              0 && (
              <div
                style={{
                  padding:
                    "24px",
                  marginTop:
                    "16px",
                  borderRadius:
                    "12px",
                  textAlign:
                    "center",
                  border:
                    "1px dashed rgba(127,127,127,0.4)",
                }}
              >
                <p className="field-help">
                  No projects added
                  yet.
                </p>
              </div>
            )}

            <button
              type="button"
              className="save-btn"
              onClick={
                addProject
              }
              disabled={saving}
              style={{
                marginTop:
                  "18px",
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

          {/* ACHIEVEMENTS */}

          <section
            id="achievements"
            className="editor-card"
            style={{
              scrollMarginTop:
                "100px",
            }}
          >
            <div className="editor-card-title">
              <Award size={20} />
              <h2>Achievements</h2>
            </div>

            <p className="field-help">
              Manage your professional
              achievements. Each
              achievement can have a title,
              description, year and
              organization.
            </p>

            {achievements.map(
              (
                achievement,
                index
              ) => (
                <div
                  key={index}
                  style={{
                    border:
                      "1px solid rgba(127,127,127,0.25)",
                    borderRadius:
                      "14px",
                    padding:
                      "18px",
                    marginTop:
                      "16px",
                  }}
                >
                  <div
                    style={{
                      display:
                        "flex",
                      justifyContent:
                        "space-between",
                      alignItems:
                        "center",
                      gap: "12px",
                      marginBottom:
                        "16px",
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          margin: 0,
                        }}
                      >
                        Achievement{" "}
                        {index + 1}
                      </h3>

                      {achievement.title && (
                        <p
                          className="field-help"
                          style={{
                            marginTop:
                              "5px",
                          }}
                        >
                          {
                            achievement.title
                          }
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      className="back-home"
                      onClick={() =>
                        deleteAchievement(
                          index
                        )
                      }
                      disabled={
                        saving
                      }
                      style={{
                        display:
                          "inline-flex",
                        alignItems:
                          "center",
                        gap: "6px",
                      }}
                    >
                      <Trash2
                        size={16}
                      />
                      Delete
                    </button>
                  </div>

                  <label>
                    Achievement Title
                  </label>

                  <input
                    type="text"
                    placeholder="Example: Best Performer"
                    value={
                      achievement.title ||
                      ""
                    }
                    onChange={(
                      event
                    ) =>
                      updateAchievement(
                        index,
                        "title",
                        event.target
                          .value
                      )
                    }
                  />

                  <label>
                    Description
                  </label>

                  <textarea
                    rows="5"
                    placeholder="Describe the achievement, recognition or result."
                    value={
                      achievement.description ||
                      ""
                    }
                    onChange={(
                      event
                    ) =>
                      updateAchievement(
                        index,
                        "description",
                        event.target
                          .value
                      )
                    }
                  />

                  <label>
                    Year
                  </label>

                  <input
                    type="text"
                    placeholder="Example: 2026"
                    value={
                      achievement.year ||
                      ""
                    }
                    onChange={(
                      event
                    ) =>
                      updateAchievement(
                        index,
                        "year",
                        event.target
                          .value
                      )
                    }
                  />

                  <label>
                    Organization /
                    Context
                  </label>

                  <input
                    type="text"
                    placeholder="Example: Data Annotation Team"
                    value={
                      achievement.organization ||
                      ""
                    }
                    onChange={(
                      event
                    ) =>
                      updateAchievement(
                        index,
                        "organization",
                        event.target
                          .value
                      )
                    }
                  />
                </div>
              )
            )}

            {achievements.length ===
              0 && (
              <div
                style={{
                  padding:
                    "24px",
                  marginTop:
                    "16px",
                  borderRadius:
                    "12px",
                  textAlign:
                    "center",
                  border:
                    "1px dashed rgba(127,127,127,0.4)",
                }}
              >
                <p className="field-help">
                  No achievements added
                  yet.
                </p>
              </div>
            )}

            <button
              type="button"
              className="save-btn"
              onClick={
                addAchievement
              }
              disabled={saving}
              style={{
                marginTop:
                  "18px",
                display:
                  "inline-flex",
                alignItems:
                  "center",
                gap: "8px",
              }}
            >
              <Plus size={18} />
              Add Achievement
            </button>
          </section>

          {/* SAVE */}

          <div className="save-area">
            <button
              className="save-btn"
              onClick={
                saveChanges
              }
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
    </div>
  );
}

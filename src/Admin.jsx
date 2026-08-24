import React, { useEffect, useState } from "react";
import {
  LogOut,
  Save,
  User,
  Briefcase,
  Code,
  FolderKanban,
  Award,
} from "lucide-react";
import { supabase } from "./supabase";

const emptyContent = {
  name: "",
  title: "",
  about: "",
  experience: [],
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
  const [user, setUser] = useState(null);
  const [content, setContent] = useState(emptyContent);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAdmin();
  }, []);

  async function loadAdmin() {
    try {
      setLoading(true);
      setError("");

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      if (!session) {
        window.location.href = "/admin";
        return;
      }

      setUser(session.user);

      const { data, error: contentError } = await supabase
        .from("site_content")
        .select("content")
        .eq("id", "main")
        .maybeSingle();

      if (contentError) {
        throw contentError;
      }

      if (data?.content) {
        setContent({
          ...emptyContent,
          ...data.content,
          contact: {
            ...emptyContent.contact,
            ...(data.content.contact || {}),
          },
        });
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to load website data.");
    } finally {
      setLoading(false);
    }
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

  async function saveChanges() {
    try {
      setSaving(true);
      setError("");

      const { error: updateError } = await supabase
        .from("site_content")
        .update({
          content,
          updated_at: new Date().toISOString(),
        })
        .eq("id", "main");

      if (updateError) {
        throw updateError;
      }

      alert("Changes saved successfully! 🎉");
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to save changes.");
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/admin";
  }

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-card">
          <h2>Checking your account...</h2>
          <p>Please wait.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <div className="admin-card">
          <h2>Something went wrong</h2>

          <p className="admin-error">
            {error}
          </p>

          <button
            className="admin-login-btn"
            onClick={loadAdmin}
          >
            Try Again
          </button>

          <button
            className="back-home"
            onClick={logout}
          >
            Logout
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

          <h1>Edit My Website</h1>

          <p>
            Logged in as {user?.email}
          </p>
        </div>

        <button
          className="logout-btn"
          onClick={logout}
        >
          <LogOut size={18} />
          Logout
        </button>
      </header>

      <main className="editor-container">

        <section className="editor-card">
          <div className="editor-card-title">
            <User size={20} />
            <h2>Profile</h2>
          </div>

          <label>Name</label>

          <input
            value={content.name}
            onChange={(e) =>
              updateField("name", e.target.value)
            }
          />

          <label>Professional Title</label>

          <input
            value={content.title}
            onChange={(e) =>
              updateField("title", e.target.value)
            }
          />

          <label>About Me</label>

          <textarea
            rows="6"
            value={content.about}
            onChange={(e) =>
              updateField("about", e.target.value)
            }
          />
        </section>

        <section className="editor-card">
          <div className="editor-card-title">
            <Briefcase size={20} />
            <h2>Experience</h2>
          </div>

          <label>Job Role</label>

          <input
            value={
              content.experience?.[0]?.role || ""
            }
            onChange={(e) => {
              const experience = [
                ...(content.experience || []),
              ];

              experience[0] = {
                ...(experience[0] || {}),
                role: e.target.value,
              };

              updateField(
                "experience",
                experience
              );
            }}
          />

          <label>Company</label>

          <input
            value={
              content.experience?.[0]?.company || ""
            }
            onChange={(e) => {
              const experience = [
                ...(content.experience || []),
              ];

              experience[0] = {
                ...(experience[0] || {}),
                company: e.target.value,
              };

              updateField(
                "experience",
                experience
              );
            }}
          />

          <label>Description</label>

          <textarea
            rows="6"
            value={
              content.experience?.[0]?.description ||
              ""
            }
            onChange={(e) => {
              const experience = [
                ...(content.experience || []),
              ];

              experience[0] = {
                ...(experience[0] || {}),
                description: e.target.value,
              };

              updateField(
                "experience",
                experience
              );
            }}
          />
        </section>

        <section className="editor-card">
          <div className="editor-card-title">
            <Code size={20} />
            <h2>Skills</h2>
          </div>

          <label>
            Skills — separate with commas
          </label>

          <textarea
            rows="5"
            value={(content.skills || []).join(
              ", "
            )}
            onChange={(e) =>
              updateField(
                "skills",
                e.target.value
                  .split(",")
                  .map((x) => x.trim())
                  .filter(Boolean)
              )
            }
          />
        </section>

        <section className="editor-card">
          <div className="editor-card-title">
            <FolderKanban size={20} />
            <h2>Projects</h2>
          </div>

          <label>
            Projects — one project per line
          </label>

          <textarea
            rows="8"
            value={(content.projects || [])
              .map(
                (p) =>
                  `${p.title || ""}: ${
                    p.description ||
                    p.text ||
                    ""
                  }`
              )
              .join("\n")}
            onChange={(e) => {
              const projects = e.target.value
                .split("\n")
                .filter(Boolean)
                .map((line) => {
                  const index =
                    line.indexOf(":");

                  if (index === -1) {
                    return {
                      title: line.trim(),
                      description: "",
                    };
                  }

                  return {
                    title: line
                      .slice(0, index)
                      .trim(),

                    description: line
                      .slice(index + 1)
                      .trim(),
                  };
                });

              updateField(
                "projects",
                projects
              );
            }}
          />
        </section>

        <section className="editor-card">
          <div className="editor-card-title">
            <Award size={20} />
            <h2>Achievements</h2>
          </div>

          <label>
            Achievements — separate with commas
          </label>

          <textarea
            rows="5"
            value={(content.achievements || []).join(
              ", "
            )}
            onChange={(e) =>
              updateField(
                "achievements",
                e.target.value
                  .split(",")
                  .map((x) => x.trim())
                  .filter(Boolean)
              )
            }
          />
        </section>

        <section className="editor-card">
          <div className="editor-card-title">
            <User size={20} />
            <h2>Contact</h2>
          </div>

          <label>Email</label>

          <input
            value={content.contact.email}
            onChange={(e) =>
              updateContact(
                "email",
                e.target.value
              )
            }
          />

          <label>Phone</label>

          <input
            value={content.contact.phone}
            onChange={(e) =>
              updateContact(
                "phone",
                e.target.value
              )
            }
          />

          <label>LinkedIn</label>

          <input
            value={content.contact.linkedin}
            onChange={(e) =>
              updateContact(
                "linkedin",
                e.target.value
              )
            }
          />
        </section>

        <section className="save-area">
          {error && (
            <div className="admin-error">
              {error}
            </div>
          )}

          <button
            className="save-btn"
            onClick={saveChanges}
            disabled={saving}
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

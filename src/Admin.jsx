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
  const [session, setSession] = useState(null);
  const [content, setContent] = useState(emptyContent);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function start() {
      try {
        setLoading(true);

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (!mounted) return;

        if (!session) {
          window.location.replace("/admin");
          return;
        }

        setSession(session);

        const result = await supabase
          .from("site_content")
          .select("content")
          .eq("id", "main")
          .limit(1);

        if (result.error) {
          throw result.error;
        }

        if (result.data && result.data.length > 0) {
          setContent({
            ...emptyContent,
            ...result.data[0].content,
            contact: {
              ...emptyContent.contact,
              ...(result.data[0].content.contact || {}),
            },
          });
        }
      } catch (err) {
        if (mounted) {
          setError(
            err?.message ||
              "Unable to load admin dashboard."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    start();

    return () => {
      mounted = false;
    };
  }, []);

  function updateField(name, value) {
    setContent((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function updateContact(name, value) {
    setContent((current) => ({
      ...current,
      contact: {
        ...current.contact,
        [name]: value,
      },
    }));
  }

  async function saveChanges() {
    setSaving(true);
    setError("");

    const { error } = await supabase
      .from("site_content")
      .update({
        content,
        updated_at: new Date().toISOString(),
      })
      .eq("id", "main");

    setSaving(false);

    if (error) {
      setError(error.message);
      return;
    }

    alert("Website updated successfully!");
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.replace("/admin");
  }

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-card">
          <h2>Loading admin dashboard...</h2>
          <p>Please wait.</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="editor-page">
      <header className="editor-header">
        <div>
          <div className="editor-label">
            ADMIN PANEL
          </div>

          <h1>Edit My Website</h1>

          <p>{session.user.email}</p>
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

        {error && (
          <div className="admin-error">
            {error}
          </div>
        )}

        <section className="editor-card">
          <div className="editor-card-title">
            <User size={20} />
            <h2>Profile</h2>
          </div>

          <label>Name</label>

          <input
            value={content.name}
            onChange={(e) =>
              updateField(
                "name",
                e.target.value
              )
            }
          />

          <label>Professional Title</label>

          <input
            value={content.title}
            onChange={(e) =>
              updateField(
                "title",
                e.target.value
              )
            }
          />

          <label>About Me</label>

          <textarea
            rows="6"
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
            Skills (separate with commas)
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
            One project per line:
            Title: Description
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
                  const i =
                    line.indexOf(":");

                  return {
                    title:
                      i >= 0
                        ? line
                            .slice(0, i)
                            .trim()
                        : line.trim(),

                    description:
                      i >= 0
                        ? line
                            .slice(i + 1)
                            .trim()
                        : "",
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
            Achievements (separate with commas)
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

        <div className="save-area">
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
        </div>

      </main>
    </div>
  );
                }

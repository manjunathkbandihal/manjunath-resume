import React, { useEffect, useState } from "react";
import { LogOut, Save, User, Briefcase, Code, FolderKanban, Award } from "lucide-react";
import { supabase } from "./supabase";

const defaultContent = {
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
    linkedin: ""
  }
};

export default function Admin() {
  const [user, setUser] = useState(null);
  const [content, setContent] = useState(defaultContent);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const {
      data: { session }
    } = await supabase.auth.getSession();

    if (!session) {
      window.location.href = "/admin";
      return;
    }

    setUser(session.user);
    await loadContent();
    setLoading(false);
  }

  async function loadContent() {
    const { data, error } = await supabase
      .from("site_content")
      .select("content")
      .eq("id", "main")
      .single();

    if (error) {
      setMessage(error.message);
      return;
    }

    setContent({
      ...defaultContent,
      ...data.content,
      contact: {
        ...defaultContent.contact,
        ...(data.content.contact || {})
      }
    });
  }

  function updateField(field, value) {
    setContent((old) => ({
      ...old,
      [field]: value
    }));
  }

  function updateContact(field, value) {
    setContent((old) => ({
      ...old,
      contact: {
        ...old.contact,
        [field]: value
      }
    }));
  }

  function updateSkills(value) {
    const skills = value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    updateField("skills", skills);
  }

  async function saveChanges() {
    setSaving(true);
    setMessage("");

    const { error } = await supabase
      .from("site_content")
      .update({
        content: content,
        updated_at: new Date().toISOString()
      })
      .eq("id", "main");

    setSaving(false);

    if (error) {
      setMessage("Error: " + error.message);
      return;
    }

    setMessage("Changes saved successfully! 🎉");
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/admin";
  }

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-card">
          <h2>Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="editor-page">

      <header className="editor-header">
        <div>
          <div className="editor-label">ADMIN PANEL</div>
          <h1>Edit My Website</h1>
          <p>Update your resume website from your phone.</p>
        </div>

        <button className="logout-btn" onClick={logout}>
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
            placeholder="Your name"
          />

          <label>Professional Title</label>
          <input
            value={content.title}
            onChange={(e) =>
              updateField("title", e.target.value)
            }
            placeholder="Your professional title"
          />

          <label>About Me</label>
          <textarea
            rows="6"
            value={content.about}
            onChange={(e) =>
              updateField("about", e.target.value)
            }
            placeholder="Write about yourself..."
          />
        </section>

        <section className="editor-card">
          <div className="editor-card-title">
            <Briefcase size={20} />
            <h2>Experience</h2>
          </div>

          <label>Job Role</label>
          <input
            value={content.experience?.[0]?.role || ""}
            onChange={(e) => {
              const experience = [
                ...(content.experience || [])
              ];

              experience[0] = {
                ...(experience[0] || {}),
                role: e.target.value
              };

              updateField("experience", experience);
            }}
            placeholder="Data Annotation Team Lead"
          />

          <label>Company</label>
          <input
            value={content.experience?.[0]?.company || ""}
            onChange={(e) => {
              const experience = [
                ...(content.experience || [])
              ];

              experience[0] = {
                ...(experience[0] || {}),
                company: e.target.value
              };

              updateField("experience", experience);
            }}
            placeholder="Company name"
          />

          <label>Description</label>
          <textarea
            rows="6"
            value={content.experience?.[0]?.description || ""}
            onChange={(e) => {
              const experience = [
                ...(content.experience || [])
              ];

              experience[0] = {
                ...(experience[0] || {}),
                description: e.target.value
              };

              updateField("experience", experience);
            }}
            placeholder="Describe your experience..."
          />
        </section>

        <section className="editor-card">
          <div className="editor-card-title">
            <Code size={20} />
            <h2>Skills</h2>
          </div>

          <label>Skills</label>

          <textarea
            rows="5"
            value={(content.skills || []).join(", ")}
            onChange={(e) =>
              updateSkills(e.target.value)
            }
            placeholder="Data Annotation, Team Management, Excel..."
          />

          <small>
            Separate each skill with a comma.
          </small>
        </section>

        <section className="editor-card">
          <div className="editor-card-title">
            <FolderKanban size={20} />
            <h2>Projects</h2>
          </div>

          <label>Projects</label>

          <textarea
            rows="8"
            value={(content.projects || [])
              .map(
                (project) =>
                  `${project.title || ""}: ${project.description || project.text || ""}`
              )
              .join("\n\n")}
            onChange={(e) => {
              const projects = e.target.value
                .split("\n\n")
                .filter(Boolean)
                .map((item) => {
                  const parts = item.split(":");

                  return {
                    title: parts[0]?.trim() || "",
                    description:
                      parts.slice(1).join(":").trim() || ""
                  };
                });

              updateField("projects", projects);
            }}
            placeholder="Project name: Project description"
          />

          <small>
            Separate projects with a blank line.
          </small>
        </section>

        <section className="editor-card">
          <div className="editor-card-title">
            <Award size={20} />
            <h2>Achievements</h2>
          </div>

          <label>Achievements</label>

          <textarea
            rows="6"
            value={(content.achievements || []).join(", ")}
            onChange={(e) => {
              const achievements = e.target.value
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean);

              updateField("achievements", achievements);
            }}
            placeholder="Best Performer, Quality Improvement..."
          />
        </section>

        <section className="editor-card">
          <div className="editor-card-title">
            <User size={20} />
            <h2>Contact Information</h2>
          </div>

          <label>Email</label>
          <input
            value={content.contact.email}
            onChange={(e) =>
              updateContact("email", e.target.value)
            }
            placeholder="your@email.com"
          />

          <label>Phone</label>
          <input
            value={content.contact.phone}
            onChange={(e) =>
              updateContact("phone", e.target.value)
            }
            placeholder="Your phone number"
          />

          <label>LinkedIn</label>
          <input
            value={content.contact.linkedin}
            onChange={(e) =>
              updateContact("linkedin", e.target.value)
            }
            placeholder="https://linkedin.com/in/..."
          />
        </section>

        <div className="save-area">
          {message && (
            <div className="save-message">
              {message}
            </div>
          )}

          <button
            className="save-btn"
            onClick={saveChanges}
            disabled={saving}
          >
            <Save size={20} />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

      </main>
    </div>
  );
          }

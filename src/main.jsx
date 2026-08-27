import React from "react";
import ReactDOM from "react-dom/client";

import {
  Menu,
  X,
  Download,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  Users,
  BarChart3,
  Award,
  GraduationCap,
  BriefcaseBusiness,
  FolderKanban,
  MessageCircle,
  ExternalLink,
} from "lucide-react";

import Admin from "./Admin";
import { supabase } from "./supabase";
import "./styles.css";

const navItems = [
  "About",
  "Experience",
  "Skills",
  "Projects",
  "Achievements",
  "Contact",
];

const defaultContent = {
  name: "Manjunath Bandihal",
  title: "Data Annotation Team Lead",
  photo: "",
  resume: "",

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
      url: "",
    },
    {
      title: "hase2_july_data_1",
      description:
        "Checked model predictions, corrected wrong labels and added missing annotations where required.",
      tag: "QA & Correction",
      url: "",
    },
    {
      title: "Object Annotation Projects",
      description:
        "Worked on umbrellas, tents, electrical units and other street-level objects from frames.",
      tag: "Object Annotation",
      url: "",
    },
    {
      title: "Multiple Concurrent Projects",
      description:
        "Managed and delivered multiple projects simultaneously with focus on quality and deadlines.",
      tag: "Team Management",
      url: "",
    },
  ],

  achievements: [
    {
      title: "Best Performer",
      description: "",
      year: "",
      organization: "",
    },
    {
      title: "Quality Improvement",
      description: "",
      year: "",
      organization: "",
    },
    {
      title: "Team Leadership",
      description: "",
      year: "",
      organization: "",
    },
    {
      title: "Process Improvement",
      description: "",
      year: "",
      organization: "",
    },
  ],

  stats: [
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
  ],

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
    return defaultContent;
  }

  return {
    ...defaultContent,
    ...saved,

    personal: {
      ...defaultContent.personal,
      ...(saved.personal || {}),
    },

    contact: {
      ...defaultContent.contact,
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
        : defaultContent.experience,

    skills:
      Array.isArray(saved.skills)
        ? saved.skills
        : defaultContent.skills,

    projects:
      Array.isArray(saved.projects) &&
      saved.projects.length > 0
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
        : defaultContent.projects,

    achievements:
      Array.isArray(saved.achievements)
        ? saved.achievements.map(
            normalizeAchievement
          )
        : defaultContent.achievements,

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
        : defaultContent.stats,

    resume:
      typeof saved.resume === "string"
        ? saved.resume
        : defaultContent.resume,

    photo:
      typeof saved.photo === "string"
        ? saved.photo
        : defaultContent.photo,
  };
}

function App() {
  const [menuOpen, setMenuOpen] = React.useState(false);

  const [content, setContent] =
    React.useState(defaultContent);

  const [loading, setLoading] =
    React.useState(true);

  const [formName, setFormName] =
    React.useState("");

  const [formEmail, setFormEmail] =
    React.useState("");

  const [formMessage, setFormMessage] =
    React.useState("");

  const [sendingMessage, setSendingMessage] =
    React.useState(false);

  const [contactStatus, setContactStatus] =
    React.useState("");

  const [contactError, setContactError] =
    React.useState("");

  React.useEffect(() => {
    let mounted = true;

    async function loadWebsiteContent() {
      try {
        const { data, error } =
          await supabase
            .from("site_content")
            .select("content")
            .eq("id", "main")
            .maybeSingle();

        if (error) {
          console.error(
            "Supabase viewer error:",
            error
          );
          return;
        }

        if (
          mounted &&
          data &&
          data.content
        ) {
          setContent(
            mergeContent(data.content)
          );
        }
      } catch (error) {
        console.error(
          "Unable to load website content:",
          error
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadWebsiteContent();

    return () => {
      mounted = false;
    };
  }, []);

  const go = (id) => {
    setMenuOpen(false);

    const element =
      document.getElementById(id);

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
      });
    }
  };

  async function handleContactSubmit(event) {
    event.preventDefault();

    setContactStatus("");
    setContactError("");

    const name = formName.trim();
    const email = formEmail.trim();
    const message = formMessage.trim();

    if (!name) {
      setContactError(
        "Please enter your name."
      );
      return;
    }

    if (!email) {
      setContactError(
        "Please enter your email address."
      );
      return;
    }

    if (!message) {
      setContactError(
        "Please enter your message."
      );
      return;
    }

    if (name.length > 100) {
      setContactError(
        "Name must be 100 characters or less."
      );
      return;
    }

    if (
      email.length < 3 ||
      email.length > 320
    ) {
      setContactError(
        "Please enter a valid email address."
      );
      return;
    }

    if (message.length > 5000) {
      setContactError(
        "Message must be 5000 characters or less."
      );
      return;
    }

    try {
      setSendingMessage(true);

      const { error } =
        await supabase
          .from("contact_messages")
          .insert([
            {
              name,
              email,
              message,
              status: "new",
            },
          ]);

      if (error) {
        console.error(
          "Contact form submission failed:",
          error
        );

        throw error;
      }

      setFormName("");
      setFormEmail("");
      setFormMessage("");

      setContactStatus(
        "Message sent successfully! Thank you for reaching out."
      );
    } catch (error) {
      console.error(
        "Contact form error:",
        error
      );

      setContactError(
        error?.message ||
          "Unable to send your message right now. Please try again."
      );
    } finally {
      setSendingMessage(false);
    }
  }

  if (loading) {
    return (
      <div className="site">
        <section className="hero">
          <div
            className="container"
            style={{
              textAlign: "center",
            }}
          >
            <div className="eyebrow">
              LOADING PROFILE
            </div>

            <h1>
              Manjunath
              <span>Bandihal</span>
            </h1>

            <p className="hero-text">
              Loading website...
            </p>
          </div>
        </section>
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

  return (
    <div className="site">

      <header className="header">
        <div className="nav container">

          <button
            className="brand"
            onClick={() =>
              go("home")
            }
          >
            <span>
              {content.name
                ? content.name.split(" ")[0]
                : "Manjunath"}
            </span>{" "}

            {content.name
              ? content.name
                  .split(" ")
                  .slice(1)
                  .join(" ")
              : "Bandihal"}
          </button>

          <nav
            className={
              menuOpen
                ? "nav-links open"
                : "nav-links"
            }
          >
            {navItems.map((item) => (
              <button
                key={item}
                onClick={() =>
                  go(
                    item.toLowerCase()
                  )
                }
              >
                {item}
              </button>
            ))}
          </nav>

          <button
            className="menu-btn"
            onClick={() =>
              setMenuOpen(!menuOpen)
            }
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <X size={24} />
            ) : (
              <Menu size={24} />
            )}
          </button>

        </div>
      </header>

      <main>

        <section
          id="home"
          className="hero"
        >
          <div className="container hero-grid">

            <div className="hero-copy">

              <div className="eyebrow">
                {content.title ||
                  "DATA ANNOTATION TEAM LEAD"}
              </div>

              <h1>
                {content.name
                  ? content.name
                      .split(" ")[0]
                      .toUpperCase()
                  : "MANJUNATH"}

                <span>
                  {content.name
                    ? content.name
                        .split(" ")
                        .slice(1)
                        .join(" ")
                        .toUpperCase()
                    : "BANDIHAL"}
                </span>
              </h1>

              <p className="hero-text">
                {content.about ||
                  "Dedicated and result-driven professional."}
              </p>

              <div className="hero-actions">

                {content.resume ? (
                  <a
                    className="btn primary"
                    href={content.resume}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Download size={18} />
                    Download Resume
                  </a>
                ) : (
                  <a
                    className="btn primary"
                    href="/Manjunath-Bandihal-Resume.pdf"
                    download
                  >
                    <Download size={18} />
                    Download Resume
                  </a>
                )}

                {content.contact?.linkedin && (
                  <a
                    className="btn secondary"
                    href={
                      content.contact.linkedin
                    }
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Linkedin size={18} />
                    LinkedIn Profile
                  </a>
                )}

              </div>

              <div className="contact-chips">

                {content.contact?.email && (
                  <span>
                    <Mail size={15} />
                    {content.contact.email}
                  </span>
                )}

                {content.contact?.phone && (
                  <span>
                    <Phone size={15} />
                    {content.contact.phone}
                  </span>
                )}

                {content.personal?.location && (
                  <span>
                    <MapPin size={15} />
                    {content.personal.location}
                  </span>
                )}

              </div>

            </div>

            <div className="portrait-wrap">

              {content.photo ? (
                <div
                  className="portrait-placeholder"
                  style={{
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={content.photo}
                    alt={
                      content.name ||
                      "Profile"
                    }
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius:
                        "inherit",
                    }}
                  />
                </div>
              ) : (
                <div className="portrait-placeholder">

                  <div className="portrait-icon">
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

                  <p>
                    Your professional photo
                  </p>

                  <small>
                    Add your photo here
                  </small>

                </div>
              )}

            </div>

          </div>
        </section>

        <section
          id="about"
          className="section"
        >
          <div className="container">

            <SectionTitle
              icon={<Users size={18} />}
              label="ABOUT ME"
              title="Who I Am"
            />

            <div className="about-grid">

              <div>

                <p>
                  {content.about ||
                    "About me information will appear here."}
                </p>

                <div className="mini-cards">

                  <Mini
                    icon={
                      <GraduationCap />
                    }
                    title="Education"
                    value={
                      content.personal?.education ||
                      "Education"
                    }
                  />

                  <Mini
                    icon={<Award />}
                    title="Recognition"
                    value="Best Performer"
                  />

                  <Mini
                    icon={
                      <BriefcaseBusiness />
                    }
                    title="Experience"
                    value={
                      content.title ||
                      "Professional"
                    }
                  />

                </div>

              </div>

              <div className="info-card">

                <h3>
                  Personal Information
                </h3>

                <InfoRow
                  icon={<Users />}
                  label="Name"
                  value={
                    content.name ||
                    "Not provided"
                  }
                />

                <InfoRow
                  icon={<Mail />}
                  label="Email"
                  value={
                    content.contact?.email ||
                    "Not provided"
                  }
                />

                <InfoRow
                  icon={<Phone />}
                  label="Phone"
                  value={
                    content.contact?.phone ||
                    "Not provided"
                  }
                />

                <InfoRow
                  icon={<MapPin />}
                  label="Location"
                  value={
                    content.personal?.location ||
                    "India"
                  }
                />

                <InfoRow
                  icon={<Linkedin />}
                  label="LinkedIn"
                  value={
                    content.contact?.linkedin ||
                    "Not provided"
                  }
                />

              </div>

            </div>

          </div>
        </section>

        <section
          id="experience"
          className="section alt"
        >
          <div className="container">

            <SectionTitle
              icon={
                <BriefcaseBusiness
                  size={18}
                />
              }
              label="EXPERIENCE"
              title="Work Experience"
            />

            <div className="experience-grid">

              <div className="timeline-card">

                {experiences.length > 0 ? (
                  experiences.map(
                    (experience, index) => (
                      <div
                        className="experience-item"
                        key={index}
                        style={{
                          position:
                            "relative",
                          paddingLeft:
                            "28px",
                          paddingBottom:
                            index ===
                            experiences.length -
                              1
                              ? "0"
                              : "32px",
                          marginBottom:
                            index ===
                            experiences.length -
                              1
                              ? "0"
                              : "32px",
                          borderLeft:
                            index ===
                            experiences.length -
                              1
                              ? "none"
                              : "2px solid rgba(127,127,127,0.25)",
                        }}
                      >

                        <div
                          className="timeline-dot"
                          style={{
                            position:
                              "absolute",
                            left: "-7px",
                            top: "3px",
                          }}
                        />

                        <div className="role-head">

                          <div>

                            <h3>
                              {experience.role ||
                                content.title ||
                                "Professional Role"}
                            </h3>

                            <p>
                              {experience.company ||
                                "Annotation / Data Operations"}
                            </p>

                          </div>

                          <span className="pill">
                            {experience.period ||
                              "Present"}
                          </span>

                        </div>

                        <ul>
                          {(
                            experience.description ||
                            ""
                          )
                            .split("\n")
                            .filter(Boolean)
                            .map(
                              (
                                item,
                                itemIndex
                              ) => (
                                <li
                                  key={
                                    itemIndex
                                  }
                                >
                                  {item}
                                </li>
                              )
                            )}
                        </ul>

                      </div>
                    )
                  )
                ) : (
                  <div>
                    <h3>
                      {content.title}
                    </h3>
                    <p>
                      Professional experience
                    </p>
                  </div>
                )}

              </div>

              <div className="stats-grid">

                {stats.map(
                  (stat, index) => (
                    <Stat
                      key={index}
                      icon={
                        <BarChart3 />
                      }
                      value={
                        stat.value ||
                        "—"
                      }
                      label={
                        stat.label ||
                        "Professional statistic"
                      }
                    />
                  )
                )}

              </div>

            </div>

          </div>
        </section>

        <section
          id="skills"
          className="section"
        >
          <div className="container">

            <SectionTitle
              icon={
                <CheckCircle2
                  size={18}
                />
              }
              label="SKILLS"
              title="My Skills"
            />

            <div className="skill-list">

              {(content.skills || []).map(
                (skill, index) => (
                  <span key={index}>
                    <CheckCircle2
                      size={16}
                    />
                    {skill}
                  </span>
                )
              )}

            </div>

          </div>
        </section>

        <section
          id="projects"
          className="section alt"
        >
          <div className="container">

            <SectionTitle
              icon={
                <FolderKanban
                  size={18}
                />
              }
              label="PROJECTS"
              title="Projects Worked On"
            />

            <div className="projects-grid">

              {(content.projects || []).map(
                (project, index) => (
                  <article
                    className="project-card"
                    key={
                      project.title ||
                      index
                    }
                  >

                    <div className="project-icon">
                      <FolderKanban
                        size={20}
                      />
                    </div>

                    <h3>
                      {project.title ||
                        "Project"}
                    </h3>

                    <p>
                      {project.description ||
                        project.text ||
                        ""}
                    </p>

                    <span className="tag">
                      {project.tag ||
                        "Project"}
                    </span>

                    {project.url && (
                      <a
                        href={
                          project.url
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="project-link"
                        style={{
                          display:
                            "inline-flex",
                          alignItems:
                            "center",
                          gap: "6px",
                          marginTop:
                            "14px",
                          textDecoration:
                            "none",
                        }}
                      >
                        <ExternalLink
                          size={16}
                        />
                        View Project
                      </a>
                    )}

                  </article>
                )
              )}

            </div>

          </div>
        </section>

        <section
          id="achievements"
          className="section"
        >
          <div className="container">

            <SectionTitle
              icon={<Award size={18} />}
              label="ACHIEVEMENTS"
              title="Key Achievements"
            />

            <div className="achievement-grid">

              {achievements.map(
                (
                  achievement,
                  index
                ) => (
                  <article
                    className="achievement achievement-animated"
                    key={
                      achievement.title ||
                      index
                    }
                    style={{
                      "--achievement-index":
                        index,
                    }}
                  >

                    <div className="round-icon achievement-icon-animated">
                      <Award
                        size={20}
                      />
                    </div>

                    <div className="achievement-content">

                      <h3>
                        {achievement.title ||
                          "Achievement"}
                      </h3>

                      {achievement.description && (
                        <p>
                          {
                            achievement.description
                          }
                        </p>
                      )}

                      {(achievement.year ||
                        achievement.organization) && (
                        <div className="achievement-meta">

                          {achievement.year && (
                            <span>
                              {
                                achievement.year
                              }
                            </span>
                          )}

                          {achievement.organization && (
                            <span>
                              {
                                achievement.organization
                              }
                            </span>
                          )}

                        </div>
                      )}

                    </div>

                  </article>
                )
              )}

            </div>

            {achievements.length === 0 && (
              <div className="achievement-empty">

                <Award size={28} />

                <p>
                  Achievements will appear
                  here.
                </p>

              </div>
            )}

          </div>
        </section>

        <section
          id="contact"
          className="contact-section"
        >
          <div className="container contact-grid">

            <div>

              <div className="eyebrow">
                LET'S CONNECT
              </div>

              <h2>
                Get In Touch
              </h2>

              <p>
                Open to discussing new
                opportunities,
                collaborations and
                professional conversations
                around annotation and
                leadership.
              </p>

            </div>

            <div className="contact-details">

              {content.contact?.email && (
                <div>
                  <Mail size={20} />

                  <a
                    href={
                      "mailto:" +
                      content.contact.email
                    }
                  >
                    {content.contact.email}
                  </a>
                </div>
              )}

              {content.contact?.phone && (
                <div>
                  <Phone size={20} />

                  <a
                    href={
                      "tel:" +
                      content.contact.phone
                    }
                  >
                    {content.contact.phone}
                  </a>
                </div>
              )}

              {content.personal?.location && (
                <div>
                  <MapPin size={20} />

                  <span>
                    {content.personal.location}
                  </span>
                </div>
              )}

              {content.contact?.linkedin && (
                <div>
                  <Linkedin size={20} />

                  <a
                    href={
                      content.contact.linkedin
                    }
                    target="_blank"
                    rel="noreferrer"
                  >
                    LinkedIn Profile
                  </a>
                </div>
              )}

            </div>

            <form
              className="message-form"
              onSubmit={
                handleContactSubmit
              }
            >

              <h3>
                Send a Message
              </h3>

              <div className="form-row">

                <input
                  type="text"
                  placeholder="Your Name"
                  value={formName}
                  onChange={(event) =>
                    setFormName(
                      event.target.value
                    )
                  }
                  maxLength={100}
                  required
                  disabled={
                    sendingMessage
                  }
                />

                <input
                  type="email"
                  placeholder="Your Email"
                  value={formEmail}
                  onChange={(event) =>
                    setFormEmail(
                      event.target.value
                    )
                  }
                  maxLength={320}
                  required
                  disabled={
                    sendingMessage
                  }
                />

              </div>

              <textarea
                placeholder="Your Message"
                rows="5"
                value={formMessage}
                onChange={(event) =>
                  setFormMessage(
                    event.target.value
                  )
                }
                maxLength={5000}
                required
                disabled={
                  sendingMessage
                }
              />

              {contactError && (
                <div
                  className="admin-error"
                  role="alert"
                >
                  {contactError}
                </div>
              )}

              {contactStatus && (
                <div
                  className="admin-success"
                  role="status"
                >
                  {contactStatus}
                </div>
              )}

              <button
                className="btn primary"
                type="submit"
                disabled={
                  sendingMessage
                }
              >
                <MessageCircle
                  size={18}
                />

                {sendingMessage
                  ? "Sending..."
                  : "Send Message"}
              </button>

            </form>

          </div>
        </section>

      </main>

      <footer className="footer">
        <div className="container">

          <span>
            © 2026 {content.name}.
            All Rights Reserved.
          </span>

          <span>
            Built with purpose & passion.
          </span>

        </div>
      </footer>

    </div>
  );
}

function SectionTitle({
  icon,
  label,
  title,
}) {
  return (
    <div className="section-title">

      <div className="section-label">
        {icon}
        {label}
      </div>

      <h2>{title}</h2>

    </div>
  );
}

function Mini({
  icon,
  title,
  value,
}) {
  return (
    <div className="mini-card">

      <span>{icon}</span>

      <div>

        <strong>
          {title}
        </strong>

        <small>
          {value}
        </small>

      </div>

    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}) {
  return (
    <div className="info-row">

      <span>{icon}</span>

      <strong>
        {label}
      </strong>

      <em>
        {value}
      </em>

    </div>
  );
}

function Stat({
  icon,
  value,
  label,
}) {
  return (
    <div className="stat">

      <span>{icon}</span>

      <strong>
        {value}
      </strong>

      <p>
        {label}
      </p>

    </div>
  );
}

function Root() {
  const isAdmin =
    window.location.pathname ===
    "/admin";

  if (isAdmin) {
    return <Admin />;
  }

  return <App />;
}

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);

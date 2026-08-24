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
  Target,
  BarChart3,
  Award,
  GraduationCap,
  BriefcaseBusiness,
  FolderKanban,
  MessageCircle,
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
      saved.experience &&
      saved.experience.length
        ? saved.experience
        : defaultContent.experience,

    skills:
      saved.skills &&
      saved.skills.length
        ? saved.skills
        : defaultContent.skills,

    projects:
      saved.projects &&
      saved.projects.length
        ? saved.projects
        : defaultContent.projects,

    achievements:
      saved.achievements &&
      saved.achievements.length
        ? saved.achievements
        : defaultContent.achievements,
  };
}

function App() {
  const [menuOpen, setMenuOpen] =
    React.useState(false);

  const [content, setContent] =
    React.useState(defaultContent);

  const [loading, setLoading] =
    React.useState(true);

  React.useEffect(() => {
    let mounted = true;

    async function loadWebsiteContent() {
      try {
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
            "Supabase viewer error:",
            error
          );
          return;
        }

        if (!mounted) {
          return;
        }

        setContent(
          mergeContent(data?.content)
        );
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
              {defaultContent.name}
            </h1>

            <p className="hero-text">
              Loading website...
            </p>
          </div>
        </section>
      </div>
    );
  }

  const firstExperience =
    content.experience &&
    content.experience.length
      ? content.experience[0]
      : {};

  return (
    <div className="site">

      {/* HEADER */}

      <header className="header">
        <div className="nav container">

          <button
            className="brand"
            onClick={() => go("home")}
          >
            <span>
              {content.name
                ? content.name
                    .split(" ")[0]
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
                  go(item.toLowerCase())
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

        {/* HERO */}

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
                      .split(" ")
                      .slice(0, 1)
                      .join(" ")
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

                <a
                  className="btn primary"
                  href="/Manjunath-Bandihal-Resume.pdf"
                  download
                >
                  <Download size={18} />
                  Download Resume
                </a>

                {content.contact &&
                  content.contact.linkedin && (
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

                {content.contact &&
                  content.contact.email && (
                    <span>
                      <Mail size={15} />
                      {content.contact.email}
                    </span>
                  )}

                {content.contact &&
                  content.contact.phone && (
                    <span>
                      <Phone size={15} />
                      {content.contact.phone}
                    </span>
                  )}

                {content.personal &&
                  content.personal.location && (
                    <span>
                      <MapPin size={15} />
                      {content.personal.location}
                    </span>
                  )}

              </div>

            </div>

            {/* PROFILE PHOTO */}

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
                    alt={content.name}
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

        {/* ABOUT */}

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
                      content.personal &&
                      content.personal.education
                        ? content.personal.education
                        : "Education"
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
                    content.contact &&
                    content.contact.email
                      ? content.contact.email
                      : "Not provided"
                  }
                />

                <InfoRow
                  icon={<Phone />}
                  label="Phone"
                  value={
                    content.contact &&
                    content.contact.phone
                      ? content.contact.phone
                      : "Not provided"
                  }
                />

                <InfoRow
                  icon={<MapPin />}
                  label="Location"
                  value={
                    content.personal &&
                    content.personal.location
                      ? content.personal.location
                      : "India"
                  }
                />

                <InfoRow
                  icon={<Linkedin />}
                  label="LinkedIn"
                  value={
                    content.contact &&
                    content.contact.linkedin
                      ? content.contact.linkedin
                      : "Not provided"
                  }
                />

              </div>

            </div>

          </div>
        </section>

        {/* EXPERIENCE */}

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

                <div className="timeline-dot" />

                <div className="role-head">

                  <div>

                    <h3>
                      {firstExperience.role ||
                        content.title}
                    </h3>

                    <p>
                      {firstExperience.company ||
                        "Annotation / Data Operations"}
                    </p>

                  </div>

                  <span className="pill">
                    {firstExperience.period ||
                      "Present"}
                  </span>

                </div>

                <ul>

                  {(
                    firstExperience.description ||
                    ""
                  )
                    .split("\n")
                    .filter(Boolean)
                    .map(
                      (
                        item,
                        index
                      ) => (
                        <li key={index}>
                          {item}
                        </li>
                      )
                    )}

                </ul>

              </div>

              <div className="stats-grid">

                <Stat
                  icon={
                    <FolderKanban />
                  }
                  value="18+"
                  label="Projects handled concurrently"
                />

                <Stat
                  icon={<Target />}
                  value="90%"
                  label="Reduction in escalations"
                />

                <Stat
                  icon={
                    <BarChart3 />
                  }
                  value="100%"
                  label="Focus on on-time delivery"
                />

                <Stat
                  icon={<Users />}
                  value="10+"
                  label="Team members supported"
                />

              </div>

            </div>

          </div>
        </section>

        {/* SKILLS */}

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

              {(
                content.skills || []
              ).map((skill) => (
                <span key={skill}>
                  <CheckCircle2
                    size={16}
                  />
                  {skill}
                </span>
              ))}

            </div>

          </div>
        </section>

        {/* PROJECTS */}

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

              {(
                content.projects || []
              ).map(
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
                      {project.title}
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

                  </article>
                )
              )}

            </div>

          </div>
        </section>

        {/* ACHIEVEMENTS */}

        <section
          id="achievements"
          className="section"
        >
          <div className="container">

            <SectionTitle
              icon={
                <Award size={18} />
              }
              label="ACHIEVEMENTS"
              title="Key Achievements"
            />

            <div className="achievement-grid">

              {(
                content.achievements ||
                []
              ).map(
                (
                  achievement,
                  index
                ) => {

                  const title =
                    typeof achievement ===
                    "string"
                      ? achievement
                      : achievement.title;

                  const text =
                    typeof achievement ===
                    "string"
                      ? ""
                      : achievement.description ||
                        "";

                  return (
               

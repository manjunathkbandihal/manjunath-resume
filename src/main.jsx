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
import "./styles.css";

const navItems = [
  "About",
  "Experience",
  "Skills",
  "Projects",
  "Achievements",
  "Contact",
];

const skills = [
  "Data Annotation",
  "Segmentation Annotation",
  "Quality Control / QA",
  "Team Management",
  "Project Management",
  "Calibration & Training",
  "Excel / Data Management",
  "Communication",
];

const projects = [
  {
    title: "PCI_Annotations",
    text: "Segmentation annotation for pavement, light poles, fencing, chimneys, electrical wires and other objects.",
    tag: "Segmentation",
  },
  {
    title: "hase2_july_data_1",
    text: "Checked model predictions, corrected wrong labels and added missing annotations where required.",
    tag: "QA & Correction",
  },
  {
    title: "Object Annotation Projects",
    text: "Worked on umbrellas, tents, electrical units and other street-level objects from frames.",
    tag: "Object Annotation",
  },
  {
    title: "Multiple Concurrent Projects",
    text: "Managed and delivered multiple projects simultaneously with focus on quality and deadlines.",
    tag: "Team Management",
  },
];

const achievements = [
  [
    "Best Performer",
    "Recognized for strong performance and dedication.",
  ],
  [
    "Quality Improvement",
    "Maintained high annotation quality and reduced errors.",
  ],
  [
    "Team Leadership",
    "Supported team productivity, training and daily targets.",
  ],
  [
    "Process Improvement",
    "Helped improve workflows and reduce escalations.",
  ],
];

function App() {
  const [menuOpen, setMenuOpen] = React.useState(false);

  const go = (id) => {
    setMenuOpen(false);

    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="site">
      <header className="header">
        <div className="nav container">
          <button
            className="brand"
            onClick={() => go("home")}
          >
            <span>Manjunath</span> Bandihal
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
        <section id="home" className="hero">
          <div className="container hero-grid">
            <div className="hero-copy">
              <div className="eyebrow">
                DATA ANNOTATION TEAM LEAD
              </div>

              <h1>
                MANJUNATH <span>BANDIHAL</span>
              </h1>

              <p className="hero-text">
                Dedicated and result-driven professional
                with experience in data annotation,
                segmentation annotation, quality control,
                team coordination and project management.
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

                <a
                  className="btn secondary"
                  href="https://www.linkedin.com/"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Linkedin size={18} />
                  LinkedIn Profile
                </a>
              </div>

              <div className="contact-chips">
                <span>
                  <Mail size={15} />
                  Email
                </span>

                <span>
                  <Phone size={15} />
                  Phone
                </span>

                <span>
                  <MapPin size={15} />
                  India
                </span>
              </div>
            </div>

            <div className="portrait-wrap">
              <div className="portrait-placeholder">
                <div className="portrait-icon">
                  MB
                </div>

                <p>Your professional photo</p>

                <small>
                  Add your photo here
                </small>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="section">
          <div className="container">
            <SectionTitle
              icon={<Users size={18} />}
              label="ABOUT ME"
              title="Who I Am"
            />

            <div className="about-grid">
              <div>
                <p>
                  I am a Data Annotation Team Lead
                  with experience managing annotation
                  teams, maintaining quality standards
                  and delivering projects within deadlines.
                </p>

                <p>
                  I have hands-on experience with
                  segmentation annotation, quality checks,
                  calibration sessions, team coordination
                  and process improvement.
                </p>

                <div className="mini-cards">
                  <Mini
                    icon={<GraduationCap />}
                    title="Education"
                    value="Diploma in Civil Engineering"
                  />

                  <Mini
                    icon={<Award />}
                    title="Recognition"
                    value="Best Performer"
                  />

                  <Mini
                    icon={<BriefcaseBusiness />}
                    title="Experience"
                    value="Team Lead in Annotation"
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
                  value="Manjunath Bandihal"
                />

                <InfoRow
                  icon={<Mail />}
                  label="Email"
                  value="Your email"
                />

                <InfoRow
                  icon={<Phone />}
                  label="Phone"
                  value="Your phone"
                />

                <InfoRow
                  icon={<MapPin />}
                  label="Location"
                  value="India"
                />

                <InfoRow
                  icon={<Linkedin />}
                  label="LinkedIn"
                  value="Your LinkedIn profile"
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
              icon={<BriefcaseBusiness size={18} />}
              label="EXPERIENCE"
              title="Work Experience"
            />

            <div className="experience-grid">
              <div className="timeline-card">
                <div className="timeline-dot" />

                <div className="role-head">
                  <div>
                    <h3>
                      Data Annotation Team Lead
                    </h3>

                    <p>
                      Annotation / Data Operations
                    </p>
                  </div>

                  <span className="pill">
                    Team Lead
                  </span>
                </div>

                <ul>
                  <li>
                    Led annotation teams across
                    multiple projects.
                  </li>

                  <li>
                    Managed daily targets, deadlines
                    and overall performance.
                  </li>

                  <li>
                    Ensured high-quality annotations
                    through reviews and quality checks.
                  </li>

                  <li>
                    Conducted calibration sessions
                    and training for team members.
                  </li>

                  <li>
                    Coordinated with QA teams to
                    improve quality and reduce
                    escalations.
                  </li>

                  <li>
                    Supported delivery across
                    concurrent annotation projects.
                  </li>
                </ul>
              </div>

              <div className="stats-grid">
                <Stat
                  icon={<FolderKanban />}
                  value="18+"
                  label="Projects handled concurrently"
                />

                <Stat
                  icon={<Target />}
                  value="90%"
                  label="Reduction in escalations"
                />

                <Stat
                  icon={<BarChart3 />}
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

        <section id="skills" className="section">
          <div className="container">
            <SectionTitle
              icon={<CheckCircle2 size={18} />}
              label="SKILLS"
              title="My Skills"
            />

            <div className="skill-list">
              {skills.map((skill) => (
                <span key={skill}>
                  <CheckCircle2 size={16} />
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section
          id="projects"
          className="section alt"
        >
          <div className="container">
            <SectionTitle
              icon={<FolderKanban size={18} />}
              label="PROJECTS"
              title="Projects Worked On"
            />

            <div className="projects-grid">
              {projects.map((project) => (
                <article
                  className="project-card"
                  key={project.title}
                >
                  <div className="project-icon">
                    <FolderKanban size={20} />
                  </div>

                  <h3>{project.title}</h3>

                  <p>{project.text}</p>

                  <span className="tag">
                    {project.tag}
                  </span>
                </article>
              ))}
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
                ([title, text]) => (
                  <article
                    className="achievement"
                    key={title}
                  >
                    <div className="round-icon">
                      <Award size={20} />
                    </div>

                    <div>
                      <h3>{title}</h3>
                      <p>{text}</p>
                    </div>
                  </article>
                )
              )}
            </div>
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

              <h2>Get In Touch</h2>

              <p>
                Open to discussing new opportunities,
                collaborations and professional
                conversations around annotation
                and leadership.
              </p>
            </div>

            <div className="contact-details">
              <div>
                <Mail size={20} />
                <span>Your email</span>
              </div>

              <div>
                <Phone size={20} />
                <span>Your phone</span>
              </div>

              <div>
                <MapPin size={20} />
                <span>India</span>
              </div>
            </div>

            <form
              className="message-form"
              onSubmit={(e) =>
                e.preventDefault()
              }
            >
              <h3>Send a Message</h3>

              <div className="form-row">
                <input
                  placeholder="Your Name"
                />

                <input
                  type="email"
                  placeholder="Your Email"
                />
              </div>

              <textarea
                placeholder="Your Message"
                rows="5"
              />

              <button
                className="btn primary"
                type="submit"
              >
                <MessageCircle size={18} />
                Send Message
              </button>
            </form>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container">
          <span>
            © 2026 Manjunath Bandihal.
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
        <strong>{title}</strong>
        <small>{value}</small>
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
      <strong>{label}</strong>
      <em>{value}</em>
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
      <strong>{value}</strong>
      <p>{label}</p>
    </div>
  );
}

function Root() {
  const isAdmin =
    window.location.pathname === "/admin";

  if (isAdmin) {
    return (
      <Admin
        onLogin={(user) =>
          console.log("Logged in:", user)
        }
      />
    );
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

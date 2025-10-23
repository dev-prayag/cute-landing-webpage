import React, { useState, useEffect } from 'react';
import { Shield, Zap, Music, Hammer, Gift, Ticket, Wrench, Heart, MessageCircle, UserCheck, ScrollText, Image, Mic, Sparkles, Bot, Moon, Sun, Menu, X, Github, ExternalLink, ChevronRight, Home, FileText, User } from 'lucide-react';

const Ongaku = () => {
  const [theme, setTheme] = useState('dark');
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const navigateTo = (page) => {
    setCurrentPage(page);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const features = [
    {
      icon: Shield,
      title: 'AntiNuke',
      description: 'Server protection system with advanced security measures to prevent malicious actions.',
      color: '#ff6b9d'
    },
    {
      icon: Zap,
      title: 'Auto Moderation',
      description: 'Automated content filtering with smart message detection and customizable rules.',
      color: '#ffd93d'
    },
    {
      icon: Music,
      title: 'Music',
      description: 'High-quality audio playback with queue management and multiple platform support.',
      color: '#6bcf7f'
    },
    {
      icon: Hammer,
      title: 'Moderation',
      description: 'Complete moderation suite with kick, ban, mute commands and warning system.',
      color: '#4ecdc4'
    },
    {
      icon: Gift,
      title: 'Giveaway',
      description: 'Create custom giveaways with automatic winner selection and reroll functionality.',
      color: '#a8e6cf'
    },
    {
      icon: Ticket,
      title: 'Ticket System',
      description: 'Professional support tickets with custom panels and transcript logs.',
      color: '#ff8b94'
    },
    {
      icon: Wrench,
      title: 'Utility',
      description: 'Server information, user lookup, and helpful tools for server management.',
      color: '#c7ceea'
    },
    {
      icon: Heart,
      title: 'Welcomer',
      description: 'Custom welcome and goodbye messages with auto-role assignment.',
      color: '#ff6b9d'
    },
    {
      icon: MessageCircle,
      title: 'Auto Responder',
      description: 'Custom trigger words with automated responses and regex support.',
      color: '#b4a7d6'
    },
    {
      icon: UserCheck,
      title: 'Custom Roles',
      description: 'Reaction roles, button roles, and dropdown selection for role management.',
      color: '#fdcae1'
    },
    {
      icon: ScrollText,
      title: 'Logging',
      description: 'Comprehensive message logs, member activity, and server events tracking.',
      color: '#95e1d3'
    },
    {
      icon: Image,
      title: 'Media',
      description: 'Image manipulation, meme generator, and various media commands.',
      color: '#f38181'
    },
    {
      icon: Mic,
      title: 'VCRoles',
      description: 'Voice channel roles with auto role assignment on join.',
      color: '#aa96da'
    },
    {
      icon: Sparkles,
      title: 'Fun',
      description: 'Games, trivia, random commands, and entertainment features.',
      color: '#fcbad3'
    },
    {
      icon: Bot,
      title: 'Bot Commands',
      description: 'Bot statistics, help command, and configuration settings.',
      color: '#a8d8ea'
    }
  ];

  const FeatureCard = ({ icon: Icon, title, description, color }) => (
    <div className="feature-card">
      <div className="feature-icon-container" style={{ background: color }}>
        <Icon size={32} strokeWidth={2} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );

  const HomePage = () => (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-logo">
            <img 
              src="https://cdn.discordapp.com/avatars/1430379996064518176/26ff3d991d4afb22c055616888919f63.png?size=4096" 
              alt="Ongaku-ko"
            />
          </div>
          <h1 className="hero-title">音楽子</h1>
          <p className="hero-subtitle">Ongaku-ko</p>
          <p className="hero-description">
            The Ultimate Multipurpose Discord Bot. Access powerful features to manage your server with ease.
          </p>
          <div className="hero-buttons">
            <a 
              href="https://discord.com/oauth2/authorize?client_id=1430379996064518176" 
              className="btn btn-primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              Invite Ongaku-ko
            </a>
            <a 
              href="https://discord.gg/WAQfU8U7HZ" 
              className="btn btn-secondary"
              target="_blank"
              rel="noopener noreferrer"
            >
              Support Server
            </a>
          </div>
        </div>
      </section>

      {/* Installation Info */}
      <section className="info-section">
        <div className="container">
          <div className="info-card">
            <h2>Installation Options</h2>
            <p>Ongaku-ko supports both User Install and Guild Install for maximum flexibility.</p>
            <div className="command-info">
              <div className="command-item">
                <span className="command-label">Slash Commands</span>
                <code>/command</code>
              </div>
              <div className="command-item">
                <span className="command-label">Prefix Commands</span>
                <code>o!command</code>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Powerful Features</h2>
          <p className="section-subtitle">Everything you need to manage and enhance your Discord server</p>
          <div className="features-grid">
            {features.map((feature, idx) => (
              <FeatureCard key={idx} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <h2>Ready to Get Started?</h2>
            <p>Add Ongaku-ko to your server today and experience the power of a complete multipurpose bot.</p>
            <a 
              href="https://discord.com/oauth2/authorize?client_id=1430379996064518176" 
              className="btn btn-primary btn-large"
              target="_blank"
              rel="noopener noreferrer"
            >
              Invite Now <ChevronRight size={20} />
            </a>
          </div>
        </div>
      </section>
    </>
  );

  const DeveloperPage = () => (
    <section className="developer-section">
      <div className="container">
        <h2 className="section-title">Meet the Developer</h2>
        <div className="developer-card">
          <div className="developer-avatar">
            <img 
              src="https://cdn.discordapp.com/avatars/937380760875302974/c9dfc77b5e063a7a1e355004df534838.png?size=4096" 
              alt="prayag.cake"
            />
          </div>
          <h3>prayag.cake</h3>
          <p className="developer-role">Lead Developer</p>
          <p className="developer-bio">
            Passionate Discord bot developer dedicated to creating powerful and user-friendly tools for the community. 
            Specializing in building feature-rich bots that enhance server management and user experience.
          </p>
          <div className="developer-links">
            <a 
              href="https://github.com/dev-prayag" 
              className="btn btn-secondary"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github size={20} />
              GitHub
            </a>
            <a 
              href="https://discord.gg/WAQfU8U7HZ" 
              className="btn btn-secondary"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink size={20} />
              Contact
            </a>
          </div>
        </div>

        <div className="tech-stack">
          <h3>Built With</h3>
          <div className="tech-grid">
            <div className="tech-item">
              <span>Python</span>
            </div>
            <div className="tech-item">
              <span>Discord.py</span>
            </div>
            <div className="tech-item">
              <span>JavaScript</span>
            </div>
            <div className="tech-item">
              <span>TypeScript</span>
            </div>
            <div className="tech-item">
              <span>React</span>
            </div>
            <div className="tech-item">
              <span>Node.js</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  const TermsPage = () => (
    <section className="terms-section">
      <div className="container">
        <h2 className="section-title">Terms and Conditions</h2>
        <div className="terms-content">
          <div className="terms-block">
            <h3>1. Acceptance of Terms</h3>
            <p>
              By inviting and using Ongaku-ko (音楽子) in your Discord server, you agree to be bound by these Terms and Conditions. 
              If you do not agree to these terms, please do not use the bot.
            </p>
          </div>

          <div className="terms-block">
            <h3>2. Bot Usage</h3>
            <p>
              Ongaku-ko is provided as a service for Discord servers. You may use the bot for legitimate purposes only. 
              You agree not to use the bot to:
            </p>
            <ul>
              <li>Violate Discord's Terms of Service or Community Guidelines</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Distribute malware or engage in malicious activities</li>
              <li>Spam or flood channels with commands</li>
              <li>Attempt to exploit, hack, or reverse engineer the bot</li>
            </ul>
          </div>

          <div className="terms-block">
            <h3>3. Data Collection and Privacy</h3>
            <p>
              Ongaku-ko may collect and store the following data to provide its services:
            </p>
            <ul>
              <li>Server IDs, channel IDs, and user IDs</li>
              <li>Server configuration settings</li>
              <li>Command usage statistics</li>
              <li>Message content only when required for specific features (auto-moderation, logging)</li>
            </ul>
            <p>
              We do not sell or share your data with third parties. Data is used solely for bot functionality and improvement.
            </p>
          </div>

          <div className="terms-block">
            <h3>4. Service Availability</h3>
            <p>
              We strive to maintain 99% uptime for Ongaku-ko. However, we do not guarantee uninterrupted service and are not 
              liable for any downtime, data loss, or service interruptions. We reserve the right to:
            </p>
            <ul>
              <li>Perform maintenance and updates without prior notice</li>
              <li>Modify or discontinue features at any time</li>
              <li>Temporarily or permanently ban servers that violate these terms</li>
            </ul>
          </div>

          <div className="terms-block">
            <h3>5. Prohibited Actions</h3>
            <p>
              The following actions are strictly prohibited:
            </p>
            <ul>
              <li>Using the bot to raid, nuke, or attack other servers</li>
              <li>Abusing rate limits or attempting to overload the bot</li>
              <li>Impersonating the bot or its developers</li>
              <li>Redistributing or claiming ownership of the bot</li>
            </ul>
          </div>

          <div className="terms-block">
            <h3>6. User Responsibilities</h3>
            <p>
              Server administrators and users are responsible for:
            </p>
            <ul>
              <li>Properly configuring bot permissions and settings</li>
              <li>Ensuring the bot is used in compliance with Discord's Terms of Service</li>
              <li>Monitoring bot usage within their servers</li>
              <li>Reporting bugs or security vulnerabilities responsibly</li>
            </ul>
          </div>

          <div className="terms-block">
            <h3>7. Liability and Disclaimers</h3>
            <p>
              Ongaku-ko is provided "as is" without warranties of any kind. We are not liable for:
            </p>
            <ul>
              <li>Any damages resulting from the use or inability to use the bot</li>
              <li>Loss of data or server disruptions</li>
              <li>Actions taken by users using bot features</li>
              <li>Third-party integrations or services</li>
            </ul>
          </div>

          <div className="terms-block">
            <h3>8. Modifications to Terms</h3>
            <p>
              We reserve the right to modify these Terms and Conditions at any time. Continued use of the bot after changes 
              constitutes acceptance of the new terms. Users will be notified of significant changes through the support server.
            </p>
          </div>

          <div className="terms-block">
            <h3>9. Termination</h3>
            <p>
              We reserve the right to terminate or suspend access to Ongaku-ko for any server or user that violates these terms, 
              without prior notice or liability.
            </p>
          </div>

          <div className="terms-block">
            <h3>10. Contact Information</h3>
            <p>
              For questions, concerns, or support regarding these Terms and Conditions, please join our support server:
            </p>
            <a href="https://discord.gg/WAQfU8U7HZ" target="_blank" rel="noopener noreferrer" className="contact-link">
              discord.gg/WAQfU8U7HZ
            </a>
          </div>

          <div className="terms-footer">
            <p>Last Updated: October 23, 2024</p>
            <p>© 2024 Ongaku-ko. All rights reserved.</p>
          </div>
        </div>
      </div>
    </section>
  );

  return (
    <div className={`app ${theme}`}>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .app {
          min-height: 100vh;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          transition: all 0.3s ease;
        }

        .app.light {
          --bg-primary: #ffffff;
          --bg-secondary: #f8f9fa;
          --bg-tertiary: #e9ecef;
          --text-primary: #1a1a1a;
          --text-secondary: #6c757d;
          --accent-pink: #ff6b9d;
          --accent-blue: #667eea;
          --card-bg: #ffffff;
          --border: #dee2e6;
          --shadow: rgba(0, 0, 0, 0.1);
          --shadow-lg: rgba(0, 0, 0, 0.15);
        }

        .app.dark {
          --bg-primary: #0a0e27;
          --bg-secondary: #111827;
          --bg-tertiary: #1f2937;
          --text-primary: #f9fafb;
          --text-secondary: #9ca3af;
          --accent-pink: #ff6b9d;
          --accent-blue: #667eea;
          --card-bg: #1f2937;
          --border: #374151;
          --shadow: rgba(0, 0, 0, 0.3);
          --shadow-lg: rgba(0, 0, 0, 0.5);
        }

        .app {
          background: var(--bg-primary);
          color: var(--text-primary);
        }

        /* Navigation */
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: var(--card-bg);
          border-bottom: 1px solid var(--border);
          padding: 1rem 2rem;
          z-index: 1000;
          backdrop-filter: blur(10px);
          background: var(--card-bg);
        }

        .nav-container {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .nav-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          text-decoration: none;
        }

        .nav-brand img {
          width: 40px;
          height: 40px;
          border-radius: 50%;
        }

        .nav-links {
          display: flex;
          gap: 2rem;
          align-items: center;
        }

        .nav-link {
          color: var(--text-secondary);
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .nav-link:hover {
          color: var(--accent-pink);
        }

        .nav-link.active {
          color: var(--accent-pink);
        }

        .theme-toggle {
          background: var(--bg-tertiary);
          border: none;
          padding: 0.5rem;
          border-radius: 0.5rem;
          cursor: pointer;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .theme-toggle:hover {
          background: var(--accent-pink);
          color: white;
        }

        .menu-toggle {
          display: none;
          background: none;
          border: none;
          color: var(--text-primary);
          cursor: pointer;
        }

        /* Hero Section */
        .hero {
          padding: 8rem 2rem 4rem;
          text-align: center;
          background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
        }

        .hero-content {
          max-width: 800px;
          margin: 0 auto;
        }

        .hero-logo {
          width: 150px;
          height: 150px;
          margin: 0 auto 2rem;
          border-radius: 50%;
          overflow: hidden;
          border: 4px solid var(--accent-pink);
          box-shadow: 0 10px 40px var(--shadow-lg);
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .hero-logo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .hero-title {
          font-size: 4rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, var(--accent-pink), var(--accent-blue));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-subtitle {
          font-size: 2rem;
          color: var(--text-secondary);
          margin-bottom: 1rem;
          font-weight: 600;
        }

        .hero-description {
          font-size: 1.25rem;
          color: var(--text-secondary);
          margin-bottom: 2rem;
          line-height: 1.6;
        }

        .hero-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        /* Buttons */
        .btn {
          padding: 0.875rem 2rem;
          border-radius: 0.75rem;
          font-weight: 600;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s;
          border: none;
          cursor: pointer;
          font-size: 1rem;
        }

        .btn-primary {
          background: linear-gradient(135deg, var(--accent-pink), var(--accent-blue));
          color: white;
          box-shadow: 0 4px 15px var(--shadow);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px var(--shadow-lg);
        }

        .btn-secondary {
          background: var(--card-bg);
          color: var(--text-primary);
          border: 2px solid var(--border);
        }

        .btn-secondary:hover {
          border-color: var(--accent-pink);
          color: var(--accent-pink);
        }

        .btn-large {
          padding: 1.25rem 3rem;
          font-size: 1.125rem;
        }

        /* Container */
        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        /* Info Section */
        .info-section {
          padding: 4rem 2rem;
          background: var(--bg-secondary);
        }

        .info-card {
          background: var(--card-bg);
          padding: 3rem;
          border-radius: 1.5rem;
          border: 1px solid var(--border);
          box-shadow: 0 4px 20px var(--shadow);
          text-align: center;
        }

        .info-card h2 {
          font-size: 2rem;
          margin-bottom: 1rem;
          color: var(--text-primary);
        }

        .info-card > p {
          color: var(--text-secondary);
          font-size: 1.125rem;
          margin-bottom: 2rem;
        }

        .command-info {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-top: 2rem;
        }

        .command-item {
          background: var(--bg-secondary);
          padding: 1.5rem;
          border-radius: 1rem;
          border: 1px solid var(--border);
        }

        .command-label {
          display: block;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        code {
          background: var(--bg-tertiary);
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          font-family: 'Fira Code', monospace;
          color: var(--accent-pink);
          font-size: 1.125rem;
          display: inline-block;
        }

        /* Features Section */
        .features-section {
          padding: 4rem 2rem;
        }

        .section-title {
          font-size: 3rem;
          text-align: center;
          margin-bottom: 1rem;
          font-weight: 800;
        }

        .section-subtitle {
          text-align: center;
          color: var(--text-secondary);
          font-size: 1.25rem;
          margin-bottom: 3rem;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 2rem;
        }

        .feature-card {
          background: var(--card-bg);
          padding: 2rem;
          border-radius: 1.5rem;
          border: 1px solid var(--border);
          transition: all 0.3s;
          cursor: pointer;
        }

        .feature-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px var(--shadow-lg);
        }

        .feature-icon-container {
          width: 64px;
          height: 64px;
          border-radius: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
          color: white;
        }

        .feature-card h3 {
          font-size: 1.5rem;
          margin-bottom: 0.75rem;
          color: var(--text-primary);
        }

        .feature-card p {
          color: var(--text-secondary);
          line-height: 1.6;
        }

        /* CTA Section */
        .cta-section {
          padding: 4rem 2rem;
          background: var(--bg-secondary);
        }

        .cta-card {
          background: linear-gradient(135deg, var(--accent-pink), var(--accent-blue));
          padding: 4rem;
          border-radius: 2rem;
          text-align: center;
          color: white;
        }

        .cta-card h2 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }

        .cta-card p {
          font-size: 1.25rem;
          margin-bottom: 2rem;
          opacity: 0.9;
        }

        /* Developer Section */
        .developer-section {
          padding: 6rem 2rem;
          min-height: calc(100vh - 70px);
        }

        .developer-card {
          background: var(--card-bg);
          padding: 4rem;
          border-radius: 2rem;
          border: 1px solid var(--border);
          text-align: center;
          max-width: 800px;
          margin: 0 auto 4rem;
          box-shadow: 0 10px 40px var(--shadow-lg);
        }

        .developer-avatar {
          width: 200px;
          height: 200px;
          margin: 0 auto 2rem;
          border-radius: 50%;
          overflow: hidden;
          border: 6px solid var(--accent-pink);
          box-shadow: 0 10px 40px var(--shadow-lg);
        }

        .developer-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .developer-card h3 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
          color: var(--text-primary);
        }

        .developer-role {
          color: var(--accent-pink);
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
        }

        .developer-bio {
          color: var(--text-secondary);
          font-size: 1.125rem;
          line-height: 1.8;
          margin-bottom: 2rem;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .developer-links {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .tech-stack {
          text-align: center;
        }

        .tech-stack h3 {
          font-size: 2rem;
          margin-bottom: 2rem;
          color: var(--text-primary);
        }

        .tech-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
          max-width: 800px;
          margin: 0 auto;
        }

        .tech-item {
          background: var(--card-bg);
          padding: 1.5rem;
          border-radius: 1rem;
          border: 1px solid var(--border);
          font-weight: 600;
          color: var(--text-primary);
          transition: all 0.3s;
        }

        .tech-item:hover {
          border-color: var(--accent-pink);
          transform: translateY(-3px);
        }

        /* Terms Section */
        .terms-section {
          padding: 6rem 2rem;
          min-height: calc(100vh - 70px);
        }

        .terms-content {
          background: var(--card-bg);
          padding: 4rem;
          border-radius: 2rem;
          border: 1px solid var(--border);
          max-width: 1000px;
          margin: 0 auto;
          box-shadow: 0 4px 20px var(--shadow);
        }

        .terms-block {
          margin-bottom: 3rem;
        }

        .terms-block h3 {
          font-size: 1.75rem;
          margin-bottom: 1rem;
          color: var(--accent-pink);
        }

        .terms-block p {
          color: var(--text-secondary);
          line-height: 1.8;
          margin-bottom: 1rem;
          font-size: 1.0625rem;
        }

        .terms-block ul {
          list-style: none;
          padding-left: 1.5rem;
          margin: 1rem 0;
        }

        .terms-block ul li {
          color: var(--text-secondary);
          line-height: 1.8;
          margin-bottom: 0.5rem;
          position: relative;
          padding-left: 1.5rem;
        }

        .terms-block ul li:before {
          content: "→";
          position: absolute;
          left: 0;
          color: var(--accent-pink);
          font-weight: 600;
        }

        .contact-link {
          display: inline-block;
          color: var(--accent-blue);
          text-decoration: none;
          font-weight: 600;
          margin-top: 0.5rem;
        }

        .contact-link:hover {
          color: var(--accent-pink);
        }

        .terms-footer {
          margin-top: 4rem;
          padding-top: 2rem;
          border-top: 1px solid var(--border);
          text-align: center;
          color: var(--text-secondary);
        }

        .terms-footer p {
          margin: 0.5rem 0;
        }

        /* Mobile Menu */
        @media (max-width: 768px) {
          .menu-toggle {
            display: block;
          }

          .nav-links {
            position: fixed;
            top: 70px;
            left: 0;
            right: 0;
            background: var(--card-bg);
            flex-direction: column;
            padding: 2rem;
            border-bottom: 1px solid var(--border);
            transform: translateY(-100%);
            opacity: 0;
            transition: all 0.3s;
            pointer-events: none;
          }

          .nav-links.open {
            transform: translateY(0);
            opacity: 1;
            pointer-events: all;
          }

          .hero-title {
            font-size: 2.5rem;
          }

          .hero-subtitle {
            font-size: 1.5rem;
          }

          .hero-description {
            font-size: 1rem;
          }

          .hero-buttons {
            flex-direction: column;
          }

          .btn {
            width: 100%;
            justify-content: center;
          }

          .features-grid {
            grid-template-columns: 1fr;
          }

          .command-info {
            grid-template-columns: 1fr;
          }

          .info-card,
          .cta-card,
          .developer-card,
          .terms-content {
            padding: 2rem;
          }

          .section-title {
            font-size: 2rem;
          }

          .tech-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        /* Scrollbar */
        ::-webkit-scrollbar {
          width: 10px;
        }

        ::-webkit-scrollbar-track {
          background: var(--bg-secondary);
        }

        ::-webkit-scrollbar-thumb {
          background: var(--accent-pink);
          border-radius: 5px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: var(--accent-blue);
        }
      `}</style>

      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <a className="nav-brand" onClick={() => navigateTo('home')}>
            <img 
              src="https://cdn.discordapp.com/avatars/1430379996064518176/26ff3d991d4afb22c055616888919f63.png?size=4096" 
              alt="Ongaku-ko"
            />
            音楽子
          </a>
          <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
            <span 
              className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
              onClick={() => navigateTo('home')}
            >
              <Home size={18} />
              Home
            </span>
            <span 
              className={`nav-link ${currentPage === 'developer' ? 'active' : ''}`}
              onClick={() => navigateTo('developer')}
            >
              <User size={18} />
              Developer
            </span>
            <span 
              className={`nav-link ${currentPage === 'terms' ? 'active' : ''}`}
              onClick={() => navigateTo('terms')}
            >
              <FileText size={18} />
              Terms
            </span>
            <button className="theme-toggle" onClick={toggleTheme}>
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
          </div>
          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Page Content */}
      <main style={{ marginTop: '70px' }}>
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'developer' && <DeveloperPage />}
        {currentPage === 'terms' && <TermsPage />}
      </main>

      {/* Footer */}
      <footer style={{ 
        textAlign: 'center', 
        padding: '2rem', 
        background: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border)',
        color: 'var(--text-secondary)'
      }}>
        <p>Made with 💖 by prayag.cake</p>
        <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
          © 2024 Ongaku-ko. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default Ongaku;

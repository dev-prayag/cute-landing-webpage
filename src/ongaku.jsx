import React, { useState, useEffect } from 'react';
import { Shield, Zap, Music, Hammer, Gift, Ticket, Wrench, Heart, MessageCircle, UserCheck, ScrollText, Image, Mic, Sparkles, Bot, Moon, Sun } from 'lucide-react';

const Ongaku = () => {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const features = [
    {
      icon: Shield,
      title: 'AntiNuke',
      items: ['Server protection system', 'Prevents malicious actions', 'Auto-moderation security']
    },
    {
      icon: Zap,
      title: 'Auto Moderation',
      items: ['Automated content filtering', 'Smart message detection', 'Customizable rules']
    },
    {
      icon: Music,
      title: 'Music',
      items: ['High-quality audio playback', 'Queue management', 'Multiple platform support']
    },
    {
      icon: Hammer,
      title: 'Moderation',
      items: ['Kick, ban, mute commands', 'Warning system', 'Moderation logs']
    },
    {
      icon: Gift,
      title: 'Giveaway',
      items: ['Create custom giveaways', 'Automatic winner selection', 'Reroll functionality']
    },
    {
      icon: Ticket,
      title: 'Ticket',
      items: ['Support ticket system', 'Private channels', 'Transcript logs']
    },
    {
      icon: Wrench,
      title: 'Utility',
      items: ['Server information', 'User lookup', 'Helpful tools']
    },
    {
      icon: Heart,
      title: 'Welcomer',
      items: ['Custom welcome messages', 'Goodbye messages', 'Auto-role assignment']
    },
    {
      icon: MessageCircle,
      title: 'Auto Responder',
      items: ['Custom trigger words', 'Automated responses', 'Regex support']
    },
    {
      icon: UserCheck,
      title: 'Custom Roles',
      items: ['Reaction roles', 'Button roles', 'Dropdown selection']
    },
    {
      icon: ScrollText,
      title: 'Logging',
      items: ['Message logs', 'Member activity', 'Server events tracking']
    },
    {
      icon: Image,
      title: 'Media',
      items: ['Image manipulation', 'Meme generator', 'Media commands']
    },
    {
      icon: Mic,
      title: 'VCRoles',
      items: ['Voice channel roles', 'Auto role on join', 'Channel-specific roles']
    },
    {
      icon: Sparkles,
      title: 'Fun',
      items: ['Games and trivia', 'Random commands', 'Entertainment features']
    },
    {
      icon: Bot,
      title: 'Bot Commands',
      items: ['Bot statistics', 'Help command', 'Configuration settings']
    }
  ];

  const FeatureCard = ({ icon: Icon, title, items }) => (
    <div className="feature-card">
      <div className="feature-icon">
        <Icon size={48} />
      </div>
      <h3>{title}</h3>
      <ul className="feature-list">
        {items.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
    </div>
  );

  const Sparkle = ({ style }) => (
    <div className="sparkle" style={style} />
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
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          transition: all 0.3s ease;
          position: relative;
          overflow-x: hidden;
        }

        .app.light {
          --bg-primary: #fff5f9;
          --bg-secondary: #ffffff;
          --text-primary: #2d2d2d;
          --text-secondary: #666666;
          --accent-pink: #ffb3d9;
          --accent-blue: #a8d8ff;
          --card-bg: rgba(255, 255, 255, 0.9);
          --shadow: rgba(168, 216, 255, 0.2);
        }

        .app.dark {
          --bg-primary: #1a1a2e;
          --bg-secondary: #16213e;
          --text-primary: #e6e6e6;
          --text-secondary: #b3b3b3;
          --accent-pink: #ff6eb4;
          --accent-blue: #5eb3ff;
          --card-bg: rgba(22, 33, 62, 0.9);
          --shadow: rgba(94, 179, 255, 0.3);
        }

        .app {
          background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
          color: var(--text-primary);
        }

        .theme-toggle {
          position: fixed;
          top: 20px;
          right: 20px;
          background: var(--card-bg);
          border: none;
          padding: 12px 16px;
          border-radius: 50px;
          cursor: pointer;
          box-shadow: 0 4px 15px var(--shadow);
          transition: all 0.3s ease;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent-pink);
        }

        .theme-toggle:hover {
          transform: scale(1.1);
        }

        .sparkles-container {
          position: fixed;
          pointer-events: none;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          z-index: 0;
        }

        .sparkle {
          position: absolute;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          animation: sparkle 4s infinite;
          opacity: 0;
        }

        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }

        header {
          text-align: center;
          padding: 60px 20px 40px;
          position: relative;
          z-index: 1;
        }

        .logo-container {
          width: 200px;
          height: 200px;
          margin: 0 auto 30px;
          border-radius: 50%;
          overflow: hidden;
          box-shadow: 0 10px 40px var(--shadow);
          border: 5px solid var(--accent-pink);
          background: white;
          animation: float 3s ease-in-out infinite;
        }

        .logo-container img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        h1 {
          font-size: 3em;
          margin-bottom: 10px;
          background: linear-gradient(45deg, var(--accent-pink), var(--accent-blue));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .subtitle {
          font-size: 1.2em;
          color: var(--text-secondary);
          margin-bottom: 30px;
        }

        .cta-buttons {
          display: flex;
          gap: 20px;
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: 40px;
        }

        .btn {
          padding: 15px 35px;
          border: none;
          border-radius: 50px;
          font-size: 1.1em;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          display: inline-block;
          box-shadow: 0 4px 15px var(--shadow);
        }

        .btn-primary {
          background: linear-gradient(45deg, var(--accent-pink), var(--accent-blue));
          color: white;
        }

        .btn-secondary {
          background: var(--card-bg);
          color: var(--text-primary);
          border: 2px solid var(--accent-blue);
        }

        .btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 20px var(--shadow);
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          position: relative;
          z-index: 1;
        }

        .install-section {
          background: var(--card-bg);
          padding: 40px;
          border-radius: 20px;
          margin: 40px 0;
          text-align: center;
          box-shadow: 0 8px 30px var(--shadow);
        }

        .install-section h2 {
          color: var(--accent-pink);
          margin-bottom: 20px;
          font-size: 2em;
        }

        .prefix-info {
          background: linear-gradient(45deg, rgba(255, 179, 217, 0.2), rgba(168, 216, 255, 0.2));
          padding: 20px;
          border-radius: 15px;
          margin: 20px 0;
          border-left: 4px solid var(--accent-blue);
        }

        .prefix-info p {
          margin: 8px 0;
          font-size: 1.05em;
        }

        code {
          background: var(--bg-secondary);
          padding: 5px 10px;
          border-radius: 5px;
          font-family: 'Courier New', monospace;
          color: var(--accent-pink);
          font-weight: 600;
        }

        .section-title {
          text-align: center;
          font-size: 2.5em;
          margin: 40px 0;
          background: linear-gradient(45deg, var(--accent-pink), var(--accent-blue));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .features {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 30px;
          margin: 60px 0;
        }

        .feature-card {
          background: var(--card-bg);
          padding: 30px;
          border-radius: 20px;
          box-shadow: 0 8px 30px var(--shadow);
          transition: all 0.3s ease;
          border: 2px solid transparent;
        }

        .feature-card:hover {
          transform: translateY(-10px);
          border-color: var(--accent-pink);
        }

        .feature-icon {
          margin-bottom: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent-pink);
        }

        .feature-card h3 {
          color: var(--accent-blue);
          margin-bottom: 10px;
          font-size: 1.4em;
          text-align: center;
        }

        .feature-list {
          list-style: none;
          padding: 0;
        }

        .feature-list li {
          padding: 8px 0;
          color: var(--text-secondary);
          position: relative;
          padding-left: 25px;
        }

        .feature-list li:before {
          content: "✨";
          position: absolute;
          left: 0;
        }

        footer {
          text-align: center;
          padding: 40px 20px;
          color: var(--text-secondary);
          position: relative;
          z-index: 1;
        }

        footer p {
          margin: 5px 0;
        }

        @media (max-width: 768px) {
          h1 { font-size: 2em; }
          .logo-container { width: 150px; height: 150px; }
          .cta-buttons { flex-direction: column; align-items: center; }
          .btn { width: 80%; max-width: 300px; }
        }
      `}</style>

      {/* Sparkles Background */}
      <div className="sparkles-container">
        {[...Array(30)].map((_, i) => (
          <Sparkle
            key={i}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              background: Math.random() > 0.5 ? 'var(--accent-pink)' : 'var(--accent-blue)'
            }}
          />
        ))}
      </div>

      {/* Theme Toggle */}
      <button className="theme-toggle" onClick={toggleTheme}>
        {theme === 'light' ? <Moon size={24} /> : <Sun size={24} />}
      </button>

      {/* Header */}
      <header>
        <div className="logo-container">
          <img 
            src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'%3E%3Crect fill='%23fff5f9' width='400' height='400'/%3E%3Ctext x='200' y='220' font-size='120' text-anchor='middle' fill='%23ffb3d9'%3E音楽%3C/text%3E%3C/svg%3E" 
            alt="Ongaku-ko Logo"
          />
        </div>
        <h1>音楽子</h1>
        <p className="subtitle">Ongaku-ko • Your Kawaii Multipurpose Discord Bot</p>
        
        <div className="cta-buttons">
          <a 
            href="https://discord.com/oauth2/authorize?client_id=1430379996064518176" 
            className="btn btn-primary" 
            target="_blank"
            rel="noopener noreferrer"
          >
            Add to Discord 💖
          </a>
          <a 
            href="https://discord.gg/WAQfU8U7HZ" 
            className="btn btn-secondary" 
            target="_blank"
            rel="noopener noreferrer"
          >
            Support Server ✨
          </a>
        </div>
      </header>

      {/* Main Content */}
      <div className="container">
        {/* Installation Section */}
        <div className="install-section">
          <h2>🎀 Installation Options</h2>
          <p style={{ margin: '15px 0', fontSize: '1.1em' }}>
            Ongaku-ko supports both User Install and Guild Install!
          </p>
          <div className="prefix-info">
            <p><strong>Slash Commands:</strong> Just type <code>/</code> to see all commands</p>
            <p><strong>Prefix Commands:</strong> Use <code>o</code> before any command</p>
          </div>
        </div>

        {/* Features Section */}
        <h2 className="section-title">Features ✨</h2>
        
        <div className="features">
          {features.map((feature, idx) => (
            <FeatureCard 
              key={idx}
              icon={feature.icon}
              title={feature.title}
              items={feature.items}
            />
          ))}
        </div>

        {/* CTA Section */}
        <div className="install-section">
          <h2>Ready to get started? 🎀</h2>
          <p style={{ margin: '20px 0', fontSize: '1.1em' }}>
            Add Ongaku-ko to your server today and experience the kawaii magic!
          </p>
          <a 
            href="https://discord.com/oauth2/authorize?client_id=1430379996064518176" 
            className="btn btn-primary" 
            target="_blank"
            rel="noopener noreferrer"
          >
            Invite Now! 💖✨
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer>
        <p>Made with 💖 for the Discord community</p>
        <p style={{ marginTop: '10px', opacity: 0.7 }}>© 2024 Ongaku-ko • All Rights Reserved</p>
      </footer>
    </div>
  );
};

export default Ongaku;

import React, { useState, useEffect, useRef } from 'react';
import { Play, Heart, Bookmark, Sun, Moon, ChevronUp, Search, Clock, TrendingUp, Star, Film, Tv, Calendar, X, Menu } from 'lucide-react';

const API_BASE = 'https://hianime-api-1-h1kg.onrender.com/api/v1';

const Ongaku = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [theme, setTheme] = useState('dark');
  const [homeData, setHomeData] = useState(null);
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [animeDetails, setAnimeDetails] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [currentEpisode, setCurrentEpisode] = useState(null);
  const [streamData, setStreamData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [liked, setLiked] = useState([]);
  const [bookmarked, setBookmarked] = useState([]);
  const [loading, setLoading] = useState(false);
  const [serverType, setServerType] = useState('sub');
  const [showAnimeModal, setShowAnimeModal] = useState(false);
  const [ripples, setRipples] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    const savedLiked = JSON.parse(localStorage.getItem('liked') || '[]');
    const savedBookmarked = JSON.parse(localStorage.getItem('bookmarked') || '[]');
    setTheme(savedTheme);
    setLiked(savedLiked);
    setBookmarked(savedBookmarked);
    fetchHomeData();

    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  const fetchHomeData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/home`);
      const data = await res.json();
      if (data.success) setHomeData(data.data);
    } catch (err) {
      console.error('Error fetching home data:', err);
    }
    setLoading(false);
  };

  const fetchAnimeDetails = async (animeId) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/anime/${animeId}`);
      const data = await res.json();
      if (data.success) {
        setAnimeDetails(data.data);
        fetchEpisodes(animeId);
      }
    } catch (err) {
      console.error('Error fetching anime details:', err);
    }
    setLoading(false);
  };

  const fetchEpisodes = async (animeId) => {
    try {
      const res = await fetch(`${API_BASE}/episodes/${animeId}`);
      const data = await res.json();
      if (data.success) setEpisodes(data.data);
    } catch (err) {
      console.error('Error fetching episodes:', err);
    }
  };

  const fetchStreamData = async (episodeId, server = 'HD-2', type = 'sub') => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/stream?id=${episodeId}&server=${server}&type=${type}`);
      const data = await res.json();
      if (data.success) {
        setStreamData(data.data);
      }
    } catch (err) {
      console.error('Error fetching stream data:', err);
    }
    setLoading(false);
  };

  const handleSearch = async (query) => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/search?keyword=${query}&page=1`);
      const data = await res.json();
      if (data.success) setSearchResults(data.data.response);
    } catch (err) {
      console.error('Error searching:', err);
    }
    setLoading(false);
  };

  const toggleTheme = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    
    const ripple = {
      x,
      y,
      id: Date.now()
    };
    
    setRipples(prev => [...prev, ripple]);
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
    
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== ripple.id));
    }, 1000);
  };

  const toggleLike = (animeId) => {
    const newLiked = liked.includes(animeId) 
      ? liked.filter(id => id !== animeId)
      : [...liked, animeId];
    setLiked(newLiked);
    localStorage.setItem('liked', JSON.stringify(newLiked));
  };

  const toggleBookmark = (animeId) => {
    const newBookmarked = bookmarked.includes(animeId)
      ? bookmarked.filter(id => id !== animeId)
      : [...bookmarked, animeId];
    setBookmarked(newBookmarked);
    localStorage.setItem('bookmarked', JSON.stringify(newBookmarked));
  };

  const handleAnimeClick = (anime) => {
    // Play click sound - user should add: new Audio('/click.mp3').play();
    setSelectedAnime(anime);
    setShowAnimeModal(true);
    fetchAnimeDetails(anime.id.split('?')[0]);
    setCurrentPage('anime');
  };

  const playEpisode = (episode) => {
    const episodeId = `${animeDetails.id}${episode.id.split('?')[1]}`;
    setCurrentEpisode(episode);
    fetchStreamData(episodeId, 'HD-2', serverType);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
          transition: background 0.6s ease, color 0.6s ease;
          position: relative;
        }

        .app.light {
          --bg-primary: #ffffff;
          --bg-secondary: #f0f7ff;
          --bg-tertiary: #e3f2fd;
          --text-primary: #1a1a1a;
          --text-secondary: #6c757d;
          --accent-primary: #5eb3ff;
          --accent-secondary: #667eea;
          --card-bg: #ffffff;
          --border: #cfe2f3;
          --shadow: rgba(94, 179, 255, 0.15);
          --shadow-lg: rgba(94, 179, 255, 0.25);
        }

        .app.dark {
          --bg-primary: #0a0e27;
          --bg-secondary: #111827;
          --bg-tertiary: #1a1f3a;
          --text-primary: #f9fafb;
          --text-secondary: #9ca3af;
          --accent-primary: #5eb3ff;
          --accent-secondary: #667eea;
          --card-bg: #1f2937;
          --border: #2d3748;
          --shadow: rgba(94, 179, 255, 0.2);
          --shadow-lg: rgba(94, 179, 255, 0.35);
        }

        .app {
          background: var(--bg-primary);
          color: var(--text-primary);
        }

        .theme-ripple {
          position: fixed;
          border-radius: 50%;
          background: radial-gradient(circle, var(--accent-primary) 0%, transparent 70%);
          pointer-events: none;
          z-index: 9998;
          animation: ripple-expand 1s ease-out forwards;
        }

        @keyframes ripple-expand {
          0% {
            width: 0;
            height: 0;
            opacity: 0.8;
          }
          100% {
            width: 300vmax;
            height: 300vmax;
            opacity: 0;
          }
        }

        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: var(--card-bg);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
          padding: 1rem 2rem;
          z-index: 10000;
          transition: all 0.3s ease;
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
          cursor: pointer;
          transition: transform 0.2s;
        }

        .nav-brand:hover {
          transform: scale(1.05);
        }

        .nav-links {
          display: flex;
          gap: 2rem;
          align-items: center;
        }

        .search-container {
          position: relative;
        }

        .search-input {
          background: var(--bg-tertiary);
          border: 1px solid var(--border);
          padding: 0.625rem 2.5rem 0.625rem 1rem;
          border-radius: 0.75rem;
          color: var(--text-primary);
          font-size: 0.9375rem;
          width: 16rem;
          transition: all 0.3s;
        }

        .search-input:focus {
          outline: none;
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 3px var(--shadow);
        }

        .search-icon {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-secondary);
          pointer-events: none;
        }

        .theme-toggle {
          background: var(--bg-tertiary);
          border: none;
          padding: 0.625rem;
          border-radius: 0.75rem;
          cursor: pointer;
          color: var(--accent-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;
          position: relative;
          z-index: 10001;
        }

        .theme-toggle:hover {
          background: var(--accent-primary);
          color: white;
          transform: rotate(180deg);
        }

        .menu-toggle {
          display: none;
          background: none;
          border: none;
          color: var(--text-primary);
          cursor: pointer;
        }

        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .section {
          padding: 4rem 2rem;
          position: relative;
          z-index: 10000;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 2rem;
        }

        .section-title {
          font-size: 2rem;
          font-weight: 800;
          color: var(--text-primary);
        }

        .spotlight-section {
          padding: 8rem 2rem 4rem;
          background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
          position: relative;
          overflow: hidden;
          z-index: 10000;
        }

        .spotlight-section::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 50% 50%, var(--accent-primary) 0%, transparent 70%);
          opacity: 0.05;
          pointer-events: none;
        }

        .spotlight-card {
          position: relative;
          border-radius: 1.5rem;
          overflow: hidden;
          height: 28rem;
          cursor: pointer;
          transition: transform 0.3s;
          box-shadow: 0 10px 40px var(--shadow-lg);
        }

        .spotlight-card:hover {
          transform: scale(1.02);
        }

        .spotlight-bg {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
        }

        .spotlight-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.5) 50%, transparent 100%);
        }

        .spotlight-content {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 3rem;
        }

        .spotlight-title {
          font-size: 3rem;
          font-weight: 800;
          color: white;
          margin-bottom: 1rem;
        }

        .spotlight-desc {
          color: rgba(255,255,255,0.9);
          font-size: 1.125rem;
          line-height: 1.6;
          margin-bottom: 1.5rem;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .spotlight-actions {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .btn {
          padding: 0.875rem 2rem;
          border-radius: 0.75rem;
          font-weight: 600;
          border: none;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s;
          font-size: 1rem;
        }

        .btn-primary {
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          color: white;
          box-shadow: 0 4px 15px var(--shadow);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 25px var(--shadow-lg);
        }

        .btn-icon {
          background: var(--card-bg);
          padding: 0.75rem;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;
        }

        .btn-icon:hover {
          background: var(--accent-primary);
          color: white;
          transform: scale(1.1);
        }

        .anime-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
          gap: 1.5rem;
          position: relative;
          z-index: 10000;
        }

        .anime-card {
          background: var(--card-bg);
          border-radius: 1rem;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.3s;
          border: 1px solid var(--border);
          position: relative;
        }

        .anime-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 15px 40px var(--shadow-lg);
          border-color: var(--accent-primary);
        }

        .anime-poster {
          position: relative;
          width: 100%;
          height: 18rem;
          overflow: hidden;
        }

        .anime-poster img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s;
        }

        .anime-card:hover .anime-poster img {
          transform: scale(1.1);
        }

        .anime-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%);
          opacity: 0;
          transition: opacity 0.3s;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          padding: 1rem;
        }

        .anime-card:hover .anime-overlay {
          opacity: 1;
        }

        .anime-badge {
          position: absolute;
          top: 0.5rem;
          left: 0.5rem;
          background: var(--accent-primary);
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 0.5rem;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .anime-info {
          padding: 1rem;
        }

        .anime-title {
          font-size: 0.9375rem;
          font-weight: 600;
          color: var(--text-primary);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin-bottom: 0.5rem;
        }

        .anime-meta {
          color: var(--text-secondary);
          font-size: 0.8125rem;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.75);
          backdrop-filter: blur(8px);
          z-index: 10001;
          overflow-y: auto;
          animation: fadeIn 0.3s;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .modal-container {
          min-height: 100vh;
          padding: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-content {
          background: var(--card-bg);
          border-radius: 1.5rem;
          max-width: 80rem;
          width: 100%;
          box-shadow: 0 20px 60px var(--shadow-lg);
          position: relative;
          animation: slideUp 0.4s;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .modal-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: rgba(239, 68, 68, 0.9);
          border: none;
          width: 3rem;
          height: 3rem;
          border-radius: 50%;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;
          z-index: 10;
        }

        .modal-close:hover {
          background: rgb(220, 38, 38);
          transform: scale(1.1);
        }

        .video-player {
          width: 100%;
          border-radius: 1.5rem 1.5rem 0 0;
        }

        .video-controls {
          padding: 1.5rem;
          border-bottom: 1px solid var(--border);
        }

        .episode-title {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 1rem;
          color: var(--text-primary);
        }

        .server-buttons {
          display: flex;
          gap: 1rem;
        }

        .server-btn {
          padding: 0.625rem 1.5rem;
          border-radius: 0.5rem;
          border: none;
          background: var(--bg-tertiary);
          color: var(--text-primary);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .server-btn.active {
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          color: white;
        }

        .server-btn:hover {
          transform: translateY(-2px);
        }

        .anime-details {
          padding: 2rem;
        }

        .details-grid {
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .details-poster {
          width: 12rem;
          height: 18rem;
          border-radius: 1rem;
          overflow: hidden;
          box-shadow: 0 10px 30px var(--shadow-lg);
        }

        .details-poster img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .details-info h2 {
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
          color: var(--text-primary);
        }

        .details-alt {
          color: var(--text-secondary);
          font-size: 1.125rem;
          margin-bottom: 1rem;
        }

        .details-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .badge {
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .badge-blue { background: var(--accent-primary); color: white; }
        .badge-green { background: #10b981; color: white; }
        .badge-yellow { background: #f59e0b; color: white; }

        .details-synopsis {
          color: var(--text-secondary);
          line-height: 1.7;
          margin-bottom: 1.5rem;
        }

        .details-meta {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .meta-item {
          color: var(--text-secondary);
        }

        .meta-label {
          font-weight: 600;
          color: var(--text-primary);
          margin-right: 0.5rem;
        }

        .genre-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }

        .genre-tag {
          padding: 0.375rem 0.875rem;
          background: var(--bg-tertiary);
          border-radius: 0.5rem;
          font-size: 0.875rem;
          color: var(--text-primary);
          border: 1px solid var(--border);
        }

        .action-buttons {
          display: flex;
          gap: 1rem;
        }

        .episodes-section {
          margin-top: 2rem;
        }

        .episodes-title {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
          color: var(--text-primary);
        }

        .episodes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(8rem, 1fr));
          gap: 1rem;
          max-height: 24rem;
          overflow-y: auto;
          padding: 0.5rem;
        }

        .episode-card {
          background: var(--bg-tertiary);
          padding: 1rem;
          border-radius: 0.75rem;
          border: 1px solid var(--border);
          cursor: pointer;
          transition: all 0.3s;
          text-align: center;
        }

        .episode-card:hover {
          background: var(--accent-primary);
          color: white;
          transform: translateY(-3px);
          box-shadow: 0 6px 20px var(--shadow);
        }

        .episode-card.active {
          border: 2px solid var(--accent-primary);
        }

        .episode-number {
          font-weight: 700;
          font-size: 0.875rem;
          margin-bottom: 0.25rem;
        }

        .episode-title-small {
          font-size: 0.75rem;
          color: var(--text-secondary);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .episode-card:hover .episode-title-small {
          color: white;
        }

        .back-to-top {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          border: none;
          width: 3.5rem;
          height: 3.5rem;
          border-radius: 50%;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 20px var(--shadow-lg);
          transition: all 0.3s;
          z-index: 10000;
          animation: fadeIn 0.3s;
        }

        .back-to-top:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px var(--shadow-lg);
        }

        .loading-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10002;
        }

        .spinner {
          width: 4rem;
          height: 4rem;
          border: 4px solid var(--border);
          border-top-color: var(--accent-primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        ::-webkit-scrollbar {
          width: 10px;
        }

        ::-webkit-scrollbar-track {
          background: var(--bg-secondary);
        }

        ::-webkit-scrollbar-thumb {
          background: var(--accent-primary);
          border-radius: 5px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: var(--accent-secondary);
        }

        @media (max-width: 768px) {
          .menu-toggle {
            display: block;
          }

          .nav-links {
            display: none;
          }

          .spotlight-title {
            font-size: 2rem;
          }

          .spotlight-desc {
            font-size: 1rem;
          }

          .anime-grid {
            grid-template-columns: repeat(auto-fill, minmax(8rem, 1fr));
          }

          .details-grid {
            grid-template-columns: 1fr;
          }

          .details-meta {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* Theme Ripples */}
      {ripples.map(ripple => (
        <div
          key={ripple.id}
          className="theme-ripple"
          style={{
            left: ripple.x,
            top: ripple.y,
            transform: 'translate(-50%, -50%)'
          }}
        />
      ))}

      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-brand" onClick={() => { setCurrentPage('home'); setShowAnimeModal(false); }}>
            音楽Ko
          </div>
          <div className="nav-links">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search anime..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                className="search-input"
              />
              <Search className="search-icon" size={18} />
            </div>
            <button className="theme-toggle" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{ paddingTop: '5rem' }}>
        {currentPage === 'home' && homeData && (
          <>
            {/* Spotlight */}
            {homeData.spotlight && homeData.spotlight.length > 0 && (
              <section className="spotlight-section">
                <div className="container">
                  <div className="spotlight-card" onClick={() => handleAnimeClick(homeData.spotlight[0])}>
                    <div className="spotlight-bg" style={{ backgroundImage: `url(${homeData.spotlight[0].poster})` }} />
                    <div className="spotlight-overlay" />
                    <div className="spotlight-content">
                      <h1 className="spotlight-title">{homeData.spotlight[0].title}</h1>
                      <p className="spotlight-desc">{homeData.spotlight[0].synopsis}</p>
                      <div className="spotlight-actions">
                        <button className="btn btn-primary">
                          <Play size={20} />
                          Watch Now
                        </button>
                        <button 
                          className="btn-icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBookmark(homeData.spotlight[0].id);
                          }}
                        >
                          <Bookmark size={20} className={bookmarked.includes(homeData.spotlight[0].id) ? 'fill-current' : ''} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Search Results */}
            {searchResults.length > 0 && (
              <section className="section">
                <div className="container">
                  <div className="section-header">
                    <Search size={28} style={{ color: 'var(--accent-primary)' }} />
                    <h2 className="section-title">Search Results</h2>
                  </div>
                  <div className="anime-grid">
                    {searchResults.slice(0, 12).map((anime, i) => (
                      <AnimeCard 
                        key={i} 
                        anime={anime} 
                        onClick={handleAnimeClick}
                        liked={liked}
                        bookmarked={bookmarked}
                        onLike={toggleLike}
                        onBookmark={toggleBookmark}
                      />
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Trending */}
            {homeData.trending && (
              <section className="section">
                <div className="container">
                  <div className="section-header">
                    <TrendingUp size={28} style={{ color: 'var(--accent-primary)' }} />
                    <h2 className="section-title">Trending Now</h2>
                  </div>
                  <div className="anime-grid">
                    {homeData.trending.slice(0, 12).map((anime, i) => (
                      <AnimeCard 
                        key={i} 
                        anime={anime} 
                        onClick={handleAnimeClick}
                        liked={liked}
                        bookmarked={bookmarked}
                        onLike={toggleLike}
                        onBookmark={toggleBookmark}
                      />
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Top Airing */}
            {homeData.topAiring && (
              <section className="section">
                <div className="container">
                  <div className="section-header">
                    <Tv size={28} style={{ color: 'var(--accent-primary)' }} />
                    <h2 className="section-title">Top Airing</h2>
                  </div>
                  <div className="anime-grid">
                    {homeData.topAiring.slice(0, 12).map((anime, i) => (
                      <AnimeCard 
                        key={i} 
                        anime={anime} 
                        onClick={handleAnimeClick}
                        liked={liked}
                        bookmarked={bookmarked}
                        onLike={toggleLike}
                        onBookmark={toggleBookmark}
                      />
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Most Popular */}
            {homeData.mostPopular && (
              <section className="section">
                <div className="container">
                  <div className="section-header">
                    <Star size={28} style={{ color: 'var(--accent-primary)' }} />
                    <h2 className="section-title">Most Popular</h2>
                  </div>
                  <div className="anime-grid">
                    {homeData.mostPopular.slice(0, 12).map((anime, i) => (
                      <AnimeCard 
                        key={i} 
                        anime={anime} 
                        onClick={handleAnimeClick}
                        liked={liked}
                        bookmarked={bookmarked}
                        onLike={toggleLike}
                        onBookmark={toggleBookmark}
                      />
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Latest Episodes */}
            {homeData.latestEpisode && (
              <section className="section">
                <div className="container">
                  <div className="section-header">
                    <Clock size={28} style={{ color: 'var(--accent-primary)' }} />
                    <h2 className="section-title">Latest Episodes</h2>
                  </div>
                  <div className="anime-grid">
                    {homeData.latestEpisode.slice(0, 12).map((anime, i) => (
                      <AnimeCard 
                        key={i} 
                        anime={anime} 
                        onClick={handleAnimeClick}
                        liked={liked}
                        bookmarked={bookmarked}
                        onLike={toggleLike}
                        onBookmark={toggleBookmark}
                      />
                    ))}
                  </div>
                </div>
              </section>
            )}
          </>
        )}

        {/* Anime Detail Modal */}
        {showAnimeModal && animeDetails && (
          <div className="modal-overlay">
            <div className="modal-container">
              <div className="modal-content">
                <button className="modal-close" onClick={() => {
                  setShowAnimeModal(false);
                  setCurrentPage('home');
                  setStreamData(null);
                }}>
                  <X size={24} />
                </button>

                {/* Video Player */}
                {streamData && (
                  <>
                    <video
                      ref={videoRef}
                      controls
                      className="video-player"
                      src={streamData.streamingLink.link.file}
                      crossOrigin="anonymous"
                    >
                      <track kind="subtitles" src="" srcLang="en" label="English" />
                    </video>
                    <div className="video-controls">
                      <h3 className="episode-title">{currentEpisode?.title}</h3>
                      <div className="server-buttons">
                        <button
                          className={`server-btn ${serverType === 'sub' ? 'active' : ''}`}
                          onClick={() => {
                            setServerType('sub');
                            playEpisode(currentEpisode);
                          }}
                        >
                          SUB
                        </button>
                        <button
                          className={`server-btn ${serverType === 'dub' ? 'active' : ''}`}
                          onClick={() => {
                            setServerType('dub');
                            playEpisode(currentEpisode);
                          }}
                        >
                          DUB
                        </button>
                      </div>
                    </div>
                  </>
                )}

                <div className="anime-details">
                  <div className="details-grid">
                    <div className="details-poster">
                      <img src={animeDetails.poster} alt={animeDetails.title} />
                    </div>
                    <div className="details-info">
                      <h2>{animeDetails.title}</h2>
                      <p className="details-alt">{animeDetails.alternativeTitle}</p>
                      <div className="details-badges">
                        <span className="badge badge-blue">{animeDetails.type}</span>
                        <span className="badge badge-green">{animeDetails.rating}</span>
                        <span className="badge badge-yellow">
                          <Star size={14} style={{ display: 'inline', marginRight: '0.25rem' }} />
                          {animeDetails.MAL_score}
                        </span>
                      </div>
                      <p className="details-synopsis">{animeDetails.synopsis}</p>
                      <div className="details-meta">
                        <div className="meta-item">
                          <span className="meta-label">Status:</span>
                          {animeDetails.status}
                        </div>
                        <div className="meta-item">
                          <span className="meta-label">Duration:</span>
                          {animeDetails.duration}
                        </div>
                        <div className="meta-item">
                          <span className="meta-label">Studio:</span>
                          {animeDetails.studios}
                        </div>
                        <div className="meta-item">
                          <span className="meta-label">Premiered:</span>
                          {animeDetails.premiered}
                        </div>
                      </div>
                      <div className="genre-tags">
                        {animeDetails.genres?.map((genre, i) => (
                          <span key={i} className="genre-tag">{genre}</span>
                        ))}
                      </div>
                      <div className="action-buttons">
                        <button className="btn-icon" onClick={() => toggleLike(animeDetails.id)}>
                          <Heart size={20} className={liked.includes(animeDetails.id) ? 'fill-current' : ''} style={{ color: liked.includes(animeDetails.id) ? '#ef4444' : 'inherit' }} />
                        </button>
                        <button className="btn-icon" onClick={() => toggleBookmark(animeDetails.id)}>
                          <Bookmark size={20} className={bookmarked.includes(animeDetails.id) ? 'fill-current' : ''} style={{ color: bookmarked.includes(animeDetails.id) ? 'var(--accent-primary)' : 'inherit' }} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Episodes */}
                  {episodes.length > 0 && (
                    <div className="episodes-section">
                      <h3 className="episodes-title">Episodes</h3>
                      <div className="episodes-grid">
                        {episodes.map((ep, i) => (
                          <div
                            key={i}
                            className={`episode-card ${currentEpisode?.id === ep.id ? 'active' : ''}`}
                            onClick={() => playEpisode(ep)}
                          >
                            <div className="episode-number">Episode {i + 1}</div>
                            <div className="episode-title-small">{ep.title}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Back to Top */}
      {showBackToTop && (
        <button className="back-to-top" onClick={scrollToTop}>
          <ChevronUp size={24} />
        </button>
      )}

      {/* Loading */}
      {loading && (
        <div className="loading-overlay">
          <div className="spinner" />
        </div>
      )}
    </div>
  );
};

const AnimeCard = ({ anime, onClick, liked, bookmarked, onLike, onBookmark }) => (
  <div className="anime-card" onClick={() => onClick(anime)}>
    <div className="anime-poster">
      <img src={anime.poster} alt={anime.title} />
      {anime.episodes && (
        <span className="anime-badge">EP {anime.episodes.eps || anime.episodes.sub}</span>
      )}
      <div className="anime-overlay">
        <button className="btn-icon" onClick={(e) => { e.stopPropagation(); onLike(anime.id); }}>
          <Heart size={16} className={liked.includes(anime.id) ? 'fill-current' : ''} style={{ color: liked.includes(anime.id) ? '#ef4444' : 'white' }} />
        </button>
        <button className="btn-icon" onClick={(e) => { e.stopPropagation(); onBookmark(anime.id); }}>
          <Bookmark size={16} className={bookmarked.includes(anime.id) ? 'fill-current' : ''} style={{ color: bookmarked.includes(anime.id) ? '#5eb3ff' : 'white' }} />
        </button>
      </div>
    </div>
    <div className="anime-info">
      <h3 className="anime-title">{anime.title}</h3>
      {anime.type && <p className="anime-meta">{anime.type}</p>}
    </div>
  </div>
);

export default Ongaku;

import React, { useState, useEffect, useRef } from 'react';
import { Search, Moon, Sun, Heart, Bookmark, ChevronUp, Play, Star, Clock, Calendar, TrendingUp } from 'lucide-react';

const API_BASE = 'https://hianime-api-1-h1kg.onrender.com/api/v1';

const Ongaku = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [homeData, setHomeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [likedAnimes, setLikedAnimes] = useState([]);
  const [bookmarkedAnimes, setBookmarkedAnimes] = useState([]);
  const [activeView, setActiveView] = useState('home');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const toggleRef = useRef(null);

  useEffect(() => {
    const liked = JSON.parse(localStorage.getItem('likedAnimes') || '[]');
    const bookmarked = JSON.parse(localStorage.getItem('bookmarkedAnimes') || '[]');
    setLikedAnimes(liked);
    setBookmarkedAnimes(bookmarked);
    fetchHomeData();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchHomeData = async () => {
    try {
      const res = await fetch(`${API_BASE}/home`);
      const data = await res.json();
      if (data.success) {
        setHomeData(data.data);
      }
    } catch (err) {
      console.error('Error fetching home data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/search?keyword=${encodeURIComponent(searchQuery)}&page=1`);
      const data = await res.json();
      if (data.success) {
        setSearchResults(data.data.response);
        setActiveView('search');
      }
    } catch (err) {
      console.error('Error searching:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = () => {
    setIsTransitioning(true);
    const rect = toggleRef.current?.getBoundingClientRect();
    const x = rect?.left + rect?.width / 2;
    const y = rect?.top + rect?.height / 2;
    
    document.documentElement.style.setProperty('--ripple-x', `${x}px`);
    document.documentElement.style.setProperty('--ripple-y', `${y}px`);
    
    setTimeout(() => {
      setDarkMode(!darkMode);
      setTimeout(() => setIsTransitioning(false), 800);
    }, 50);
  };

  const toggleLike = (anime) => {
    const updated = likedAnimes.some(a => a.id === anime.id)
      ? likedAnimes.filter(a => a.id !== anime.id)
      : [...likedAnimes, anime];
    setLikedAnimes(updated);
    localStorage.setItem('likedAnimes', JSON.stringify(updated));
  };

  const toggleBookmark = (anime) => {
    const updated = bookmarkedAnimes.some(a => a.id === anime.id)
      ? bookmarkedAnimes.filter(a => a.id !== anime.id)
      : [...bookmarkedAnimes, anime];
    setBookmarkedAnimes(updated);
    localStorage.setItem('bookmarkedAnimes', JSON.stringify(updated));
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const AnimeCard = ({ anime, index }) => (
    <div 
      className="anime-card"
      style={{ animationDelay: `${index * 0.1}s` }}
      onClick={() => {
        setSelectedAnime(anime);
        setActiveView('details');
      }}
    >
      <div className="anime-card-inner">
        <img src={anime.poster} alt={anime.title} />
        <div className="anime-overlay">
          <Play className="play-icon" />
        </div>
        <div className="anime-actions">
          <button 
            onClick={(e) => { e.stopPropagation(); toggleLike(anime); }}
            className={likedAnimes.some(a => a.id === anime.id) ? 'active' : ''}
          >
            <Heart size={18} />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); toggleBookmark(anime); }}
            className={bookmarkedAnimes.some(a => a.id === anime.id) ? 'active' : ''}
          >
            <Bookmark size={18} />
          </button>
        </div>
      </div>
      <div className="anime-info">
        <h3>{anime.title}</h3>
        <div className="anime-meta">
          {anime.episodes && <span>EP {anime.episodes.eps || anime.episodes.sub}</span>}
          {anime.type && <span>{anime.type}</span>}
        </div>
      </div>
    </div>
  );

  const SpotlightSection = () => (
    <div className="spotlight-section">
      {homeData?.spotlight?.slice(0, 5).map((anime, i) => (
        <div key={i} className="spotlight-item" style={{ animationDelay: `${i * 0.2}s` }}>
          <img src={anime.poster} alt={anime.title} />
          <div className="spotlight-content">
            <span className="rank">#{anime.rank}</span>
            <h2>{anime.title}</h2>
            <p>{anime.synopsis?.slice(0, 200)}...</p>
            <div className="spotlight-meta">
              <span><Calendar size={16} /> {anime.aired}</span>
              <span><Clock size={16} /> {anime.duration}</span>
              <span className="quality">{anime.quality}</span>
            </div>
            <button className="watch-btn" onClick={() => {
              setSelectedAnime(anime);
              setActiveView('details');
            }}>
              <Play size={20} /> Watch Now
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className={`app ${darkMode ? 'dark' : 'light'} ${isTransitioning ? 'transitioning' : ''}`}>
      <nav className="navbar">
        <div className="nav-container">
          <h1 className="logo" onClick={() => setActiveView('home')}>AnimeStream</h1>
          <div className="search-bar">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search anime..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button onClick={handleSearch} className="search-btn">Search</button>
          </div>
          <div className="nav-actions">
            <button onClick={() => setActiveView('liked')} className="nav-btn">
              <Heart size={22} />
              {likedAnimes.length > 0 && <span className="badge">{likedAnimes.length}</span>}
            </button>
            <button onClick={() => setActiveView('bookmarked')} className="nav-btn">
              <Bookmark size={22} />
              {bookmarkedAnimes.length > 0 && <span className="badge">{bookmarkedAnimes.length}</span>}
            </button>
            <button ref={toggleRef} onClick={toggleTheme} className="theme-toggle">
              {darkMode ? <Sun size={22} /> : <Moon size={22} />}
            </button>
          </div>
        </div>
      </nav>

      <main className="main-content">
        {loading ? (
          <div className="loader-container">
            <div className="loader"></div>
          </div>
        ) : (
          <>
            {activeView === 'home' && homeData && (
              <>
                <SpotlightSection />
                
                <section className="anime-section">
                  <h2><TrendingUp size={24} /> Trending Now</h2>
                  <div className="anime-grid">
                    {homeData.trending?.slice(0, 12).map((anime, i) => (
                      <AnimeCard key={anime.id} anime={anime} index={i} />
                    ))}
                  </div>
                </section>

                <section className="anime-section">
                  <h2><Star size={24} /> Most Popular</h2>
                  <div className="anime-grid">
                    {homeData.mostPopular?.slice(0, 12).map((anime, i) => (
                      <AnimeCard key={anime.id} anime={anime} index={i} />
                    ))}
                  </div>
                </section>

                <section className="anime-section">
                  <h2><Clock size={24} /> Recently Added</h2>
                  <div className="anime-grid">
                    {homeData.newAdded?.slice(0, 12).map((anime, i) => (
                      <AnimeCard key={anime.id} anime={anime} index={i} />
                    ))}
                  </div>
                </section>
              </>
            )}

            {activeView === 'search' && (
              <section className="anime-section">
                <h2>Search Results for "{searchQuery}"</h2>
                <div className="anime-grid">
                  {searchResults.map((anime, i) => (
                    <AnimeCard key={anime.id} anime={anime} index={i} />
                  ))}
                </div>
              </section>
            )}

            {activeView === 'liked' && (
              <section className="anime-section">
                <h2><Heart size={24} /> Liked Anime</h2>
                {likedAnimes.length === 0 ? (
                  <p className="empty-state">No liked anime yet. Start exploring!</p>
                ) : (
                  <div className="anime-grid">
                    {likedAnimes.map((anime, i) => (
                      <AnimeCard key={anime.id} anime={anime} index={i} />
                    ))}
                  </div>
                )}
              </section>
            )}

            {activeView === 'bookmarked' && (
              <section className="anime-section">
                <h2><Bookmark size={24} /> Bookmarked Anime</h2>
                {bookmarkedAnimes.length === 0 ? (
                  <p className="empty-state">No bookmarked anime yet. Start exploring!</p>
                ) : (
                  <div className="anime-grid">
                    {bookmarkedAnimes.map((anime, i) => (
                      <AnimeCard key={anime.id} anime={anime} index={i} />
                    ))}
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </main>

      {showBackToTop && (
        <button className="back-to-top" onClick={scrollToTop}>
          <ChevronUp size={24} />
        </button>
      )}

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .app {
          min-height: 100vh;
          transition: background-color 0.3s ease, color 0.3s ease;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        }

        .app.dark {
          background: linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 100%);
          color: #ffffff;
        }

        .app.light {
          background: linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 100%);
          color: #1a1a2e;
        }

        .app.transitioning::before {
          content: '';
          position: fixed;
          top: var(--ripple-y);
          left: var(--ripple-x);
          width: 0;
          height: 0;
          border-radius: 50%;
          background: var(--ripple-bg);
          transform: translate(-50%, -50%);
          animation: ripple 0.8s ease-out forwards;
          pointer-events: none;
          z-index: 9999;
        }

        .dark.transitioning::before {
          --ripple-bg: #f5f7fa;
        }

        .light.transitioning::before {
          --ripple-bg: #0f0f1e;
        }

        @keyframes ripple {
          to {
            width: 300vmax;
            height: 300vmax;
          }
        }

        .navbar {
          position: sticky;
          top: 0;
          z-index: 100;
          backdrop-filter: blur(10px);
          padding: 1rem 0;
          box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
        }

        .dark .navbar {
          background: rgba(15, 15, 30, 0.8);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .light .navbar {
          background: rgba(255, 255, 255, 0.8);
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }

        .nav-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .logo {
          font-size: 1.8rem;
          font-weight: 800;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          cursor: pointer;
          transition: transform 0.3s ease;
        }

        .logo:hover {
          transform: scale(1.05);
        }

        .search-bar {
          flex: 1;
          max-width: 500px;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          border-radius: 50px;
          transition: all 0.3s ease;
        }

        .dark .search-bar {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .light .search-bar {
          background: rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(0, 0, 0, 0.1);
        }

        .search-bar:focus-within {
          transform: scale(1.02);
          box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
        }

        .search-bar input {
          flex: 1;
          background: none;
          border: none;
          outline: none;
          font-size: 1rem;
          color: inherit;
        }

        .search-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .search-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }

        .nav-actions {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .nav-btn, .theme-toggle {
          position: relative;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 50%;
          transition: all 0.3s ease;
          color: inherit;
        }

        .dark .nav-btn:hover, .dark .theme-toggle:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .light .nav-btn:hover, .light .theme-toggle:hover {
          background: rgba(0, 0, 0, 0.1);
        }

        .badge {
          position: absolute;
          top: -2px;
          right: -2px;
          background: #f43f5e;
          color: white;
          font-size: 0.7rem;
          padding: 0.15rem 0.4rem;
          border-radius: 10px;
          font-weight: bold;
        }

        .main-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
        }

        .spotlight-section {
          margin-bottom: 3rem;
          display: grid;
          gap: 2rem;
        }

        .spotlight-item {
          position: relative;
          height: 500px;
          border-radius: 20px;
          overflow: hidden;
          animation: fadeInUp 0.6s ease-out;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .spotlight-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .spotlight-content {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 3rem;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.9), transparent);
          color: white;
        }

        .rank {
          display: inline-block;
          background: #667eea;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-weight: bold;
          margin-bottom: 1rem;
        }

        .spotlight-content h2 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }

        .spotlight-meta {
          display: flex;
          gap: 1.5rem;
          margin: 1rem 0;
          align-items: center;
        }

        .spotlight-meta span {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .quality {
          background: #10b981;
          padding: 0.25rem 0.75rem;
          border-radius: 4px;
          font-weight: bold;
        }

        .watch-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 0.75rem 2rem;
          border-radius: 50px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          margin-top: 1rem;
          transition: all 0.3s ease;
        }

        .watch-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
        }

        .anime-section {
          margin-bottom: 3rem;
        }

        .anime-section h2 {
          font-size: 1.8rem;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .anime-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1.5rem;
        }

        .anime-card {
          cursor: pointer;
          animation: fadeInUp 0.6s ease-out;
          animation-fill-mode: both;
        }

        .anime-card-inner {
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          aspect-ratio: 2/3;
          transition: all 0.3s ease;
        }

        .anime-card:hover .anime-card-inner {
          transform: translateY(-8px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
        }

        .anime-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .anime-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .anime-card:hover .anime-overlay {
          opacity: 1;
        }

        .play-icon {
          width: 60px;
          height: 60px;
          color: white;
        }

        .anime-actions {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          display: flex;
          gap: 0.5rem;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .anime-card:hover .anime-actions {
          opacity: 1;
        }

        .anime-actions button {
          background: rgba(0, 0, 0, 0.7);
          border: none;
          padding: 0.5rem;
          border-radius: 50%;
          cursor: pointer;
          color: white;
          transition: all 0.3s ease;
        }

        .anime-actions button:hover {
          background: rgba(0, 0, 0, 0.9);
          transform: scale(1.1);
        }

        .anime-actions button.active {
          background: #f43f5e;
        }

        .anime-info {
          margin-top: 0.75rem;
        }

        .anime-info h3 {
          font-size: 0.95rem;
          margin-bottom: 0.5rem;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .anime-meta {
          display: flex;
          gap: 0.75rem;
          font-size: 0.85rem;
          opacity: 0.7;
        }

        .back-to-top {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
          animation: fadeInUp 0.3s ease-out;
          transition: all 0.3s ease;
        }

        .back-to-top:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 30px rgba(102, 126, 234, 0.4);
        }

        .loader-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 60vh;
        }

        .loader {
          width: 50px;
          height: 50px;
          border: 4px solid rgba(102, 126, 234, 0.2);
          border-top-color: #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          font-size: 1.2rem;
          opacity: 0.6;
        }

        @media (max-width: 768px) {
          .nav-container {
            flex-wrap: wrap;
            gap: 1rem;
          }

          .search-bar {
            order: 3;
            width: 100%;
            max-width: 100%;
          }

          .spotlight-content h2 {
            font-size: 1.5rem;
          }

          .anime-grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Ongaku;

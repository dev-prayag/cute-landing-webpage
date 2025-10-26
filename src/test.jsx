import React, { useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Bookmark, Star, Plus, Check, Search, TrendingUp, Clock, Film, Calendar, ChevronRight, Moon, Sun, Menu, X, Home, User, FileText, Sparkles, LogIn, LogOut, List, ArrowLeft } from 'lucide-react';

const API_BASE = 'https://onkagu-api.vercel.app/api';

const Ongaku = () => {
  const [theme, setTheme] = useState('dark');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('home');
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Anime data
  const [homeData, setHomeData] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [animeInfo, setAnimeInfo] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [currentEpisode, setCurrentEpisode] = useState(null);
  const [streamData, setStreamData] = useState(null);
  const [selectedServer, setSelectedServer] = useState(null);
  
  // User data
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [bookmarks, setBookmarks] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [watchlist, setWatchlist] = useState([]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('ongaku_theme') || 'dark';
    setTheme(savedTheme);
    
    const savedUser = localStorage.getItem('ongaku_user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setIsLoggedIn(true);
      setUsername(userData.username);
      setBookmarks(userData.bookmarks || []);
      setFavorites(userData.favorites || []);
      setWatchlist(userData.watchlist || []);
    }
    
    fetchHomeData();
    setTimeout(() => setLoading(false), 2500);
  }, []);

  useEffect(() => {
    localStorage.setItem('ongaku_theme', theme);
  }, [theme]);

  useEffect(() => {
    if (isLoggedIn) {
      localStorage.setItem('ongaku_user', JSON.stringify({
        username,
        bookmarks,
        favorites,
        watchlist
      }));
    }
  }, [isLoggedIn, username, bookmarks, favorites, watchlist]);

  const fetchHomeData = async () => {
    try {
      const response = await fetch(`${API_BASE}/`);
      const data = await response.json();
      if (data.success) {
        setHomeData(data.results);
      }
    } catch (error) {
      console.error('Error fetching home data:', error);
    }
  };

  const searchAnime = async (query) => {
    if (!query) return;
    try {
      const response = await fetch(`${API_BASE}/search?keyword=${encodeURIComponent(query)}`);
      const data = await response.json();
      if (data.success) {
        setSearchResults(data.results);
      }
    } catch (error) {
      console.error('Error searching anime:', error);
    }
  };

  const fetchAnimeInfo = async (animeId) => {
    try {
      const response = await fetch(`${API_BASE}/info?id=${animeId}`);
      const data = await response.json();
      if (data.success) {
        setAnimeInfo(data.results);
        fetchEpisodes(animeId);
      }
    } catch (error) {
      console.error('Error fetching anime info:', error);
    }
  };

  const fetchEpisodes = async (animeId) => {
    try {
      const response = await fetch(`${API_BASE}/episodes/${animeId}`);
      const data = await response.json();
      if (data.success) {
        setEpisodes(data.results.episodes || []);
      }
    } catch (error) {
      console.error('Error fetching episodes:', error);
    }
  };

  const fetchStreamData = async (episodeId, server = 'hd-1', type = 'sub') => {
    try {
      const response = await fetch(`${API_BASE}/stream?id=${episodeId}&server=${server}&type=${type}`);
      const data = await response.json();
      if (data.success) {
        setStreamData(data.results);
        setSelectedServer(server);
      }
    } catch (error) {
      console.error('Error fetching stream data:', error);
    }
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const navigateTo = (page) => {
    setCurrentPage(page);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAnimeClick = (anime) => {
    setSelectedAnime(anime);
    fetchAnimeInfo(anime.id);
    setCurrentPage('info');
  };

  const handleEpisodeClick = (episode) => {
    setCurrentEpisode(episode);
    fetchStreamData(episode.id);
    setCurrentPage('watch');
  };

  const handleLogin = (user) => {
    setIsLoggedIn(true);
    setUsername(user);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setBookmarks([]);
    setFavorites([]);
    setWatchlist([]);
    localStorage.removeItem('ongaku_user');
  };

  const toggleBookmark = (anime) => {
    if (bookmarks.find(b => b.id === anime.id)) {
      setBookmarks(bookmarks.filter(b => b.id !== anime.id));
    } else {
      setBookmarks([...bookmarks, anime]);
    }
  };

  const toggleFavorite = (anime) => {
    if (favorites.find(f => f.id === anime.id)) {
      setFavorites(favorites.filter(f => f.id !== anime.id));
    } else {
      setFavorites([...favorites, anime]);
    }
  };

  const addToWatchlist = (anime) => {
    if (!watchlist.find(w => w.id === anime.id)) {
      setWatchlist([...watchlist, anime]);
    }
  };

  // COMPONENTS
  const AnimeCard = ({ anime, size = 'normal' }) => (
    <div className="anime-card" onClick={() => handleAnimeClick(anime)}>
      <div className="anime-poster">
        <img src={anime.poster} alt={anime.title} />
        <div className="anime-overlay">
          <Play size={size === 'large' ? 60 : 40} />
        </div>
      </div>
      <div className="anime-details">
        <h3>{anime.title}</h3>
        {anime.tvInfo && (
          <div className="anime-meta">
            <span>{anime.tvInfo.showType}</span>
            {anime.tvInfo.sub && <span>SUB: {anime.tvInfo.sub}</span>}
            {anime.tvInfo.dub && <span>DUB: {anime.tvInfo.dub}</span>}
          </div>
        )}
      </div>
      {isLoggedIn && (
        <div className="anime-actions">
          <button onClick={(e) => { e.stopPropagation(); toggleBookmark(anime); }}>
            {bookmarks.find(b => b.id === anime.id) ? <Bookmark fill="currentColor" size={16} /> : <Bookmark size={16} />}
          </button>
          <button onClick={(e) => { e.stopPropagation(); toggleFavorite(anime); }}>
            {favorites.find(f => f.id === anime.id) ? <Star fill="currentColor" size={16} /> : <Star size={16} />}
          </button>
          <button onClick={(e) => { e.stopPropagation(); addToWatchlist(anime); }}>
            {watchlist.find(w => w.id === anime.id) ? <Check size={16} /> : <Plus size={16} />}
          </button>
        </div>
      )}
    </div>
  );

  const VideoPlayer = () => {
    if (!streamData || !streamData.streamingLink || !streamData.streamingLink[0]) {
      return <div className="video-placeholder">Loading stream...</div>;
    }

    const stream = streamData.streamingLink[0];
    
    return (
      <div className="video-container">
        <div className="watermark">音楽子</div>
        <video
          controls
          autoPlay
          className="video-player"
          src={stream.link?.file}
        >
          {stream.tracks && stream.tracks.map((track, idx) => (
            <track
              key={idx}
              kind={track.kind}
              label={track.label}
              src={track.file}
              default={track.default}
            />
          ))}
        </video>
        {streamData.servers && streamData.servers.length > 1 && (
          <div className="server-selector">
            <span>Servers:</span>
            {streamData.servers.map((server) => (
              <button
                key={server.server_id}
                className={`server-btn ${selectedServer === server.server_name ? 'active' : ''}`}
                onClick={() => fetchStreamData(currentEpisode.id, server.server_name, server.type)}
              >
                {server.server_name}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  // PAGES
  const HomePage = () => (
    <div className="home-page">
      {/* Hero/Spotlight */}
      {homeData?.spotlights && homeData.spotlights.length > 0 && (
        <section className="spotlight-section">
          <div className="spotlight-card" style={{backgroundImage: `url(${homeData.spotlights[0].poster})`}}>
            <div className="spotlight-overlay">
              <div className="spotlight-content">
                <h1>{homeData.spotlights[0].title}</h1>
                <p>{homeData.spotlights[0].description}</p>
                <div className="spotlight-buttons">
                  <button className="btn btn-primary" onClick={() => handleAnimeClick(homeData.spotlights[0])}>
                    <Play size={20} /> Watch Now
                  </button>
                  <button className="btn btn-secondary" onClick={() => navigateTo('browse')}>
                    Browse All
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Trending */}
      {homeData?.trending && homeData.trending.length > 0 && (
        <section className="anime-section">
          <h2><TrendingUp size={24} /> Trending Now</h2>
          <div className="anime-grid">
            {homeData.trending.slice(0, 12).map((anime) => (
              <AnimeCard key={anime.data_id} anime={anime} />
            ))}
          </div>
        </section>
      )}

      {/* Top Airing */}
      {homeData?.topAiring && homeData.topAiring.length > 0 && (
        <section className="anime-section">
          <h2><Calendar size={24} /> Top Airing</h2>
          <div className="anime-grid">
            {homeData.topAiring.slice(0, 12).map((anime) => (
              <AnimeCard key={anime.data_id} anime={anime} />
            ))}
          </div>
        </section>
      )}

      {/* Most Popular */}
      {homeData?.mostPopular && homeData.mostPopular.length > 0 && (
        <section className="anime-section">
          <h2><Star size={24} /> Most Popular</h2>
          <div className="anime-grid">
            {homeData.mostPopular.slice(0, 12).map((anime) => (
              <AnimeCard key={anime.data_id} anime={anime} />
            ))}
          </div>
        </section>
      )}

      {/* Latest Episodes */}
      {homeData?.latestEpisode && homeData.latestEpisode.length > 0 && (
        <section className="anime-section">
          <h2><Clock size={24} /> Latest Episodes</h2>
          <div className="anime-grid">
            {homeData.latestEpisode.slice(0, 12).map((anime) => (
              <AnimeCard key={anime.data_id} anime={anime} />
            ))}
          </div>
        </section>
      )}
    </div>
  );

  const BrowsePage = () => (
    <div className="browse-page">
      <div className="search-section">
        <h1>Browse Anime</h1>
        <div className="search-bar">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search anime..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchAnime(searchQuery)}
          />
          <button onClick={() => searchAnime(searchQuery)}>Search</button>
        </div>
      </div>

      {isLoggedIn && (
        <div className="collections">
          <button className="collection-btn" onClick={() => navigateTo('bookmarks')}>
            <Bookmark size={18} /> Bookmarks ({bookmarks.length})
          </button>
          <button className="collection-btn" onClick={() => navigateTo('favorites')}>
            <Star size={18} /> Favorites ({favorites.length})
          </button>
          <button className="collection-btn" onClick={() => navigateTo('watchlist')}>
            <List size={18} /> Watchlist ({watchlist.length})
          </button>
        </div>
      )}

      {searchResults.length > 0 ? (
        <section className="anime-section">
          <h2>Search Results</h2>
          <div className="anime-grid">
            {searchResults.map((anime) => (
              <AnimeCard key={anime.data_id} anime={anime} />
            ))}
          </div>
        </section>
      ) : homeData?.mostPopular ? (
        <section className="anime-section">
          <h2>Popular Anime</h2>
          <div className="anime-grid">
            {homeData.mostPopular.map((anime) => (
              <AnimeCard key={anime.data_id} anime={anime} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );

  const InfoPage = () => {
    if (!animeInfo) return <div className="loading">Loading...</div>;

    return (
      <div className="info-page">
        <button className="back-btn" onClick={() => navigateTo('browse')}>
          <ArrowLeft size={20} /> Back
        </button>
        
        <div className="info-header">
          <img src={animeInfo.data.poster} alt={animeInfo.data.title} className="info-poster" />
          <div className="info-content">
            <h1>{animeInfo.data.title}</h1>
            <p className="japanese-title">{animeInfo.data.japanese_title}</p>
            
            {isLoggedIn && (
              <div className="info-actions">
                <button 
                  className={bookmarks.find(b => b.id === animeInfo.data.id) ? 'active' : ''}
                  onClick={() => toggleBookmark(animeInfo.data)}
                >
                  <Bookmark size={20} /> Bookmark
                </button>
                <button 
                  className={favorites.find(f => f.id === animeInfo.data.id) ? 'active' : ''}
                  onClick={() => toggleFavorite(animeInfo.data)}
                >
                  <Star size={20} /> Favorite
                </button>
                <button 
                  className={watchlist.find(w => w.id === animeInfo.data.id) ? 'active' : ''}
                  onClick={() => addToWatchlist(animeInfo.data)}
                >
                  <Plus size={20} /> Watchlist
                </button>
              </div>
            )}

            <div className="info-meta">
              {animeInfo.data.animeInfo && Object.entries(animeInfo.data.animeInfo).map(([key, value]) => (
                <div key={key} className="meta-item">
                  <strong>{key}:</strong> <span>{typeof value === 'object' ? JSON.stringify(value) : value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {episodes.length > 0 && (
          <section className="episodes-section">
            <h2>Episodes ({episodes.length})</h2>
            <div className="episodes-grid">
              {episodes.map((ep) => (
                <button
                  key={ep.episode_no}
                  className="episode-btn"
                  onClick={() => handleEpisodeClick(ep)}
                >
                  <Play size={16} /> Episode {ep.episode_no}
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    );
  };

  const WatchPage = () => {
    if (!currentEpisode) return <div className="loading">Loading...</div>;

    return (
      <div className="watch-page">
        <button className="back-btn" onClick={() => navigateTo('info')}>
          <ArrowLeft size={20} /> Back to Info
        </button>
        
        <VideoPlayer />
        
        <div className="watch-info">
          <h2>{currentEpisode.title || 'Episode ' + currentEpisode.episode_no}</h2>
          <p>{currentEpisode.japanese_title}</p>
        </div>

        {episodes.length > 0 && (
          <section className="episodes-section">
            <h3>All Episodes</h3>
            <div className="episodes-grid">
              {episodes.map((ep) => (
                <button
                  key={ep.episode_no}
                  className={`episode-btn ${currentEpisode.episode_no === ep.episode_no ? 'active' : ''}`}
                  onClick={() => handleEpisodeClick(ep)}
                >
                  EP {ep.episode_no}
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    );
  };

  const LoginPage = () => {
    const [loginUsername, setLoginUsername] = useState('');

    const handleSubmit = (e) => {
      e.preventDefault();
      if (loginUsername.trim()) {
        handleLogin(loginUsername.trim());
        navigateTo('browse');
      }
    };

    return (
      <div className="login-page">
        <div className="login-card">
          <h2>Login to 音楽子</h2>
          <p>Enter your username to access personalized features</p>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Username"
              value={loginUsername}
              onChange={(e) => setLoginUsername(e.target.value)}
              className="login-input"
              required
            />
            <button type="submit" className="btn btn-primary btn-large">
              <LogIn size={20} /> Login
            </button>
          </form>
        </div>
      </div>
    );
  };

  const CollectionPage = ({ type }) => {
    let items = [];
    let title = '';
    let icon = null;

    switch(type) {
      case 'bookmarks':
        items = bookmarks;
        title = 'Bookmarks';
        icon = <Bookmark size={32} />;
        break;
      case 'favorites':
        items = favorites;
        title = 'Favorites';
        icon = <Star size={32} />;
        break;
      case 'watchlist':
        items = watchlist;
        title = 'Watchlist';
        icon = <List size={32} />;
        break;
    }

    return (
      <div className="collection-page">
        <button className="back-btn" onClick={() => navigateTo('browse')}>
          <ArrowLeft size={20} /> Back
        </button>
        <div className="collection-header">
          {icon}
          <h2>{title}</h2>
          <p>{items.length} items</p>
        </div>
        {items.length > 0 ? (
          <div className="anime-grid">
            {items.map(anime => <AnimeCard key={anime.id} anime={anime} />)}
          </div>
        ) : (
          <div className="empty-state">
            <p>No items in your {title.toLowerCase()} yet!</p>
          </div>
        )}
      </div>
    );
  };

  const DeveloperPage = () => (
    <section className="developer-section">
      <div className="developer-card">
        <img 
          src="https://cdn.discordapp.com/avatars/937380760875302974/c9dfc77b5e063a7a1e355004df534838.png?size=4096" 
          alt="prayag.cake"
          className="developer-avatar"
        />
        <h2>prayag.cake</h2>
        <p className="developer-role">Lead Developer</p>
        <p className="developer-bio">
          Passionate developer creating the ultimate anime streaming experience with 音楽子.
        </p>
        <div className="developer-links">
          <a href="https://github.com/dev-prayag" className="btn btn-secondary" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          <a href="https://discord.gg/WAQfU8U7HZ" className="btn btn-secondary" target="_blank" rel="noopener noreferrer">
            Discord
          </a>
        </div>
      </div>
    </section>
  );

  const TermsPage = () => (
    <section className="terms-section">
      <h2>Terms and Conditions</h2>
      <div className="terms-content">
        <h3>1. Content Disclaimer</h3>
        <p>音楽子 does not host any files. All content is linked from third-party services.</p>
        
        <h3>2. Educational Purpose</h3>
        <p>This platform is for educational purposes only. We are not responsible for misuse.</p>
        
        <h3>3. User Accounts</h3>
        <p>Create a simple account with just a username. Your data is stored locally.</p>
        
        <h3>4. Copyright</h3>
        <p>All anime content belongs to their respective copyright holders.</p>
      </div>
    </section>
  );

  if (loading) {
    return (
      <div className="loading-screen">
        <h1 className="loading-text">音楽子</h1>
        <style>{`
          .loading-screen {
            position: fixed;
            inset: 0;
            background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
          }
          .loading-text {
            font-size: 5rem;
            font-weight: 800;
            background: linear-gradient(135deg, #5eb3ff, #667eea);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: fadeSlideShake 2s ease-in-out infinite;
          }
          @keyframes fadeSlideShake {
            0% { opacity: 0; transform: translateX(-50px) rotate(0deg); }
            25% { opacity: 1; transform: translateX(0) rotate(2deg); }
            50% { transform: translateX(0) rotate(-2deg); }
            75% { transform: translateX(0) rotate(1deg); }
            100% { opacity: 0; transform: translateX(50px) rotate(0deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className={`app ${theme}`}>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        .app {
          min-height: 100vh;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          transition: background 0.3s, color 0.3s;
        }
        
        .app.light {
          --bg: #ffffff;
          --bg-sec: #f0f7ff;
          --card: #ffffff;
          --text: #1a1a1a;
          --text-sec: #6c757d;
          --accent: #5eb3ff;
          --border: #cfe2f3;
          --shadow: rgba(0,0,0,0.1);
        }
        
        .app.dark {
          --bg: #0a0e27;
          --bg-sec: #111827;
          --card: #1f2937;
          --text: #f9fafb;
          --text-sec: #9ca3af;
          --accent: #5eb3ff;
          --border: #2d3748;
          --shadow: rgba(0,0,0,0.3);
        }
        
        .app { background: var(--bg); color: var(--text); }
        
        /* Navbar */
        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: var(--card);
          border-bottom: 1px solid var(--border);
          padding: 1rem 2rem;
          z-index: 1000;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .nav-brand {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .nav-links {
          display: flex;
          gap: 2rem;
          align-items: center;
        }
        
        .nav-link {
          color: var(--text-sec);
          cursor: pointer;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: color 0.2s;
        }
        
        .nav-link:hover, .nav-link.active { color: var(--accent); }
        
        .theme-toggle {
          background: var(--bg-sec);
          border: none;
          padding: 0.5rem;
          border-radius: 0.5rem;
          color: var(--accent);
          cursor: pointer;
          display: flex;
          align-items: center;
        }
        
        .menu-toggle { display: none; }
        
        /* Main Content */
        main { margin-top: 70px; min-height: calc(100vh - 70px); }
        
        /* Home Page */
        .home-page { padding: 2rem; }
        
        .spotlight-section {
          margin-bottom: 3rem;
          border-radius: 1rem;
          overflow: hidden;
        }
        
        .spotlight-card {
          height: 500px;
          background-size: cover;
          background-position: center;
          position: relative;
        }
        
        .spotlight-overlay {
          background: linear-gradient(to top, rgba(0,0,0,0.9), transparent);
          height: 100%;
          display: flex;
          align-items: flex-end;
          padding: 3rem;
        }
        
        .spotlight-content h1 {
          font-size: 3rem;
          margin-bottom: 1rem;
        }
        
        .spotlight-content p {
          max-width: 600px;
          margin-bottom: 2rem;
          line-height: 1.6;
        }
        
        .spotlight-buttons {
          display: flex;
          gap: 1rem;
        }
        
        /* Anime Section */
        .anime-section {
          margin-bottom: 3rem;
        }
        
        .anime-section h2 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          font-size: 1.75rem;
        }
        
        .anime-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1.5rem;
        }
        
        .anime-card {
          background: var(--card);
          border-radius: 0.75rem;
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.3s, box-shadow 0.3s;
          border: 1px solid var(--border);
        }
        
        .anime-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px var(--shadow);
        }
        
        .anime-poster {
          position: relative;
          height: 280px;
          overflow: hidden;
        }
        
        .anime-poster img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .anime-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s;
          color: white;
        }
        
        .anime-card:hover .anime-overlay { opacity: 1; }
        
        .anime-details {
          padding: 1rem;
        }
        
        .anime-details h3 {
          font-size: 1rem;
          margin-bottom: 0.5rem;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .anime-meta {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          font-size: 0.875rem;
          color: var(--text-sec);
        }
        
        .anime-actions {
          display: flex;
          gap: 0.5rem;
          padding: 0 1rem 1rem;
        }
        
        .anime-actions button {
          background: var(--bg-sec);
          border: 1px solid var(--border);
          padding: 0.5rem;
          border-radius: 0.5rem;
          color: var(--text);
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .anime-actions button:hover {
          background: var(--accent);
          color: white;
        }
        
        /* Browse Page */
        .browse-page { padding: 2rem; }
        
        .search-section {
          text-align: center;
          margin-bottom: 2rem;
        }
        
        .search-section h1 {
          font-size: 3rem;
          margin-bottom: 1.5rem;
        }
        
        .search-bar {
          display: flex;
          max-width: 600px;
          margin: 0 auto;
          background: var(--card);
          border: 2px solid var(--border);
          border-radius: 0.75rem;
          padding: 0.75rem 1rem;
          gap: 0.75rem;
          align-items: center;
        }
        
        .search-bar input {
          flex: 1;
          border: none;
          background: transparent;
          color: var(--text);
          font-size: 1rem;
          outline: none;
        }
        
        .search-bar button {
          background: var(--accent);
          color: white;
          border: none;
          padding: 0.5rem 1.5rem;
          border-radius: 0.5rem;
          cursor: pointer;
          font-weight: 600;
        }
        
        .collections {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }
        
        .collection-btn {
          background: var(--card);
          border: 2px solid var(--border);
          padding: 0.75rem 1.5rem;
          border-radius: 0.75rem;
          color: var(--text);
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s;
        }
        
        .collection-btn:hover {
          border-color: var(--accent);
          color: var(--accent);
        }
        
        /* Info Page */
        .info-page { padding: 2rem; max-width: 1400px; margin: 0 auto; }
        
        .back-btn {
          background: var(--card);
          border: 2px solid var(--border);
          padding: 0.75rem 1.5rem;
          border-radius: 0.75rem;
          color: var(--text);
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 2rem;
          transition: all 0.3s;
        }
        
        .back-btn:hover {
          border-color: var(--accent);
          color: var(--accent);
        }
        
        .info-header {
          display: flex;
          gap: 2rem;
          margin-bottom: 3rem;
          background: var(--card);
          padding: 2rem;
          border-radius: 1rem;
          border: 1px solid var(--border);
        }
        
        .info-poster {
          width: 300px;
          height: 420px;
          object-fit: cover;
          border-radius: 0.75rem;
          flex-shrink: 0;
        }
        
        .info-content {
          flex: 1;
        }
        
        .info-content h1 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
        }
        
        .japanese-title {
          color: var(--text-sec);
          font-size: 1.25rem;
          margin-bottom: 1.5rem;
        }
        
        .info-actions {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }
        
        .info-actions button {
          background: var(--bg-sec);
          border: 2px solid var(--border);
          padding: 0.75rem 1.5rem;
          border-radius: 0.75rem;
          color: var(--text);
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s;
        }
        
        .info-actions button:hover {
          border-color: var(--accent);
          color: var(--accent);
        }
        
        .info-actions button.active {
          background: var(--accent);
          color: white;
          border-color: var(--accent);
        }
        
        .info-meta {
          display: grid;
          gap: 1rem;
        }
        
        .meta-item {
          display: flex;
          gap: 0.5rem;
        }
        
        .meta-item strong {
          min-width: 120px;
          color: var(--text);
        }
        
        .meta-item span {
          color: var(--text-sec);
        }
        
        /* Episodes Section */
        .episodes-section {
          background: var(--card);
          padding: 2rem;
          border-radius: 1rem;
          border: 1px solid var(--border);
        }
        
        .episodes-section h2, .episodes-section h3 {
          margin-bottom: 1.5rem;
        }
        
        .episodes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 1rem;
        }
        
        .episode-btn {
          background: var(--bg-sec);
          border: 2px solid var(--border);
          padding: 1rem;
          border-radius: 0.75rem;
          color: var(--text);
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.3s;
        }
        
        .episode-btn:hover {
          border-color: var(--accent);
          color: var(--accent);
        }
        
        .episode-btn.active {
          background: var(--accent);
          color: white;
          border-color: var(--accent);
        }
        
        /* Watch Page */
        .watch-page { padding: 2rem; max-width: 1400px; margin: 0 auto; }
        
        .video-container {
          position: relative;
          background: #000;
          border-radius: 1rem;
          overflow: hidden;
          margin-bottom: 2rem;
        }
        
        .watermark {
          position: absolute;
          top: 20px;
          right: 20px;
          font-size: 1.5rem;
          font-weight: 800;
          color: rgba(255,255,255,0.3);
          z-index: 10;
          pointer-events: none;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        }
        
        .video-player {
          width: 100%;
          aspect-ratio: 16/9;
        }
        
        .video-placeholder {
          width: 100%;
          aspect-ratio: 16/9;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.5rem;
        }
        
        .server-selector {
          background: rgba(0,0,0,0.9);
          padding: 1rem;
          display: flex;
          gap: 1rem;
          align-items: center;
          flex-wrap: wrap;
        }
        
        .server-selector span {
          color: white;
          font-weight: 600;
        }
        
        .server-btn {
          background: rgba(255,255,255,0.1);
          border: 2px solid rgba(255,255,255,0.3);
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .server-btn:hover {
          background: rgba(255,255,255,0.2);
        }
        
        .server-btn.active {
          background: var(--accent);
          border-color: var(--accent);
        }
        
        .watch-info {
          background: var(--card);
          padding: 2rem;
          border-radius: 1rem;
          border: 1px solid var(--border);
          margin-bottom: 2rem;
        }
        
        .watch-info h2 {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }
        
        .watch-info p {
          color: var(--text-sec);
          font-size: 1.125rem;
        }
        
        /* Login Page */
        .login-page {
          padding: 8rem 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
        }
        
        .login-card {
          background: var(--card);
          padding: 3rem;
          border-radius: 2rem;
          border: 1px solid var(--border);
          max-width: 500px;
          width: 100%;
          text-align: center;
        }
        
        .login-card h2 {
          font-size: 2rem;
          margin-bottom: 1rem;
        }
        
        .login-card p {
          color: var(--text-sec);
          margin-bottom: 2rem;
        }
        
        .login-input {
          width: 100%;
          padding: 1rem;
          border: 2px solid var(--border);
          border-radius: 0.75rem;
          background: var(--bg-sec);
          color: var(--text);
          font-size: 1rem;
          margin-bottom: 1.5rem;
        }
        
        .login-input:focus {
          outline: none;
          border-color: var(--accent);
        }
        
        /* Collection Page */
        .collection-page { padding: 2rem; }
        
        .collection-header {
          text-align: center;
          margin-bottom: 3rem;
        }
        
        .collection-header h2 {
          font-size: 2.5rem;
          margin: 1rem 0 0.5rem;
        }
        
        .empty-state {
          text-align: center;
          padding: 4rem;
          color: var(--text-sec);
          font-size: 1.25rem;
        }
        
        /* Developer Page */
        .developer-section {
          padding: 6rem 2rem;
          min-height: 100vh;
        }
        
        .developer-card {
          background: var(--card);
          padding: 4rem;
          border-radius: 2rem;
          border: 1px solid var(--border);
          max-width: 600px;
          margin: 0 auto;
          text-align: center;
        }
        
        .developer-avatar {
          width: 200px;
          height: 200px;
          border-radius: 50%;
          margin: 0 auto 2rem;
          border: 6px solid var(--accent);
        }
        
        .developer-card h2 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
        }
        
        .developer-role {
          color: var(--accent);
          font-size: 1.25rem;
          margin-bottom: 1.5rem;
          font-weight: 600;
        }
        
        .developer-bio {
          color: var(--text-sec);
          margin-bottom: 2rem;
          line-height: 1.6;
        }
        
        .developer-links {
          display: flex;
          gap: 1rem;
          justify-content: center;
        }
        
        /* Terms Page */
        .terms-section {
          padding: 6rem 2rem;
          max-width: 1000px;
          margin: 0 auto;
        }
        
        .terms-section h2 {
          font-size: 3rem;
          margin-bottom: 2rem;
          text-align: center;
        }
        
        .terms-content {
          background: var(--card);
          padding: 3rem;
          border-radius: 1rem;
          border: 1px solid var(--border);
        }
        
        .terms-content h3 {
          font-size: 1.5rem;
          margin-bottom: 1rem;
          color: var(--accent);
        }
        
        .terms-content p {
          color: var(--text-sec);
          line-height: 1.8;
          margin-bottom: 2rem;
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
          background: linear-gradient(135deg, var(--accent), #667eea);
          color: white;
        }
        
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px var(--shadow);
        }
        
        .btn-secondary {
          background: var(--card);
          color: var(--text);
          border: 2px solid var(--border);
        }
        
        .btn-secondary:hover {
          border-color: var(--accent);
          color: var(--accent);
        }
        
        .btn-large {
          padding: 1.25rem 3rem;
          font-size: 1.125rem;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
          .menu-toggle {
            display: block;
            background: none;
            border: none;
            color: var(--text);
            cursor: pointer;
          }
          
          .nav-links {
            position: fixed;
            top: 70px;
            left: 0;
            right: 0;
            background: var(--card);
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
          
          .spotlight-card { height: 300px; }
          .spotlight-content h1 { font-size: 2rem; }
          .spotlight-buttons { flex-direction: column; }
          .btn { width: 100%; justify-content: center; }
          
          .anime-grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          }
          
          .info-header {
            flex-direction: column;
          }
          
          .info-poster {
            width: 100%;
            height: auto;
          }
          
          .episodes-grid {
            grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
          }
        }
        
        ::-webkit-scrollbar { width: 10px; }
        ::-webkit-scrollbar-track { background: var(--bg-sec); }
        ::-webkit-scrollbar-thumb { background: var(--accent); border-radius: 5px; }
      `}</style>

      <nav className="navbar">
        <div className="nav-brand" onClick={() => navigateTo('home')}>
          音楽子
        </div>
        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <span 
            className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
            onClick={() => navigateTo('home')}
          >
            <Home size={18} /> Home
          </span>
          <span 
            className={`nav-link ${currentPage === 'browse' || currentPage === 'info' || currentPage === 'watch' ? 'active' : ''}`}
            onClick={() => navigateTo('browse')}
          >
            <Film size={18} /> Browse
          </span>
          <span 
            className={`nav-link ${currentPage === 'developer' ? 'active' : ''}`}
            onClick={() => navigateTo('developer')}
          >
            <User size={18} /> Developer
          </span>
          <span 
            className={`nav-link ${currentPage === 'terms' ? 'active' : ''}`}
            onClick={() => navigateTo('terms')}
          >
            <FileText size={18} /> Terms
          </span>
          {isLoggedIn ? (
            <button className="btn btn-secondary" onClick={handleLogout}>
              <LogOut size={18} /> Logout
            </button>
          ) : (
            <button className="btn btn-primary" onClick={() => navigateTo('login')}>
              <LogIn size={18} /> Login
            </button>
          )}
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      <main>
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'browse' && <BrowsePage />}
        {currentPage === 'info' && <InfoPage />}
        {currentPage === 'watch' && <WatchPage />}
        {currentPage === 'login' && <LoginPage />}
        {currentPage === 'bookmarks' && <CollectionPage type="bookmarks" />}
        {currentPage === 'favorites' && <CollectionPage type="favorites" />}
        {currentPage === 'watchlist' && <CollectionPage type="watchlist" />}
        {currentPage === 'developer' && <DeveloperPage />}
        {currentPage === 'terms' && <TermsPage />}
      </main>
    </div>
  );
};

export default Ongaku;

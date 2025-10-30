import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Moon, Sun, Heart, Bookmark, ChevronUp, Play, Star, Clock, Calendar, TrendingUp, ArrowLeft, Settings, Maximize, Volume2, VolumeX, SkipForward, SkipBack } from 'lucide-react';

const API_BASE = 'https://hianime-api-1-h1kg.onrender.com/api/v1';

// API Cache with retry logic
const apiCache = new Map();
const fetchWithCache = async (url, retries = 2) => {
  if (apiCache.has(url)) {
    return apiCache.get(url);
  }

  let lastError;
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        apiCache.set(url, data);
        return data;
      }
      lastError = new Error('API returned unsuccessful response');
    } catch (err) {
      lastError = err;
      if (i < retries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }
  throw lastError;
};

const Ongaku = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [homeData, setHomeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [animeDetails, setAnimeDetails] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0);
  const [streamType, setStreamType] = useState('sub');
  const [server, setServer] = useState('vidWish');
  const [likedAnimes, setLikedAnimes] = useState([]);
  const [bookmarkedAnimes, setBookmarkedAnimes] = useState([]);
  const [activeView, setActiveView] = useState('home');
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const iframeRef = useRef(null);

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

  useEffect(() => {
    if (selectedAnime && activeView === 'details') {
      fetchAnimeDetails(selectedAnime.id);
      fetchEpisodes(selectedAnime.id);
    }
  }, [selectedAnime, activeView]);

  const fetchHomeData = async () => {
    try {
      const data = await fetchWithCache(`${API_BASE}/home`);
      setHomeData(data.data);
    } catch (err) {
      console.error('Error fetching home data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnimeDetails = async (animeId) => {
    try {
      const data = await fetchWithCache(`${API_BASE}/anime/${animeId}`);
      setAnimeDetails(data.data);
    } catch (err) {
      console.error('Error fetching anime details:', err);
    }
  };

  const fetchEpisodes = async (animeId) => {
    try {
      const data = await fetchWithCache(`${API_BASE}/episodes/${animeId}`);
      setEpisodes(data.data);
    } catch (err) {
      console.error('Error fetching episodes:', err);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const data = await fetchWithCache(`${API_BASE}/search?keyword=${encodeURIComponent(searchQuery)}&page=1`);
      setSearchResults(data.data.response);
      setActiveView('search');
    } catch (err) {
      console.error('Error searching:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
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

  const handleEpisodeSelect = (episode, index) => {
    setSelectedEpisode(episode);
    setCurrentEpisodeIndex(index);
    setActiveView('watch');
  };

  const changeEpisode = (direction) => {
    const newIndex = direction === 'next' ? currentEpisodeIndex + 1 : currentEpisodeIndex - 1;
    if (newIndex >= 0 && newIndex < episodes.length) {
      setSelectedEpisode(episodes[newIndex]);
      setCurrentEpisodeIndex(newIndex);
    }
  };

  const getStreamUrl = () => {
    if (!selectedEpisode) return '';
    const episodeNum = selectedEpisode.id.split('ep=').pop();
    const baseUrl = server === 'vidWish' ? 'vidwish.live' : 'megaplay.buzz';
    return `https://${baseUrl}/stream/s-2/${episodeNum}/${streamType}`;
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
        <img src={anime.poster} alt={anime.title} loading="lazy" />
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
          <img src={anime.poster} alt={anime.title} loading="lazy" />
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

  const AnimeDetailsView = () => (
    <div className="anime-details">
      <button className="back-btn" onClick={() => setActiveView('home')}>
        <ArrowLeft size={20} /> Back
      </button>
      
      {animeDetails && (
        <div className="details-header">
          <img src={animeDetails.poster} alt={animeDetails.title} className="details-poster" loading="lazy" />
          <div className="details-info">
            <h1>{animeDetails.title}</h1>
            <p className="alternative-title">{animeDetails.alternativeTitle}</p>
            <div className="details-meta">
              <span className="rating">{animeDetails.rating}</span>
              <span>{animeDetails.type}</span>
              <span>{animeDetails.status}</span>
              <span><Star size={14} /> {animeDetails.MAL_score}</span>
            </div>
            <p className="synopsis">{animeDetails.synopsis}</p>
            <div className="genres">
              {animeDetails.genres?.map((genre, i) => (
                <span key={i} className="genre-tag">{genre}</span>
              ))}
            </div>
            <div className="action-buttons">
              <button 
                className={`action-btn ${likedAnimes.some(a => a.id === animeDetails.id) ? 'active' : ''}`}
                onClick={() => toggleLike(animeDetails)}
              >
                <Heart size={20} /> {likedAnimes.some(a => a.id === animeDetails.id) ? 'Liked' : 'Like'}
              </button>
              <button 
                className={`action-btn ${bookmarkedAnimes.some(a => a.id === animeDetails.id) ? 'active' : ''}`}
                onClick={() => toggleBookmark(animeDetails)}
              >
                <Bookmark size={20} /> {bookmarkedAnimes.some(a => a.id === animeDetails.id) ? 'Bookmarked' : 'Bookmark'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="episodes-section">
        <h2>Episodes ({episodes.length})</h2>
        <div className="episodes-grid">
          {episodes.map((ep, i) => (
            <div 
              key={i} 
              className="episode-card"
              onClick={() => handleEpisodeSelect(ep, i)}
            >
              <Play size={16} />
              <div className="episode-info">
                <span>Episode {i + 1}</span>
                {ep.title && <small>{ep.title}</small>}
                {ep.isFiller && <span className="filler-badge">Filler</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const WatchView = () => (
    <div className="watch-container">
      <button className="back-btn" onClick={() => setActiveView('details')}>
        <ArrowLeft size={20} /> Back to Episodes
      </button>

      <div className={`video-wrapper ${isTheaterMode ? 'theater-mode' : ''}`}>
        <div className="video-container">
          <iframe
            ref={iframeRef}
            src={getStreamUrl()}
            className="video-player"
            allowFullScreen
            allow="autoplay; encrypted-media; picture-in-picture"
          />
          
          <div className="video-overlay">
            <div className="overlay-top">
              <div className="episode-badge">
                Episode {currentEpisodeIndex + 1}
                {selectedEpisode?.isFiller && <span className="filler-tag">Filler</span>}
              </div>
              <div className="overlay-controls">
                <button onClick={() => setIsTheaterMode(!isTheaterMode)} title="Theater Mode">
                  <Maximize size={18} />
                </button>
                <button onClick={() => setShowSettings(!showSettings)} title="Settings">
                  <Settings size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="player-controls">
        <div className="control-section">
          <div className="control-label">Server</div>
          <div className="button-group">
            <button
              className={server === 'vidWish' ? 'active' : ''}
              onClick={() => setServer('vidWish')}
            >
              VidWish
            </button>
            <button
              className={server === 'megaPlay' ? 'active' : ''}
              onClick={() => setServer('megaPlay')}
            >
              MegaPlay
            </button>
          </div>
        </div>

        <div className="control-section">
          <div className="control-label">Audio</div>
          <div className="button-group">
            <button
              className={streamType === 'sub' ? 'active' : ''}
              onClick={() => setStreamType('sub')}
            >
              SUB
            </button>
            <button
              className={streamType === 'dub' ? 'active' : ''}
              onClick={() => setStreamType('dub')}
            >
              DUB
            </button>
          </div>
        </div>

        <div className="control-section">
          <div className="control-label">Episode</div>
          <div className="button-group">
            {currentEpisodeIndex > 0 && (
              <button onClick={() => changeEpisode('prev')} className="nav-btn">
                <SkipBack size={16} /> Previous
              </button>
            )}
            {currentEpisodeIndex < episodes.length - 1 && (
              <button onClick={() => changeEpisode('next')} className="nav-btn primary">
                Next <SkipForward size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="episode-info-card">
        <div className="info-row">
          <span className="label">Now Watching:</span>
          <span className="value">Episode {currentEpisodeIndex + 1} of {episodes.length}</span>
        </div>
        <div className="info-row">
          <span className="label">Server:</span>
          <span className="value">{server === 'vidWish' ? 'VidWish' : 'MegaPlay'}</span>
        </div>
        <div className="info-row">
          <span className="label">Audio:</span>
          <span className="value">{streamType.toUpperCase()}</span>
        </div>
      </div>

      <div className="episodes-list-compact">
        <h3>All Episodes</h3>
        <div className="episodes-compact-grid">
          {episodes.map((ep, i) => (
            <button
              key={i}
              className={`episode-btn ${i === currentEpisodeIndex ? 'active' : ''}`}
              onClick={() => handleEpisodeSelect(ep, i)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`app ${darkMode ? 'dark' : 'light'}`}>
      <nav className="navbar">
        <div className="nav-container">
          <h1 className="logo" onClick={() => setActiveView('home')}>音楽子</h1>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search anime..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button onClick={handleSearch} className="search-btn">
              <Search size={18} />
            </button>
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
            <button onClick={toggleTheme} className="theme-toggle">
              {darkMode ? <Sun size={22} /> : <Moon size={22} />}
            </button>
          </div>
        </div>
      </nav>

      <main className="main-content">
        {loading ? (
          <div className="loader-container">
            <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' stroke='%23667eea' stroke-width='8' fill='none' stroke-dasharray='63 188' stroke-linecap='round'%3E%3CanimateTransform attributeName='transform' type='rotate' repeatCount='indefinite' dur='1s' values='0 50 50;360 50 50' keyTimes='0;1'/%3E%3C/circle%3E%3C/svg%3E" alt="Loading..." className="loader" />
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

            {activeView === 'details' && <AnimeDetailsView />}
            {activeView === 'watch' && <WatchView />}
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
          white-space: nowrap;
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
          background: transparent;
          color: inherit;
          border: none;
          padding: 0.5rem;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .search-btn:hover {
          transform: scale(1.1);
        }

        .dark .search-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .light .search-btn:hover {
          background: rgba(0, 0, 0, 0.1);
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

        .anime-details {
          animation: fadeInUp 0.6s ease-out;
        }

        .back-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: transparent;
          border: 1px solid rgba(102, 126, 234, 0.5);
          color: inherit;
          padding: 0.75rem 1.5rem;
          border-radius: 50px;
          cursor: pointer;
          margin-bottom: 2rem;
          transition: all 0.3s ease;
        }

        .back-btn:hover {
          background: rgba(102, 126, 234, 0.1);
          transform: translateX(-5px);
        }

        .details-header {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 2rem;
          margin-bottom: 3rem;
        }

        .details-poster {
          width: 100%;
          border-radius: 12px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
        }

        .details-info h1 {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
        }

        .alternative-title {
          font-size: 1.2rem;
          opacity: 0.7;
          margin-bottom: 1rem;
        }

        .details-meta {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }

        .details-meta span {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 20px;
        }

        .dark .details-meta span {
          background: rgba(255, 255, 255, 0.1);
        }

        .light .details-meta span {
          background: rgba(0, 0, 0, 0.1);
        }

        .rating {
          background: #ef4444 !important;
          color: white !important;
          font-weight: bold;
        }

        .synopsis {
          line-height: 1.8;
          margin-bottom: 1.5rem;
        }

        .genres {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          margin-bottom: 1.5rem;
        }

        .genre-tag {
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.9rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .action-buttons {
          display: flex;
          gap: 1rem;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border-radius: 50px;
          border: 2px solid rgba(102, 126, 234, 0.5);
          background: transparent;
          color: inherit;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .action-btn:hover {
          background: rgba(102, 126, 234, 0.1);
          transform: translateY(-2px);
        }

        .action-btn.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-color: transparent;
        }

        .episodes-section {
          margin-top: 3rem;
        }

        .episodes-section h2 {
          font-size: 1.8rem;
          margin-bottom: 1.5rem;
        }

        .episodes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1rem;
          max-height: 60vh;
          overflow-y: auto;
          padding-right: 0.5rem;
        }

        .episodes-grid::-webkit-scrollbar {
          width: 6px;
        }

        .episodes-grid::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }

        .episodes-grid::-webkit-scrollbar-thumb {
          background: rgba(102, 126, 234, 0.5);
          border-radius: 10px;
        }

        .episode-card {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .dark .episode-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .light .episode-card {
          background: rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(0, 0, 0, 0.1);
        }

        .episode-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
        }

        .dark .episode-card:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .light .episode-card:hover {
          background: rgba(0, 0, 0, 0.1);
        }

        .episode-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .episode-info small {
          opacity: 0.7;
          font-size: 0.85rem;
        }

        .filler-badge {
          display: inline-block;
          background: #ef4444;
          color: white;
          padding: 0.15rem 0.5rem;
          border-radius: 10px;
          font-size: 0.7rem;
          font-weight: bold;
        }

        .watch-container {
          animation: fadeInUp 0.6s ease-out;
        }

        .video-wrapper {
          margin-bottom: 2rem;
        }

        .video-wrapper.theater-mode {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 200;
          background: #000;
          margin: 0;
        }

        .video-container {
          position: relative;
          width: 100%;
          aspect-ratio: 16/9;
          background: #000;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
        }

        .theater-mode .video-container {
          height: 100vh;
          border-radius: 0;
        }

        .video-player {
          width: 100%;
          height: 100%;
          border: none;
        }

        .video-overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .video-container:hover .video-overlay {
          opacity: 1;
        }

        .overlay-top {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          padding: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: linear-gradient(to bottom, rgba(0, 0, 0, 0.8), transparent);
          pointer-events: auto;
        }

        .episode-badge {
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(10px);
          padding: 0.5rem 1rem;
          border-radius: 20px;
          color: white;
          font-size: 0.9rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .filler-tag {
          background: #ef4444;
          padding: 0.15rem 0.5rem;
          border-radius: 10px;
          font-size: 0.75rem;
        }

        .overlay-controls {
          display: flex;
          gap: 0.5rem;
        }

        .overlay-controls button {
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(10px);
          border: none;
          padding: 0.5rem;
          border-radius: 50%;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .overlay-controls button:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: scale(1.1);
        }

        .player-controls {
          display: flex;
          flex-wrap: wrap;
          gap: 1.5rem;
          padding: 1.5rem;
          border-radius: 12px;
          margin-bottom: 1.5rem;
        }

        .dark .player-controls {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .light .player-controls {
          background: rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(0, 0, 0, 0.1);
        }

        .control-section {
          flex: 1;
          min-width: 200px;
        }

        .control-label {
          font-size: 0.9rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
          opacity: 0.7;
        }

        .button-group {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .button-group button {
          padding: 0.6rem 1.2rem;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 500;
          font-size: 0.9rem;
        }

        .dark .button-group button {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .light .button-group button {
          background: rgba(0, 0, 0, 0.1);
          color: #1a1a2e;
          border: 1px solid rgba(0, 0, 0, 0.1);
        }

        .button-group button:hover:not(:disabled) {
          transform: translateY(-2px);
        }

        .button-group button.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-color: transparent;
        }

        .button-group button:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .nav-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .nav-btn.primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
          color: white !important;
          border-color: transparent !important;
        }

        .episode-info-card {
          padding: 1.5rem;
          border-radius: 12px;
          margin-bottom: 1.5rem;
        }

        .dark .episode-info-card {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .light .episode-info-card {
          background: rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(0, 0, 0, 0.1);
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0;
        }

        .info-row:not(:last-child) {
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .label {
          opacity: 0.7;
          font-size: 0.9rem;
        }

        .value {
          font-weight: 600;
        }

        .episodes-list-compact {
          padding: 1.5rem;
          border-radius: 12px;
        }

        .dark .episodes-list-compact {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .light .episodes-list-compact {
          background: rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(0, 0, 0, 0.1);
        }

        .episodes-list-compact h3 {
          margin-bottom: 1rem;
          font-size: 1.2rem;
        }

        .episodes-compact-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
          gap: 0.5rem;
          max-height: 40vh;
          overflow-y: auto;
          padding-right: 0.5rem;
        }

        .episodes-compact-grid::-webkit-scrollbar {
          width: 6px;
        }

        .episodes-compact-grid::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }

        .episodes-compact-grid::-webkit-scrollbar-thumb {
          background: rgba(102, 126, 234, 0.5);
          border-radius: 10px;
        }

        .episode-btn {
          padding: 0.75rem;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .dark .episode-btn {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .light .episode-btn {
          background: rgba(0, 0, 0, 0.1);
          color: #1a1a2e;
          border: 1px solid rgba(0, 0, 0, 0.1);
        }

        .episode-btn:hover {
          transform: scale(1.05);
        }

        .episode-btn.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-color: transparent;
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
          z-index: 90;
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
          width: 80px;
          height: 80px;
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(0.95);
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

          .spotlight-content {
            padding: 2rem;
          }

          .spotlight-content h2 {
            font-size: 1.5rem;
          }

          .anime-grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 1rem;
          }

          .details-header {
            grid-template-columns: 1fr;
          }

          .details-poster {
            max-width: 300px;
            margin: 0 auto;
          }

          .details-info h1 {
            font-size: 1.8rem;
          }

          .player-controls {
            flex-direction: column;
            gap: 1rem;
          }

          .episodes-compact-grid {
            grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
          }

          .episodes-grid {
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          }
        }
      `}</style>
    </div>
  );
};

export default Ongaku;

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Search, Moon, Sun, Heart, Bookmark, ChevronUp, Play, Star, Clock, Calendar, TrendingUp, ArrowLeft, Settings, Maximize, Volume2, VolumeX, SkipForward, SkipBack, ChevronLeft, ChevronRight, History } from 'lucide-react';

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
  const [watchHistory, setWatchHistory] = useState([]);
  const [activeView, setActiveView] = useState('home');
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [currentSpotlightIndex, setCurrentSpotlightIndex] = useState(0);
  const [autoScrollInterval, setAutoScrollInterval] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [shouldReloadPlayer, setShouldReloadPlayer] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [letterAnimes, setLetterAnimes] = useState([]);
  const [isLandscape, setIsLandscape] = useState(false);
  const iframeRef = useRef(null);
  const spotlightRef = useRef(null);
  const playerUrlRef = useRef('');

  // Check if device is in landscape mode
  useEffect(() => {
    const checkOrientation = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };
    
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  // Initialize from URL on first load
  useEffect(() => {
    if (!isInitialized) {
      const path = window.location.pathname;
      
      if (path === '/' || path === '/home') {
        setActiveView('home');
      } else if (path.startsWith('/anime/')) {
        const pathParts = path.split('/');
        if (pathParts.length >= 4) {
          const animeId = pathParts[2];
          const epNumber = pathParts[3];
          // Fetch anime details and set episode
          fetchAnimeDetails(animeId).then((animeData) => {
            if (animeData) {
              setSelectedAnime(animeData);
              fetchEpisodes(animeId).then((epData) => {
                if (epData && epData.length > 0) {
                  const episodeIndex = parseInt(epNumber) - 1;
                  if (episodeIndex >= 0 && episodeIndex < epData.length) {
                    handleEpisodeSelect(epData[episodeIndex], episodeIndex);
                  }
                }
              });
            }
          });
        }
      } else if (path === '/liked') {
        setActiveView('liked');
      } else if (path === '/bookmarked') {
        setActiveView('bookmarked');
      }
      
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // Update URL when view changes, but only after initialization
  useEffect(() => {
    if (isInitialized) {
      const path = window.location.pathname;
      let newPath = '/';
      
      if (activeView === 'home') {
        newPath = '/home';
      } else if (activeView === 'watch' && selectedAnime && selectedEpisode) {
        const epNumber = currentEpisodeIndex + 1;
        newPath = `/anime/${selectedAnime.id}/${epNumber}`;
      } else if (activeView === 'liked') {
        newPath = '/liked';
      } else if (activeView === 'bookmarked') {
        newPath = '/bookmarked';
      }
      
      if (path !== newPath) {
        window.history.pushState(null, null, newPath);
      }
    }
  }, [activeView, selectedAnime, selectedEpisode, currentEpisodeIndex, isInitialized]);

  useEffect(() => {
    const liked = JSON.parse(localStorage.getItem('likedAnimes') || '[]');
    const bookmarked = JSON.parse(localStorage.getItem('bookmarkedAnimes') || '[]');
    const history = JSON.parse(localStorage.getItem('watchHistory') || '[]');
    setLikedAnimes(liked);
    setBookmarkedAnimes(bookmarked);
    setWatchHistory(history);
    fetchHomeData();
  }, []);

  useEffect(() => {
    // Auto-scroll spotlight
    if (homeData?.spotlight && homeData.spotlight.length > 0) {
      const interval = setInterval(() => {
        setCurrentSpotlightIndex((prevIndex) => 
          (prevIndex + 1) % homeData.spotlight.length
        );
      }, 5000);
      setAutoScrollInterval(interval);
      
      return () => clearInterval(interval);
    }
  }, [homeData]);

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
      return data.data;
    } catch (err) {
      console.error('Error fetching anime details:', err);
      return null;
    }
  };

  const fetchEpisodes = async (animeId) => {
    try {
      const data = await fetchWithCache(`${API_BASE}/episodes/${animeId}`);
      setEpisodes(data.data);
      return data.data;
    } catch (err) {
      console.error('Error fetching episodes:', err);
      return [];
    }
  };

  const fetchAnimesByLetter = async (letter) => {
    if (!letter) return;
    
    setLoading(true);
    try {
      // This is a mock implementation since the API might not have this endpoint
      // In a real app, you would call the actual API endpoint
      const allAnimes = [
        ...homeData?.trending || [],
        ...homeData?.mostPopular || [],
        ...homeData?.newAdded || []
      ];
      
      const filtered = allAnimes.filter(anime => 
        anime.title && anime.title.toLowerCase().startsWith(letter.toLowerCase())
      );
      
      setLetterAnimes(filtered);
      setActiveView('letter');
    } catch (err) {
      console.error('Error fetching animes by letter:', err);
    } finally {
      setLoading(false);
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
    setShouldReloadPlayer(true);
    
    // Add to watch history
    const historyItem = {
      anime: animeDetails,
      episode: episode,
      episodeIndex: index,
      timestamp: new Date().toISOString()
    };
    
    const updatedHistory = [
      historyItem,
      ...watchHistory.filter(item => 
        !(item.anime.id === animeDetails.id && item.episodeIndex === index)
      )
    ].slice(0, 20); // Keep only last 20 items
    
    setWatchHistory(updatedHistory);
    localStorage.setItem('watchHistory', JSON.stringify(updatedHistory));
  };

  const changeEpisode = (direction) => {
    const newIndex = direction === 'next' ? currentEpisodeIndex + 1 : currentEpisodeIndex - 1;
    if (newIndex >= 0 && newIndex < episodes.length) {
      setSelectedEpisode(episodes[newIndex]);
      setCurrentEpisodeIndex(newIndex);
      setShouldReloadPlayer(true);
      
      // Add to watch history
      const historyItem = {
        anime: animeDetails,
        episode: episodes[newIndex],
        episodeIndex: newIndex,
        timestamp: new Date().toISOString()
      };
      
      const updatedHistory = [
        historyItem,
        ...watchHistory.filter(item => 
          !(item.anime.id === animeDetails.id && item.episodeIndex === newIndex)
        )
      ].slice(0, 20); // Keep only last 20 items
      
      setWatchHistory(updatedHistory);
      localStorage.setItem('watchHistory', JSON.stringify(updatedHistory));
    }
  };

  const changeStreamType = (type) => {
    setStreamType(type);
    setShouldReloadPlayer(true);
  };

  const changeServer = (serverName) => {
    setServer(serverName);
    setShouldReloadPlayer(true);
  };

  // Memoize the stream URL to prevent unnecessary recalculations
  const streamUrl = useMemo(() => {
    if (!selectedEpisode) return '';
    const episodeNum = selectedEpisode.id.split('ep=').pop();
    const baseUrl = server === 'vidWish' ? 'vidwish.live' : 'megaplay.buzz';
    return `https://${baseUrl}/stream/s-2/${episodeNum}/${streamType}`;
  }, [selectedEpisode, server, streamType]);

  // Update player URL ref to prevent unnecessary reloads
  useEffect(() => {
    if (playerUrlRef.current !== streamUrl) {
      playerUrlRef.current = streamUrl;
      setShouldReloadPlayer(true);
    }
  }, [streamUrl]);

  const handleSpotlightNav = (direction) => {
    if (!homeData?.spotlight) return;
    
    // Clear auto-scroll interval when manually navigating
    if (autoScrollInterval) {
      clearInterval(autoScrollInterval);
      setAutoScrollInterval(null);
      
      // Restart auto-scroll after 10 seconds of inactivity
      const newInterval = setInterval(() => {
        setCurrentSpotlightIndex((prevIndex) => 
          (prevIndex + 1) % homeData.spotlight.length
        );
      }, 5000);
      setAutoScrollInterval(newInterval);
    }
    
    if (direction === 'next') {
      setCurrentSpotlightIndex((prevIndex) => 
        (prevIndex + 1) % homeData.spotlight.length
      );
    } else {
      setCurrentSpotlightIndex((prevIndex) => 
        prevIndex === 0 ? homeData.spotlight.length - 1 : prevIndex - 1
      );
    }
  };

  const handleSpotlightDotClick = (index) => {
    // Clear auto-scroll interval when manually navigating
    if (autoScrollInterval) {
      clearInterval(autoScrollInterval);
      setAutoScrollInterval(null);
      
      // Restart auto-scroll after 10 seconds of inactivity
      const newInterval = setInterval(() => {
        setCurrentSpotlightIndex((prevIndex) => 
          (prevIndex + 1) % homeData.spotlight.length
        );
      }, 5000);
      setAutoScrollInterval(newInterval);
    }
    
    setCurrentSpotlightIndex(index);
  };

  const handleLetterClick = (letter) => {
    setSelectedLetter(letter);
    fetchAnimesByLetter(letter);
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

  const SpotlightSection = () => {
    if (!homeData?.spotlight || homeData.spotlight.length === 0) return null;
    
    return (
      <div className="spotlight-section" ref={spotlightRef}>
        <div className="spotlight-container">
          <button 
            className="spotlight-nav spotlight-nav-prev" 
            onClick={() => handleSpotlightNav('prev')}
          >
            <ChevronLeft size={24} />
          </button>
          
          <div className="spotlight-slider">
            {homeData.spotlight.map((anime, i) => (
              <div 
                key={i} 
                className={`spotlight-item ${i === currentSpotlightIndex ? 'active' : ''}`}
                style={{ 
                  transform: `translateX(${(i - currentSpotlightIndex) * 100}%)`,
                  opacity: i === currentSpotlightIndex ? 1 : 0
                }}
              >
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
          
          <button 
            className="spotlight-nav spotlight-nav-next" 
            onClick={() => handleSpotlightNav('next')}
          >
            <ChevronRight size={24} />
          </button>
        </div>
        
        <div className="spotlight-dots">
          {homeData.spotlight.map((_, i) => (
            <button 
              key={i} 
              className={`spotlight-dot ${i === currentSpotlightIndex ? 'active' : ''}`}
              onClick={() => handleSpotlightDotClick(i)}
            />
          ))}
        </div>
      </div>
    );
  };

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
    <div className={`watch-container ${isLandscape ? 'landscape' : ''}`}>
      {/* Player info bar above the video */}
      <div className="player-info-bar">
        <div className="episode-info">
          <span className="episode-number">{animeDetails?.title || 'Anime'}/Episode {currentEpisodeIndex + 1}</span>
          <span className="episode-title">{selectedEpisode?.title}</span>
        </div>
        <div className="player-actions">
          <button 
            onClick={() => toggleLike(animeDetails)}
            className={likedAnimes.some(a => a.id === animeDetails?.id) ? 'active' : ''}
            title="Like"
          >
            <Heart size={18} />
          </button>
          <button 
            onClick={() => toggleBookmark(animeDetails)}
            className={bookmarkedAnimes.some(a => a.id === animeDetails?.id) ? 'active' : ''}
            title="Bookmark"
          >
            <Bookmark size={18} />
          </button>
        </div>
      </div>

      <div className={`video-wrapper ${isTheaterMode ? 'theater-mode' : ''} ${isLandscape ? 'landscape' : ''}`}>
        <div className="video-container">
          {selectedEpisode ? (
            <iframe
              key={shouldReloadPlayer ? 'reload' : 'keep'}
              ref={iframeRef}
              src={streamUrl}
              className="video-player"
              allowFullScreen
              allow="autoplay; encrypted-media; picture-in-picture"
              onLoad={() => setShouldReloadPlayer(false)}
            />
          ) : (
            <div className="video-loader">
              <div className="loader-animation">
                <div className="music-note">
                  <span>♪</span>
                </div>
                <div className="music-note">
                  <span>♫</span>
                </div>
                <div className="music-note">
                  <span>♬</span>
                </div>
              </div>
              <p>Loading episode...</p>
            </div>
          )}
        </div>
      </div>

      {/* Player settings section matching the theme with episodes section */}
      <div className={`player-settings-section ${isLandscape ? 'landscape' : ''}`}>
        <div className="settings-container">
          <div className="settings-row">
            <div className="settings-item">
              <button 
                className={`settings-btn ${streamType === 'sub' ? 'active' : ''}`}
                onClick={() => changeStreamType('sub')}
              >
                cc Hard Sub
              </button>
              <button 
                className={`settings-btn ${streamType === 'dub' ? 'active' : ''}`}
                onClick={() => changeStreamType('dub')}
              >
                Dub
              </button>
            </div>
          </div>
          
          <div className="settings-row">
            <div className="settings-item">
              <button 
                className={`settings-btn ${server === 'vidWish' ? 'active' : ''}`}
                onClick={() => changeServer('vidWish')}
              >
                Server 1
              </button>
              <button 
                className={`settings-btn ${server === 'megaPlay' ? 'active' : ''}`}
                onClick={() => changeServer('megaPlay')}
              >
                Server 2
              </button>
            </div>
          </div>
          
          <div className="settings-note">
            You are watching Episode {currentEpisodeIndex + 1}
          </div>
          <div className="settings-note secondary">
            If the current server is not working, please try switching to other servers.
          </div>
        </div>
      </div>

      <div className={`episodes-list-compact ${isLandscape ? 'landscape' : ''}`}>
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

  const Footer = () => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    
    return (
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-section">
            <h3>Browse Anime</h3>
            <p>Search anime alphabetically</p>
            <div className="alphabet-grid">
              {alphabet.map(letter => (
                <button
                  key={letter}
                  className={`alphabet-btn ${selectedLetter === letter ? 'active' : ''}`}
                  onClick={() => handleLetterClick(letter)}
                >
                  {letter}
                </button>
              ))}
            </div>
          </div>
          
          <div className="footer-section">
            <h3>About 音楽子</h3>
            <p>Your ultimate destination for free anime streaming. Watch thousands of episodes in HD quality.</p>
          </div>
          
          <div className="footer-section">
            <h3>Legal</h3>
            <p>音楽子 does not store any files on our server. We only link to media hosted on 3rd party services.</p>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>Made with love by prayag.cake</p>
        </div>
      </footer>
    );
  };

  return (
    <div className={`app ${darkMode ? 'dark' : 'light'}`}>
      <nav className="navbar">
        <div className="nav-container">
          <h1 className="logo" onClick={() => setActiveView('home')}>音楽子</h1>
          <div className="nav-right">
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
        </div>
      </nav>

      <main className={`main-content ${isLandscape ? 'landscape' : ''}`}>
        {loading ? (
          <div className="loader-container">
            <img src="./assets/loader.gif" alt="Loading..." className="loader" />
          </div>
        ) : (
          <>
            {activeView === 'home' && homeData && (
              <>
                <SpotlightSection />
                
                {watchHistory.length > 0 && (
                  <section className="anime-section">
                    <h2><History size={24} /> Continue Watching</h2>
                    <div className={`anime-grid ${isLandscape ? 'landscape' : ''}`}>
                      {watchHistory.slice(0, 6).map((item, i) => (
                        <div 
                          key={i} 
                          className="anime-card"
                          style={{ animationDelay: `${i * 0.1}s` }}
                          onClick={() => {
                            setSelectedAnime(item.anime);
                            setActiveView('details');
                            fetchAnimeDetails(item.anime.id).then(() => {
                              fetchEpisodes(item.anime.id).then(() => {
                                handleEpisodeSelect(item.episode, item.episodeIndex);
                              });
                            });
                          }}
                        >
                          <div className="anime-card-inner">
                            <img src={item.anime.poster} alt={item.anime.title} loading="lazy" />
                            <div className="anime-overlay">
                              <Play className="play-icon" />
                            </div>
                            <div className="progress-bar">
                              <div 
                                className="progress-fill" 
                                style={{ width: `${(item.episodeIndex / episodes.length) * 100}%` }}
                              />
                            </div>
                          </div>
                          <div className="anime-info">
                            <h3>{item.anime.title}</h3>
                            <div className="anime-meta">
                              <span>EP {item.episodeIndex + 1}</span>
                              <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
                
                <section className="anime-section">
                  <h2><TrendingUp size={24} /> Trending Now</h2>
                  <div className={`anime-grid ${isLandscape ? 'landscape-3' : ''}`}>
                    {homeData.trending?.slice(0, isLandscape ? 9 : 12).map((anime, i) => (
                      <AnimeCard key={anime.id} anime={anime} index={i} />
                    ))}
                  </div>
                </section>

                <section className="anime-section">
                  <h2><Star size={24} /> Most Popular</h2>
                  <div className={`anime-grid ${isLandscape ? 'landscape-3' : ''}`}>
                    {homeData.mostPopular?.slice(0, isLandscape ? 9 : 12).map((anime, i) => (
                      <AnimeCard key={anime.id} anime={anime} index={i} />
                    ))}
                  </div>
                </section>

                <section className="anime-section">
                  <h2><Clock size={24} /> Recently Added</h2>
                  <div className={`anime-grid ${isLandscape ? 'landscape-3' : ''}`}>
                    {homeData.newAdded?.slice(0, isLandscape ? 9 : 12).map((anime, i) => (
                      <AnimeCard key={anime.id} anime={anime} index={i} />
                    ))}
                  </div>
                </section>
              </>
            )}

            {activeView === 'search' && (
              <section className="anime-section">
                <h2>Search Results for "{searchQuery}"</h2>
                <div className={`anime-grid ${isLandscape ? 'landscape-3' : ''}`}>
                  {searchResults.map((anime, i) => (
                    <AnimeCard key={anime.id} anime={anime} index={i} />
                  ))}
                </div>
              </section>
            )}

            {activeView === 'letter' && (
              <section className="anime-section">
                <h2>Anime starting with "{selectedLetter}"</h2>
                <div className={`anime-grid ${isLandscape ? 'landscape-3' : ''}`}>
                  {letterAnimes.map((anime, i) => (
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
                  <div className={`anime-grid ${isLandscape ? 'landscape-3' : ''}`}>
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
                  <div className={`anime-grid ${isLandscape ? 'landscape-3' : ''}`}>
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

      <div className="footer-separator"></div>
      
      <Footer />

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
          display: flex;
          flex-direction: column;
        }

        .app.dark {
          background: #000000;
          color: #ffffff;
        }

        .app.light {
          background: #ffffff;
          color: #000000;
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
          background: #000000;
          border-bottom: 1px solid #333333;
        }

        .light .navbar {
          background: #ffffff;
          border-bottom: 1px solid #e0e0e0;
        }

        .nav-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
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

        .nav-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .search-bar {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          border-radius: 50px;
          transition: all 0.3s ease;
          width: 300px;
        }

        .dark .search-bar {
          background: #1a1a1a;
          border: 1px solid #333333;
        }

        .light .search-bar {
          background: #f5f5f5;
          border: 1px solid #e0e0e0;
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
          display: flex;
          align-items: center;
          gap: 0.25rem;
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
          flex: 1;
        }

        .main-content.landscape {
          padding: 1rem;
        }

        .spotlight-section {
          margin-bottom: 3rem;
          position: relative;
          height: 500px;
          overflow: hidden;
          border-radius: 20px;
        }

        .spotlight-container {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .spotlight-slider {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        .spotlight-item {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          transition: transform 0.5s ease, opacity 0.5s ease;
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

        .spotlight-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(0, 0, 0, 0.5);
          color: white;
          border: none;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
          transition: all 0.3s ease;
        }

        .spotlight-nav:hover {
          background: rgba(0, 0, 0, 0.8);
        }

        .spotlight-nav-prev {
          left: 1rem;
        }

        .spotlight-nav-next {
          right: 1rem;
        }

        .spotlight-dots {
          position: absolute;
          bottom: 1rem;
          left: 0;
          right: 0;
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          z-index: 10;
        }

        .spotlight-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.5);
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .spotlight-dot.active {
          background: white;
          transform: scale(1.2);
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

        .anime-grid.landscape {
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        }

        .anime-grid.landscape-3 {
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
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

        .progress-bar {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: rgba(255, 255, 255, 0.3);
        }

        .progress-fill {
          height: 100%;
          background: #667eea;
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
          background: #1a1a1a;
          border: 1px solid #333333;
        }

        .light .details-meta span {
          background: #f5f5f5;
          border: 1px solid #e0e0e0;
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
          background: #1a1a1a;
          border: 1px solid #333333;
        }

        .light .episode-card {
          background: #f5f5f5;
          border: 1px solid #e0e0e0;
        }

        .episode-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
        }

        .dark .episode-card:hover {
          background: #222222;
        }

        .light .episode-card:hover {
          background: #e0e0e0;
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

        .watch-container.landscape {
          display: flex;
          flex-direction: column;
          height: calc(100vh - 200px);
        }

        .video-wrapper {
          margin-bottom: 2rem;
        }

        .video-wrapper.landscape {
          flex: 1;
          margin-bottom: 1rem;
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

        .video-wrapper.landscape .video-container {
          height: 100%;
          aspect-ratio: auto;
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

        .video-loader {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #000;
          color: white;
        }

        .loader-animation {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .music-note {
          font-size: 2rem;
          animation: musicNote 1.5s infinite ease-in-out;
        }

        .music-note:nth-child(2) {
          animation-delay: 0.2s;
        }

        .music-note:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes musicNote {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        .player-info-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1rem;
          border-radius: 12px 12px 0 0;
          margin-bottom: -4px;
        }

        .dark .player-info-bar {
          background: #1a1a1a;
          border: 1px solid #333333;
          border-bottom: none;
        }

        .light .player-info-bar {
          background: #f5f5f5;
          border: 1px solid #e0e0e0;
          border-bottom: none;
        }

        .episode-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          flex: 1;
          min-width: 0;
        }

        .episode-number {
          font-weight: 600;
          font-size: 1rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .episode-title {
          font-size: 0.9rem;
          opacity: 0.7;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .player-actions {
          display: flex;
          gap: 0.5rem;
          flex-shrink: 0;
        }

        .player-actions button {
          background: rgba(0, 0, 0, 0.2);
          border: none;
          padding: 0.5rem;
          border-radius: 50%;
          cursor: pointer;
          color: inherit;
          transition: all 0.3s ease;
        }

        .player-actions button:hover {
          background: rgba(0, 0, 0, 0.4);
          transform: scale(1.1);
        }

        .player-actions button.active {
          background: #f43f5e;
          color: white;
        }

        .player-settings-section {
          padding: 1.5rem;
          border-radius: 12px;
          margin-bottom: 1.5rem;
        }

        .player-settings-section.landscape {
          margin-bottom: 1rem;
          padding: 1rem;
        }

        .dark .player-settings-section {
          background: #1a1a1a;
          border: 1px solid #333333;
        }

        .light .player-settings-section {
          background: #f5f5f5;
          border: 1px solid #e0e0e0;
        }

        .settings-container {
          max-width: 600px;
          margin: 0 auto;
          text-align: center;
        }

        .settings-row {
          display: flex;
          justify-content: center;
          margin-bottom: 1rem;
        }

        .settings-item {
          display: flex;
          gap: 0.5rem;
        }

        .settings-btn {
          padding: 0.5rem 1rem;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .dark .settings-btn {
          background: #222222;
          color: white;
          border: 1px solid #333333;
        }

        .light .settings-btn {
          background: #e0e0e0;
          color: #000000;
          border: 1px solid #d0d0d0;
        }

        .settings-btn.active {
          background: #ff9500;
          color: white;
          border-color: transparent;
        }

        .settings-note {
          color: white;
          font-size: 0.9rem;
          margin-top: 0.5rem;
        }

        .settings-note.secondary {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.8rem;
          margin-top: 0.25rem;
        }

        .episodes-list-compact {
          padding: 1.5rem;
          border-radius: 12px;
        }

        .episodes-list-compact.landscape {
          padding: 1rem;
          flex: 1;
          overflow-y: auto;
        }

        .dark .episodes-list-compact {
          background: #1a1a1a;
          border: 1px solid #333333;
        }

        .light .episodes-list-compact {
          background: #f5f5f5;
          border: 1px solid #e0e0e0;
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

        .episodes-list-compact.landscape .episodes-compact-grid {
          max-height: none;
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
          background: #222222;
          color: white;
          border: 1px solid #333333;
        }

        .light .episode-btn {
          background: #e0e0e0;
          color: #000000;
          border: 1px solid #d0d0d0;
        }

        .episode-btn:hover {
          transform: scale(1.05);
        }

        .episode-btn.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-color: transparent;
        }

        .footer-separator {
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(102, 126, 234, 0.5), transparent);
          margin: 2rem 0;
        }

        .footer {
          padding: 2rem 0;
        }

        .dark .footer {
          background: #0a0a0a;
          color: #ffffff;
        }

        .light .footer {
          background: #f5f5f5;
          color: #000000;
        }

        .footer-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
        }

        .footer-section h3 {
          font-size: 1.2rem;
          margin-bottom: 1rem;
          position: relative;
          padding-bottom: 0.5rem;
        }

        .footer-section h3:after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 50px;
          height: 2px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .footer-section p {
          margin-bottom: 1rem;
          opacity: 0.8;
          line-height: 1.6;
        }

        .alphabet-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
          gap: 0.5rem;
        }

        .alphabet-btn {
          padding: 0.5rem;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .dark .alphabet-btn {
          background: #1a1a1a;
          color: white;
          border: 1px solid #333333;
        }

        .light .alphabet-btn {
          background: #e0e0e0;
          color: #000000;
          border: 1px solid #d0d0d0;
        }

        .alphabet-btn:hover {
          transform: scale(1.05);
        }

        .alphabet-btn.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-color: transparent;
        }

        .footer-bottom {
          text-align: center;
          padding: 1rem 0;
          margin-top: 2rem;
          border-top: 1px solid rgba(102, 126, 234, 0.2);
          font-size: 0.9rem;
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

          .nav-right {
            width: 100%;
            justify-content: space-between;
          }

          .search-bar {
            width: 200px;
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

          .anime-grid.landscape-3 {
            grid-template-columns: repeat(2, 1fr);
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

          .episodes-compact-grid {
            grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
          }

          .episodes-grid {
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          }

          .player-info-bar {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .settings-container {
            max-width: 100%;
          }

          .footer-container {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .alphabet-grid {
            grid-template-columns: repeat(auto-fill, minmax(35px, 1fr));
          }
        }

        @media (max-width: 480px) {
          .nav-right {
            flex-direction: column;
            gap: 0.5rem;
          }

          .search-bar {
            width: 100%;
          }

          .anime-grid.landscape-3 {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
};

export default Ongaku;

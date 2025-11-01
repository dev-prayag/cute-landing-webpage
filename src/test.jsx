import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { Search, Moon, Sun, Heart, Bookmark, ChevronUp, Play, Star, Clock, Calendar, TrendingUp, ArrowLeft, ChevronLeft, ChevronRight, Mic, List, Grid3x3 } from 'lucide-react';

const API_BASE = 'https://ongaku-api.vercel.app';

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

const AnimeCard = React.memo(({ anime, index, rank, onClick }) => (
  <div   
    className="anime-card"  
    style={{ animationDelay: `${index * 0.1}s` }}  
    onClick={onClick}  
  >  
    {rank && <div className="rank-badge">{rank}</div>}  
    <div className="anime-card-inner">  
      <img src={anime.poster} alt={anime.title} loading="lazy" />  
      <div className="anime-overlay">  
        <Play className="play-icon" />  
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
));

const EpisodeCard = React.memo(({ episode, actualIndex, isActive, listView, onClick }) => (
  <div   
    className={`episode-card ${isActive ? 'active' : ''}`}  
    onClick={onClick}  
  >  
    {listView === 'grid' ? (  
      <>  
        <Play size={16} />  
        <span className="ep-number">{actualIndex + 1}</span>  
        {episode.isFiller && <span className="filler-badge">Filler</span>}  
      </>  
    ) : (  
      <div className="episode-list-content">  
        <Play size={16} />  
        <div className="episode-text">  
          <span className="ep-number">Episode {actualIndex + 1}</span>  
          {episode.title && <span className="ep-title">{episode.title}</span>}  
        </div>  
        {episode.isFiller && <span className="filler-badge">Filler</span>}  
      </div>  
    )}  
  </div>  
));

const Footer = ({ darkMode }) => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  
  return (
    <footer className={`footer ${darkMode ? 'dark' : 'light'}`}>
      <div className="footer-content">
        <div className="footer-section">
          <h3>Browse</h3>
          <div className="alphabet-grid">
            {alphabet.map(letter => (
              <Link key={letter} to={`/browse/${letter}`} className="alphabet-link">
                {letter}
              </Link>
            ))}
          </div>
        </div>
        
        <div className="footer-section">
          <h3>Navigation</h3>
          <div className="footer-links">
            <Link to="/home">Home</Link>
            <Link to="/liked">Liked Anime</Link>
            <Link to="/bookmarked">Bookmarked Anime</Link>
          </div>
        </div>
        
        <div className="footer-section">
          <h3>About</h3>
          <p className="footer-about">
            Made with love by Prayag
          </p>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Ongaku. All rights reserved.</p>
      </div>
      
      <style>{`
        .footer {
          margin-top: 3rem;
          padding: 2rem 0 1rem;
          border-top: 1px solid;
        }
        
        .dark.footer {
          background: #0a0a0a;
          border-color: rgba(255, 255, 255, 0.1);
          color: #ffffff;
        }
        
        .light.footer {
          background: #f0f2f5;
          border-color: rgba(0, 0, 0, 0.1);
          color: #1a1a2e;
        }
        
        .footer-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: 2rem;
        }
        
        .footer-section h3 {
          margin-bottom: 1rem;
          font-size: 1.2rem;
        }
        
        .alphabet-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 0.5rem;
        }
        
        .alphabet-link {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem;
          border-radius: 4px;
          transition: all 0.3s ease;
          text-decoration: none;
          color: inherit;
        }
        
        .dark .alphabet-link:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        
        .light .alphabet-link:hover {
          background: rgba(0, 0, 0, 0.1);
        }
        
        .footer-links {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .footer-links a {
          color: inherit;
          text-decoration: none;
          transition: all 0.3s ease;
        }
        
        .dark .footer-links a:hover {
          color: #667eea;
        }
        
        .light .footer-links a:hover {
          color: #764ba2;
        }
        
        .footer-about {
          font-style: italic;
          opacity: 0.8;
        }
        
        .footer-bottom {
          max-width: 1400px;
          margin: 1.5rem auto 0;
          padding: 1rem 2rem 0;
          text-align: center;
          font-size: 0.9rem;
          opacity: 0.7;
        }
        
        @media (max-width: 768px) {
          .footer-content {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
          
          .alphabet-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }
      `}</style>
    </footer>
  );
};

const HomePage = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [homeData, setHomeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [likedAnimes, setLikedAnimes] = useState([]);
  const [bookmarkedAnimes, setBookmarkedAnimes] = useState([]);
  const [spotlightIndex, setSpotlightIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const liked = JSON.parse(localStorage.getItem('likedAnimes') || '[]');
    const bookmarked = JSON.parse(localStorage.getItem('bookmarkedAnimes') || '[]');
    setLikedAnimes(liked);
    setBookmarkedAnimes(bookmarked);
    fetchHomeData();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const shouldShow = window.scrollY > 400;
      setShowBackToTop(prev => prev !== shouldShow ? shouldShow : prev);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const handleSearch = useCallback(() => {
    if (!searchQuery.trim()) return;
    navigate(`/browse/${encodeURIComponent(searchQuery)}`);
  }, [searchQuery, navigate]);

  const toggleTheme = useCallback(() => setDarkMode(prev => !prev), []);

  const scrollToTop = useCallback(() => window.scrollTo({ top: 0, behavior: 'smooth' }), []);

  const handleAnimeClick = useCallback((anime) => {
    const animeName = anime.title.replace(/\s+/g, '-').toLowerCase();
    navigate(`/anime/${animeName}`, { state: { anime } });
  }, [navigate]);

  const nextSpotlight = useCallback(() => {
    setSpotlightIndex((prev) => (prev + 1) % (homeData?.spotlight?.length || 1));
  }, [homeData?.spotlight?.length]);

  const prevSpotlight = useCallback(() => {
    setSpotlightIndex((prev) => (prev - 1 + (homeData?.spotlight?.length || 1)) % (homeData?.spotlight?.length || 1));
  }, [homeData?.spotlight?.length]);

  const SpotlightSection = React.memo(() => {
    const anime = homeData?.spotlight?.[spotlightIndex];
    if (!anime) return null;

    return (  
      <div className="spotlight-carousel">  
        <button className="carousel-btn prev" onClick={prevSpotlight}>  
          <ChevronLeft size={32} />  
        </button>  
          
        <div className="spotlight-slide">  
          <img src={anime.poster} alt={anime.title} className="spotlight-bg" />  
          <div className="spotlight-overlay">  
            <div className="spotlight-content">  
              <div className="spotlight-badges">  
                <span className="quality-badge">{anime.quality}</span>  
                <span className="type-badge">{anime.type}</span>  
              </div>  
              <h1 className="spotlight-title">{anime.title}</h1>  
              <p className="spotlight-synopsis">{anime.synopsis?.slice(0, 200)}...</p>  
              <div className="spotlight-meta">  
                <span><Calendar size={16} /> {anime.aired}</span>  
                <span><Clock size={16} /> {anime.duration}</span>  
              </div>  
              <div className="spotlight-actions">  
                <button className="play-button" onClick={() => handleAnimeClick(anime)}>  
                  <Play size={20} /> Watch Now  
                </button>  
                <button   
                  className={`icon-button ${bookmarkedAnimes.some(a => a.id === anime.id) ? 'active' : ''}`}  
                  onClick={(e) => { e.stopPropagation(); }}  
                >  
                  <Bookmark size={20} />  
                </button>  
              </div>  
            </div>  
          </div>  
        </div>  

        <button className="carousel-btn next" onClick={nextSpotlight}>  
          <ChevronRight size={32} />  
        </button>  

        <div className="carousel-indicators">  
          {homeData?.spotlight?.slice(0, 10).map((_, idx) => (  
            <button  
              key={idx}  
              className={`indicator ${idx === spotlightIndex ? 'active' : ''}`}  
              onClick={() => setSpotlightIndex(idx)}  
            />  
          ))}  
          <span className="indicator-text">{spotlightIndex + 1} / 10</span>  
        </div>  
      </div>  
    );
  });

  const TrendingSection = React.memo(() => (
    <div className="trending-carousel">
      <div className="carousel-scroll">
        {homeData?.trending?.slice(0, 10).map((anime, i) => (
          <div key={anime.id} className="trending-card" onClick={() => handleAnimeClick(anime)}>
            <div className="trending-rank">{i + 1}</div>
            <img src={anime.poster} alt={anime.title} loading="lazy" />
            <div className="trending-overlay">
              <h3>{anime.title}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  ));

  return (
    <div className={`app ${darkMode ? 'dark' : 'light'}`}>
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/home" className="logo">音楽子</Link>
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
            <Link to="/liked" className="nav-btn">
              <Heart size={22} />
              {likedAnimes.length > 0 && <span className="badge">{likedAnimes.length}</span>}
            </Link>
            <Link to="/bookmarked" className="nav-btn">
              <Bookmark size={22} />
              {bookmarkedAnimes.length > 0 && <span className="badge">{bookmarkedAnimes.length}</span>}
            </Link>
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
            <SpotlightSection />  
              
            <section className="anime-section">  
              <h2><TrendingUp size={24} /> Trending Now</h2>  
              <TrendingSection />  
            </section>  

            <section className="anime-section">  
              <h2><Star size={24} /> Most Popular</h2>  
              <div className="anime-grid">  
                {homeData.mostPopular?.slice(0, 12).map((anime, i) => (  
                  <AnimeCard key={anime.id} anime={anime} index={i} onClick={() => handleAnimeClick(anime)} />  
                ))}  
              </div>  
            </section>  

            <section className="anime-section">  
              <h2><Clock size={24} /> Recently Added</h2>  
              <div className="anime-grid">  
                {homeData.newAdded?.slice(0, 12).map((anime, i) => (  
                  <AnimeCard key={anime.id} anime={anime} index={i} onClick={() => handleAnimeClick(anime)} />  
                ))}  
              </div>  
            </section>  
          </>  
        )}  
      </main>  

      {showBackToTop && (  
        <button className="back-to-top" onClick={scrollToTop}>  
          <ChevronUp size={24} />  
        </button>  
      )}

      <Footer darkMode={darkMode} />
    </div>
  );
};

const AnimeDetailsPage = () => {
  const { animeName } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(true);
  const [animeDetails, setAnimeDetails] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [episodeSearch, setEpisodeSearch] = useState('');
  const [episodeListView, setEpisodeListView] = useState('grid');
  const [likedAnimes, setLikedAnimes] = useState([]);
  const [bookmarkedAnimes, setBookmarkedAnimes] = useState([]);
  const [selectedAnime, setSelectedAnime] = useState(null);

  useEffect(() => {
    const liked = JSON.parse(localStorage.getItem('likedAnimes') || '[]');
    const bookmarked = JSON.parse(localStorage.getItem('bookmarkedAnimes') || '[]');
    setLikedAnimes(liked);
    setBookmarkedAnimes(bookmarked);
    
    // Get anime from location state or fetch by name
    if (location.state?.anime) {
      setSelectedAnime(location.state.anime);
      fetchAnimeDetails(location.state.anime.id);
      fetchEpisodes(location.state.anime.id);
    } else {
      // In a real app, you would fetch by anime name here
      // For now, we'll just show an error
      console.error('Anime not found');
    }
  }, [animeName, location.state]);

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

  const toggleLike = useCallback((anime) => {
    setLikedAnimes(prev => {
      const updated = prev.some(a => a.id === anime.id)
        ? prev.filter(a => a.id !== anime.id)
        : [...prev, anime];
      localStorage.setItem('likedAnimes', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const toggleBookmark = useCallback((anime) => {
    setBookmarkedAnimes(prev => {
      const updated = prev.some(a => a.id === anime.id)
        ? prev.filter(a => a.id !== anime.id)
        : [...prev, anime];
      localStorage.setItem('bookmarkedAnimes', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleEpisodeSelect = useCallback((episode, index) => {
    navigate(`/anime/${animeName}/episode=${index + 1}`, { 
      state: { 
        anime: selectedAnime, 
        episode, 
        episodeIndex: index 
      } 
    });
  }, [navigate, animeName, selectedAnime]);

  const filteredEpisodes = useMemo(() => {
    if (!episodeSearch) return episodes;
    const searchLower = episodeSearch.toLowerCase();
    return episodes.filter((ep, idx) => {
      const epNum = idx + 1;
      return epNum.toString().includes(episodeSearch) ||
        (ep.title && ep.title.toLowerCase().includes(searchLower));
    });
  }, [episodes, episodeSearch]);

  return (
    <div className={`app ${darkMode ? 'dark' : 'light'}`}>
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/home" className="logo">音楽子</Link>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search anime..."
              readOnly
            />
            <button className="search-btn">
              <Search size={18} />
            </button>
          </div>
          <div className="nav-actions">
            <Link to="/liked" className="nav-btn">
              <Heart size={22} />
              {likedAnimes.length > 0 && <span className="badge">{likedAnimes.length}</span>}
            </Link>
            <Link to="/bookmarked" className="nav-btn">
              <Bookmark size={22} />
              {bookmarkedAnimes.length > 0 && <span className="badge">{bookmarkedAnimes.length}</span>}
            </Link>
            <button onClick={() => setDarkMode(prev => !prev)} className="theme-toggle">
              {darkMode ? <Sun size={22} /> : <Moon size={22} />}
            </button>
          </div>
        </div>
      </nav>

      <main className="main-content">
        <div className="anime-details">
          <button className="back-btn" onClick={() => navigate(-1)}>
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
            <div className="episodes-header">  
              <h2>All Episodes ({episodes.length})</h2>  
              <div className="episodes-controls">  
                <input  
                  type="text"  
                  placeholder="Find episode..."  
                  value={episodeSearch}  
                  onChange={(e) => setEpisodeSearch(e.target.value)}  
                  className="episode-search-input"  
                />  
                <button   
                  className="view-toggle"  
                  onClick={() => setEpisodeListView(prev => prev === 'grid' ? 'list' : 'grid')}  
                >  
                  {episodeListView === 'grid' ? <List size={20} /> : <Grid3x3 size={20} />}  
                </button>  
              </div>  
            </div>  
              
            <div className={`episodes-grid ${episodeListView}`}>  
              {filteredEpisodes.map((ep) => {  
                const actualIndex = episodes.indexOf(ep);  
                return (  
                  <EpisodeCard  
                    key={ep.id}  
                    episode={ep}  
                    actualIndex={actualIndex}  
                    isActive={false}  
                    listView={episodeListView}  
                    onClick={() => handleEpisodeSelect(ep, actualIndex)}  
                  />  
                );  
              })}  
            </div>  
          </div>  
        </div>
      </main>

      <Footer darkMode={darkMode} />
    </div>
  );
};

const WatchPage = () => {
  const { animeName, episodeNumber } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(true);
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0);
  const [streamType, setStreamType] = useState('sub');
  const [server, setServer] = useState('vidWish');
  const [likedAnimes, setLikedAnimes] = useState([]);
  const [bookmarkedAnimes, setBookmarkedAnimes] = useState([]);
  const [episodeSearch, setEpisodeSearch] = useState('');
  const [episodeListView, setEpisodeListView] = useState('grid');
  const iframeRef = useRef(null);

  useEffect(() => {
    const liked = JSON.parse(localStorage.getItem('likedAnimes') || '[]');
    const bookmarked = JSON.parse(localStorage.getItem('bookmarkedAnimes') || '[]');
    setLikedAnimes(liked);
    setBookmarkedAnimes(bookmarked);
    
    // Get data from location state
    if (location.state?.anime) {
      setSelectedAnime(location.state.anime);
      setSelectedEpisode(location.state.episode);
      setCurrentEpisodeIndex(location.state.episodeIndex || 0);
      fetchEpisodes(location.state.anime.id);
    }
  }, [location.state]);

  const fetchEpisodes = async (animeId) => {
    try {
      const data = await fetchWithCache(`${API_BASE}/episodes/${animeId}`);
      setEpisodes(data.data);
    } catch (err) {
      console.error('Error fetching episodes:', err);
    }
  };

  const toggleLike = useCallback((anime) => {
    setLikedAnimes(prev => {
      const updated = prev.some(a => a.id === anime.id)
        ? prev.filter(a => a.id !== anime.id)
        : [...prev, anime];
      localStorage.setItem('likedAnimes', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const toggleBookmark = useCallback((anime) => {
    setBookmarkedAnimes(prev => {
      const updated = prev.some(a => a.id === anime.id)
        ? prev.filter(a => a.id !== anime.id)
        : [...prev, anime];
      localStorage.setItem('bookmarkedAnimes', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const changeEpisode = useCallback((direction) => {
    setCurrentEpisodeIndex(prev => {
      const newIndex = direction === 'next' ? prev + 1 : prev - 1;
      if (newIndex >= 0 && newIndex < episodes.length) {
        const newEpisode = episodes[newIndex];
        setSelectedEpisode(newEpisode);
        navigate(`/anime/${animeName}/episode=${newIndex + 1}`, { 
          state: { 
            anime: selectedAnime, 
            episode: newEpisode, 
            episodeIndex: newIndex 
          } 
        });
        return newIndex;
      }
      return prev;
    });
  }, [episodes, navigate, animeName, selectedAnime]);

  const handleEpisodeSelect = useCallback((episode, index) => {
    setSelectedEpisode(episode);
    setCurrentEpisodeIndex(index);
    navigate(`/anime/${animeName}/episode=${index + 1}`, { 
      state: { 
        anime: selectedAnime, 
        episode, 
        episodeIndex: index 
      } 
    });
  }, [navigate, animeName, selectedAnime]);

  const getStreamUrl = useCallback(() => {
    if (!selectedEpisode) return '';
    const episodeNum = selectedEpisode.id.split('ep=').pop();
    const baseUrl = server === 'vidWish' ? 'vidwish.live' : 'megaplay.buzz';
    return `https://${baseUrl}/stream/s-2/${episodeNum}/${streamType}`;
  }, [selectedEpisode, server, streamType]);

  const filteredEpisodes = useMemo(() => {
    if (!episodeSearch) return episodes;
    const searchLower = episodeSearch.toLowerCase();
    return episodes.filter((ep, idx) => {
      const epNum = idx + 1;
      return epNum.toString().includes(episodeSearch) ||
        (ep.title && ep.title.toLowerCase().includes(searchLower));
    });
  }, [episodes, episodeSearch]);

  const currentEp = episodes[currentEpisodeIndex];
  const isLiked = selectedAnime && likedAnimes.some(a => a.id === selectedAnime.id);
  const isBookmarked = selectedAnime && bookmarkedAnimes.some(a => a.id === selectedAnime.id);

  return (
    <div className={`app ${darkMode ? 'dark' : 'light'}`}>
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/home" className="logo">音楽子</Link>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search anime..."
              readOnly
            />
            <button className="search-btn">
              <Search size={18} />
            </button>
          </div>
          <div className="nav-actions">
            <Link to="/liked" className="nav-btn">
              <Heart size={22} />
              {likedAnimes.length > 0 && <span className="badge">{likedAnimes.length}</span>}
            </Link>
            <Link to="/bookmarked" className="nav-btn">
              <Bookmark size={22} />
              {bookmarkedAnimes.length > 0 && <span className="badge">{bookmarkedAnimes.length}</span>}
            </Link>
            <button onClick={() => setDarkMode(prev => !prev)} className="theme-toggle">
              {darkMode ? <Sun size={22} /> : <Moon size={22} />}
            </button>
          </div>
        </div>
      </nav>

      <main className="main-content">
        <div className="watch-container">  
          <button className="back-btn" onClick={() => navigate(`/anime/${animeName}`)}>  
            <ArrowLeft size={20} /> Back to Episodes  
          </button>  

          <div className="video-wrapper">  
            <div className="episode-header">  
              <div className="episode-title-section">  
                <span className="ep-number-badge">{currentEpisodeIndex + 1}.</span>  
                <span className="ep-name">{currentEp?.title || `Episode ${currentEpisodeIndex + 1}`}</span>  
              </div>  
              <div className="episode-actions">  
                <button   
                  className={`icon-btn ${isLiked ? 'liked' : ''}`}  
                  onClick={() => selectedAnime && toggleLike(selectedAnime)}  
                  title={isLiked ? 'Unlike' : 'Like'}  
                >  
                  <Heart size={20} fill={isLiked ? '#ec4899' : 'none'} stroke={isLiked ? '#ec4899' : 'currentColor'} />  
                </button>  
                <button   
                  className={`icon-btn ${isBookmarked ? 'bookmarked' : ''}`}  
                  onClick={() => selectedAnime && toggleBookmark(selectedAnime)}  
                  title={isBookmarked ? 'Remove Bookmark' : 'Bookmark'}  
                >  
                  <Bookmark size={20} fill={isBookmarked ? '#10b981' : 'none'} stroke={isBookmarked ? '#10b981' : 'currentColor'} />  
                </button>  
              </div>  
            </div>  

            <div className="video-container">  
              <iframe  
                ref={iframeRef}  
                src={getStreamUrl()}  
                className="video-player"  
                allowFullScreen  
                allow="autoplay; encrypted-media; picture-in-picture"  
              />  
            </div>  
          </div>  

          <div className="player-controls-center">  
            <div className="control-row">  
              <div className="audio-selector">  
                <button   
                  className={streamType === 'sub' ? 'active' : ''}  
                  onClick={() => setStreamType('sub')}  
                >  
                  <Mic size={16} /> SUB  
                </button>  
                <button   
                  className={streamType === 'dub' ? 'active' : ''}  
                  onClick={() => setStreamType('dub')}  
                >  
                  <Mic size={16} /> DUB  
                </button>  
              </div>  

              <div className="server-selector">  
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

              <div className="episode-nav">  
                {currentEpisodeIndex > 0 && (  
                  <button onClick={() => changeEpisode('prev')} className="nav-btn">  
                    Previous  
                  </button>  
                )}  
                {currentEpisodeIndex < episodes.length - 1 && (  
                  <button onClick={() => changeEpisode('next')} className="nav-btn primary">  
                    Next  
                  </button>  
                )}  
              </div>  
            </div>  

            <div className="player-info">  
              <p>You are watching <strong>Episode {currentEpisodeIndex + 1}</strong></p>  
              <p className="server-info">Please try changing servers if this server isn't loading anything.</p>  
            </div>  
          </div>  

          <div className="episodes-section">  
            <div className="episodes-header">  
              <h2>All Episodes ({episodes.length})</h2>  
              <div className="episodes-controls">  
                <input  
                  type="text"  
                  placeholder="Find episode..."  
                  value={episodeSearch}  
                  onChange={(e) => setEpisodeSearch(e.target.value)}  
                  className="episode-search-input"  
                />  
                <button   
                  className="view-toggle"  
                  onClick={() => setEpisodeListView(prev => prev === 'grid' ? 'list' : 'grid')}  
                >  
                  {episodeListView === 'grid' ? <List size={20} /> : <Grid3x3 size={20} />}  
                </button>  
              </div>  
            </div>  
              
            <div className={`episodes-grid ${episodeListView}`}>  
              {filteredEpisodes.map((ep) => {  
                const actualIndex = episodes.indexOf(ep);  
                const isActive = actualIndex === currentEpisodeIndex;  
                return (  
                  <EpisodeCard  
                    key={ep.id}  
                    episode={ep}  
                    actualIndex={actualIndex}  
                    isActive={isActive}  
                    listView={episodeListView}  
                    onClick={() => handleEpisodeSelect(ep, actualIndex)}  
                  />  
                );  
              })}  
            </div>  
          </div>  
        </div>
      </main>

      <Footer darkMode={darkMode} />
    </div>
  );
};

const LikedPage = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [likedAnimes, setLikedAnimes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const liked = JSON.parse(localStorage.getItem('likedAnimes') || '[]');
    setLikedAnimes(liked);
  }, []);

  const handleAnimeClick = useCallback((anime) => {
    const animeName = anime.title.replace(/\s+/g, '-').toLowerCase();
    navigate(`/anime/${animeName}`, { state: { anime } });
  }, [navigate]);

  return (
    <div className={`app ${darkMode ? 'dark' : 'light'}`}>
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/home" className="logo">音楽子</Link>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search anime..."
              readOnly
            />
            <button className="search-btn">
              <Search size={18} />
            </button>
          </div>
          <div className="nav-actions">
            <Link to="/liked" className="nav-btn">
              <Heart size={22} />
              {likedAnimes.length > 0 && <span className="badge">{likedAnimes.length}</span>}
            </Link>
            <Link to="/bookmarked" className="nav-btn">
              <Bookmark size={22} />
            </Link>
            <button onClick={() => setDarkMode(prev => !prev)} className="theme-toggle">
              {darkMode ? <Sun size={22} /> : <Moon size={22} />}
            </button>
          </div>
        </div>
      </nav>

      <main className="main-content">
        <section className="anime-section">  
          <h2><Heart size={24} /> Liked Anime</h2>  
          {likedAnimes.length === 0 ? (  
            <p className="empty-state">No liked anime yet. Start exploring!</p>  
          ) : (  
            <div className="anime-grid">  
              {likedAnimes.map((anime, i) => (  
                <AnimeCard key={anime.id} anime={anime} index={i} onClick={() => handleAnimeClick(anime)} />  
              ))}  
            </div>  
          )}  
        </section>
      </main>

      <Footer darkMode={darkMode} />
    </div>
  );
};

const BookmarkedPage = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [bookmarkedAnimes, setBookmarkedAnimes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const bookmarked = JSON.parse(localStorage.getItem('bookmarkedAnimes') || '[]');
    setBookmarkedAnimes(bookmarked);
  }, []);

  const handleAnimeClick = useCallback((anime) => {
    const animeName = anime.title.replace(/\s+/g, '-').toLowerCase();
    navigate(`/anime/${animeName}`, { state: { anime } });
  }, [navigate]);

  return (
    <div className={`app ${darkMode ? 'dark' : 'light'}`}>
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/home" className="logo">音楽子</Link>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search anime..."
              readOnly
            />
            <button className="search-btn">
              <Search size={18} />
            </button>
          </div>
          <div className="nav-actions">
            <Link to="/liked" className="nav-btn">
              <Heart size={22} />
            </Link>
            <Link to="/bookmarked" className="nav-btn">
              <Bookmark size={22} />
              {bookmarkedAnimes.length > 0 && <span className="badge">{bookmarkedAnimes.length}</span>}
            </Link>
            <button onClick={() => setDarkMode(prev => !prev)} className="theme-toggle">
              {darkMode ? <Sun size={22} /> : <Moon size={22} />}
            </button>
          </div>
        </div>
      </nav>

      <main className="main-content">
        <section className="anime-section">  
          <h2><Bookmark size={24} /> Bookmarked Anime</h2>  
          {bookmarkedAnimes.length === 0 ? (  
            <p className="empty-state">No bookmarked anime yet. Start exploring!</p>  
          ) : (  
            <div className="anime-grid">  
              {bookmarkedAnimes.map((anime, i) => (  
                <AnimeCard key={anime.id} anime={anime} index={i} onClick={() => handleAnimeClick(anime)} />  
              ))}  
            </div>  
          )}  
        </section>
      </main>

      <Footer darkMode={darkMode} />
    </div>
  );
};

const BrowsePage = () => {
  const { query } = useParams();
  const [darkMode, setDarkMode] = useState(true);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likedAnimes, setLikedAnimes] = useState([]);
  const [bookmarkedAnimes, setBookmarkedAnimes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const liked = JSON.parse(localStorage.getItem('likedAnimes') || '[]');
    const bookmarked = JSON.parse(localStorage.getItem('bookmarkedAnimes') || '[]');
    setLikedAnimes(liked);
    setBookmarkedAnimes(bookmarked);
    
    if (query && query.length === 1) {
      // This is for A-Z browsing
      // In a real app, you would fetch animes starting with this letter
      setLoading(false);
    } else {
      // This is for search queries
      fetchSearchResults();
    }
  }, [query]);

  const fetchSearchResults = async () => {
    if (!query) return;
    
    setLoading(true);
    try {
      const data = await fetchWithCache(`${API_BASE}/search?keyword=${encodeURIComponent(query)}&page=1`);
      setSearchResults(data.data.response);
    } catch (err) {
      console.error('Error searching:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnimeClick = useCallback((anime) => {
    const animeName = anime.title.replace(/\s+/g, '-').toLowerCase();
    navigate(`/anime/${animeName}`, { state: { anime } });
  }, [navigate]);

  return (
    <div className={`app ${darkMode ? 'dark' : 'light'}`}>
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/home" className="logo">音楽子</Link>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search anime..."
              defaultValue={query && query.length > 1 ? query : ''}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.target.value.trim()) {
                  navigate(`/browse/${encodeURIComponent(e.target.value)}`);
                }
              }}
            />
            <button className="search-btn">
              <Search size={18} />
            </button>
          </div>
          <div className="nav-actions">
            <Link to="/liked" className="nav-btn">
              <Heart size={22} />
              {likedAnimes.length > 0 && <span className="badge">{likedAnimes.length}</span>}
            </Link>
            <Link to="/bookmarked" className="nav-btn">
              <Bookmark size={22} />
              {bookmarkedAnimes.length > 0 && <span className="badge">{bookmarkedAnimes.length}</span>}
            </Link>
            <button onClick={() => setDarkMode(prev => !prev)} className="theme-toggle">
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
          <section className="anime-section">
            <h2>
              {query && query.length === 1 
                ? `Anime starting with "${query.toUpperCase()}"`
                : `Search Results for "${query}"`
              }
            </h2>
            {searchResults.length === 0 ? (
              <p className="empty-state">No results found. Try a different search term.</p>
            ) : (
              <div className="anime-grid">
                {searchResults.map((anime, i) => (
                  <AnimeCard key={anime.id} anime={anime} index={i} onClick={() => handleAnimeClick(anime)} />
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      <Footer darkMode={darkMode} />
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/anime/:animeName" element={<AnimeDetailsPage />} />
        <Route path="/anime/:animeName/episode=:episodeNumber" element={<WatchPage />} />
        <Route path="/liked" element={<LikedPage />} />
        <Route path="/bookmarked" element={<BookmarkedPage />} />
        <Route path="/browse/:query" element={<BrowsePage />} />
      </Routes>
      
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
          background: #000;
          color: #ffffff;
        }

        .app.light {
          background: #f5f7fa;
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
          background: rgba(0, 0, 0, 0.9);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .light .navbar {
          background: rgba(255, 255, 255, 0.9);
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
          font-size: 2rem;
          font-weight: 800;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          cursor: pointer;
          transition: transform 0.3s ease;
          white-space: nowrap;
          text-decoration: none;
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
          text-decoration: none;
          display: flex;
          align-items: center;
          justify-content: center;
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

        /* Spotlight Carousel */
        .spotlight-carousel {
          position: relative;
          height: 600px;
          border-radius: 20px;
          overflow: hidden;
          margin-bottom: 3rem;
        }

        .spotlight-slide {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .spotlight-bg {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .spotlight-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to right, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.7) 50%, transparent 100%);
          display: flex;
          align-items: center;
        }

        .spotlight-content {
          max-width: 600px;
          padding: 3rem;
          color: white;
        }

        .spotlight-badges {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .quality-badge, .type-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 4px;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .quality-badge {
          background: #10b981;
        }

        .type-badge {
          background: rgba(255, 255, 255, 0.2);
        }

        .spotlight-title {
          font-size: 3rem;
          font-weight: 800;
          margin-bottom: 1rem;
          line-height: 1.2;
        }

        .spotlight-synopsis {
          font-size: 1rem;
          line-height: 1.6;
          margin-bottom: 1.5rem;
          opacity: 0.9;
        }

        .spotlight-meta {
          display: flex;
          gap: 1.5rem;
          margin-bottom: 2rem;
          font-size: 0.9rem;
        }

        .spotlight-meta span {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .spotlight-actions {
          display: flex;
          gap: 1rem;
        }

        .play-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 50px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .play-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
        }

        .icon-button {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          color: white;
        }

        .icon-button:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.1);
        }

        .icon-button.active {
          background: #10b981;
        }

        .carousel-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(10px);
          border: none;
          color: white;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          z-index: 10;
        }

        .carousel-btn:hover {
          background: rgba(0, 0, 0, 0.8);
          transform: translateY(-50%) scale(1.1);
        }

        .carousel-btn.prev {
          left: 2rem;
        }

        .carousel-btn.next {
          right: 2rem;
        }

        .carousel-indicators {
          position: absolute;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .indicator {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .indicator.active {
          background: white;
          width: 30px;
          border-radius: 5px;
        }

        .indicator-text {
          color: white;
          font-size: 0.9rem;
          margin-left: 1rem;
          font-weight: 600;
        }

        /* Trending Carousel */
        .trending-carousel {
          position: relative;
          margin-bottom: 2rem;
        }

        .carousel-scroll {
          display: flex;
          gap: 1.5rem;
          overflow-x: auto;
          scroll-behavior: smooth;
          padding-bottom: 1rem;
        }

        .carousel-scroll::-webkit-scrollbar {
          height: 6px;
        }

        .carousel-scroll::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }

        .carousel-scroll::-webkit-scrollbar-thumb {
          background: rgba(102, 126, 234, 0.5);
          border-radius: 10px;
        }

        .trending-card {
          position: relative;
          min-width: 300px;
          height: 450px;
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .trending-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
        }

        .trending-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .trending-rank {
          position: absolute;
          top: 1rem;
          left: 1rem;
          width: 60px;
          height: 60px;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(10px);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          font-weight: 800;
          color: white;
          z-index: 2;
        }

        .trending-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 2rem;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.95), transparent);
          color: white;
        }

        .trending-overlay h3 {
          font-size: 1.2rem;
          font-weight: 600;
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
          position: relative;
          cursor: pointer;
          animation: fadeInUp 0.6s ease-out;
          animation-fill-mode: both;
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

        .rank-badge {
          position: absolute;
          top: 0.5rem;
          left: 0.5rem;
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-weight: 700;
          z-index: 2;
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

        /* Details Page */
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

        /* Episodes Section */
        .episodes-section {
          margin-top: 3rem;
        }

        .episodes-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          gap: 1rem;
        }

        .episodes-header h2 {
          font-size: 1.8rem;
          margin: 0;
        }

        .episodes-controls {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .episode-search-input {
          padding: 0.6rem 1rem;
          border-radius: 8px;
          border: none;
          outline: none;
          font-size: 0.9rem;
        }

        .dark .episode-search-input {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .light .episode-search-input {
          background: rgba(0, 0, 0, 0.05);
          color: #1a1a2e;
          border: 1px solid rgba(0, 0, 0, 0.1);
        }

        .view-toggle {
          background: transparent;
          border: none;
          padding: 0.6rem;
          border-radius: 8px;
          cursor: pointer;
          color: inherit;
          transition: all 0.3s ease;
        }

        .dark .view-toggle {
          background: rgba(255, 255, 255, 0.1);
        }

        .light .view-toggle {
          background: rgba(0, 0, 0, 0.1);
        }

        .view-toggle:hover {
          transform: scale(1.1);
        }

        .episodes-grid {
          display: grid;
          gap: 0.75rem;
          max-height: 60vh;
          overflow-y: auto;
          padding-right: 0.5rem;
        }

        .episodes-grid.grid {
          grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
        }

        .episodes-grid.list {
          grid-template-columns: 1fr;
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
          justify-content: center;
          gap: 0.5rem;
          padding: 1rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
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
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .dark .episode-card:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .light .episode-card:hover {
          background: rgba(0, 0, 0, 0.1);
        }

        .episode-card.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-color: transparent;
        }

        .episodes-grid.list .episode-card {
          justify-content: flex-start;
          padding: 1.25rem;
        }

        .episode-list-content {
          display: flex;
          align-items: center;
          gap: 1rem;
          width: 100%;
        }

        .episode-text {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .ep-number {
          font-weight: 600;
        }

        .ep-title {
          font-size: 0.85rem;
          opacity: 0.7;
        }

        .filler-badge {
          background: #ef4444;
          color: white;
          padding: 0.15rem 0.5rem;
          border-radius: 10px;
          font-size: 0.7rem;
          font-weight: bold;
        }

        /* Watch Page */
        .watch-container {
          animation: fadeInUp 0.6s ease-out;
        }

        .video-wrapper {
          margin-bottom: 2rem;
        }

        .episode-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          border-radius: 12px 12px 0 0;
          margin-bottom: 0;
        }

        .dark .episode-header {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-bottom: none;
        }

        .light .episode-header {
          background: rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-bottom: none;
        }

        .episode-title-section {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .ep-number-badge {
          font-size: 1.5rem;
          font-weight: 700;
          color: #667eea;
        }

        .ep-name {
          font-size: 1.1rem;
          font-weight: 600;
        }

        .episode-actions {
          display: flex;
          gap: 0.75rem;
        }

        .icon-btn {
          background: transparent;
          border: none;
          padding: 0.5rem;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.3s ease;
          color: inherit;
        }

        .dark .icon-btn {
          background: rgba(255, 255, 255, 0.1);
        }

        .light .icon-btn {
          background: rgba(0, 0, 0, 0.1);
        }

        .icon-btn:hover {
          transform: scale(1.1);
        }

        .icon-btn.liked {
          background: rgba(236, 72, 153, 0.2);
        }

        .icon-btn.bookmarked {
          background: rgba(16, 185, 129, 0.2);
        }

        .video-container {
          position: relative;
          width: 100%;
          aspect-ratio: 16/9;
          background: #000;
          border-radius: 0 0 12px 12px;
          overflow: hidden;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
        }

        .video-player {
          width: 100%;
          height: 100%;
          border: none;
        }

        .player-controls-center {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          padding: 2rem;
          border-radius: 12px;
          margin-bottom: 2rem;
        }

        .dark .player-controls-center {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .light .player-controls-center {
          background: rgba(0, 0, 0, 0.05);
          border: 1px solid rgba(0, 0, 0, 0.1);
        }

        .control-row {
          display: flex;
          gap: 2rem;
          flex-wrap: wrap;
          justify-content: center;
          align-items: center;
        }

        .audio-selector, .server-selector, .episode-nav {
          display: flex;
          gap: 0.5rem;
        }

        .audio-selector button, .server-selector button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1.2rem;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .dark .audio-selector button, .dark .server-selector button {
          background: transparent;
          color: rgba(255, 255, 255, 0.7);
        }

        .light .audio-selector button, .light .server-selector button {
          background: transparent;
          color: rgba(0, 0, 0, 0.7);
        }

        .audio-selector button.active {
          color: #667eea;
          font-weight: 700;
        }

        .server-selector button.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .nav-btn {
          padding: 0.6rem 1.2rem;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .dark .nav-btn {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .light .nav-btn {
          background: rgba(0, 0, 0, 0.1);
          color: #1a1a2e;
          border: 1px solid rgba(0, 0, 0, 0.1);
        }

        .nav-btn:hover {
          transform: translateY(-2px);
        }

        .nav-btn.primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-color: transparent;
        }

        .player-info {
          text-align: center;
          font-size: 0.95rem;
        }

        .player-info p {
          margin: 0.25rem 0;
        }

        .server-info {
          opacity: 0.7;
          font-size: 0.85rem;
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

          .spotlight-title {
            font-size: 2rem;
          }

          .spotlight-content {
            padding: 2rem;
          }

          .carousel-btn {
            width: 40px;
            height: 40px;
          }

          .carousel-btn.prev {
            left: 1rem;
          }

          .carousel-btn.next {
            right: 1rem;
          }

          .trending-card {
            min-width: 250px;
            height: 375px;
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

          .control-row {
            flex-direction: column;
            gap: 1rem;
          }

          .episodes-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .episodes-controls {
            width: 100%;
          }

          .episode-search-input {
            flex: 1;
          }
        }
      `}</style>
    </Router>
  );
};

export default App;

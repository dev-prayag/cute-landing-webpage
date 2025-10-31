import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  <div className="anime-card" style={{ animationDelay: `${index * 0.1}s` }} onClick={onClick}>
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
  <div className={`episode-card ${isActive ? 'active' : ''}`} onClick={onClick}>
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

const Footer = React.memo(({ darkMode }) => (
  <footer className={`footer ${darkMode ? 'dark' : 'light'}`}>
    <div className="footer-content">
      <div className="az-listing">
        <h3>A-Z Listing</h3>
        <div className="az-buttons">
          {Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ').map(letter => (
            <a key={letter} href={`/browse/${letter.toLowerCase()}`} className="az-btn">
              {letter}
            </a>
          ))}
        </div>
      </div>
      <div className="footer-credit">
        <p>Made with love by Prayag</p>
      </div>
    </div>
    <style>{`
      .footer { padding: 2rem; border-top: 1px solid; margin-top: 4rem; }
      .dark .footer { background: #000; color: #ffffff; border-color: rgba(255, 255, 255, 0.1); }
      .light .footer { background: #f5f7fa; color: #1a1a2e; border-color: rgba(0, 0, 0, 0.1); }
      .footer-content { max-width: 1400px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 2rem; }
      .az-listing h3 { margin-bottom: 1rem; }
      .az-buttons { display: flex; flex-wrap: wrap; gap: 0.5rem; }
      .az-btn { padding: 0.5rem 1rem; border: 1px solid; border-radius: 4px; text-decoration: none; color: inherit; transition: all 0.3s ease; }
      .dark .az-btn { border-color: rgba(255, 255, 255, 0.1); }
      .light .az-btn { border-color: rgba(0, 0, 0, 0.1); }
      .az-btn:hover { background: rgba(102, 126, 234, 0.1); border-color: #667eea; }
      .footer-credit { text-align: center; opacity: 0.7; }
      @media (max-width: 768px) { .footer-content { flex-direction: column; text-align: center; } }
    `}</style>
  </footer>
));

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
  const [spotlightIndex, setSpotlightIndex] = useState(0);
  const [episodeSearch, setEpisodeSearch] = useState('');
  const [episodeListView, setEpisodeListView] = useState('grid');
  const iframeRef = useRef(null);
  const navigate = useNavigate();
  const { animeName, episodeNum, query } = useParams();

  useEffect(() => {
    const liked = JSON.parse(localStorage.getItem('likedAnimes') || '[]');
    const bookmarked = JSON.parse(localStorage.getItem('bookmarkedAnimes') || '[]');
    setLikedAnimes(liked);
    setBookmarkedAnimes(bookmarked);
    fetchHomeData();
  }, []); // Only on initial mount

  useEffect(() => {
    const handleScroll = () => {
      const shouldShow = window.scrollY > 400;
      setShowBackToTop(prev => prev !== shouldShow ? shouldShow : prev);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []); // Detached from state changes

  useEffect(() => {
    if (animeName && !episodes.length) {
      fetchAnimeDetailsByName(animeName);
    }
  }, [animeName]); // Only on route param change

  useEffect(() => {
    if (query && query !== searchQuery) {
      setSearchQuery(query);
      handleSearch();
    }
  }, [query]); // Only on route param change

  useEffect(() => {
    if (episodeNum && selectedAnime) {
      const epIndex = parseInt(episodeNum) - 1;
      if (epIndex >= 0 && epIndex < episodes.length) {
        setCurrentEpisodeIndex(epIndex);
        setSelectedEpisode(episodes[epIndex]);
      }
    }
  }, [episodeNum, episodes.length, selectedAnime?.id]); // Only on relevant changes

  const fetchHomeData = useCallback(async () => {
    try {
      const data = await fetchWithCache(`${API_BASE}/home`);
      setHomeData(data.data);
    } catch (err) {
      console.error('Error fetching home data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAnimeDetailsByName = useCallback(async (name) => {
    try {
      const data = await fetchWithCache(`${API_BASE}/search?keyword=${encodeURIComponent(name)}&page=1`);
      const anime = data.data.response[0]; // Assume first match
      if (anime) {
        setSelectedAnime(anime);
        await fetchAnimeDetails(anime.id);
        await fetchEpisodes(anime.id);
      }
    } catch (err) {
      console.error('Error fetching anime by name:', err);
    }
  }, []);

  const fetchAnimeDetails = useCallback(async (animeId) => {
    try {
      const data = await fetchWithCache(`${API_BASE}/anime/${animeId}`);
      setAnimeDetails(data.data);
    } catch (err) {
      console.error('Error fetching anime details:', err);
    }
  }, []);

  const fetchEpisodes = useCallback(async (animeId) => {
    try {
      const data = await fetchWithCache(`${API_BASE}/episodes/${animeId}`);
      setEpisodes(data.data);
    } catch (err) {
      console.error('Error fetching episodes:', err);
    }
  }, []);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const data = await fetchWithCache(`${API_BASE}/search?keyword=${encodeURIComponent(searchQuery)}&page=1`);
      setSearchResults(data.data.response);
      navigate(`/browse/${encodeURIComponent(searchQuery)}`);
    } catch (err) {
      console.error('Error searching:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, navigate]);

  const toggleTheme = useCallback(() => setDarkMode(prev => !prev), []);

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

  const scrollToTop = useCallback(() => window.scrollTo({ top: 0, behavior: 'smooth' }), []);

  const handleEpisodeSelect = useCallback((episode, index) => {
    setSelectedEpisode(episode);
    setCurrentEpisodeIndex(index);
    navigate(`/anime/${encodeURIComponent(selectedAnime.title)}/episode=${index + 1}`);
  }, [selectedAnime?.title, navigate]);

  const changeEpisode = useCallback((direction) => {
    setCurrentEpisodeIndex(prev => {
      const newIndex = direction === 'next' ? prev + 1 : prev - 1;
      if (newIndex >= 0 && newIndex < episodes.length) {
        setSelectedEpisode(episodes[newIndex]);
        navigate(`/anime/${encodeURIComponent(selectedAnime.title)}/episode=${newIndex + 1}`);
        return newIndex;
      }
      return prev;
    });
  }, [episodes.length, selectedAnime?.title, navigate]);

  const getStreamUrl = useCallback(() => {
    if (!selectedEpisode) return '';
    const episodeNum = selectedEpisode.id.split('ep=').pop();
    const baseUrl = server === 'vidWish' ? 'vidwish.live' : 'megaplay.buzz';
    return `https://${baseUrl}/stream/s-2/${episodeNum}/${streamType}`;
  }, [selectedEpisode?.id, server, streamType]);

  const nextSpotlight = useCallback(() => {
    setSpotlightIndex((prev) => (prev + 1) % (homeData?.spotlight?.length || 1));
  }, [homeData?.spotlight?.length]);

  const prevSpotlight = useCallback(() => {
    setSpotlightIndex((prev) => (prev - 1 + (homeData?.spotlight?.length || 1)) % (homeData?.spotlight?.length || 1));
  }, [homeData?.spotlight?.length]);

  const filteredEpisodes = useMemo(() => {
    if (!episodeSearch) return episodes;
    const searchLower = episodeSearch.toLowerCase();
    return episodes.filter((ep, idx) => {
      const epNum = idx + 1;
      return epNum.toString().includes(episodeSearch) ||
        (ep.title && ep.title.toLowerCase().includes(searchLower));
    });
  }, [episodes, episodeSearch]);

  const handleAnimeClick = useCallback((anime) => {
    setSelectedAnime(anime);
    navigate(`/anime/${encodeURIComponent(anime.title)}`);
  }, [navigate]);

  const goToLiked = useCallback(() => navigate('/liked'), [navigate]);
  const goToBookmarked = useCallback(() => navigate('/bookmarked'), [navigate]);
  const goToHome = useCallback(() => navigate('/home'), [navigate]);

  const streamUrl = useMemo(() => getStreamUrl(), [getStreamUrl]);

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
                  onClick={(e) => { e.stopPropagation(); toggleBookmark(anime); }}
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

  // Views as separate components to isolate re-renders
  const HomeView = useMemo(() => (
    <>
      <SpotlightSection />
      <section className="anime-section">
        <h2><TrendingUp size={24} /> Trending Now</h2>
        <TrendingSection />
      </section>
      <section className="anime-section">
        <h2><Star size={24} /> Most Popular</h2>
        <div className="anime-grid">
          {homeData?.mostPopular?.slice(0, 12).map((anime, i) => (
            <AnimeCard key={anime.id} anime={anime} index={i} onClick={() => handleAnimeClick(anime)} />
          ))}
        </div>
      </section>
      <section className="anime-section">
        <h2><Clock size={24} /> Recently Added</h2>
        <div className="anime-grid">
          {homeData?.newAdded?.slice(0, 12).map((anime, i) => (
            <AnimeCard key={anime.id} anime={anime} index={i} onClick={() => handleAnimeClick(anime)} />
          ))}
        </div>
      </section>
    </>
  ), [homeData, spotlightIndex, bookmarkedAnimes, handleAnimeClick]); // Memoized on key deps only

  const SearchView = useMemo(() => (
    <section className="anime-section">
      <h2>Search Results for "{searchQuery}"</h2>
      <div className="anime-grid">
        {searchResults.map((anime, i) => (
          <AnimeCard key={anime.id} anime={anime} index={i} onClick={() => handleAnimeClick(anime)} />
        ))}
      </div>
    </section>
  ), [searchQuery, searchResults, handleAnimeClick]);

  const LikedView = useMemo(() => (
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
  ), [likedAnimes, handleAnimeClick]);

  const BookmarkedView = useMemo(() => (
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
  ), [bookmarkedAnimes, handleAnimeClick]);

  const AnimeDetailsView = useMemo(() => (
    <div className="anime-details">
      <button className="back-btn" onClick={() => navigate('/home')}>
        <ArrowLeft size={20} /> Back
      </button>

      {animeDetails && (
        <>
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
        </>
      )}
    </div>
  ), [animeDetails, episodes.length, episodeSearch, episodeListView, filteredEpisodes, likedAnimes, bookmarkedAnimes, toggleLike, toggleBookmark, navigate, handleEpisodeSelect]);

  const WatchView = useMemo(() => {
    const currentEp = episodes[currentEpisodeIndex];
    const isLiked = selectedAnime && likedAnimes.some(a => a.id === selectedAnime.id);
    const isBookmarked = selectedAnime && bookmarkedAnimes.some(a => a.id === selectedAnime.id);

    return (
      <div className="watch-container">
        <button className="back-btn" onClick={() => navigate(`/anime/${encodeURIComponent(selectedAnime.title)}`)}>
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
              src={streamUrl}
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
    );
  }, [currentEpisodeIndex, episodes, selectedAnime, likedAnimes, bookmarkedAnimes, streamUrl, streamType, server, episodeSearch, episodeListView, filteredEpisodes, toggleLike, toggleBookmark, navigate, changeEpisode, handleEpisodeSelect]);

  if (loading && activeView !== 'details' && activeView !== 'watch') {
    return (
      <div className={`app ${darkMode ? 'dark' : 'light'}`}>
        <div className="loader-container">
          <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' stroke='%23667eea' stroke-width='8' fill='none' stroke-dasharray='63 188' stroke-linecap='round'%3E%3CanimateTransform attributeName='transform' type='rotate' repeatCount='indefinite' dur='1s' values='0 50 50;360 50 50' keyTimes='0;1'/%3E%3C/circle%3E%3C/svg%3E" alt="Loading..." className="loader" />
        </div>
      </div>
    );
  }

  return (
    <div className={`app ${darkMode ? 'dark' : 'light'}`}>
      <nav className="navbar">
        <div className="nav-container">
          <h1 className="logo" onClick={goToHome}>音楽子</h1>
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
            <button onClick={goToLiked} className="nav-btn">
              <Heart size={22} />
              {likedAnimes.length > 0 && <span className="badge">{likedAnimes.length}</span>}
            </button>
            <button onClick={goToBookmarked} className="nav-btn">
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
        {location.pathname === '/home' || location.pathname === '/' ? <HomeView /> : null}
        {location.pathname === '/liked' ? <LikedView /> : null}
        {location.pathname === '/bookmarked' ? <BookmarkedView /> : null}
        {location.pathname.startsWith('/browse/') ? <SearchView /> : null}
        {location.pathname.startsWith('/anime/') && !episodeNum ? <AnimeDetailsView /> : null}
        {location.pathname.startsWith('/anime/') && episodeNum ? <WatchView /> : null}
      </main>

      {showBackToTop && (
        <button className="back-to-top" onClick={scrollToTop}>
          <ChevronUp size={24} />
        </button>
      )}

      <Footer darkMode={darkMode} />

      {/* Styles unchanged from previous – omitted for brevity, but include the full <style> block here */}
    </div>
  );
};

export default Ongaku;

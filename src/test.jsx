import React, { useState, useEffect, useRef } from 'react';
import { Play, Heart, Bookmark, Sun, Moon, ChevronUp, Search, Clock, TrendingUp, Star, Film, Tv, Calendar, X } from 'lucide-react';

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
  const videoRef = useRef(null);
  const themeToggleRef = useRef(null);

  useEffect(() => {
    const savedLiked = JSON.parse(localStorage.getItem('liked') || '[]');
    const savedBookmarked = JSON.parse(localStorage.getItem('bookmarked') || '[]');
    setLiked(savedLiked);
    setBookmarked(savedBookmarked);
    fetchHomeData();

    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    
    if (themeToggleRef.current) {
      const rect = themeToggleRef.current.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      
      const ripple = document.createElement('div');
      ripple.style.position = 'fixed';
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      ripple.style.width = '0';
      ripple.style.height = '0';
      ripple.style.borderRadius = '50%';
      ripple.style.background = newTheme === 'light' ? '#fff' : '#1a1a1a';
      ripple.style.transform = 'translate(-50%, -50%)';
      ripple.style.zIndex = '-1';
      ripple.style.pointerEvents = 'none';
      ripple.style.transition = 'width 0.8s ease-out, height 0.8s ease-out';
      
      document.body.appendChild(ripple);
      
      setTimeout(() => {
        ripple.style.width = '3000px';
        ripple.style.height = '3000px';
      }, 10);
      
      setTimeout(() => {
        setTheme(newTheme);
        ripple.remove();
      }, 400);
    } else {
      setTheme(newTheme);
    }
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

  const bgClass = theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50';
  const textClass = theme === 'dark' ? 'text-white' : 'text-gray-900';
  const cardBg = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
  const hoverClass = theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100';

  return (
    <div className={`min-h-screen ${bgClass} ${textClass} transition-colors duration-300`}>
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 ${cardBg} shadow-lg backdrop-blur-sm bg-opacity-95`}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <h1 
                className="text-2xl font-bold cursor-pointer hover:scale-105 transition-transform"
                onClick={() => {
                  setCurrentPage('home');
                  setShowAnimeModal(false);
                }}
              >
                音楽Ko
              </h1>
              <nav className="hidden md:flex space-x-6">
                <button 
                  onClick={() => setCurrentPage('home')}
                  className={`hover:text-blue-500 transition-colors ${currentPage === 'home' ? 'text-blue-500' : ''}`}
                >
                  Home
                </button>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search anime..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                  className={`px-4 py-2 rounded-full ${cardBg} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-blue-500 w-64`}
                />
                <Search className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
              </div>
              
              <button
                ref={themeToggleRef}
                onClick={toggleTheme}
                className={`p-2 rounded-full ${hoverClass} transition-all hover:scale-110`}
              >
                {theme === 'dark' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="pt-20">
        {currentPage === 'home' && homeData && (
          <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Spotlight Section */}
            {homeData.spotlight && homeData.spotlight.length > 0 && (
              <div className="mb-12">
                <div 
                  className="relative rounded-2xl overflow-hidden h-96 group cursor-pointer"
                  style={{
                    backgroundImage: `url(${homeData.spotlight[0].poster})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                  onClick={() => handleAnimeClick(homeData.spotlight[0])}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent">
                    <div className="absolute bottom-0 left-0 p-8">
                      <h2 className="text-4xl font-bold mb-2">{homeData.spotlight[0].title}</h2>
                      <p className="text-gray-300 mb-4 max-w-2xl line-clamp-3">{homeData.spotlight[0].synopsis}</p>
                      <div className="flex items-center space-x-4">
                        <button className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-full flex items-center space-x-2 transition-all transform hover:scale-105">
                          <Play className="w-5 h-5" />
                          <span>Watch Now</span>
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBookmark(homeData.spotlight[0].id);
                          }}
                          className={`p-3 rounded-full ${cardBg} ${hoverClass} transition-all`}
                        >
                          <Bookmark className={`w-5 h-5 ${bookmarked.includes(homeData.spotlight[0].id) ? 'fill-current text-blue-500' : ''}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Search Results */}
            {searchResults.length > 0 && (
              <Section title="Search Results" icon={<Search />}>
                <AnimeGrid 
                  animes={searchResults} 
                  onAnimeClick={handleAnimeClick}
                  liked={liked}
                  bookmarked={bookmarked}
                  toggleLike={toggleLike}
                  toggleBookmark={toggleBookmark}
                  theme={theme}
                />
              </Section>
            )}

            {/* Trending */}
            {homeData.trending && (
              <Section title="Trending Now" icon={<TrendingUp />}>
                <AnimeGrid 
                  animes={homeData.trending} 
                  onAnimeClick={handleAnimeClick}
                  liked={liked}
                  bookmarked={bookmarked}
                  toggleLike={toggleLike}
                  toggleBookmark={toggleBookmark}
                  theme={theme}
                />
              </Section>
            )}

            {/* Top Airing */}
            {homeData.topAiring && (
              <Section title="Top Airing" icon={<Tv />}>
                <AnimeGrid 
                  animes={homeData.topAiring} 
                  onAnimeClick={handleAnimeClick}
                  liked={liked}
                  bookmarked={bookmarked}
                  toggleLike={toggleLike}
                  toggleBookmark={toggleBookmark}
                  theme={theme}
                />
              </Section>
            )}

            {/* Most Popular */}
            {homeData.mostPopular && (
              <Section title="Most Popular" icon={<Star />}>
                <AnimeGrid 
                  animes={homeData.mostPopular} 
                  onAnimeClick={handleAnimeClick}
                  liked={liked}
                  bookmarked={bookmarked}
                  toggleLike={toggleLike}
                  toggleBookmark={toggleBookmark}
                  theme={theme}
                />
              </Section>
            )}

            {/* Latest Episodes */}
            {homeData.latestEpisode && (
              <Section title="Latest Episodes" icon={<Clock />}>
                <AnimeGrid 
                  animes={homeData.latestEpisode} 
                  onAnimeClick={handleAnimeClick}
                  liked={liked}
                  bookmarked={bookmarked}
                  toggleLike={toggleLike}
                  toggleBookmark={toggleBookmark}
                  theme={theme}
                />
              </Section>
            )}
          </div>
        )}

        {/* Anime Detail Modal */}
        {showAnimeModal && animeDetails && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75 animate-fadeIn">
            <div className="min-h-screen px-4 py-8">
              <div className={`max-w-6xl mx-auto ${cardBg} rounded-2xl shadow-2xl animate-slideUp`}>
                <button
                  onClick={() => {
                    setShowAnimeModal(false);
                    setCurrentPage('home');
                    setStreamData(null);
                  }}
                  className="absolute top-4 right-4 p-2 rounded-full bg-red-600 hover:bg-red-700 transition-colors z-10"
                >
                  <X className="w-6 h-6 text-white" />
                </button>

                {/* Video Player */}
                {streamData && (
                  <div className="mb-8">
                    <video
                      ref={videoRef}
                      controls
                      className="w-full rounded-t-2xl"
                      src={streamData.streamingLink.link.file}
                      crossOrigin="anonymous"
                    >
                      <track
                        kind="subtitles"
                        src=""
                        srcLang="en"
                        label="English"
                      />
                    </video>
                    <div className="p-4 border-b">
                      <h3 className="text-xl font-bold mb-2">{currentEpisode?.title}</h3>
                      <div className="flex space-x-4">
                        <button
                          onClick={() => {
                            setServerType('sub');
                            playEpisode(currentEpisode);
                          }}
                          className={`px-4 py-2 rounded-lg ${serverType === 'sub' ? 'bg-blue-600' : cardBg} transition-colors`}
                        >
                          SUB
                        </button>
                        <button
                          onClick={() => {
                            setServerType('dub');
                            playEpisode(currentEpisode);
                          }}
                          className={`px-4 py-2 rounded-lg ${serverType === 'dub' ? 'bg-blue-600' : cardBg} transition-colors`}
                        >
                          DUB
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-8">
                  {/* Anime Info */}
                  <div className="flex gap-8 mb-8">
                    <img
                      src={animeDetails.poster}
                      alt={animeDetails.title}
                      className="w-48 h-72 object-cover rounded-lg shadow-lg"
                    />
                    <div className="flex-1">
                      <h2 className="text-3xl font-bold mb-2">{animeDetails.title}</h2>
                      <p className="text-gray-400 mb-4">{animeDetails.alternativeTitle}</p>
                      <div className="flex items-center space-x-4 mb-4">
                        <span className="px-3 py-1 bg-blue-600 rounded-full text-sm">{animeDetails.type}</span>
                        <span className="px-3 py-1 bg-green-600 rounded-full text-sm">{animeDetails.rating}</span>
                        <span className="flex items-center space-x-1">
                          <Star className="w-4 h-4 fill-current text-yellow-500" />
                          <span>{animeDetails.MAL_score}</span>
                        </span>
                      </div>
                      <p className="text-gray-300 mb-4 leading-relaxed">{animeDetails.synopsis}</p>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <span className="text-gray-400">Status:</span> {animeDetails.status}
                        </div>
                        <div>
                          <span className="text-gray-400">Duration:</span> {animeDetails.duration}
                        </div>
                        <div>
                          <span className="text-gray-400">Studio:</span> {animeDetails.studios}
                        </div>
                        <div>
                          <span className="text-gray-400">Premiered:</span> {animeDetails.premiered}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {animeDetails.genres?.map((genre, i) => (
                          <span key={i} className={`px-3 py-1 ${cardBg} rounded-full text-sm`}>
                            {genre}
                          </span>
                        ))}
                      </div>
                      <div className="flex space-x-4">
                        <button 
                          onClick={() => toggleLike(animeDetails.id)}
                          className={`p-3 rounded-full ${hoverClass} transition-all hover:scale-110`}
                        >
                          <Heart className={`w-6 h-6 ${liked.includes(animeDetails.id) ? 'fill-current text-red-500' : ''}`} />
                        </button>
                        <button 
                          onClick={() => toggleBookmark(animeDetails.id)}
                          className={`p-3 rounded-full ${hoverClass} transition-all hover:scale-110`}
                        >
                          <Bookmark className={`w-6 h-6 ${bookmarked.includes(animeDetails.id) ? 'fill-current text-blue-500' : ''}`} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Episodes */}
                  {episodes.length > 0 && (
                    <div>
                      <h3 className="text-2xl font-bold mb-4">Episodes</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-96 overflow-y-auto">
                        {episodes.map((ep, i) => (
                          <button
                            key={i}
                            onClick={() => playEpisode(ep)}
                            className={`p-4 ${cardBg} ${hoverClass} rounded-lg transition-all hover:scale-105 hover:shadow-lg ${currentEpisode?.id === ep.id ? 'ring-2 ring-blue-500' : ''}`}
                          >
                            <div className="text-sm font-medium">Episode {i + 1}</div>
                            <div className="text-xs text-gray-400 mt-1 line-clamp-2">{ep.title}</div>
                          </button>
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

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-4 bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg transition-all hover:scale-110 animate-fadeIn z-40"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
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
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

const Section = ({ title, icon, children }) => (
  <div className="mb-12">
    <div className="flex items-center space-x-3 mb-6">
      {icon}
      <h2 className="text-2xl font-bold">{title}</h2>
    </div>
    {children}
  </div>
);

const AnimeGrid = ({ animes, onAnimeClick, liked, bookmarked, toggleLike, toggleBookmark, theme }) => {
  const cardBg = theme === 'dark' ? 'bg-gray-800' : 'bg-white';
  const hoverClass = theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100';
  
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {animes.slice(0, 12).map((anime, i) => (
        <div
          key={i}
          className={`${cardBg} rounded-lg overflow-hidden shadow-lg cursor-pointer transition-all hover:scale-105 hover:shadow-2xl group animate-fadeIn`}
          style={{ animationDelay: `${i * 0.05}s` }}
          onClick={() => onAnimeClick(anime)}
        >
          <div className="relative">
            <img
              src={anime.poster}
              alt={anime.title}
              className="w-full h-72 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="absolute bottom-2 left-2 right-2 flex justify-between">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLike(anime.id);
                  }}
                  className="p-2 bg-black bg-opacity-50 rounded-full hover:bg-opacity-75 transition-all"
                >
                  <Heart className={`w-4 h-4 ${liked.includes(anime.id) ? 'fill-current text-red-500' : ''}`} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleBookmark(anime.id);
                  }}
                  className="p-2 bg-black bg-opacity-50 rounded-full hover:bg-opacity-75 transition-all"
                >
                  <Bookmark className={`w-4 h-4 ${bookmarked.includes(anime.id) ? 'fill-current text-blue-500' : ''}`} />
                </button>
              </div>
            </div>
            {anime.episodes && (
              <div className="absolute top-2 left-2">
                <span className="px-2 py-1 bg-blue-600 rounded text-xs font-bold">
                  EP {anime.episodes.eps || anime.episodes.sub}
                </span>
              </div>
            )}
          </div>
          <div className="p-3">
            <h3 className="font-semibold text-sm line-clamp-2 mb-1">{anime.title}</h3>
            {anime.type && (
              <p className="text-xs text-gray-400">{anime.type}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Ongaku;

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, BookmarkPlus, Heart, List, Sun, Moon, User, LogOut, Home, Search, Clock } from 'lucide-react';

const Ongaku = () => {
  const [animeList, setAnimeList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [currentEpisode, setCurrentEpisode] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bookmarks, setBookmarks] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [currentView, setCurrentView] = useState('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [darkMode, setDarkMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const videoRef = useRef(null);

  // Fetch anime from Jikan API (free, no key needed)
  useEffect(() => {
    fetchAnime();
  }, []);

  const fetchAnime = async (query = '') => {
    setLoading(true);
    try {
      const url = query 
        ? `https://api.jikan.moe/v4/anime?q=${query}&limit=20`
        : `https://api.jikan.moe/v4/top/anime?limit=20`;
      const response = await fetch(url);
      const data = await response.json();
      setAnimeList(data.data || []);
    } catch (error) {
      console.error('Error fetching anime:', error);
    }
    setLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      fetchAnime(searchQuery);
    }
  };

  const playAnime = (anime) => {
    setSelectedAnime(anime);
    // For demo, using a sample video URL since we can't embed actual anime
    setCurrentEpisode({
      number: 1,
      title: `${anime.title} - Episode 1`,
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
    });
    setCurrentView('player');
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.parentElement.requestFullscreen();
      }
    }
  };

  const addToBookmarks = (anime) => {
    if (!bookmarks.find(b => b.mal_id === anime.mal_id)) {
      setBookmarks([...bookmarks, anime]);
    }
  };

  const addToFavorites = (anime) => {
    if (!favorites.find(f => f.mal_id === anime.mal_id)) {
      setFavorites([...favorites, anime]);
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (username.trim()) {
      setIsLoggedIn(true);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setBookmarks([]);
    setFavorites([]);
    setPlaylists([]);
  };

  const bgClass = darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900';
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const borderClass = darkMode ? 'border-gray-700' : 'border-gray-200';

  if (!isLoggedIn) {
    return (
      <div className={`min-h-screen ${bgClass} flex items-center justify-center p-4`}>
        <div className={`${cardBg} p-8 rounded-lg shadow-2xl max-w-md w-full border ${borderClass}`}>
          <h1 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            音楽子
          </h1>
          <p className={`text-center mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Your Anime Streaming Portal
          </p>
          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`w-full p-3 rounded-lg mb-4 ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'} border ${borderClass} focus:outline-none focus:ring-2 focus:ring-purple-500`}
            />
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-lg font-semibold hover:opacity-90 transition"
            >
              Enter 音楽子
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgClass}`}>
      {/* Header */}
      <header className={`${cardBg} border-b ${borderClass} sticky top-0 z-50`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent cursor-pointer"
                  onClick={() => setCurrentView('home')}>
                音楽子
              </h1>
              <nav className="flex gap-4">
                <button onClick={() => setCurrentView('home')} className={`flex items-center gap-2 px-4 py-2 rounded-lg ${currentView === 'home' ? 'bg-purple-500 text-white' : ''}`}>
                  <Home size={18} />
                  Home
                </button>
                <button onClick={() => setCurrentView('bookmarks')} className={`flex items-center gap-2 px-4 py-2 rounded-lg ${currentView === 'bookmarks' ? 'bg-purple-500 text-white' : ''}`}>
                  <BookmarkPlus size={18} />
                  Bookmarks ({bookmarks.length})
                </button>
                <button onClick={() => setCurrentView('favorites')} className={`flex items-center gap-2 px-4 py-2 rounded-lg ${currentView === 'favorites' ? 'bg-purple-500 text-white' : ''}`}>
                  <Heart size={18} />
                  Favorites ({favorites.length})
                </button>
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-lg hover:bg-gray-700">
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <div className="flex items-center gap-2">
                <User size={20} />
                <span>{username}</span>
                <button onClick={handleLogout} className="ml-2 p-2 rounded-lg hover:bg-red-500">
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Video Player View */}
      {currentView === 'player' && currentEpisode && (
        <div className="container mx-auto px-4 py-6">
          <button 
            onClick={() => setCurrentView('home')}
            className="mb-4 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
          >
            ← Back to Browse
          </button>
          <div className="max-w-6xl mx-auto">
            <div className="relative bg-black rounded-lg overflow-hidden shadow-2xl">
              {/* Watermark */}
              <div className="absolute top-4 right-4 z-10 bg-black bg-opacity-50 px-3 py-1 rounded text-white text-sm font-bold">
                音楽子
              </div>
              
              <video
                ref={videoRef}
                src={currentEpisode.videoUrl}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleTimeUpdate}
                className="w-full aspect-video"
                onClick={togglePlay}
              />
              
              {/* Custom Controls */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full mb-3 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${(currentTime / duration) * 100}%, #4b5563 ${(currentTime / duration) * 100}%, #4b5563 100%)`
                  }}
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button onClick={togglePlay} className="text-white hover:text-purple-400">
                      {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                    </button>
                    <button onClick={toggleMute} className="text-white hover:text-purple-400">
                      {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="text-white text-sm">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => addToBookmarks(selectedAnime)} className="text-white hover:text-purple-400">
                      <BookmarkPlus size={20} />
                    </button>
                    <button onClick={() => addToFavorites(selectedAnime)} className="text-white hover:text-pink-400">
                      <Heart size={20} />
                    </button>
                    <button onClick={toggleFullscreen} className="text-white hover:text-purple-400">
                      <Maximize size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className={`${cardBg} mt-6 p-6 rounded-lg shadow-lg`}>
              <h2 className="text-2xl font-bold mb-2">{selectedAnime.title}</h2>
              <p className={`mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Episode {currentEpisode.number}
              </p>
              <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                {selectedAnime.synopsis}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Home/Browse View */}
      {currentView === 'home' && (
        <div className="container mx-auto px-4 py-6">
          <form onSubmit={handleSearch} className="mb-6 max-w-2xl mx-auto">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search anime..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`flex-1 p-3 rounded-lg ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} border ${borderClass} focus:outline-none focus:ring-2 focus:ring-purple-500`}
              />
              <button type="submit" className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 flex items-center gap-2">
                <Search size={20} />
                Search
              </button>
            </div>
          </form>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {animeList.map((anime) => (
                <div key={anime.mal_id} className={`${cardBg} rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow cursor-pointer border ${borderClass}`}>
                  <div className="relative">
                    <img
                      src={anime.images.jpg.large_image_url}
                      alt={anime.title}
                      className="w-full h-64 object-cover"
                      onClick={() => playAnime(anime)}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-60 transition-opacity flex items-center justify-center"
                         onClick={() => playAnime(anime)}>
                      <Play className="text-white opacity-0 hover:opacity-100 transition-opacity" size={48} />
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-sm mb-2 line-clamp-2">{anime.title}</h3>
                    <div className="flex justify-between items-center mb-2">
                      <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        ⭐ {anime.score || 'N/A'}
                      </span>
                      <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {anime.episodes || '?'} eps
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => addToBookmarks(anime)}
                        className="flex-1 p-2 bg-purple-500 text-white rounded hover:bg-purple-600 text-xs"
                      >
                        <BookmarkPlus size={14} className="inline mr-1" />
                        Bookmark
                      </button>
                      <button
                        onClick={() => addToFavorites(anime)}
                        className="flex-1 p-2 bg-pink-500 text-white rounded hover:bg-pink-600 text-xs"
                      >
                        <Heart size={14} className="inline mr-1" />
                        Favorite
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bookmarks View */}
      {currentView === 'bookmarks' && (
        <div className="container mx-auto px-4 py-6">
          <h2 className="text-3xl font-bold mb-6">My Bookmarks</h2>
          {bookmarks.length === 0 ? (
            <div className="text-center py-12">
              <BookmarkPlus size={64} className="mx-auto mb-4 opacity-50" />
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>No bookmarks yet. Start adding some anime!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {bookmarks.map((anime) => (
                <div key={anime.mal_id} className={`${cardBg} rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow cursor-pointer border ${borderClass}`}>
                  <img
                    src={anime.images.jpg.large_image_url}
                    alt={anime.title}
                    className="w-full h-64 object-cover"
                    onClick={() => playAnime(anime)}
                  />
                  <div className="p-3">
                    <h3 className="font-semibold text-sm mb-2 line-clamp-2">{anime.title}</h3>
                    <button
                      onClick={() => playAnime(anime)}
                      className="w-full p-2 bg-purple-500 text-white rounded hover:bg-purple-600 text-xs"
                    >
                      <Play size={14} className="inline mr-1" />
                      Watch Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Favorites View */}
      {currentView === 'favorites' && (
        <div className="container mx-auto px-4 py-6">
          <h2 className="text-3xl font-bold mb-6">My Favorites</h2>
          {favorites.length === 0 ? (
            <div className="text-center py-12">
              <Heart size={64} className="mx-auto mb-4 opacity-50" />
              <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>No favorites yet. Start adding some anime!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {favorites.map((anime) => (
                <div key={anime.mal_id} className={`${cardBg} rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow cursor-pointer border ${borderClass}`}>
                  <img
                    src={anime.images.jpg.large_image_url}
                    alt={anime.title}
                    className="w-full h-64 object-cover"
                    onClick={() => playAnime(anime)}
                  />
                  <div className="p-3">
                    <h3 className="font-semibold text-sm mb-2 line-clamp-2">{anime.title}</h3>
                    <button
                      onClick={() => playAnime(anime)}
                      className="w-full p-2 bg-pink-500 text-white rounded hover:bg-pink-600 text-xs"
                    >
                      <Play size={14} className="inline mr-1" />
                      Watch Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Ongaku;

import React, { useState, useRef, useEffect } from 'react';

const API_BASE = 'https://saavn.sumit.co/api';

const Ongaku = () => {
  const [theme, setTheme] = useState('dark');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [currentTab, setCurrentTab] = useState('all');
  const [loading, setLoading] = useState(false);
  
  const [currentSong, setCurrentSong] = useState(null);
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState(0); // 0: off, 1: all, 2: one
  
  const audioRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Search functionality
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.length < 2) {
      setSearchResults(null);
      return;
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchAll(searchQuery);
    }, 500);
  }, [searchQuery]);

  const searchAll = async (query) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/search?query=${encodeURIComponent(query)}`);
      const data = await response.json();
      if (data.success) {
        setSearchResults(data.data);
      }
    } catch (error) {
      console.error('Search error:', error);
    }
    setLoading(false);
  };

  // Play song
  const playSong = async (songId) => {
    try {
      const response = await fetch(`${API_BASE}/songs/${songId}`);
      const data = await response.json();
      
      if (data.success && data.data[0]) {
        const song = data.data[0];
        setCurrentSong(song);
        setQueue([song]);
        setCurrentIndex(0);
        
        const audioUrl = song.downloadUrl?.find(d => d.quality === '320kbps')?.url || 
                       song.downloadUrl?.[0]?.url;
        
        if (audioUrl && audioRef.current) {
          audioRef.current.src = audioUrl;
          audioRef.current.play();
          loadSuggestions(songId);
        }
      }
    } catch (error) {
      console.error('Play error:', error);
    }
  };

  const loadSuggestions = async (songId) => {
    try {
      const response = await fetch(`${API_BASE}/songs/${songId}/suggestions?limit=20`);
      const data = await response.json();
      
      if (data.success && data.data) {
        setQueue(prev => [prev[0], ...data.data]);
      }
    } catch (error) {
      console.error('Suggestions error:', error);
    }
  };

  // Audio event handlers
  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };
  const handleEnded = () => {
    if (repeatMode === 2) {
      audioRef.current?.play();
    } else {
      playNext();
    }
  };

  // Playback controls
  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  const playNext = () => {
    if (queue.length === 0) return;
    
    let nextIndex;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else {
      nextIndex = (currentIndex + 1) % queue.length;
    }
    
    setCurrentIndex(nextIndex);
    const nextSong = queue[nextIndex];
    if (nextSong) {
      playSong(nextSong.id);
    }
  };

  const playPrev = () => {
    if (queue.length === 0) return;
    
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
    } else {
      const prevIndex = currentIndex - 1 < 0 ? queue.length - 1 : currentIndex - 1;
      setCurrentIndex(prevIndex);
      const prevSong = queue[prevIndex];
      if (prevSong) {
        playSong(prevSong.id);
      }
    }
  };

  const handleProgressClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    if (audioRef.current) {
      audioRef.current.currentTime = percent * duration;
    }
  };

  const handleVolumeClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newVolume = Math.max(0, Math.min(1, percent));
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const toggleShuffle = () => setIsShuffle(!isShuffle);
  const toggleRepeat = () => setRepeatMode((repeatMode + 1) % 3);

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`app-container ${theme === 'light' ? 'light-theme' : ''}`}>
      <div className="main-content">
        <div className="sidebar">
          <div className="logo">Resonance</div>
          <div className="search-container">
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search songs, artists, albums..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            className="theme-toggle" 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            <span>{theme === 'dark' ? '🌙' : '☀️'}</span>
            <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
          </button>
        </div>

        <div className="content-area">
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Searching...</p>
            </div>
          ) : !searchResults ? (
            <div className="empty-state">
              <div className="empty-state-icon">🎵</div>
              <h2>Welcome to Resonance</h2>
              <p>Search for your favorite songs, artists, or albums to get started</p>
            </div>
          ) : (
            <>
              <div className="tab-container">
                {['all', 'songs', 'albums', 'artists', 'playlists'].map(tab => (
                  <button 
                    key={tab}
                    className={`tab ${currentTab === tab ? 'active' : ''}`}
                    onClick={() => setCurrentTab(tab)}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              {(currentTab === 'all' || currentTab === 'songs') && searchResults.songs?.results?.length > 0 && (
                <Section title="Songs" items={searchResults.songs.results} type="song" onPlay={playSong} />
              )}

              {(currentTab === 'all' || currentTab === 'albums') && searchResults.albums?.results?.length > 0 && (
                <Section title="Albums" items={searchResults.albums.results} type="album" onPlay={playSong} />
              )}

              {(currentTab === 'all' || currentTab === 'artists') && searchResults.artists?.results?.length > 0 && (
                <Section title="Artists" items={searchResults.artists.results} type="artist" onPlay={playSong} />
              )}

              {(currentTab === 'all' || currentTab === 'playlists') && searchResults.playlists?.results?.length > 0 && (
                <Section title="Playlists" items={searchResults.playlists.results} type="playlist" onPlay={playSong} />
              )}
            </>
          )}
        </div>
      </div>

      <div className="player-bar">
        <div className="now-playing">
          <img 
            src={currentSong?.image?.[2]?.url || currentSong?.image?.[1]?.url || 'https://via.placeholder.com/56'} 
            alt="Album art" 
            className="now-playing-image"
          />
          <div className="now-playing-info">
            <div className="now-playing-title">{currentSong?.name || 'No song playing'}</div>
            <div className="now-playing-artist">
              {currentSong?.artists?.primary?.[0]?.name || 'Select a song to play'}
            </div>
          </div>
        </div>

        <div className="player-controls">
          <div className="control-buttons">
            <button 
              className={`control-btn ${isShuffle ? 'active' : ''}`} 
              onClick={toggleShuffle}
              title="Shuffle"
            >
              <svg className="icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/>
              </svg>
            </button>
            <button className="control-btn" onClick={playPrev} title="Previous">
              <svg className="icon-lg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
              </svg>
            </button>
            <button className="control-btn play-pause" onClick={togglePlayPause} title={isPlaying ? 'Pause' : 'Play'}>
              {isPlaying ? (
                <svg className="icon-lg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                </svg>
              ) : (
                <svg className="icon-lg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              )}
            </button>
            <button className="control-btn" onClick={playNext} title="Next">
              <svg className="icon-lg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
              </svg>
            </button>
            <button 
              className={`control-btn ${repeatMode > 0 ? 'active' : ''}`}
              onClick={toggleRepeat}
              title={repeatMode === 0 ? 'Repeat off' : repeatMode === 1 ? 'Repeat all' : 'Repeat one'}
            >
              <svg className="icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>
              </svg>
              {repeatMode === 2 && <span style={{position: 'absolute', fontSize: '10px'}}>1</span>}
            </button>
          </div>
          <div className="progress-container">
            <span className="time">{formatTime(currentTime)}</span>
            <div className="progress-bar" onClick={handleProgressClick}>
              <div 
                className="progress-fill" 
                style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              ></div>
            </div>
            <span className="time">{formatTime(duration)}</span>
          </div>
        </div>

        <div className="volume-control">
          <button className="control-btn" title="Volume">
            <svg className="icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
            </svg>
          </button>
          <div className="volume-bar" onClick={handleVolumeClick}>
            <div className="volume-fill" style={{ width: `${volume * 100}%` }}></div>
          </div>
        </div>
      </div>

      <audio 
        ref={audioRef}
        onPlay={handlePlay}
        onPause={handlePause}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .app-container {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
          background: #121212;
          color: #ffffff;
          height: 100vh;
          display: flex;
          flex-direction: column;
          --bg-primary: #121212;
          --bg-secondary: #181818;
          --bg-tertiary: #282828;
          --text-primary: #ffffff;
          --text-secondary: #b3b3b3;
          --accent: #1db954;
          --accent-hover: #1ed760;
          --border: #282828;
          transition: all 0.3s ease;
        }

        .app-container.light-theme {
          --bg-primary: #ffffff;
          --bg-secondary: #f6f6f6;
          --bg-tertiary: #e8e8e8;
          --text-primary: #000000;
          --text-secondary: #6a6a6a;
          --border: #d9d9d9;
          background: #ffffff;
          color: #000000;
        }

        .main-content {
          display: flex;
          flex: 1;
          overflow: hidden;
        }

        .sidebar {
          width: 280px;
          background: var(--bg-secondary);
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .logo {
          font-size: 28px;
          font-weight: 700;
          background: linear-gradient(135deg, var(--accent), var(--accent-hover));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 20px;
        }

        .search-input {
          width: 100%;
          padding: 12px 16px;
          background: var(--bg-tertiary);
          border: none;
          border-radius: 24px;
          color: var(--text-primary);
          font-size: 14px;
          transition: all 0.3s ease;
        }

        .search-input:focus {
          outline: 2px solid var(--accent);
          background: var(--bg-primary);
        }

        .theme-toggle {
          padding: 12px;
          background: var(--bg-tertiary);
          border: none;
          border-radius: 24px;
          color: var(--text-primary);
          cursor: pointer;
          font-size: 14px;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .theme-toggle:hover {
          background: var(--bg-primary);
          transform: scale(1.05);
        }

        .content-area {
          flex: 1;
          background: var(--bg-primary);
          padding: 24px;
          overflow-y: auto;
        }

        .content-area::-webkit-scrollbar {
          width: 12px;
        }

        .content-area::-webkit-scrollbar-track {
          background: var(--bg-secondary);
        }

        .content-area::-webkit-scrollbar-thumb {
          background: var(--bg-tertiary);
          border-radius: 6px;
        }

        .section-title {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 20px;
        }

        .results-container {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .card {
          background: var(--bg-secondary);
          padding: 16px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .card:hover {
          background: var(--bg-tertiary);
          transform: translateY(-4px);
        }

        .card-image {
          width: 100%;
          aspect-ratio: 1;
          object-fit: cover;
          border-radius: 4px;
          margin-bottom: 12px;
        }

        .card-title {
          font-weight: 600;
          font-size: 14px;
          margin-bottom: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .card-subtitle {
          font-size: 13px;
          color: var(--text-secondary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .play-btn-overlay {
          position: absolute;
          bottom: 80px;
          right: 16px;
          width: 48px;
          height: 48px;
          background: var(--accent);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transform: translateY(8px);
          transition: all 0.3s ease;
          box-shadow: 0 8px 16px rgba(0,0,0,0.3);
        }

        .card:hover .play-btn-overlay {
          opacity: 1;
          transform: translateY(0);
        }

        .player-bar {
          background: var(--bg-secondary);
          border-top: 1px solid var(--border);
          padding: 16px 24px;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .now-playing {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          min-width: 180px;
        }

        .now-playing-image {
          width: 56px;
          height: 56px;
          border-radius: 4px;
          object-fit: cover;
        }

        .now-playing-info {
          flex: 1;
          min-width: 0;
        }

        .now-playing-title {
          font-weight: 600;
          font-size: 14px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .now-playing-artist {
          font-size: 12px;
          color: var(--text-secondary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .player-controls {
          flex: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }

        .control-buttons {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .control-btn {
          background: none;
          border: none;
          color: var(--text-primary);
          cursor: pointer;
          padding: 8px;
          border-radius: 50%;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .control-btn:hover {
          transform: scale(1.1);
        }

        .control-btn:active {
          transform: scale(0.95);
        }

        .control-btn.active {
          color: var(--accent);
        }

        .control-btn.play-pause {
          width: 40px;
          height: 40px;
          background: var(--text-primary);
          color: var(--bg-primary);
        }

        .control-btn.play-pause:hover {
          transform: scale(1.08);
          background: var(--accent);
        }

        .progress-container {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          max-width: 600px;
        }

        .time {
          font-size: 12px;
          color: var(--text-secondary);
          min-width: 40px;
          text-align: center;
        }

        .progress-bar {
          flex: 1;
          height: 4px;
          background: var(--bg-tertiary);
          border-radius: 2px;
          cursor: pointer;
          position: relative;
          transition: height 0.2s ease;
        }

        .progress-bar:hover {
          height: 6px;
        }

        .progress-fill {
          height: 100%;
          background: var(--accent);
          border-radius: 2px;
          position: relative;
          transition: width 0.1s linear;
        }

        .volume-control {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          justify-content: flex-end;
          min-width: 180px;
        }

        .volume-bar {
          width: 100px;
          height: 4px;
          background: var(--bg-tertiary);
          border-radius: 2px;
          cursor: pointer;
          position: relative;
        }

        .volume-fill {
          height: 100%;
          background: var(--accent);
          border-radius: 2px;
        }

        .loading {
          text-align: center;
          padding: 40px;
          color: var(--text-secondary);
        }

        .spinner {
          border: 3px solid var(--bg-tertiary);
          border-top: 3px solid var(--accent);
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: 0 auto 16px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .tab-container {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
          border-bottom: 1px solid var(--border);
          padding-bottom: 8px;
        }

        .tab {
          background: none;
          border: none;
          color: var(--text-secondary);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          padding: 8px 16px;
          border-radius: 4px;
          transition: all 0.3s ease;
        }

        .tab:hover {
          color: var(--text-primary);
          background: var(--bg-tertiary);
        }

        .tab.active {
          color: var(--text-primary);
          background: var(--bg-tertiary);
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: var(--text-secondary);
        }

        .empty-state-icon {
          font-size: 64px;
          margin-bottom: 16px;
          opacity: 0.5;
        }

        .icon {
          width: 20px;
          height: 20px;
        }

        .icon-lg {
          width: 24px;
          height: 24px;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .card {
          animation: fadeIn 0.5s ease;
        }
      `}</style>
    </div>
  );
};

const Section = ({ title, items, type, onPlay }) => {
  return (
    <div style={{ marginBottom: '40px' }}>
      <h2 className="section-title">{title}</h2>
      <div className="results-container">
        {items.map((item, index) => (
          <Card key={item.id || index} item={item} type={type} onPlay={onPlay} />
        ))}
      </div>
    </div>
  );
};

const Card = ({ item, type, onPlay }) => {
  const imageUrl = item.image?.[2]?.url || item.image?.[1]?.url || item.image?.[0]?.url || 'https://via.placeholder.com/200';
  const title = item.title || item.name;
  
  let subtitle = '';
  if (type === 'song') {
    subtitle = item.primaryArtists || item.singers || 'Unknown Artist';
  } else if (type === 'album') {
    subtitle = item.artist || 'Various Artists';
  } else if (type === 'artist') {
    subtitle = 'Artist';
  } else if (type === 'playlist') {
    subtitle = 'Playlist';
  }

  const handleClick = () => {
    if (type === 'song') {
      onPlay(item.id);
    }
  };

  return (
    <div className="card" onClick={handleClick}>
      <img src={imageUrl} alt={title} className="card-image" />
      <div className="play-btn-overlay">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
          <path d="M8 5v14l11-7z"/>
        </svg>
      </div>
      <div className="card-title">{title}</div>
      <div className="card-subtitle">{subtitle}</div>
    </div>
  );
};

export default Ongaku;

import React, { useState, useEffect, useRef } from 'react';
import { Search, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Shuffle, List, Heart, Moon, Sun, Music, Album, User, Clock, ListMusic, X, ChevronDown, MoreVertical, Plus, Trash2 } from 'lucide-react';

const API_BASE = 'https://saavn.sumit.co/api';

const Ongaku = () => {
  const [theme, setTheme] = useState('dark');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [queue, setQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(-1);
  const [showQueue, setShowQueue] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [lyrics, setLyrics] = useState([]);
  const [showLyrics, setShowLyrics] = useState(false);
  const [activeTab, setActiveTab] = useState('songs');
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [ripples, setRipples] = useState([]);
  const [likedSongs, setLikedSongs] = useState([]);
  const [likedSongDetails, setLikedSongDetails] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [playHistory, setPlayHistory] = useState([]);
  const [showHome, setShowHome] = useState(true);
  const [playerExpanded, setPlayerExpanded] = useState(false);
  const [bottomPanel, setBottomPanel] = useState('none');
  
  const audioRef = useRef(null);
  const lyricsRef = useRef(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('resonance-theme') || 'dark';
    const savedLiked = JSON.parse(localStorage.getItem('resonance-liked') || '[]');
    const savedHistory = JSON.parse(localStorage.getItem('resonance-history') || '[]');
    const savedQueue = JSON.parse(localStorage.getItem('resonance-queue') || '[]');
    
    setTheme(savedTheme);
    setLikedSongs(savedLiked);
    setPlayHistory(savedHistory);
    setQueue(savedQueue);
    
    setTimeout(() => {
      setLoading(false);
    }, 2500);
  }, []);

  useEffect(() => {
    if (likedSongs.length > 0) {
      loadLikedSongDetails();
    }
  }, [likedSongs]);

  useEffect(() => {
    localStorage.setItem('resonance-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('resonance-liked', JSON.stringify(likedSongs));
  }, [likedSongs]);

  useEffect(() => {
    localStorage.setItem('resonance-history', JSON.stringify(playHistory));
  }, [playHistory]);

  useEffect(() => {
    localStorage.setItem('resonance-queue', JSON.stringify(queue));
  }, [queue]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration || 0);
    const handleEnded = () => {
      if (isRepeat) {
        audio.currentTime = 0;
        audio.play();
      } else {
        handleNext();
      }
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [isRepeat]);

  useEffect(() => {
    if (audioRef.current && currentSong) {
      audioRef.current.src = currentSong.downloadUrl?.find(u => u.quality === '320kbps')?.url || currentSong.downloadUrl?.[0]?.url;
      audioRef.current.load();
      setCurrentTime(0);
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error('Play error:', e));
      }
    }
  }, [currentSong]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (currentSong && isPlaying) {
      const playPromise = audioRef.current?.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => console.error('Play error:', e));
      }
    } else if (audioRef.current) {
      audioRef.current.pause();
    }
  }, [isPlaying, currentSong]);

  useEffect(() => {
    if (lyrics.length > 0 && lyricsRef.current && (showLyrics || bottomPanel === 'lyrics')) {
      const currentIndex = getCurrentLyricIndex();
      
      if (currentIndex >= 0 && lyricsRef.current.children[currentIndex]) {
        const lyricElement = lyricsRef.current.children[currentIndex];
        lyricElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentTime, lyrics, showLyrics, bottomPanel]);

  useEffect(() => {
    if (playHistory.length > 0 && showHome) {
      loadRecommendations();
    }
  }, [playHistory, showHome]);

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

  const goHome = () => {
    setShowHome(true);
    setSearchResults(null);
    setSearchQuery('');
  };

  const searchMusic = async (query) => {
    if (!query.trim()) return;
    setSearching(true);
    setShowHome(false);
    try {
      const response = await fetch(`${API_BASE}/search?query=${encodeURIComponent(query)}`);
      const data = await response.json();
      if (data.success) {
        setSearchResults(data.data);
      }
    } catch (error) {
      console.error('Search error:', error);
    }
    setSearching(false);
  };

  const fetchSongDetails = async (songId) => {
    try {
      const response = await fetch(`${API_BASE}/songs/${songId}`);
      const data = await response.json();
      if (data.success && data.data.length > 0) {
        return data.data[0];
      }
    } catch (error) {
      console.error('Fetch song error:', error);
    }
    return null;
  };

  const loadLikedSongDetails = async () => {
    const details = [];
    for (const songId of likedSongs.slice(-10)) {
      const song = await fetchSongDetails(songId);
      if (song) {
        details.push(song);
      }
    }
    setLikedSongDetails(details.reverse());
  };

  const parseLyrics = (lrcText) => {
    if (!lrcText) return [];
    const lines = lrcText.split('\n');
    const parsed = [];
    
    lines.forEach(line => {
      const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/);
      if (match) {
        const minutes = parseInt(match[1]);
        const seconds = parseInt(match[2]);
        const milliseconds = parseInt(match[3].padEnd(3, '0'));
        const text = match[4].trim();
        
        if (text) {
          parsed.push({
            time: minutes * 60 + seconds + milliseconds / 1000,
            text
          });
        }
      }
    });
    
    return parsed;
  };

  const fetchLyrics = async (songName, artistName) => {
    try {
      const response = await fetch(`https://lrclib.net/api/search?track_name=${encodeURIComponent(songName)}&artist_name=${encodeURIComponent(artistName)}`);
      const data = await response.json();
      if (data && data.length > 0 && data[0].syncedLyrics) {
        const parsedLyrics = parseLyrics(data[0].syncedLyrics);
        setLyrics(parsedLyrics);
      } else {
        setLyrics([]);
      }
    } catch (error) {
      console.error('Lyrics error:', error);
      setLyrics([]);
    }
  };

  const loadRecommendations = async () => {
    if (playHistory.length === 0) return;
    
    const lastSongId = playHistory[playHistory.length - 1];
    try {
      const response = await fetch(`${API_BASE}/songs/${lastSongId}/suggestions?limit=10`);
      const data = await response.json();
      if (data.success) {
        setRecommendations(data.data);
      }
    } catch (error) {
      console.error('Recommendations error:', error);
    }
  };

  const addToHistory = (songId) => {
    setPlayHistory(prev => {
      const filtered = prev.filter(id => id !== songId);
      return [...filtered, songId].slice(-50);
    });
  };

  const playSong = async (song, addToQueue = true) => {
    const songDetails = await fetchSongDetails(song.id);
    if (songDetails) {
      setCurrentSong(songDetails);
      setDuration(parseInt(songDetails.duration) || 0);
      setIsPlaying(true);
      setCurrentTime(0);
      
      const artistName = songDetails.artists?.primary?.[0]?.name || '';
      fetchLyrics(songDetails.name, artistName);
      
      addToHistory(songDetails.id);
      
      if (addToQueue) {
        const existingIndex = queue.findIndex(q => q.id === songDetails.id);
        if (existingIndex === -1) {
          setQueue([...queue, { id: songDetails.id, ...songDetails }]);
          setQueueIndex(queue.length);
        } else {
          setQueueIndex(existingIndex);
        }
      }
      
      loadRecommendations();
    }
  };

  const addToQueue = async (song) => {
    const songDetails = await fetchSongDetails(song.id);
    if (songDetails) {
      const exists = queue.find(q => q.id === songDetails.id);
      if (!exists) {
        setQueue([...queue, { id: songDetails.id, ...songDetails }]);
      }
    }
  };

  const removeFromQueue = (index) => {
    const newQueue = queue.filter((_, i) => i !== index);
    setQueue(newQueue);
    if (queueIndex > index) {
      setQueueIndex(queueIndex - 1);
    } else if (queueIndex === index && currentSong) {
      if (newQueue.length > 0) {
        const newIndex = Math.min(index, newQueue.length - 1);
        setQueueIndex(newIndex);
        playSongFromQueue(newIndex);
      } else {
        setCurrentSong(null);
        setQueueIndex(-1);
      }
    }
  };

  const playSongFromQueue = async (index) => {
    setQueueIndex(index);
    const song = queue[index];
    setCurrentSong(song);
    setDuration(parseInt(song.duration) || 0);
    setIsPlaying(true);
    setCurrentTime(0);
    
    const artistName = song.artists?.primary?.[0]?.name || '';
    fetchLyrics(song.name, artistName);
    
    addToHistory(song.id);
  };

  const toggleLike = (songId) => {
    setLikedSongs(prev => {
      if (prev.includes(songId)) {
        return prev.filter(id => id !== songId);
      } else {
        return [...prev, songId];
      }
    });
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = async () => {
    if (queue.length === 0) return;
    
    let nextIndex;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else {
      nextIndex = (queueIndex + 1) % queue.length;
    }
    
    playSongFromQueue(nextIndex);
  };

  const handlePrevious = async () => {
    if (currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }
    
    if (queue.length === 0) return;
    
    const prevIndex = queueIndex === 0 ? queue.length - 1 : queueIndex - 1;
    playSongFromQueue(prevIndex);
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const seekTime = ((e.clientX - rect.left) / rect.width) * duration;
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
    }
    setCurrentTime(seekTime);
  };

  const handleProgressDrag = (e) => {
    if (e.buttons === 1) {
      handleSeek(e);
    }
  };

  const formatTime = (time) => {
    if (isNaN(time) || time === 0) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentLyricIndex = () => {
    if (lyrics.length === 0) return -1;
    
    let currentIndex = -1;
    for (let i = 0; i < lyrics.length; i++) {
      if (currentTime >= lyrics[i].time) {
        currentIndex = i;
      } else {
        break;
      }
    }
    return currentIndex;
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="loading-logo">
            <Music size={80} />
          </div>
          <h1 className="loading-text">Resonance</h1>
        </div>
        <style>{`
          .loading-screen {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
          }

          .loading-content {
            text-align: center;
          }

          .loading-logo {
            margin-bottom: 2rem;
            color: #667eea;
            animation: pulse-scale 2s ease-in-out infinite;
          }

          .loading-text {
            font-size: 4rem;
            font-weight: 800;
            background: linear-gradient(135deg, #667eea, #5eb3ff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            animation: fadeSlideShake 2s ease-in-out infinite;
          }

          @keyframes pulse-scale {
            0%, 100% {
              transform: scale(1);
              opacity: 1;
            }
            50% {
              transform: scale(1.2);
              opacity: 0.7;
            }
          }

          @keyframes fadeSlideShake {
            0% {
              opacity: 0;
              transform: translateX(-50px) rotate(0deg);
            }
            25% {
              opacity: 1;
              transform: translateX(0) rotate(2deg);
            }
            50% {
              transform: translateX(0) rotate(-2deg);
            }
            75% {
              transform: translateX(0) rotate(1deg);
            }
            100% {
              opacity: 0;
              transform: translateX(50px) rotate(0deg);
            }
          }
        `}</style>
      </div>
    );
  }

  const albumArt = currentSong?.image?.find(i => i.quality === '500x500')?.url || currentSong?.image?.[0]?.url;

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
          --accent-primary: #667eea;
          --accent-secondary: #5eb3ff;
          --card-bg: #ffffff;
          --border: #cfe2f3;
          --shadow: rgba(102, 126, 234, 0.15);
          --shadow-lg: rgba(102, 126, 234, 0.25);
        }

        .app.dark {
          --bg-primary: #0a0e27;
          --bg-secondary: #111827;
          --bg-tertiary: #1a1f3a;
          --text-primary: #f9fafb;
          --text-secondary: #9ca3af;
          --accent-primary: #667eea;
          --accent-secondary: #5eb3ff;
          --card-bg: #1f2937;
          --border: #2d3748;
          --shadow: rgba(102, 126, 234, 0.2);
          --shadow-lg: rgba(102, 126, 234, 0.35);
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

        .header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: var(--card-bg);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
          padding: 1rem 2rem;
          z-index: 1000;
          transition: all 0.3s ease;
        }

        .header-container {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          cursor: pointer;
          transition: transform 0.3s;
        }

        .logo:hover {
          transform: scale(1.05);
        }

        .logo-icon {
          color: var(--accent-primary);
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        .logo-text {
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .search-container {
          flex: 1;
          max-width: 600px;
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-secondary);
        }

        .search-input {
          width: 100%;
          padding: 0.875rem 1rem 0.875rem 3rem;
          background: var(--bg-secondary);
          border: 2px solid var(--border);
          border-radius: 2rem;
          color: var(--text-primary);
          font-size: 0.95rem;
          outline: none;
          transition: all 0.3s;
        }

        .search-input:focus {
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 3px var(--shadow);
        }

        .theme-toggle {
          background: var(--bg-tertiary);
          border: none;
          padding: 0.625rem;
          border-radius: 50%;
          cursor: pointer;
          color: var(--accent-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;
        }

        .theme-toggle:hover {
          background: var(--accent-primary);
          color: white;
          transform: rotate(180deg);
        }

        .main-content {
          margin-top: 80px;
          padding: 2rem;
          max-width: 1400px;
          margin-left: auto;
          margin-right: auto;
          padding-bottom: 200px;
        }

        .section-title {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          color: var(--text-primary);
        }

        .tabs {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 2rem;
          overflow-x: auto;
          padding-bottom: 0.5rem;
        }

        .tab {
          padding: 0.625rem 1.5rem;
          background: var(--bg-secondary);
          border: 2px solid var(--border);
          border-radius: 2rem;
          cursor: pointer;
          font-weight: 600;
          color: var(--text-secondary);
          transition: all 0.3s;
          white-space: nowrap;
        }

        .tab:hover {
          border-color: var(--accent-primary);
          color: var(--accent-primary);
          transform: translateY(-2px);
        }

        .tab.active {
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          border-color: transparent;
          color: white;
          box-shadow: 0 4px 15px var(--shadow);
        }

        .results-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .song-card {
          background: var(--card-bg);
          border-radius: 1rem;
          padding: 1.25rem;
          cursor: pointer;
          transition: all 0.3s;
          border: 1px solid var(--border);
          position: relative;
          overflow: hidden;
        }

        .song-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          opacity: 0;
          transition: opacity 0.3s;
        }

        .song-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 30px var(--shadow-lg);
          border-color: var(--accent-primary);
        }

        .song-card:hover::before {
          opacity: 0.05;
        }

        .song-card-content {
          position: relative;
          z-index: 1;
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .song-image-container {
          position: relative;
          flex-shrink: 0;
        }

        .song-image {
          width: 70px;
          height: 70px;
          border-radius: 0.75rem;
          object-fit: cover;
        }

        .play-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s;
        }

        .song-card:hover .play-overlay {
          opacity: 1;
        }

        .play-icon {
          color: white;
          transform: scale(0.8);
          transition: transform 0.3s;
        }

        .song-card:hover .play-icon {
          transform: scale(1);
        }

        .song-info {
          flex: 1;
          min-width: 0;
        }

        .song-title {
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .song-artist {
          font-size: 0.875rem;
          color: var(--text-secondary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .song-actions {
          position: relative;
          z-index: 2;
          display: flex;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .action-btn {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          padding: 0.5rem;
          border-radius: 0.5rem;
          cursor: pointer;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.875rem;
          transition: all 0.3s;
        }

        .action-btn:hover {
          background: var(--accent-primary);
          border-color: var(--accent-primary);
          color: white;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          gap: 1rem;
        }

        .empty-icon {
          color: var(--accent-primary);
          opacity: 0.5;
          animation: pulse-scale 2s ease-in-out infinite;
        }

        .empty-text {
          font-size: 1.25rem;
          color: var(--text-secondary);
        }

        .mini-player {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: var(--card-bg);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-top: 1px solid var(--border);
          padding: 0.75rem 2rem;
          z-index: 1000;
          transition: all 0.3s;
        }

        .mini-player:hover {
          transform: translateY(-2px);
          box-shadow: 0 -4px 20px var(--shadow);
        }

        .mini-player-content {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .mini-progress {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--bg-secondary);
        }

        .mini-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
          transition: width 0.1s linear;
        }

        .mini-image {
          width: 50px;
          height: 50px;
          border-radius: 0.5rem;
          object-fit: cover;
          cursor: pointer;
        }

        .mini-info {
          flex: 1;
          min-width: 0;
          cursor: pointer;
        }

        .mini-title {
          font-weight: 600;
          color: var(--text-primary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 0.95rem;
        }

        .mini-artist {
          font-size: 0.8rem;
          color: var(--text-secondary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .mini-controls {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .mini-play-btn {
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          border: none;
          color: white;
          padding: 0.75rem;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;
          box-shadow: 0 2px 10px var(--shadow);
        }

        .mini-play-btn:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 15px var(--shadow-lg);
        }

        .player.expanded {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 1001;
          display: flex;
          flex-direction: column;
          color: white;
        }

        .player-background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-size: cover;
          background-position: center;
          filter: blur(20px) brightness(0.3);
          z-index: 1;
        }

        .player-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.7) 40%, rgba(0,0,0,0.9) 100%);
          z-index: 1;
        }

        .player-content {
          position: relative;
          z-index: 2;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
          padding: 4rem 2rem 2rem;
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
          overflow: hidden;
        }

        .player-image-container {
          display: flex;
          justify-content: center;
          margin-bottom: 3rem;
        }

        .player-image-large {
          width: 60vw;
          max-width: 400px;
          height: auto;
          border-radius: 1rem;
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        }

        .player-title-large {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.25rem;
          text-align: center;
        }

        .player-artist-large {
          font-size: 1rem;
          color: rgba(255,255,255,0.8);
          text-align: center;
          margin-bottom: 2rem;
        }

        .progress-section {
          margin-bottom: 2rem;
        }

        .progress-bar {
          height: 6px;
          background: rgba(255,255,255,0.2);
          border-radius: 3px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
          border-radius: 3px;
          position: relative;
          transition: width 0.1s linear;
        }

        .progress-time {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;
          color: rgba(255,255,255,0.8);
          margin-top: 0.5rem;
        }

        .player-controls-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .control-btn-large {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 0.75rem;
          border-radius: 50%;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0.8;
        }

        .control-btn-large:hover {
          opacity: 1;
          background: rgba(255,255,255,0.1);
          transform: scale(1.1);
        }

        .control-btn-large.active {
          opacity: 1;
          color: var(--accent-primary);
        }

        .control-btn-large.liked {
          color: #ff6b9d;
        }

        .play-btn-large {
          background: rgba(255,255,255,0.2);
          padding: 1.25rem;
          width: 60px;
          height: 60px;
        }

        .play-btn-large:hover {
          background: rgba(255,255,255,0.3);
        }

        .player-bottom-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 1rem;
          margin-bottom: 1rem;
        }

        .player-bottom-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .player-bottom-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .volume-container-large {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .volume-slider-large {
          width: 100px;
          height: 4px;
          -webkit-appearance: none;
          appearance: none;
          background: rgba(255,255,255,0.3);
          border-radius: 2px;
          outline: none;
        }

        .volume-slider-large::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 12px;
          height: 12px;
          background: white;
          border-radius: 50%;
          cursor: pointer;
        }

        .volume-slider-large::-moz-range-thumb {
          width: 12px;
          height: 12px;
          background: white;
          border-radius: 50%;
          cursor: pointer;
          border: none;
        }

        .close-btn-large {
          position: absolute;
          top: 1rem;
          left: 1rem;
          background: rgba(0,0,0,0.5);
          border: none;
          color: white;
          cursor: pointer;
          padding: 0.75rem;
          border-radius: 50%;
          transition: all 0.3s;
          z-index: 3;
        }

        .close-btn-large:hover {
          background: rgba(255,255,255,0.2);
        }

        .minimize-btn {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: rgba(0,0,0,0.5);
          border: none;
          color: white;
          cursor: pointer;
          padding: 0.75rem;
          border-radius: 50%;
          transition: all 0.3s;
          z-index: 3;
        }

        .minimize-btn:hover {
          background: rgba(255,255,255,0.2);
        }

        .bottom-panel {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 60vh;
          background: rgba(0,0,0,0.8);
          backdrop-filter: blur(10px);
          overflow-y: auto;
          transition: transform 0.3s ease;
          padding: 1rem;
          color: white;
          z-index: 3;
        }

        .bottom-panel .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .bottom-panel .panel-title {
          font-size: 1.25rem;
          font-weight: 700;
        }

        .bottom-panel .close-btn {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 0.5rem;
          transition: all 0.3s;
        }

        .bottom-panel .close-btn:hover {
          background: rgba(255,255,255,0.1);
        }

        .bottom-panel .lyrics-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding: 1rem 0;
        }

        .bottom-panel .lyric-line {
          padding: 0.75rem 1rem;
          border-radius: 0.5rem;
          transition: all 0.4s ease;
          color: rgba(255,255,255,0.6);
          font-size: 1rem;
          line-height: 1.6;
          opacity: 0.8;
          text-align: center;
        }

        .bottom-panel .lyric-line.active {
          color: white;
          font-weight: 700;
          font-size: 1.25rem;
          transform: scale(1.05);
          opacity: 1;
        }

        .bottom-panel .lyric-line.near-active {
          opacity: 1;
          font-size: 1.05rem;
        }

        .bottom-panel .no-lyrics {
          text-align: center;
          padding: 2rem;
          color: rgba(255,255,255,0.6);
        }

        .bottom-panel .queue-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem;
          background: rgba(255,255,255,0.1);
          border-radius: 0.75rem;
          margin-bottom: 0.75rem;
          cursor: pointer;
          transition: all 0.3s;
        }

        .bottom-panel .queue-item:hover {
          background: rgba(255,255,255,0.2);
          transform: translateX(5px);
        }

        .bottom-panel .queue-item.active {
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          color: white;
        }

        .bottom-panel .queue-item.active .queue-title,
        .bottom-panel .queue-item.active .queue-artist {
          color: white;
        }

        .bottom-panel .queue-image {
          width: 50px;
          height: 50px;
          border-radius: 0.5rem;
          object-fit: cover;
        }

        .bottom-panel .queue-info {
          flex: 1;
          min-width: 0;
        }

        .bottom-panel .queue-title {
          font-weight: 600;
          color: white;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 0.9rem;
        }

        .bottom-panel .queue-artist {
          font-size: 0.8rem;
          color: rgba(255,255,255,0.7);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .bottom-panel .queue-remove {
          background: none;
          border: none;
          color: rgba(255,255,255,0.7);
          cursor: pointer;
          padding: 0.25rem;
          opacity: 0;
          transition: all 0.3s;
        }

        .bottom-panel .queue-item:hover .queue-remove {
          opacity: 1;
        }

        .bottom-panel .queue-remove:hover {
          color: #ff6b9d;
        }

        .panel {
          position: fixed;
          top: 80px;
          right: 0;
          width: 400px;
          height: calc(100vh - 80px - 150px);
          background: var(--card-bg);
          border-left: 1px solid var(--border);
          padding: 1.5rem;
          transform: translateX(100%);
          transition: transform 0.3s ease;
          z-index: 999;
          overflow-y: auto;
        }

        .panel.open {
          transform: translateX(0);
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .panel-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .close-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 0.5rem;
          transition: all 0.3s;
        }

        .close-btn:hover {
          background: var(--bg-secondary);
          color: var(--text-primary);
        }

        .queue-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem;
          background: var(--bg-secondary);
          border-radius: 0.75rem;
          margin-bottom: 0.75rem;
          cursor: pointer;
          transition: all 0.3s;
        }

        .queue-item:hover {
          background: var(--bg-tertiary);
          transform: translateX(5px);
        }

        .queue-item.active {
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          color: white;
        }

        .queue-item.active .queue-title,
        .queue-item.active .queue-artist {
          color: white;
        }

        .queue-image {
          width: 50px;
          height: 50px;
          border-radius: 0.5rem;
          object-fit: cover;
        }

        .queue-info {
          flex: 1;
          min-width: 0;
        }

        .queue-title {
          font-weight: 600;
          color: var(--text-primary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 0.9rem;
        }

        .queue-artist {
          font-size: 0.8rem;
          color: var(--text-secondary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .queue-remove {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 0.25rem;
          opacity: 0;
          transition: all 0.3s;
        }

        .queue-item:hover .queue-remove {
          opacity: 1;
        }

        .queue-remove:hover {
          color: #ff6b9d;
        }

        .lyrics-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding: 1rem 0;
        }

        .lyric-line {
          padding: 0.75rem 1rem;
          border-radius: 0.5rem;
          transition: all 0.4s ease;
          color: var(--text-secondary);
          font-size: 1rem;
          line-height: 1.6;
          opacity: 0.5;
        }

        .lyric-line.active {
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          color: white;
          font-weight: 700;
          font-size: 1.25rem;
          transform: scale(1.05);
          box-shadow: 0 4px 20px var(--shadow-lg);
          opacity: 1;
        }

        .lyric-line.near-active {
          opacity: 0.8;
          font-size: 1.05rem;
        }

        .no-lyrics {
          text-align: center;
          padding: 2rem;
          color: var(--text-secondary);
        }

        .loading-spinner {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 3px solid var(--border);
          border-top-color: var(--accent-primary);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .header-container {
            flex-wrap: wrap;
          }

          .search-container {
            order: 3;
            flex-basis: 100%;
          }

          .results-grid {
            grid-template-columns: 1fr;
          }

          .player-content {
            padding: 2rem 1rem 1rem;
          }

          .player-image-large {
            width: 80vw;
          }

          .player-title-large {
            font-size: 1.5rem;
          }

          .player-artist-large {
            font-size: 0.875rem;
          }

          .player-controls-row {
            gap: 1rem;
          }

          .play-btn-large {
            width: 50px;
            height: 50px;
            padding: 1rem;
          }

          .control-btn-large {
            padding: 0.5rem;
          }

          .panel {
            width: 100%;
          }

          .bottom-panel {
            height: 70vh;
          }
        }

        ::-webkit-scrollbar {
          width: 10px;
          height: 10px;
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
      `}</style>

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

      <header className="header">
        <div className="header-container">
          <div className="logo" onClick={goHome}>
            <Music className="logo-icon" size={32} />
            <span className="logo-text">Resonance</span>
          </div>
          
          <div className="search-container">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Search for songs, artists, albums..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchMusic(searchQuery)}
              className="search-input"
            />
          </div>

          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>
      </header>

      <main className="main-content">
        {searchResults && !showHome ? (
          <>
            <div className="tabs">
              {['songs', 'albums', 'artists', 'playlists'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`tab ${activeTab === tab ? 'active' : ''}`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div className="results-grid">
              {activeTab === 'songs' && searchResults.songs?.results?.map((song) => (
                <div key={song.id} className="song-card">
                  <div className="song-card-content" onClick={() => playSong(song)}>
                    <div className="song-image-container">
                      <img
                        src={song.image?.find(i => i.quality === '500x500')?.url || song.image?.[0]?.url}
                        alt={song.title}
                        className="song-image"
                      />
                      <div className="play-overlay">
                        <Play className="play-icon" size={28} />
                      </div>
                    </div>
                    <div className="song-info">
                      <div className="song-title">{song.title}</div>
                      <div className="song-artist">{song.primaryArtists}</div>
                    </div>
                  </div>
                  <div className="song-actions">
                    <button className="action-btn" onClick={(e) => { e.stopPropagation(); addToQueue(song); }}>
                      <Plus size={16} /> Queue
                    </button>
                  </div>
                </div>
              ))}

              {activeTab === 'albums' && searchResults.albums?.results?.map((album) => (
                <div key={album.id} className="song-card">
                  <div className="song-card-content">
                    <div className="song-image-container">
                      <img
                        src={album.image?.find(i => i.quality === '500x500')?.url || album.image?.[0]?.url}
                        alt={album.title}
                        className="song-image"
                      />
                      <div className="play-overlay">
                        <Album className="play-icon" size={28} />
                      </div>
                    </div>
                    <div className="song-info">
                      <div className="song-title">{album.title}</div>
                      <div className="song-artist">{album.artist}</div>
                    </div>
                  </div>
                </div>
              ))}

              {activeTab === 'artists' && searchResults.artists?.results?.map((artist) => (
                <div key={artist.id} className="song-card">
                  <div className="song-card-content">
                    <div className="song-image-container">
                      <img
                        src={artist.image?.find(i => i.quality === '500x500')?.url || artist.image?.[0]?.url}
                        alt={artist.title}
                        className="song-image"
                      />
                      <div className="play-overlay">
                        <User className="play-icon" size={28} />
                      </div>
                    </div>
                    <div className="song-info">
                      <div className="song-title">{artist.title}</div>
                      <div className="song-artist">Artist</div>
                    </div>
                  </div>
                </div>
              ))}

              {activeTab === 'playlists' && searchResults.playlists?.results?.map((playlist) => (
                <div key={playlist.id} className="song-card">
                  <div className="song-card-content">
                    <div className="song-image-container">
                      <img
                        src={playlist.image?.find(i => i.quality === '500x500')?.url || playlist.image?.[0]?.url}
                        alt={playlist.title}
                        className="song-image"
                      />
                      <div className="play-overlay">
                        <ListMusic className="play-icon" size={28} />
                      </div>
                    </div>
                    <div className="song-info">
                      <div className="song-title">{playlist.title}</div>
                      <div className="song-artist">{playlist.language}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            {likedSongDetails.length > 0 && (
              <>
                <h2 className="section-title">💖 Liked Songs</h2>
                <div className="results-grid">
                  {likedSongDetails.map((song) => (
                    <div key={song.id} className="song-card">
                      <div className="song-card-content" onClick={() => playSong(song)}>
                        <div className="song-image-container">
                          <img
                            src={song.image?.find(i => i.quality === '500x500')?.url || song.image?.[0]?.url}
                            alt={song.name}
                            className="song-image"
                          />
                          <div className="play-overlay">
                            <Play className="play-icon" size={28} />
                          </div>
                        </div>
                        <div className="song-info">
                          <div className="song-title">{song.name}</div>
                          <div className="song-artist">{song.artists?.primary?.map(a => a.name).join(', ')}</div>
                        </div>
                      </div>
                      <div className="song-actions">
                        <button className="action-btn" onClick={(e) => { e.stopPropagation(); addToQueue(song); }}>
                          <Plus size={16} /> Queue
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {recommendations.length > 0 && (
              <>
                <h2 className="section-title" style={{ marginTop: likedSongDetails.length > 0 ? '3rem' : '0' }}>
                  ✨ Recommended For You
                </h2>
                <div className="results-grid">
                  {recommendations.map((song) => (
                    <div key={song.id} className="song-card">
                      <div className="song-card-content" onClick={() => playSong(song)}>
                        <div className="song-image-container">
                          <img
                            src={song.image?.find(i => i.quality === '500x500')?.url || song.image?.[0]?.url}
                            alt={song.name}
                            className="song-image"
                          />
                          <div className="play-overlay">
                            <Play className="play-icon" size={28} />
                          </div>
                        </div>
                        <div className="song-info">
                          <div className="song-title">{song.name}</div>
                          <div className="song-artist">{song.artists?.primary?.map(a => a.name).join(', ')}</div>
                        </div>
                      </div>
                      <div className="song-actions">
                        <button className="action-btn" onClick={(e) => { e.stopPropagation(); addToQueue(song); }}>
                          <Plus size={16} /> Queue
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
            
            {recommendations.length === 0 && likedSongDetails.length === 0 && (
              <div className="empty-state">
                {searching ? (
                  <>
                    <div className="loading-spinner"></div>
                    <div className="empty-text">Searching...</div>
                  </>
                ) : (
                  <>
                    <Music className="empty-icon" size={80} />
                    <div className="empty-text">Search for your favorite music to get started</div>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {currentSong && (
        <audio
          ref={audioRef}
          preload="metadata"
        />
      )}

      {!playerExpanded && (
        <>
          <div className={`panel ${showQueue ? 'open' : ''}`}>
            <div className="panel-header">
              <h3 className="panel-title">Queue</h3>
              <button className="close-btn" onClick={() => setShowQueue(false)}>
                <X size={24} />
              </button>
            </div>
            <div>
              {queue.length === 0 ? (
                <div className="no-lyrics">No songs in queue</div>
              ) : (
                queue.map((song, index) => (
                  <div
                    key={`${song.id}-${index}`}
                    className={`queue-item ${index === queueIndex ? 'active' : ''}`}
                    onClick={() => playSongFromQueue(index)}
                  >
                    <img
                      src={song.image?.find(i => i.quality === '150x150')?.url || song.image?.[0]?.url}
                      alt={song.name}
                      className="queue-image"
                    />
                    <div className="queue-info">
                      <div className="queue-title">{song.name}</div>
                      <div className="queue-artist">{song.artists?.primary?.map(a => a.name).join(', ')}</div>
                    </div>
                    <button
                      className="queue-remove"
                      onClick={(e) => { e.stopPropagation(); removeFromQueue(index); }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className={`panel ${showLyrics ? 'open' : ''}`}>
            <div className="panel-header">
              <h3 className="panel-title">Lyrics</h3>
              <button className="close-btn" onClick={() => setShowLyrics(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="lyrics-container" ref={lyricsRef}>
              {lyrics.length === 0 ? (
                <div className="no-lyrics">No synced lyrics available for this song</div>
              ) : (
                lyrics.map((line, index) => {
                  const currentIndex = getCurrentLyricIndex();
                  const isActive = currentIndex === index;
                  const isNearActive = Math.abs(currentIndex - index) === 1;
                  
                  return (
                    <div
                      key={index}
                      className={`lyric-line ${isActive ? 'active' : ''} ${isNearActive ? 'near-active' : ''}`}
                    >
                      {line.text}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}

      {currentSong && !playerExpanded && (
        <div className="mini-player" onClick={() => setPlayerExpanded(true)}>
          <div className="mini-progress">
            <div className="mini-progress-fill" style={{ width: `${(currentTime / duration) * 100}%` }}></div>
          </div>
          <div className="mini-player-content">
            <img
              src={albumArt}
              alt={currentSong.name}
              className="mini-image"
            />
            <div className="mini-info">
              <div className="mini-title">{currentSong.name}</div>
              <div className="mini-artist">
                {currentSong.artists?.primary?.map(a => a.name).join(', ')}
              </div>
            </div>
            <div className="mini-controls">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
                className="mini-play-btn"
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </button>
            </div>
          </div>
        </div>
      )}

      {currentSong && playerExpanded && (
        <div className="player expanded">
          <div 
            className="player-background" 
            style={{
              backgroundImage: `url(${albumArt})`,
            }}
          />
          <div className="player-overlay" />
          <button className="close-btn-large" onClick={() => setPlayerExpanded(false)}>
            <X size={24} />
          </button>
          <button className="minimize-btn" onClick={() => setPlayerExpanded(false)}>
            <ChevronDown size={24} />
          </button>
          <div className="player-content">
            <div className="player-image-container">
              <img className="player-image-large" src={albumArt} alt={currentSong.name} />
            </div>
            <div className="player-title-large">{currentSong.name}</div>
            <div className="player-artist-large">
              {currentSong.artists?.primary?.map(a => a.name).join(', ')}
            </div>
            <div className="progress-section">
              <div 
                className="progress-bar" 
                onClick={handleSeek}
                onMouseMove={handleProgressDrag}
              >
                <div className="progress-fill" style={{ width: `${(currentTime / duration) * 100}%` }}></div>
              </div>
              <div className="progress-time">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
            <div className="player-controls-row">
              <button 
                onClick={() => setIsShuffle(!isShuffle)}
                className={`control-btn-large ${isShuffle ? 'active' : ''}`}
              >
                <Shuffle size={28} />
              </button>
              <button onClick={handlePrevious} className="control-btn-large">
                <SkipBack size={28} />
              </button>
              <button onClick={togglePlay} className="control-btn-large play-btn-large">
                {isPlaying ? <Pause size={32} /> : <Play size={32} />}
              </button>
              <button onClick={handleNext} className="control-btn-large">
                <SkipForward size={28} />
              </button>
              <button 
                onClick={() => setIsRepeat(!isRepeat)}
                className={`control-btn-large ${isRepeat ? 'active' : ''}`}
              >
                <Repeat size={28} />
              </button>
            </div>
            <div className="player-bottom-row">
              <div className="player-bottom-left">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="control-btn-large"
                >
                  {isMuted || volume === 0 ? <VolumeX size={24} /> : <Volume2 size={24} />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="volume-slider-large"
                />
              </div>
              <div className="player-bottom-right">
                <button 
                  className="control-btn-large"
                  onClick={() => addToQueue(currentSong)}
                >
                  <Plus size={24} />
                </button>
                <button 
                  className="control-btn-large" 
                  onClick={() => setBottomPanel(bottomPanel === 'lyrics' ? 'none' : 'lyrics')}
                >
                  <Music size={24} />
                </button>
                <button 
                  className="control-btn-large" 
                  onClick={() => setBottomPanel(bottomPanel === 'queue' ? 'none' : 'queue')}
                >
                  <List size={24} />
                </button>
                <button 
                  className={`control-btn-large ${likedSongs.includes(currentSong.id) ? 'liked' : ''}`} 
                  onClick={() => toggleLike(currentSong.id)}
                >
                  <Heart size={24} fill={likedSongs.includes(currentSong.id) ? 'currentColor' : 'none'} />
                </button>
              </div>
            </div>
            <div 
              className="bottom-panel"
              style={{ transform: bottomPanel !== 'none' ? 'translateY(0)' : 'translateY(100%)' }}
            >
              <div className="panel-header">
                <h3 className="panel-title">{bottomPanel === 'lyrics' ? 'Lyrics' : 'Queue'}</h3>
                <button className="close-btn" onClick={() => setBottomPanel('none')}>
                  <X size={24} />
                </button>
              </div>
              {bottomPanel === 'lyrics' ? (
                <div className="lyrics-container" ref={lyricsRef}>
                  {lyrics.length === 0 ? (
                    <div className="no-lyrics">No synced lyrics available for this song</div>
                  ) : (
                    lyrics.map((line, index) => {
                      const currentIndex = getCurrentLyricIndex();
                      const isActive = currentIndex === index;
                      const isNearActive = Math.abs(currentIndex - index) === 1;
                      
                      return (
                        <div
                          key={index}
                          className={`lyric-line ${isActive ? 'active' : ''} ${isNearActive ? 'near-active' : ''}`}
                        >
                          {line.text}
                        </div>
                      );
                    })
                  )}
                </div>
              ) : (
                <div>
                  {queue.length === 0 ? (
                    <div className="no-lyrics">No songs in queue</div>
                  ) : (
                    queue.map((song, index) => (
                      <div
                        key={`${song.id}-${index}`}
                        className={`queue-item ${index === queueIndex ? 'active' : ''}`}
                        onClick={() => playSongFromQueue(index)}
                      >
                        <img
                          src={song.image?.find(i => i.quality === '150x150')?.url || song.image?.[0]?.url}
                          alt={song.name}
                          className="queue-image"
                        />
                        <div className="queue-info">
                          <div className="queue-title">{song.name}</div>
                          <div className="queue-artist">{song.artists?.primary?.map(a => a.name).join(', ')}</div>
                        </div>
                        <button
                          className="queue-remove"
                          onClick={(e) => { e.stopPropagation(); removeFromQueue(index); }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ongaku;

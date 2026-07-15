import { useState, useEffect, useRef } from 'react'
import {
  Play,
  Pause,
  Clock,
  Compass,
  Sliders,
  Moon,
  Menu,
  X,
  Star,
  Check,
  CheckCircle,
  Volume2,
  Lock,
  ArrowRight
} from 'lucide-react'

// Toast Component
function Toast({ message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="toast" id="toast-notification">
      <CheckCircle className="toast-icon" size={20} />
      <span className="toast-message">{message}</span>
    </div>
  )
}

// Soundscapes (Scenarios) Data
const SCENARIOS = [
  {
    id: 'forest',
    title: 'Ancient Forest',
    label: 'Scenario',
    image: '/ancient_forest.png',
    ambientSoundName: 'Forest Rain & Birds',
    defaultVolume: 65
  },
  {
    id: 'desert',
    title: 'Celestial Desert',
    label: 'Scenario',
    image: '/celestial_desert.png',
    ambientSoundName: 'Cosmic Wind & Dunes',
    defaultVolume: 40
  },
  {
    id: 'alpine',
    title: 'Alpine Peaks',
    label: 'Scenario',
    image: '/alpine_peaks.png',
    ambientSoundName: 'Glacier Stream & Winds',
    defaultVolume: 50
  }
]

// Use Cases / Categories Data
const CATEGORIES = [
  {
    id: 'work',
    title: 'Deep Work',
    description: 'Eliminate office noise and enter the flow state instantly.',
    image: '/deep_work.png',
    className: 'bento-1'
  },
  {
    id: 'sleep',
    title: 'Better Sleep',
    description: 'Melt away stress with nocturnal rain and forest hums.',
    image: '/better_sleep.png',
    className: 'bento-2'
  },
  {
    id: 'meditation',
    title: 'Meditation',
    description: 'Ground yourself with ethereal bowls and ocean waves.',
    image: '/meditation.png',
    className: 'bento-3'
  },
  {
    id: 'study',
    title: 'Study Sessions',
    description: 'Retain more information with scientifically optimized brown noise.',
    image: '/study_sessions.png',
    className: 'bento-4'
  }
]

function App() {
  const [activeScenario, setActiveScenario] = useState(SCENARIOS[0])
  const [isPlaying, setIsPlaying] = useState(false)
  const [rainVolume, setRainVolume] = useState(65)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [isTimerActive, setIsTimerActive] = useState(false)
  const [timeLeft, setTimeLeft] = useState(2700) // 45 minutes in seconds

  const timerRef = useRef(null)

  // Sleep Timer Countdown Logic
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current)
            setIsPlaying(false)
            showToast('Sleep timer finished. Soundscape paused.')
            return 2700 // Reset to 45 mins
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isPlaying])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const showToast = (message) => {
    setToastMessage(message)
  }

  const togglePlayback = () => {
    setIsPlaying((prev) => {
      const nextState = !prev
      showToast(nextState ? `Now playing: ${activeScenario.ambientSoundName}` : 'Soundscape paused.')
      return nextState
    })
  }

  const selectScenario = (scenario) => {
    setActiveScenario(scenario)
    setRainVolume(scenario.defaultVolume)
    setIsPlaying(true)
    showToast(`Switched scenario to ${scenario.title}. Now playing...`)
  }

  const handleStartListening = () => {
    setIsPlaying(true)
    showToast('Immersive soundscape starting. Close your eyes and enjoy.')
    // Smooth scroll to the player/scenarios section
    const scenariosSection = document.getElementById('scenarios')
    if (scenariosSection) {
      scenariosSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleNavClick = (sectionId) => {
    setIsMenuOpen(false)
    const el = document.getElementById(sectionId)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <>
      {/* Header */}
      <header className="app-header">
        <div className="header-container">
          <div className="brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} id="logo-brand">
            <span className="brand-name">Zephyr</span>
          </div>

          <button
            className="menu-toggle"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <nav className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
            <button className="nav-link" onClick={() => handleNavClick('features')}>Features</button>
            <button className="nav-link" onClick={() => handleNavClick('scenarios')}>How It Works</button>
            <button className="nav-link" onClick={() => handleNavClick('pricing')}>Pricing</button>
            <button className="btn btn-primary" onClick={() => showToast("Registration is coming soon!")}>
              Get Started
            </button>
          </nav>
        </div>
      </header>

      <main className="main-content">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-container">
            <div className="hero-content">
              <h1 className="hero-title">Escape the Noise.<br />Find Your Calm</h1>
              <p className="hero-description">
                Travel through atmospheric worlds crafted with immersive sounds, dynamic weather, and calming environments.
              </p>
              <button className="btn btn-primary" onClick={handleStartListening}>
                Start Listening Free
              </button>
            </div>

            <div className="hero-panels">
              {/* Active Layer Control Panel */}
              <div className="panel-card glass-panel">
                <div className="layer-header">
                  <Volume2 className="layer-icon" size={20} />
                  <div className="layer-meta">
                    <span className="layer-label">Layer Active</span>
                    <span className="layer-title">{activeScenario.ambientSoundName}</span>
                  </div>
                </div>
                <div className="slider-container">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={rainVolume}
                    onChange={(e) => setRainVolume(Number(e.target.value))}
                    className="slider-bar"
                    aria-label="Rain volume control"
                  />
                  <span style={{ fontSize: '0.8rem', minWidth: '2.5rem', textAlign: 'right', marginLeft: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {rainVolume}%
                  </span>
                </div>
              </div>

              {/* Now Playing Panel */}
              <div className="panel-card glass-panel playing-panel">
                <div className="playing-info">
                  <span className="playing-label">Now Playing</span>
                  <span className="playing-title">{activeScenario.title}</span>
                </div>
                <div className="visualizer">
                  <div className={`vis-bar ${isPlaying ? 'animate' : ''}`} style={{ height: isPlaying ? undefined : '4px' }}></div>
                  <div className={`vis-bar ${isPlaying ? 'animate' : ''}`} style={{ height: isPlaying ? undefined : '10px' }}></div>
                  <div className={`vis-bar ${isPlaying ? 'animate' : ''}`} style={{ height: isPlaying ? undefined : '14px' }}></div>
                  <div className={`vis-bar ${isPlaying ? 'animate' : ''}`} style={{ height: isPlaying ? undefined : '8px' }}></div>
                  <div className={`vis-bar ${isPlaying ? 'animate' : ''}`} style={{ height: isPlaying ? undefined : '4px' }}></div>
                </div>
              </div>

              {/* Sleep Timer Control Panel */}
              <div className="panel-card glass-panel timer-panel">
                <div className="timer-details">
                  <div className="timer-icon-container">
                    <Clock size={20} />
                  </div>
                  <div className="timer-info">
                    <span className="timer-label">Sleep Timer</span>
                    <span className="timer-value">{formatTime(timeLeft)} remaining</span>
                  </div>
                </div>
                <button
                  className={`timer-play-btn ${isPlaying ? 'playing' : ''}`}
                  onClick={togglePlayback}
                  aria-label={isPlaying ? 'Pause soundscape' : 'Play soundscape'}
                >
                  {isPlaying ? <Pause size={14} /> : <Play size={14} style={{ marginLeft: '1px' }} />}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="section" id="features">
          <div className="section-header">
            <h2 className="section-title">Your Journey to Calm</h2>
            <p className="section-subtitle">
              Indulge in absolute auditory relief. Our platform features state-of-the-art interactive customization controls.
            </p>
          </div>
          <div className="features-grid">
            <div className="feature-card glass-panel">
              <div className="feature-icon-wrapper">
                <Compass size={22} />
              </div>
              <h3>Choose Your Location</h3>
              <p>
                Browse our curated library of hand-illustrated destinations from across the globe.
              </p>
            </div>

            <div className="feature-card glass-panel">
              <div className="feature-icon-wrapper">
                <Sliders size={22} />
              </div>
              <h3>Mix the Atmosphere</h3>
              <p>
                Fine-tune the rainfall, wind speed, and ambient wildlife to match your mood.
              </p>
            </div>

            <div className="feature-card glass-panel">
              <div className="feature-icon-wrapper">
                <Moon size={22} />
              </div>
              <h3>Drift Into Serenity</h3>
              <p>
                Set a sleep timer or dive into deep focus work while the soundscape lives on.
              </p>
            </div>
          </div>
        </section>

        {/* Immersive Environments Scenario Selector */}
        <section className="section" id="scenarios">
          <div className="section-header">
            <h2 className="section-title">Immersive Environments</h2>
            <p className="section-subtitle">
              Step into meticulously recorded worlds, from the heart of the Amazon to the peak of the Himalayas.
            </p>
          </div>
          <div className="scenarios-grid">
            {SCENARIOS.map((scenario) => (
              <div
                key={scenario.id}
                className={`scenario-card ${activeScenario.id === scenario.id ? 'active' : ''}`}
                onClick={() => selectScenario(scenario)}
              >
                <img src={scenario.image} alt={scenario.title} className="scenario-image" />
                <div className="scenario-overlay">
                  <span className="scenario-label">{scenario.label}</span>
                  <h3 className="scenario-title">{scenario.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials and Premium Pass Card */}
        <section className="section" id="pricing">
          <div className="combo-container">
            <div className="testimonial-part">
              <div className="stars-rating">
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
              </div>
              <blockquote className="testimonial-text">
                "Zephyr has completely changed my wind-down routine. The dynamic soundscapes feel alive, unlike any other white noise app I've used."
              </blockquote>
              <div className="author-block">
                <img src="/elena_avatar.png" alt="Elena Rodriguez" className="author-avatar" />
                <div className="author-info">
                  <span className="author-name">Elena Rodriguez</span>
                  <span className="author-title">Mindfulness Coach</span>
                </div>
              </div>
            </div>

            <div className="premium-part">
              <span className="premium-label">Premium Pass</span>
              <div className="premium-price">
                $4.99<span>/mo</span>
              </div>
              <ul className="premium-list">
                <li className="premium-item">
                  <Check className="check-icon" size={16} />
                  All 50+ Global Locations
                </li>
                <li className="premium-item">
                  <Check className="check-icon" size={16} />
                  Unlimited Offline Downloads
                </li>
                <li className="premium-item">
                  <Check className="check-icon" size={16} />
                  Dynamic Day/Night Cycles
                </li>
              </ul>
              <button className="btn btn-primary premium-btn" onClick={() => showToast('Premium activation coming soon!')}>
                Go Premium
              </button>
            </div>
          </div>
        </section>

        {/* Categories / Bento Grid */}
        <section className="section">
          <div className="section-header">
            <h2 className="section-title">Designed For Your Life</h2>
            <p className="section-subtitle">
              Whether you are working late, studying for exams, meditating, or winding down for bed, Zephyr provides the perfect backdrop.
            </p>
          </div>
          <div className="bento-grid">
            {CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                className={`bento-card ${cat.className}`}
                onClick={() => showToast(`Setting sound profile for ${cat.title}...`)}
              >
                <div className="bento-card-bg" style={{ backgroundImage: `url('${cat.image}')` }} />
                <div className="bento-overlay">
                  <h3 className="bento-title">{cat.title}</h3>
                  <p className="bento-description">{cat.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Downloader CTA section */}
        <section className="download-section">
          <h2 className="section-title">Your Perfect Atmosphere Is One Tap Away.</h2>
          <p className="section-subtitle">
            Join 50,000+ users who have transformed their focus and sleep with Zephyr.
          </p>
          <div className="badges-container">
            <a href="https://apple.com" target="_blank" rel="noopener noreferrer" className="store-badge">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                <path d="M18.71,19.5C17.88,20.74,17,21.95,15.66,22c-1.28,0-1.69-.78-3.15-.78s-1.92,.76-3.15,.78c-1.3,.02-2.28-1.3-3.12-2.52C4.54,16.92,3.22,11.83,4.98,8.77c.88-1.52,2.44-2.48,4.12-2.51,1.28-.02,2.5,.87,3.29,.87s1.77-.9,3.29-.75c1.62,.07,3.1,.8,4.01,2.18-3.23,1.9-2.73,6.08,.52,7.39-1.03,2.54-2.47,5.04-3.51,6.54M15.98,5.17c.66-.81,1.11-1.93,.99-3.06-1,.04-2.2,.66-2.92,1.5-.62,.72-1.16,1.86-1.02,2.97,1.11,.09,2.26-.59,2.95-1.41Z" />
              </svg>
              <div className="badge-text">
                <span className="badge-sub">Download on the</span>
                <span className="badge-main">App Store</span>
              </div>
            </a>

            <a href="https://google.com" target="_blank" rel="noopener noreferrer" className="store-badge">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                <path d="M3,5.27V18.73c0,.89,.72,1.61,1.61,1.61c.29,0,.58-.08,.83-.24l11.66-7.39L5.44,5.32c-.25-.16-.54-.24-.83-.24C3.72,5.08,3,5.17,3,5.27M18.15,11.23L19.46,12l-1.31,.77-1.46-.92,1.46-.85M17.1,10.61l-10.45-6.62c.28-.18,.61-.27,.95-.27c.43,0,.85,.15,1.19,.43l8.31,6.46M6.65,18.99l10.45-6.62-8.31,6.46c-.34,.28-.76,.43-1.19,.43c-.34,0-.67-.09-.95-.27Z" />
              </svg>
              <div className="badge-text">
                <span className="badge-sub">Get it on</span>
                <span className="badge-main">Google Play</span>
              </div>
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-container">
          <div className="footer-logo">
            <span>Zephyr</span>
          </div>

          <div className="footer-links">
            <button className="nav-link footer-link" onClick={() => showToast('Privacy Policy coming soon!')}>Privacy</button>
            <button className="nav-link footer-link" onClick={() => showToast('Terms of Service coming soon!')}>Terms</button>
            <button className="nav-link footer-link" onClick={() => showToast('Support channels coming soon!')}>Support</button>
            <button className="nav-link footer-link" onClick={() => showToast('Careers page coming soon!')}>Careers</button>
          </div>

          <div className="footer-copy">
            © 2024 Zephyr Ambient. Escapism through sound.
          </div>
        </div>
      </footer>

      {/* Toast Notifications */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          onClose={() => setToastMessage('')}
        />
      )}
    </>
  )
}

export default App

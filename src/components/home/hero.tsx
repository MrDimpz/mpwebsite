import { ArrowDown, Sparkles } from 'lucide-react';

export const heroImage = '/hero-image.png';

export function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-copy">
        <div className="hero-bg" aria-hidden="true">
          <video
            className="hero-bg-video"
            src="/hero-video.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />
          <span className="hero-bg-grain" />
        </div>
        <div className="hero-copy-inner">
          <p className="eyebrow">
            <span className="status-dot" /> THE MISSING PIECE · FIND YOUR SPACE
          </p>
          <h1 id="hero-title">
            Your content.
            <br />A little more{' '}
            <span className="play-word">
              play.
              <Sparkles aria-hidden="true" />
            </span>
          </h1>
          <p className="hero-description">
            Find your space to play. Discover TikTok interactive
            <br className="desktop-break" /> and solo games made for creators like you.
          </p>
          <a className="button button-dark" href="#games">
            Let’s find your game <ArrowDown size={18} />
          </a>
          <p className="hero-note">Play with your audience. Or make it your own.</p>
        </div>
      </div>
      <div className="hero-media">
        <span className="vertical-label">BUILT AROUND PLAY</span>
        <img
          src={heroImage}
          alt="Gold game controller and puzzle pieces on a purple background"
          fetchPriority="high"
        />
        <span className="media-sticker">
          Good content
          <br />
          starts with play.
          <span aria-hidden="true">✳</span>
        </span>
        <span className="media-caption">FOR CREATORS. FOR THE FUN OF IT.</span>
      </div>
    </section>
  );
}

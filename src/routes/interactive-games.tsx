import { Link } from 'react-router';
import { ArrowLeft, ArrowUpRight, MessageCircle, Sparkles, Users } from 'lucide-react';

export default function InteractiveGamesPage() {
  return (
    <main aria-label="TikTok interactive games">
      <section className="interactive-page">
        <Link to="/" className="solo-back">
          <ArrowLeft size={16} /> Back home
        </Link>
        <div className="interactive-hero-card">
          <div className="interactive-orbit" aria-hidden="true">
            <span className="orbit orbit-one" />
            <span className="orbit orbit-two" />
            <span className="interactive-icon icon-chat">
              <MessageCircle size={46} />
            </span>
            <span className="interactive-icon icon-users">
              <Users size={58} />
            </span>
            <Sparkles className="interactive-spark" size={34} />
          </div>
          <p className="eyebrow">
            <span className="status-dot" /> PLAY TOGETHER
          </p>
          <h1>
            Make your audience
            <br />
            part of the <span>game.</span>
          </h1>
          <p className="interactive-lede">
            Turn a live moment into a shared one. Interactive games are being prepared for creators who want to bring their community closer.
          </p>
          <div className="coming-soon-pill">
            <span className="status-dot" /> MORE PLAY, COMING SOON
          </div>
        </div>
        <div className="interactive-bottom">
          <div>
            <p className="eyebrow">WHILE YOU WAIT</p>
            <h2>
              There’s still a game
              <br />
              with your name on it.
            </h2>
          </div>
          <Link className="button button-dark" to="/solo-games">
            Explore solo games <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>
    </main>
  );
}

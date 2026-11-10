import { Link } from 'react-router';
import { ArrowUpRight, Gamepad2, Users, Sparkles, MessageCircle, Play } from 'lucide-react';

export function GameCollections() {
  return <section id="games" className="collections" aria-labelledby="games-title">
    <div className="collections-heading"><div><p className="eyebrow">TWO WAYS TO PLAY</p><h2 id="games-title">Find your kind of fun.</h2></div><p>Bring everyone into the game.<br />Or take the spotlight yourself.</p></div>
    <div className="collection-grid">
      <article id="solo" className="collection-card solo-card">
        <div className="card-top"><span className="category-label"><span className="status-dot" /> PLAY YOUR WAY</span><span className="card-number">01 /</span></div>
        <div className="category-art solo-art" aria-hidden="true"><span className="controller-shape"><Gamepad2 size={99} strokeWidth={1.35} /></span><span className="play-circle"><Play size={23} fill="currentColor" /></span><Sparkles className="art-spark" size={34} /></div>
        <h3>Solo games</h3><p>Your game, your moment. Discover solo games to enjoy on your own and use in your creator content.</p>
        <Link className="collection-link" to="/solo-games">Explore solo games <span><ArrowUpRight size={22} /></span></Link>
      </article>
      <article id="interactive" className="collection-card interactive-card">
        <div className="card-top"><span className="category-label"><span className="status-dot" /> PLAY TOGETHER</span><span className="card-number">02 /</span></div>
        <div className="category-art interactive-art" aria-hidden="true"><span className="chat-bubble"><MessageCircle size={45} strokeWidth={1.5} /></span><span className="audience-circle"><Users size={57} strokeWidth={1.6} /></span><Sparkles className="art-spark" size={34} /></div>
        <h3>TikTok interactive games</h3><p>Make your audience part of the moment. Explore interactive games to bring into your TikTok content.</p>
        <Link className="collection-link" to="/interactive-games">Explore interactive games <span><ArrowUpRight size={22} /></span></Link>
      </article>
    </div>
  </section>;
}

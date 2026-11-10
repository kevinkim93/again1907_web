import './HeroMessage.css';

export default function CinematicHero({ children }) {
  return (
    <section className="cinematic-hero" aria-labelledby="gathering-title">
      {children}
    </section>
  );
}

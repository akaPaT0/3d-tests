import Link from 'next/link';
import styles from './home.module.css';

export default function Home() {
  const experiences = [
    {
      num: "01",
      title: "Wedding & Events Photography",
      desc: "Explore Patrick Moreau's flagship portfolio. Immerse yourself in timeless editorial photography, elegant design, and interactive galleries driven by a responsive WebGL camera.",
      link: "/photography",
      img: "/photography_preview.png"
    },
    {
      num: "02",
      title: "3D Camera Rental Gear",
      desc: "Rent premium cinema gear, lenses, and production services. Interact with a fully responsive 3D camera model, inspect custom equipment packages, and book available dates.",
      link: "/blender",
      img: "/blender_preview.png"
    },
    {
      num: "03",
      title: "Analog Darkroom Lab",
      desc: "Step inside a virtual photographic lab. Switch on the red safelights, tune exposure times, fire the polaroid shutter, and watch chemical photo development in real-time.",
      link: "/darkroom",
      img: "/darkroom_preview.png"
    },
    {
      num: "04",
      title: "Cosmic Lens Telemetry",
      desc: "A futuristic portal simulator. Teleport into custom cosmic environments, adjust spacetime gravitational warp factors, and tune optical refraction indexes dynamically.",
      link: "/cosmic-lens",
      img: "/cosmic_lens_preview.png"
    }
  ];

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <span className={styles.logo}>PATRICK MOREAU STUDIO</span>
        <h1 className={styles.title}>
          Creative <em>Dimensions</em> &amp; Visual Labs
        </h1>
        <p className={styles.subtitle}>
          Select a portal to explore interactive 3D WebGL interfaces, analog simulation tools, and premium event photography galleries.
        </p>
      </header>

      <div className={styles.grid}>
        {experiences.map((exp) => (
          <Link key={exp.num} href={exp.link} className={styles.card}>
            <div className={styles.cardImageWrapper}>
              <img
                src={exp.img}
                alt={exp.title}
                className={styles.cardImage}
              />
              <div className={styles.cardOverlay} />
            </div>
            
            <div className={styles.cardContent}>
              <span className={styles.cardNum}>{exp.num}</span>
              <h2 className={styles.cardTitle}>{exp.title}</h2>
              <p className={styles.cardDesc}>{exp.desc}</p>
              <div className={styles.cardLink}>
                <span>Enter Dimension</span>
                <span className={styles.cardArrow}>➔</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <footer className={styles.footer}>
        <span>© 2026 Patrick Moreau Studio • Warsaw, Poland</span>
      </footer>
    </main>
  );
}

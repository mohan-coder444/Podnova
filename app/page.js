export default function LandingPage() {
  return (
    <main>
      <div className="nova-bg" />
      
      <nav style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '2px' }}>
          POD<span className="gradient-text">NOVA</span>
        </div>
        <div className="glass" style={{ padding: '0.5rem 1.5rem', display: 'flex', gap: '2rem' }}>
          <a href="#" style={{ color: 'white', textDecoration: 'none', opacity: 0.8 }}>Network</a>
          <a href="#" style={{ color: 'white', textDecoration: 'none', opacity: 0.8 }}>Docs</a>
          <a href="#" style={{ color: 'white', textDecoration: 'none', opacity: 0.8 }}>Login</a>
        </div>
      </nav>

      <section className="hero">
        <h1 className="gradient-text" style={{ fontSize: '5rem', marginBottom: '1rem' }}>
          Evolution of Infrastructure.
        </h1>
        <p style={{ fontSize: '1.25rem', opacity: 0.7, maxWidth: '600px', marginBottom: '3rem', lineHeight: 1.6 }}>
          PODNOVA provides the ultimate layer for decentralized, intelligent pod clusters. 
          Powered by InsForge for seamless backend scalability.
        </p>
        
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <a href="#" className="cta-button">Launch Console</a>
          <a href="#" className="glass" style={{ padding: '1rem 2.5rem', color: 'white', textDecoration: 'none', fontWeight: 600 }}>
            Read Manifest
          </a>
        </div>
      </section>

      <section style={{ padding: '5rem 2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="glass" style={{ padding: '2.5rem' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--nova-cyan)' }}>Zero-Latency Pods</h3>
          <p style={{ opacity: 0.7 }}>Optimized execution across global edge locations with sub-millisecond propagation.</p>
        </div>
        <div className="glass" style={{ padding: '2.5rem' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--accent-light)' }}>Nova Intelligence</h3>
          <p style={{ opacity: 0.7 }}>Integrated AI layer for autonomous scaling and self-healing pod architectures.</p>
        </div>
        <div className="glass" style={{ padding: '2.5rem' }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--nova-magenta)' }}>Forge Secure</h3>
          <p style={{ opacity: 0.7 }}>Advanced RLS and kernel-level security powered by the InsForge infrastructure.</p>
        </div>
      </section>

      <footer style={{ padding: '4rem 2rem', textAlign: 'center', opacity: 0.5, fontSize: '0.875rem' }}>
        &copy; 2026 PODNOVA. Built with Next.js & InsForge.
      </footer>
    </main>
  )
}

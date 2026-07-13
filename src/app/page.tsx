import Link from "next/link";

export default function HomePage() {
  return <main className="shell hero">
    <section>
      <p className="eyebrow">Your time, thoughtfully arranged</p>
      <h1>Appointments without the back-and-forth.</h1>
      <p className="lede">Publish your availability, share one polished booking link, and keep every appointment clear across timezones.</p>
      <div className="actions"><Link className="button" href="/login">Create your page</Link><Link className="button secondary" href="/book/maya">Try the booking flow</Link></div>
    </section>
    <aside className="card stack" aria-label="Upcoming appointment preview">
      <div><span className="pill">Today</span><h2 style={{marginTop:".8rem"}}>A calm week starts here.</h2></div>
      <div className="appointment"><div className="time">10:00</div><div><strong>Brand consultation</strong><div className="muted">with Amara K.</div></div><span className="pill">30 min</span></div>
      <div className="appointment"><div className="time">14:30</div><div><strong>Portfolio review</strong><div className="muted">with Noah J.</div></div><span className="pill">60 min</span></div>
      <p className="muted" style={{margin:0}}>Times shown in Africa/Lagos</p>
    </aside>
  </main>;
}


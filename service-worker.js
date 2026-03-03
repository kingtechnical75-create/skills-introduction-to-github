@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;800&display=swap');

:root{
  --bg:#12001c;
  --purple:#8b2dff;
  --deep-purple:#390060;
  --gold:#ffcc4d;
  --gold-2:#e6b436;
  --white:#fff;
  --glass:rgba(255,255,255,0.08);
  --glass-border:rgba(255,255,255,0.24);
}

*{box-sizing:border-box;font-family:Poppins,sans-serif}
body{margin:0;color:var(--white);background:var(--bg);min-height:100vh;overflow-x:hidden}
.bg-wallpaper{
  position:fixed;inset:0;z-index:-1;
  background:
    radial-gradient(circle at 20% 25%, rgba(139,45,255,.35), transparent 40%),
    radial-gradient(circle at 80% 20%, rgba(255,204,77,.25), transparent 45%),
    radial-gradient(circle at 50% 80%, rgba(139,45,255,.2), transparent 45%),
    linear-gradient(135deg, #100019, #1a0030 45%, #220033);
}

.topbar{
  position:sticky;top:0;z-index:9;
  display:flex;align-items:center;justify-content:space-between;
  padding:14px 20px;margin:10px;border-radius:16px
}
.brand{font-weight:800;letter-spacing:.4px}
.top-nav{display:flex;gap:8px}
.tab{
  background:transparent;color:#ddd;border:1px solid transparent;
  padding:8px 12px;border-radius:10px;cursor:pointer
}
.tab.active{color:#fff;border-color:var(--glass-border);background:rgba(255,255,255,.06)}

main{padding:10px;max-width:980px;margin:0 auto}
.view{display:none}
.view.active{display:block}

.card{
  margin:12px 0;padding:18px;border-radius:18px;
  border:1px solid var(--glass-border)
}
.glass{
  background:var(--glass);
  backdrop-filter:blur(14px);
  box-shadow:0 10px 40px rgba(0,0,0,.35), inset 0 0 30px rgba(255,255,255,.02);
}

h2,h3{margin:0 0 8px}
.subtitle{opacity:.8;margin-bottom:10px}

.timer-card{text-align:center}
.ring-wrap{position:relative;width:260px;height:260px;margin:10px auto}
.timer-svg{width:260px;height:260px;transform:rotate(-90deg)}
.bg-ring{fill:none;stroke:rgba(255,255,255,.2);stroke-width:10}
.progress-ring{
  fill:none;stroke:var(--gold);stroke-width:10;stroke-linecap:round;
  stroke-dasharray:754;stroke-dashoffset:0;
  filter:drop-shadow(0 0 8px rgba(255,204,77,.8))
}
.timer-text{
  position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
  font-size:3rem;font-weight:800
}
.timer-controls{display:flex;justify-content:center;gap:12px;margin-top:14px}
.btn,.icon-btn{
  border:none;border-radius:12px;padding:10px 16px;cursor:pointer;font-weight:700
}
.btn.primary{
  background:linear-gradient(135deg,var(--gold),var(--gold-2));
  color:#240033
}
.btn.gold{
  background:linear-gradient(135deg,var(--gold),#ffd97a);
  color:#240033
}
.icon-btn{background:rgba(255,255,255,.12);color:#fff}
.session-state{margin-top:10px;opacity:.9}

.stat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.stat{padding:12px;border-radius:12px;background:rgba(255,255,255,.06)}
.stat span{display:block;opacity:.75;font-size:.9rem}
.stat strong{font-size:1.2rem}

.session-list{margin-top:14px;display:flex;flex-direction:column;gap:8px}
.session-item{
  display:flex;justify-content:space-between;align-items:center;
  background:rgba(255,255,255,.06);padding:10px;border-radius:10px
}

label{display:block;margin:10px 0 6px}
input[type="text"],input[type="number"]{
  width:100%;padding:10px;border-radius:10px;
  border:1px solid var(--glass-border);background:rgba(0,0,0,.35);color:#fff
}
.toggle-row{display:flex;justify-content:space-between;align-items:center;margin:12px 0}

.overlay{position:fixed;inset:0;background:rgba(0,0,0,.72);display:none;align-items:center;justify-content:center}
.overlay.show{display:flex}
.modal{width:min(420px,92%);padding:20px;border-radius:16px}

.hidden{display:none !important}

@media (max-width:760px){
  .stat-grid{grid-template-columns:1fr}
  .topbar{flex-wrap:wrap;gap:8px}
}
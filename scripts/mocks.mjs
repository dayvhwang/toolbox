// Hand-made cover scenes, one per tool, drawn in HTML and CSS. scripts/thumbs.mjs renders a
// tool's scene when it has one here, and falls back to a screenshot of the live tool otherwise.
// Each scene sits centred on a 1024x1024 #f2f2f2 square and uses the site's two faces.

const GRAIN = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0.6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`;

export const BASE = `
  @font-face { font-family: "IBM Plex Mono"; src: url("https://dayvhwang.com/fonts/IBMPlexMono-Light.woff2") format("woff2"); font-weight: 300; }
  @font-face { font-family: "IBM Plex Mono"; src: url("https://dayvhwang.com/fonts/IBMPlexMono-Regular.woff2") format("woff2"); font-weight: 400; }
  @font-face { font-family: "PP Neue Montreal"; src: url("https://dayvhwang.com/fonts/PPNeueMontreal-Light.otf") format("opentype"); font-weight: 300; }
  @font-face { font-family: "PP Neue Montreal"; src: url("https://dayvhwang.com/fonts/PPNeueMontreal-Regular.otf") format("opentype"); font-weight: 400; }
  html, body { margin: 0; width: 1024px; height: 1024px; overflow: hidden; }
  body { position: relative; background: #f2f2f2; color: #1f1f1f; font-family: "IBM Plex Mono", monospace; font-weight: 300; -webkit-font-smoothing: antialiased; }
  .scene { position: absolute; inset: 0; display: grid; place-items: center; }
  .grain { position: absolute; inset: 0; background: ${GRAIN}; mix-blend-mode: overlay; pointer-events: none; }
`;

export const MOCKS = {
  // crate: a record crate, sleeves standing up in it, one in the brand pink
  crate: {
    css: `
      .crate { position: relative; width: 600px; height: 520px; }
      .sleeves { position: absolute; left: 34px; right: 34px; bottom: 150px; height: 360px; display: flex; align-items: flex-end; gap: 9px; }
      .sleeves i { flex: 1; height: var(--h); background: var(--c); border-radius: 5px 5px 0 0; box-shadow: inset -3px 0 0 rgb(0 0 0 / 0.08), 0 -2px 0 rgb(255 255 255 / 0.35) inset; }
      .box { position: absolute; left: 0; right: 0; bottom: 0; height: 300px; background: #141414; border-radius: 18px;
             background-image: repeating-linear-gradient(90deg, transparent 0 34px, #262626 34px 39px); background-clip: padding-box;
             box-shadow: 0 30px 60px -24px rgb(0 0 0 / 0.45), 0 0 0 1px rgb(0 0 0 / 0.06); }
      .box::after { content: "crate"; position: absolute; left: 28px; bottom: 24px; padding: 6px 10px; background: #f2f2f2; color: #141414; font-size: 18px; border-radius: 4px; }
    `,
    html: `
      <div class="crate">
        <div class="sleeves">
          <i style="--h:330px;--c:#d9d9d9"></i><i style="--h:300px;--c:#bdbdbd"></i><i style="--h:346px;--c:#2b2b2b"></i>
          <i style="--h:318px;--c:#e8e8e8"></i><i style="--h:356px;--c:#ff4fb3"></i><i style="--h:308px;--c:#9a9a9a"></i>
          <i style="--h:336px;--c:#cfcfcf"></i><i style="--h:322px;--c:#3a3a3a"></i><i style="--h:350px;--c:#e1e1e1"></i>
        </div>
        <div class="box"></div>
      </div>`,
  },

  // 2046: a letterboxed film still, teal into amber, halation, grain, a vertical title
  2046: {
    css: `
      .still { position: relative; width: 800px; height: 470px; background: #050505; border-radius: 6px; overflow: hidden; box-shadow: 0 40px 80px -30px rgb(0 0 0 / 0.5); }
      .img { position: absolute; left: 0; right: 0; top: 70px; height: 330px;
             background: linear-gradient(180deg, #0a3538 0%, #175f5f 38%, #8a5a3a 62%, #d78a3b 82%, #f0b35e 100%); }
      .sun { position: absolute; left: 56%; top: 42%; width: 180px; height: 180px; border-radius: 50%; background: radial-gradient(circle, #ffd9a8 0%, #ffb15a 35%, rgb(255 140 60 / 0) 70%); filter: blur(10px); }
      .ridge { position: absolute; left: -5%; right: -5%; bottom: 0; height: 110px; background: #120d0a; clip-path: polygon(0 60%, 12% 48%, 25% 62%, 38% 40%, 50% 55%, 62% 35%, 74% 50%, 88% 30%, 100% 52%, 100% 100%, 0 100%); }
      .title { position: absolute; right: 48px; top: 96px; writing-mode: vertical-rl; color: #fff; font-family: "Hiragino Mincho ProN", "Songti SC", "Noto Serif CJK SC", serif; font-size: 30px; letter-spacing: 0.35em; text-shadow: 0 0 14px rgb(255 200 150 / 0.7); }
      .still .grain { opacity: 0.5; }
    `,
    html: `
      <div class="still">
        <div class="img"><div class="sun"></div><div class="ridge"></div></div>
        <div class="title">二〇四六</div>
        <div class="grain"></div>
      </div>`,
  },

  // type-outline: one word, three stacked outlines, as the tool draws it
  "type-outline": {
    css: `
      .type { position: relative; font-family: Impact, "Arial Black", sans-serif; font-size: 330px; line-height: 1; letter-spacing: -0.02em; transform: rotate(-5deg); }
      .type span { position: absolute; left: 0; top: 0; }
      .type .l1 { -webkit-text-stroke: 64px #4fe0bd; color: #4fe0bd; }
      .type .l2 { -webkit-text-stroke: 40px #141414; color: #141414; }
      .type .l3 { -webkit-text-stroke: 18px #fff; color: #fff; }
      .type .l4 { position: relative; color: #141414; }
    `,
    html: `<div class="type"><span class="l1">TYPE</span><span class="l2">TYPE</span><span class="l3">TYPE</span><span class="l4">TYPE</span></div>`,
  },

  // borders: a print with a clean white border
  borders: {
    css: `
      .print { position: relative; width: 500px; height: 640px; padding: 40px 40px 108px; box-sizing: border-box; background: #fff; transform: rotate(2deg);
               box-shadow: 0 40px 80px -30px rgb(0 0 0 / 0.4), 0 0 0 1px rgb(0 0 0 / 0.04); }
      .photo { position: relative; width: 100%; height: 100%; overflow: hidden; background: linear-gradient(168deg, #f6c7a0 0%, #e8879a 42%, #7b5ea7 78%, #2c2a54 100%); }
      .photo .grain { opacity: 0.35; }
      .print::after { content: "4 × 5 · 24 px"; position: absolute; left: 40px; bottom: 40px; font-size: 18px; color: #9a9a9a; }
    `,
    html: `<div class="print"><div class="photo"><div class="grain"></div></div></div>`,
  },

  // backdrop-builder: a step-and-repeat wall, the event title in its own band between staggered sponsor marks
  "backdrop-builder": {
    css: `
      .wall { position: relative; width: 820px; height: 560px; background: #fff; overflow: hidden; display: flex; flex-direction: column; justify-content: space-evenly;
              box-shadow: 0 40px 80px -30px rgb(0 0 0 / 0.35), 0 0 0 1px rgb(0 0 0 / 0.05); }
      .row { display: flex; justify-content: center; gap: 96px; color: #c4c4c4; font-size: 22px; letter-spacing: 0.12em; white-space: nowrap; }
      .row.shift { transform: translateX(110px); }
      .row i { display: inline-block; width: 24px; height: 24px; border: 2px solid #c4c4c4; border-radius: 50%; vertical-align: middle; }
      .row b { display: inline-block; width: 22px; height: 22px; background: #c4c4c4; vertical-align: middle; }
      .event { text-align: center; }
      .event h1 { margin: 0; font-family: "PP Neue Montreal", sans-serif; font-weight: 300; font-size: 112px; line-height: 1; letter-spacing: -0.02em; color: #141414; }
      .event p { margin: 12px 0 0; font-size: 20px; letter-spacing: 0.2em; text-transform: uppercase; color: #7a7a7a; }
    `,
    html: `
      <div class="wall">
        <div class="row"><span>ACME</span><i></i><span>NORTH&amp;CO</span><b></b><span>ORBIT</span></div>
        <div class="row shift"><b></b><span>MERIDIAN</span><i></i><span>ACME</span><span>FOLD</span></div>
        <div class="event"><h1>Gala</h1><p>Step &amp; repeat</p></div>
        <div class="row shift"><i></i><span>FOLD</span><span>ACME</span><i></i><span>ORBIT</span></div>
        <div class="row"><span>MERIDIAN</span><b></b><span>FOLD</span><span>NORTH&amp;CO</span><b></b></div>
      </div>`,
  },

  // neon-clock: the time as a neon tube on a dark screen
  "neon-clock": {
    css: `
      .screen { position: relative; width: 780px; height: 500px; background: #09090b; border-radius: 28px; display: grid; place-items: center; overflow: hidden;
                box-shadow: 0 40px 80px -30px rgb(0 0 0 / 0.5), 0 0 0 1px rgb(0 0 0 / 0.08); }
      .screen::before { content: ""; position: absolute; inset: 0; background: radial-gradient(60% 50% at 50% 55%, rgb(255 79 179 / 0.22), transparent 70%); }
      .neon { position: relative; font-size: 190px; font-weight: 300; letter-spacing: 0.02em; color: #ffe3f2;
              text-shadow: 0 0 6px #fff, 0 0 18px #ff8fd0, 0 0 42px #ff4fb3, 0 0 90px #ff2d9c, 0 0 160px #ff2d9c; }
      .neon small { display: block; margin-top: 18px; font-size: 22px; letter-spacing: 0.3em; text-transform: uppercase; color: #ff9ad5; text-shadow: 0 0 12px #ff4fb3; text-align: center; }
    `,
    html: `<div class="screen"><div class="neon">23:46<small>open all night</small></div></div>`,
  },

  // caravan: the trip card, who's in, and the share per person
  caravan: {
    css: `
      .trip { width: 620px; padding: 44px 48px 40px; box-sizing: border-box; background: #fff; border-radius: 28px; box-shadow: 0 40px 80px -30px rgb(0 0 0 / 0.35), 0 0 0 1px rgb(0 0 0 / 0.05); }
      .eyebrow { font-size: 17px; letter-spacing: 0.18em; text-transform: uppercase; color: #8a8a8a; }
      .trip h1 { margin: 14px 0 30px; font-family: "PP Neue Montreal", sans-serif; font-weight: 300; font-size: 58px; line-height: 1.05; letter-spacing: -0.015em; color: #141414; }
      .people { display: flex; align-items: center; gap: 0 14px; }
      .avatars { display: flex; }
      .avatars i { font-style: normal; width: 50px; height: 50px; border-radius: 50%; margin-left: -10px; border: 3px solid #fff; display: grid; place-items: center; font-size: 16px; font-weight: 400; color: #1f1f1f; background: var(--c); }
      .avatars i:first-child { margin-left: 0; }
      .people span { font-size: 19px; color: #6b6b6b; }
      .cost { margin: 34px 0 0; padding-top: 28px; border-top: 1px solid #ececec; display: flex; align-items: baseline; gap: 12px; }
      .cost b { font-family: "PP Neue Montreal", sans-serif; font-weight: 300; font-size: 56px; color: #141414; letter-spacing: -0.02em; }
      .cost span { font-size: 19px; color: #6b6b6b; }
      .rsvp { margin-top: 30px; display: flex; gap: 10px; }
      .rsvp span { padding: 14px 26px; border-radius: 999px; font-size: 19px; background: #f2f2f2; color: #6b6b6b; }
      .rsvp .on { background: #141414; color: #fff; }
    `,
    html: `
      <div class="trip">
        <div class="eyebrow">Nov 25 – 29 · Yosemite</div>
        <h1>Thanksgiving in the valley</h1>
        <div class="people">
          <div class="avatars"><i style="--c:#cfeee2">DA</i><i style="--c:#f6d9e8">VI</i><i style="--c:#dfe6f7">NL</i><i style="--c:#f8e6c8">RA</i><i style="--c:#e4e4e4">GO</i></div>
          <span>4 going · 1 maybe</span>
        </div>
        <div class="cost"><b>$84</b><span>per person, 5 going</span></div>
        <div class="rsvp"><span class="on">Going</span><span>Maybe</span><span>Can't</span></div>
      </div>`,
  },
};

export const scene = (m) => `<!doctype html><html><head><meta charset="utf-8"><style>${BASE}${m.css}</style></head><body><div class="scene">${m.html}</div></body></html>`;

# dave's toolbox

Every small tool I've built, in one place: **[dayvhwang.com/toolbox](https://dayvhwang.com/toolbox/)**.

Each tool lives in its own repo and its own deployment. This site is the index: a card per tool, search, filters, and an inline view for the single-page ones. No framework, no build step. The whole catalog is one file, [`tools.json`](tools.json).

<!-- tools:start -->

| Tool | What it does | Kind | Live | Repo |
|---|---|---|---|---|
| [crate](https://dayvhwang.com/toolbox/tool.html?t=crate) | Paste links, get mp3s. A DJ's download queue for SoundCloud, YouTube, Bandcamp and Spotify. | `cli` | [crate-audio.vercel.app](https://crate-audio.vercel.app) | private |
| [2046](https://dayvhwang.com/toolbox/tool.html?t=2046) | Film still grader: Asian cinema color, grain and halation for your photos, in the browser. | `web` | [2046-filter.vercel.app](https://2046-filter.vercel.app) | private |
| [Type Outline](https://dayvhwang.com/toolbox/tool.html?t=type-outline) | Type, get stacked bubble-letter outlines, export SVG. | `web` | [outlinetypography-tool.vercel.app](https://outlinetypography-tool.vercel.app) | private |
| [Borders](https://dayvhwang.com/toolbox/tool.html?t=borders) | Add clean borders to images and videos and export them at full size. | `web` | [borders-beta.vercel.app](https://borders-beta.vercel.app) | private |
| [Backdrop Builder](https://dayvhwang.com/toolbox/tool.html?t=backdrop-builder) | Step-and-repeat backdrop builder: stagger sponsor logos around an event title, export a print-ready vector PDF. | `web` | [backdrop-builder.vercel.app](https://backdrop-builder.vercel.app) | private |
| [Neon Clock](https://dayvhwang.com/toolbox/tool.html?t=neon-clock) | A glowing 3D neon clock that runs in the browser. | `web` | [peggygou-at-circoloco.vercel.app](https://peggygou-at-circoloco.vercel.app) | private |
| [Caravan](https://dayvhwang.com/toolbox/tool.html?t=caravan) | Plan a trip with friends from one link: RSVPs by a date, cost per person that updates with the headcount. | `web` | [caravan-ochre-six.vercel.app](https://caravan-ochre-six.vercel.app) | private |

<details><summary>Archived</summary>

| Tool | What it does | Kind | Live | Repo |
|---|---|---|---|---|
| [GroupSync Survey](https://dayvhwang.com/toolbox/tool.html?t=groupsync-survey) | The same personality test in three interactive formats, to see which one people prefer. | `web` | [groupsync-survey.vercel.app](https://groupsync-survey.vercel.app) | private |
| [Just In](https://dayvhwang.com/toolbox/tool.html?t=just-in-app) | Expo prototype of a social tab for the Just In design exercise. | `web` | [just-in-app.vercel.app](https://just-in-app.vercel.app) | private |
| [Marathon Race](https://dayvhwang.com/toolbox/tool.html?t=marathonrace) | A marathon race experiment. | `web` | [marathonrace.vercel.app](https://marathonrace.vercel.app) | private |
| [Journl](https://dayvhwang.com/toolbox/tool.html?t=journl) | A journaling app prototype. | `web` | [journlapp.vercel.app](https://journlapp.vercel.app) |  |
| [Follow My Ball](https://dayvhwang.com/toolbox/tool.html?t=followmyball) | An interactive 3D Spline scene wrapped in Next.js. | `web` | [lab-three-amber.vercel.app](https://lab-three-amber.vercel.app) | private |
| [WindOS](https://dayvhwang.com/toolbox/tool.html?t=windos) | Windows XP makes a baby with macOS. A desktop-style portfolio. | `web` |  | private |
| [HAY](https://dayvhwang.com/toolbox/tool.html?t=hay) | How Are You? A prototype exported from Figma. | `web` |  | private |
| [dayv](https://dayvhwang.com/toolbox/tool.html?t=dayv) | An earlier personal site. | `site` |  | private |

</details>

<!-- tools:end -->

## Add a tool

1. Add an object to [`tools.json`](tools.json):

   ```json
   {
     "slug": "my-tool",
     "name": "My Tool",
     "tagline": "One line on what it does.",
     "description": "A longer paragraph for the tool page (optional).",
     "url": "https://my-tool.vercel.app",
     "repo": "https://github.com/dayvhwang/my-tool",
     "repoPublic": false,
     "kind": "web",
     "tags": ["image"],
     "embed": true,
     "status": "active",
     "year": 2026
   }
   ```

   - `kind`: `web`, `cli`, `extension` or `site`.
   - `embed: true` shows the tool inside the page in an iframe. Use it for static, single-page tools.
   - `repoPublic` controls whether a Source link is shown.
   - `status: "archived"` hides it behind the Archive chip.

2. `npm run thumbs my-tool` to screenshot it into `assets/thumbs/`.
3. `npm test` to validate, `npm run readme` to refresh the table above.

## Run locally

```bash
npm run dev
```

Then open http://localhost:5180. Any static server works; the pages fetch `tools.json` so `file://` won't.

To generate thumbnails the first time:

```bash
npm install
npx playwright install chromium
npm run thumbs
```

## Layout

```
index.html        catalog
tool.html         one tool (?t=slug)
tools.json        the manifest
assets/           style.css, app.js, tool.js, shared.js, thumbs/
scripts/          validate, readme, thumbs
```

## Use it for your own tools

Fork it, replace `tools.json`, swap the wordmark in the two HTML files, deploy the folder as a static site. MIT.

# GLB Viewer

A lightweight frontend app to preview `.glb` models in the browser.

## Features

- File picker for `.glb` files
- Drag-and-drop `.glb` support
- Remote `.glb` URL loading
- Auto-load model from share link route path (query parameter fallback supported)
- Interactive 3D camera controls (orbit, pan, zoom)
- Auto camera framing when a model loads
- Responsive layout for desktop and mobile

## Run locally

You can use any static server. Example with Node.js:

```bash
npx serve .
```

Then open the URL shown in your terminal.

For local development with Vite:

```bash
npm install
npm run dev
```

For production build:

```bash
npm run build
```

Build output is generated in `dist/`.

## Deploy to Vercel via GitHub

1. Create a new GitHub repository and push this project.
2. In Vercel, click "Add New Project" and import the GitHub repository.
3. Use these settings:
	- Framework Preset: `Vite`
	- Build Command: `npm run build`
	- Output Directory: `dist`
4. Click Deploy.

Every new push to your GitHub default branch will auto-deploy.

## Share link format

Primary format (route-based):

```text
https://your-viewer-domain.com/https%3A%2F%2Fyour-cdn.com%2Foutputs%2Fabc123.glb
```

Fallback format (query-based, still supported):

```text
https://your-viewer-domain.com/?model=https%3A%2F%2Fyour-cdn.com%2Foutputs%2Fabc123.glb
```

The encoded value must point to an HTTP/HTTPS URL serving a `.glb` file.



## Telegram integration flow

1. User sends a 2D image in Telegram.
2. Your bot backend calls your `/genrate` API on A100.
3. API returns generated 3D model file (or path).
4. Backend uploads the GLB to object storage (S3, Cloudflare R2, GCS, etc.) and gets a public or signed URL.
5. Backend builds viewer link using encoded model URL:

```text
viewerLink = https://your-viewer-domain.com/${encodeURIComponent(glbUrl)}
```

6. Backend sends `viewerLink` back to the Telegram user.

## Important

- Your GLB host must allow CORS from your viewer domain.
- For private files, use short-lived signed URLs.
- For cleaner links, you can later switch to token links like `/view/:id` and resolve the real GLB URL on your backend.

## Files

- `index.html` - page structure
- `styles.css` - visual design and responsive layout
- `app.js` - Three.js renderer and GLB loading logic

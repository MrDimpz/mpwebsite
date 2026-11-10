import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';

const ROOT_DIR = import.meta.dirname || __dirname;
const DIST_DIR = path.resolve(ROOT_DIR, 'dist');
const PUBLIC_ZIP_PATH = path.resolve(ROOT_DIR, 'public/the-missing-piece-hostinger.zip');

function generateHostingerZipFromDist(): void {
  if (!fs.existsSync(path.join(DIST_DIR, 'index.html'))) {
    return;
  }

  // Remove any recursive copy of the zip inside dist/ before packaging
  const distZip = path.join(DIST_DIR, 'the-missing-piece-hostinger.zip');
  if (fs.existsSync(distZip)) {
    try {
      fs.unlinkSync(distZip);
    } catch {}
  }

  const pyScript = `
import os, zipfile

dist_dir = ${JSON.stringify(DIST_DIR)}
zip_path = ${JSON.stringify(PUBLIC_ZIP_PATH)}
tmp_zip_path = zip_path + ".tmp"

store_exts = {'.png', '.jpg', '.jpeg', '.webp', '.gif', '.mp4', '.webm', '.woff', '.woff2'}

with zipfile.ZipFile(tmp_zip_path, 'w') as zf:
    for root, dirs, files in os.walk(dist_dir):
        for file in sorted(files):
            if file.endswith('.zip') or file.endswith('.tmp'):
                continue
            full_path = os.path.join(root, file)
            arcname = os.path.relpath(full_path, dist_dir).replace('\\\\', '/')
            # Skip unused chat attachment screenshots while keeping 3d_logo_944e5372.png
            if arcname.startswith('assets/aistudio/') and arcname != 'assets/aistudio/3d_logo_944e5372.png':
                continue
            if arcname == '3d_logo_944e5372.png':
                continue
            ext = os.path.splitext(file)[1].lower()
            compress_type = zipfile.ZIP_STORED if ext in store_exts else zipfile.ZIP_DEFLATED
            zf.write(full_path, arcname, compress_type=compress_type)

os.replace(tmp_zip_path, zip_path)
`;

  execFileSync('python3', ['-c', pyScript], { stdio: 'ignore' });
}

function hostingerZipPlugin(): Plugin {
  return {
    name: 'hostinger-zip-plugin',
    closeBundle() {
      if (process.env.SKIP_HOSTINGER_ZIP === 'true') return;
      try {
        generateHostingerZipFromDist();
      } catch (err) {
        console.warn('Failed to generate Hostinger zip in closeBundle:', err);
      }
    },
    configureServer(server) {
      const handleZipDownload = (req: any, res: any, next: any) => {
        const urlPath = (req.url || '').split('?')[0];
        if (
          urlPath !== '/the-missing-piece-hostinger.zip' &&
          urlPath !== '/api/download-hostinger-zip'
        ) {
          return next();
        }

        try {
          // Ensure dist exists and is packaged into a fresh zip
          if (!fs.existsSync(path.join(DIST_DIR, 'index.html'))) {
            execFileSync('npx', ['vite', 'build'], {
              cwd: ROOT_DIR,
              env: {
                ...process.env,
                SKIP_HOSTINGER_ZIP: 'true',
                VITE_HIDE_HOSTINGER_DOWNLOAD: 'true',
              },
              stdio: 'ignore',
            });
          }
          generateHostingerZipFromDist();

          if (!fs.existsSync(PUBLIC_ZIP_PATH)) {
            res.statusCode = 404;
            res.end('Hostinger zip archive not found');
            return;
          }

          const stat = fs.statSync(PUBLIC_ZIP_PATH);
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/zip');
          res.setHeader('Content-Length', String(stat.size));
          res.setHeader(
            'Content-Disposition',
            'attachment; filename="the-missing-piece-hostinger.zip"'
          );
          res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

          const stream = fs.createReadStream(PUBLIC_ZIP_PATH);
          stream.pipe(res);
        } catch (err) {
          console.error('Error serving Hostinger zip:', err);
          next(err);
        }
      };

      server.middlewares.use(handleZipDownload);
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), hostingerZipPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(ROOT_DIR, './src'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

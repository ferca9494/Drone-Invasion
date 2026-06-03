const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

module.exports = class Cache {
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
    this.cacheDir = path.join(projectRoot, '.projectmap_cache');
    this.mtimes = {};
    this._ensureCacheDir();
    this._load();
  }

  _ensureCacheDir() {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  _cachePath(filePath) {
    const rel = path.relative(this.projectRoot, filePath);
    const hash = crypto.createHash('md5').update(rel).digest('hex');
    return path.join(this.cacheDir, hash + '.json');
  }

  _load() {
    const metaPath = path.join(this.cacheDir, '_meta.json');
    if (fs.existsSync(metaPath)) {
      try {
        this.mtimes = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
      } catch { this.mtimes = {}; }
    }
  }

  _save() {
    const metaPath = path.join(this.cacheDir, '_meta.json');
    fs.writeFileSync(metaPath, JSON.stringify(this.mtimes));
  }

  isStale(filePath) {
    if (!fs.existsSync(filePath)) return true;
    const stat = fs.statSync(filePath);
    const key = path.relative(this.projectRoot, filePath);
    const lastMtime = this.mtimes[key];
    const currentMtime = stat.mtimeMs;
    if (!lastMtime) return true;
    return currentMtime > lastMtime;
  }

  get(filePath) {
    if (this.isStale(filePath)) return null;
    const cachePath = this._cachePath(filePath);
    if (!fs.existsSync(cachePath)) return null;
    try {
      return JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
    } catch {
      return null;
    }
  }

  set(filePath, data) {
    const cachePath = this._cachePath(filePath);
    fs.writeFileSync(cachePath, JSON.stringify(data));
    const key = path.relative(this.projectRoot, filePath);
    this.mtimes[key] = fs.statSync(filePath).mtimeMs;
    this._save();
  }

  invalidate(filename) {
    const key = filename.replace(/\\/g, '/');
    delete this.mtimes[key];
    const fullPath = path.join(this.projectRoot, filename);
    const cachePath = this._cachePath(fullPath);
    if (fs.existsSync(cachePath)) {
      fs.unlinkSync(cachePath);
    }
    this._save();
  }

  invalidateAll() {
    this.mtimes = {};
    if (fs.existsSync(this.cacheDir)) {
      const files = fs.readdirSync(this.cacheDir);
      for (const f of files) {
        fs.unlinkSync(path.join(this.cacheDir, f));
      }
    }
  }
};

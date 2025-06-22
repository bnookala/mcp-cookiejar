# Publishing Guide

This guide explains how to publish the MCP Cookie Server to npm.

## Prerequisites

1. **npm account**: Create an account at [npmjs.com](https://npmjs.com)
2. **npm login**: Run `npm login` and enter your credentials
3. **Package name**: Ensure `mcp-cookie-server` is available on npm

## Pre-Publishing Checklist

- [ ] Update version in `package.json`
- [ ] Update `CHANGELOG.md` (if exists)
- [ ] Test build: `npm run build`
- [ ] Test CLI: `node dist/index.js --help`
- [ ] Update repository URLs in `package.json`
- [ ] Review files included in package: `npm pack --dry-run`

## Publishing Steps

1. **Build the package:**
   ```bash
   npm run build
   ```

2. **Test package contents:**
   ```bash
   npm pack --dry-run
   ```

3. **Publish to npm:**
   ```bash
   npm publish
   ```

4. **Verify publication:**
   ```bash
   npx mcp-cookie-server --help
   ```

## Version Management

Use semantic versioning:

- **Patch** (1.0.1): Bug fixes
- **Minor** (1.1.0): New features, backward compatible
- **Major** (2.0.0): Breaking changes

Update version:
```bash
npm version patch|minor|major
npm publish
```

## Testing Installation

After publishing, test the installation:

```bash
# Test npx (recommended method)
npx mcp-cookie-server --help

# Test global installation
npm install -g mcp-cookie-server
mcp-cookie-server --help
npm uninstall -g mcp-cookie-server

# Test local installation
mkdir test-install && cd test-install
npm install mcp-cookie-server
npx mcp-cookie-server --help
cd .. && rm -rf test-install
```

## Package Info

The published package will include:
- `dist/` - Compiled JavaScript
- `README.md` - User documentation  
- `CLAUDE.md` - Claude-specific docs
- `package.json` - Package metadata

Excluded files (see `.npmignore`):
- `src/` - TypeScript source
- `.claude/` - Development config
- Node modules and other dev files
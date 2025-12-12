# Cricket Career Sim - Build Documentation

## Overview

This document describes how to build the Cricket Career Sim desktop application for Windows distribution.

## Prerequisites

- Node.js (v14 or later)
- npm (comes with Node.js)
- For Windows builds on Linux: Wine (optional, for advanced packaging)

## Build Process

### 1. Install Dependencies

```bash
npm install
```

### 2. Build Web Assets

```bash
npm run build
```

This command:
- Compiles TypeScript code
- Bundles the React application using Vite
- Outputs to the `dist/` directory

### 3. Build Windows Executable

```bash
npm run build:win
```

This command builds the Windows application using electron-builder.

**Note**: When building on Linux without Wine properly configured, the process will create an unpacked Windows application in `release/win-unpacked/` which can be manually packaged.

### Alternative Build Commands

- `npm run build:win:portable` - Build portable executable only
- `npm run build:win:nsis` - Build NSIS installer only

## Build Artifacts

After a successful build, you'll find the following in the `release/` directory:

- `win-unpacked/` - Unpacked Windows application folder
  - Contains `Cricket Career Sim.exe` and all required DLLs and resources
  
- `Cricket-Career-Sim-1.0.0-win-x64-portable.zip` - Complete portable package
  - Ready for distribution
  - Users can extract and run without installation
  
- `Cricket-Career-Sim-1.0.0-Portable.exe` - Standalone executable
  - Note: Requires supporting files from the zip to function

## Manual Build Steps (Linux without Wine)

If electron-builder fails due to Wine requirements:

1. Build the web assets:
   ```bash
   npm run build
   ```

2. Create the unpacked application:
   ```bash
   npx electron-builder --win --dir
   ```

3. The unpacked app will be in `release/win-unpacked/`

4. Create a ZIP package:
   ```bash
   cd release
   zip -r Cricket-Career-Sim-1.0.0-win-x64-portable.zip win-unpacked/
   ```

## Testing the Build

To test the application locally before building:

```bash
npm run electron
```

This runs the Electron app in development mode.

## Build Configuration

The build configuration is defined in `package.json` under the `"build"` key:

- **appId**: com.cricketcareersim.app
- **productName**: Cricket Career Sim
- **Output directory**: release/
- **Included files**: dist/, electron/, package.json

## Windows Build Targets

The project supports the following Windows build targets:

1. **zip** - ZIP archive with all files
2. **dir** - Unpacked directory structure
3. **nsis** - NSIS installer (requires Wine on Linux)
4. **portable** - Portable executable (requires Wine on Linux)

## Troubleshooting

### Wine Not Found Error

If you encounter "wine is required" errors when building on Linux:
- The unpacked application is still created successfully in `release/win-unpacked/`
- You can manually package this as a ZIP file
- To build installers, either:
  - Install Wine properly for your architecture
  - Build on a Windows machine
  - Use a CI/CD service with Windows runners

### Missing Dependencies

If build fails with missing dependencies:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Electron Download Issues

If Electron fails to download:
```bash
npm cache clean --force
npm install
```

## Distribution

For end-user distribution, provide:
1. The portable ZIP package (`Cricket-Career-Sim-1.0.0-win-x64-portable.zip`)
2. The README.txt file with usage instructions

Users can extract the ZIP and run the application without any installation process.

## Technical Details

- **Framework**: Electron 25.x
- **Frontend**: React 18.x with TypeScript
- **Build Tool**: Vite 4.x
- **Packager**: electron-builder 24.x
- **Target Platform**: Windows x64
- **Architecture**: x64 only

## File Structure

```
project/
├── dist/                  # Built web assets (generated)
├── electron/              # Electron main process code
│   └── main.js
├── src/                   # React application source
│   ├── App.tsx
│   ├── data/
│   ├── engine/
│   └── types.ts
├── release/               # Build output (generated)
│   ├── win-unpacked/
│   └── *.zip
├── package.json           # Project config & build settings
└── vite.config.ts         # Vite configuration
```

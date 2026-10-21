# Swarmtunes Client Setup

This guide explains how to install, develop, and build the Swarmtunes client.

## Requirements

- [Node.js](https://nodejs.org/) — use a version compatible with the project.
- npm — included with Node.js.
- [Rust](https://www.rust-lang.org/tools/install) and the [Tauri prerequisites](https://v2.tauri.app/start/prerequisites/) if you want to build or run the desktop application.

## Installation

Clone the client repo

```bash
git clone https://github.com/AceandGaming/swarmtunes-client.git
cd swarmtunes-client
```

Install the dependencies:
```bash
npm install
```

## Development

### Web client

Start the Vite development server:

```bash
npm run dev
```

Vite will print the local URL in the terminal.

### Network access

To expose the development server to other devices on your local network, run:

```bash
npm run host
```

This script enables HTTPS and binds Vite to a network-accessible interface.

## Building

Create a production build:

```bash
npm run build
```

Vite outputs the built web application to `dist/`.

To preview the production build locally:

```bash
npm run preview
```

The preview server is intended for checking a production build locally, not for hosting it as a production service.

## Desktop application (Tauri)

The client includes a Tauri desktop application.

Use the Tauri CLI through the npm script:

```bash
npm run tauri dev
```

To build the desktop application:

```bash
npm run tauri build
```
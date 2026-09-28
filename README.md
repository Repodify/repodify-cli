# Repodify CLI

The official Command Line Interface for [Repodify.app](https://repodify.app).

Repodify CLI allows you to create, manage, and distribute your podcast feeds directly from your terminal.

## Installation

```bash
npm install -g repodify-cli
```

## Authentication

Before using the CLI, you need to authenticate with your Repodify API key. You can generate an API key from your [Account Settings](https://repodify.app/dashboard/settings).

```bash
repodify login --key <YOUR_API_KEY>
```

## Usage

### Managing Feeds

**List all your feeds:**
```bash
repodify feeds
```

**Create a new feed:**
```bash
repodify create "My Awesome Podcast" --desc "A podcast about awesome things"
```

**Get details and episodes for a feed:**
```bash
repodify get <slug>
```

**Update feed metadata:**
```bash
repodify update <slug> --name "New Name" --desc "New description" --image "https://example.com/cover.jpg"
```

**Delete a feed:**
```bash
repodify rm <slug>
```

**Submit feed to PodcastIndex:**
```bash
repodify submit <slug>
```

### Managing Episodes

**Add a new episode:**
```bash
repodify add "https://example.com/audio.mp3" --feed <slug> --title "Episode 1" --desc "The first episode"
```

**Reorder episodes:**
```bash
repodify reorder <slug> --ids episode_id_1 episode_id_2 episode_id_3
```

**Update an episode:**
```bash
repodify update-ep <slug> <episodeId> --title "Updated Title"
```

**Delete an episode:**
```bash
repodify rm-ep <slug> <episodeId>
```

## Environment Variables

- `REPODIFY_API_BASE`: Override the base API URL (useful for local development). Defaults to `https://repodify.app/api/v1`.

## License
MIT

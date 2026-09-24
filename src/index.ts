#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import Configstore from 'configstore';
import fetch from 'node-fetch';

const conf = new Configstore('repodify-cli');
const program = new Command();
const API_BASE = process.env.REPODIFY_API_BASE || 'https://repodify.app/api/v1';

program
  .name('repodify')
  .description('CLI to manage Repodify podcast feeds')
  .version('1.0.0');

async function apiFetch(endpoint: string, options: any = {}) {
  const token = conf.get('apiKey');
  if (!token) {
    console.error(chalk.red('Error: Not authenticated. Run "repodify login --key <YOUR_API_KEY>" first.'));
    process.exit(1);
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    console.error(chalk.red(`Error: ${data?.error || `HTTP ${res.status}`}`));
    process.exit(1);
  }
  return data;
}

program
  .command('login')
  .description('Authenticate with your API key')
  .requiredOption('-k, --key <key>', 'Your Repodify API key')
  .action((options) => {
    conf.set('apiKey', options.key);
    console.log(chalk.green('Successfully authenticated!'));
  });

program
  .command('feeds')
  .description('List all of your Repodcast feeds')
  .action(async () => {
    const data = await apiFetch('/feeds');
    if (data.feeds.length === 0) {
      console.log(chalk.yellow('No feeds found.'));
      return;
    }
    console.log(chalk.bold('Your Feeds:'));
    data.feeds.forEach((f: any) => {
      console.log(`- ${chalk.green(f.name)} (Slug: ${chalk.cyan(f.slug)})`);
    });
  });

program
  .command('create <name>')
  .description('Create a new Repodcast feed')
  .option('-d, --desc <description>', 'Description for the feed')
  .action(async (name, options) => {
    const data = await apiFetch('/feeds', {
      method: 'POST',
      body: JSON.stringify({ name, description: options.desc })
    });
    console.log(chalk.green(`Success! Feed created with slug:`), chalk.cyan(data.feed.slug));
  });

program
  .command('get <slug>')
  .description('Get metadata and a list of episodes for a specific Repodcast')
  .action(async (slug) => {
    const data = await apiFetch(`/feeds/${slug}`);
    console.log(chalk.bold.green(data.feed.name));
    console.log(chalk.gray(data.feed.description || 'No description'));
    console.log(chalk.bold(`\nEpisodes (${data.feed.episodes.length}):`));
    data.feed.episodes.forEach((ep: any, index: number) => {
      console.log(`${index + 1}. ${chalk.cyan(ep.title)} ${chalk.gray(`[ID: ${ep.id}]`)}`);
    });
  });

program
  .command('rm <slug>')
  .description('Delete a Repodcast feed')
  .option('-f, --force', 'Force delete without prompting')
  .action(async (slug) => {
    await apiFetch(`/feeds/${slug}`, { method: 'DELETE' });
    console.log(chalk.green(`Feed ${slug} deleted successfully.`));
  });

program
  .command('add <url>')
  .description('Add an audio episode to a Repodcast feed')
  .requiredOption('-f, --feed <slug>', 'Slug of the target feed')
  .requiredOption('-t, --title <title>', 'Title of the episode')
  .option('-d, --desc <description>', 'Description of the episode')
  .action(async (url, options) => {
    const data = await apiFetch(`/feeds/${options.feed}/episodes`, {
      method: 'POST',
      body: JSON.stringify({
        title: options.title,
        audioUrl: url,
        description: options.desc
      })
    });
    console.log(chalk.green(`Success! Episode added. ID:`), chalk.cyan(data.episodeId));
  });

program
  .command('reorder <slug>')
  .description('Reorder episodes in a Repodcast feed')
  .requiredOption('-i, --ids <ids...>', 'Space-separated list of episode IDs in the desired order')
  .action(async (slug, options) => {
    await apiFetch(`/feeds/${slug}/episodes/reorder`, {
      method: 'PUT',
      body: JSON.stringify({ orderedIds: options.ids })
    });
    console.log(chalk.green(`Success! Episodes reordered for feed ${slug}.`));
  });

program
  .command('update <slug>')
  .description('Update metadata for a Repodcast feed')
  .option('-n, --name <name>', 'New name of the feed')
  .option('-d, --desc <description>', 'New description')
  .option('-i, --image <url>', 'New image URL')
  .action(async (slug, options) => {
    await apiFetch(`/feeds/${slug}`, {
      method: 'PATCH',
      body: JSON.stringify({ name: options.name, description: options.desc, imageUrl: options.image })
    });
    console.log(chalk.green(`Feed ${slug} updated successfully.`));
  });

program
  .command('submit <slug>')
  .description('Submit a Repodcast to PodcastIndex')
  .action(async (slug) => {
    await apiFetch(`/feeds/${slug}/submit`, { method: 'POST' });
    console.log(chalk.green(`Feed ${slug} submitted to PodcastIndex!`));
  });

program
  .command('rm-ep <slug> <episodeId>')
  .description('Delete a specific episode from a Repodcast')
  .action(async (slug, episodeId) => {
    await apiFetch(`/feeds/${slug}/episodes/${episodeId}`, { method: 'DELETE' });
    console.log(chalk.green(`Episode ${episodeId} deleted from ${slug}.`));
  });

program
  .command('update-ep <slug> <episodeId>')
  .description('Update metadata for a specific episode')
  .option('-t, --title <title>', 'New title')
  .option('-d, --desc <description>', 'New description')
  .action(async (slug, episodeId, options) => {
    await apiFetch(`/feeds/${slug}/episodes/${episodeId}`, {
      method: 'PATCH',
      body: JSON.stringify({ title: options.title, description: options.desc })
    });
    console.log(chalk.green(`Episode ${episodeId} updated successfully.`));
  });

program.parse();

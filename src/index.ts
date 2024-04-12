import cron from 'node-cron';
import axios from 'axios';
import { createClient } from 'redis';
import 'dotenv/config';

cron.schedule(`*/10 * * * *`, async () => {
  console.log(`Running your task...`);
  console.log(`Fetching data from QuickIndexer...`);
  const responses = await Promise.all([
    axios.get('https://api.quickindexer.xyz/leaderboard?days=1'),
    axios.get('https://api.quickindexer.xyz/leaderboard?days=7'),
    axios.get('https://api.quickindexer.xyz/leaderboard?days=14'),
    axios.get('https://api.quickindexer.xyz/leaderboard?days=30'),
  ]);
  console.log(`Data fetched from QuickIndexer...`);
  console.log(`Storing data in Redis...`);
  const leaderBoard = {
    '1': responses[0].data,
    '7': responses[1].data,
    '14': responses[2].data,
    '30': responses[3].data,
  };
  const client = createClient({ url: process.env.REDIS_URL });
  client.on('error', (err) => console.log('Redis Client Error', err));
  await client.connect();
  console.log(`Connected to Redis...`);
  await client.set('leaderboard_data', JSON.stringify(leaderBoard));
  await client.disconnect();
  console.log(`Finished running your task...`);
});

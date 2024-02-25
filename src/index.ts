import cron from 'node-cron';
import axios from 'axios';
import { createClient } from 'redis';

cron.schedule(`*/5 * * * *`, async () => {
  const client = createClient({ url: process.env.REDIS_URL });
  const responses = await Promise.all([
    axios.get('https://api.quickindexer.com/leaderboard?days=1'),
    axios.get('https://api.quickindexer.com/leaderboard?days=7'),
    axios.get('https://api.quickindexer.com/leaderboard?days=30'),
  ]);
  const leaderBoard = {
    '1': responses[0].data,
    '7': responses[1].data,
    '30': responses[2].data,
  };
  await client.set('leaderboard_data', JSON.stringify(leaderBoard));
  await client.disconnect();
  console.log(`Finished running your task...`);
});

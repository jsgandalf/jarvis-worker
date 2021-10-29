import threeCommasAPI from "../commas";

const getProfit = async query => {
  const reqToken = query.token;
  const reqKey = query.key;
  const reqSecret = query.secret;
  // check for a passed token
  if (!reqToken) throw new Error('provide a token');

  // validate token
  if (process.env.APPLE_WATCH_TOKEN !== reqToken) throw new Error('unauthorized');
  const creds = {
    apiKey: process.env.THREE_COMMAS_API_KEY,
    apiSecret: process.env.THREE_COMMAS_API_SECRET,
  };
  if (reqKey) {
    creds.apiKey = process.env[reqKey];
    creds.apiSecret = process.env[reqSecret];
  }

  const api = new threeCommasAPI(creds);
  let bots = await api.getBots({});
  if (bots && bots.length > 0) {
    const botGetStats = bots
      .filter(e => e.is_enabled)
      .map((bot) => api.getBotsStats({ account_id: bot.account_id, bot_id: bot.id }));
    const stats: any = await Promise.all(botGetStats);
    // check for errors
    if (stats?.[0]?.error) {
      //@ts-ignore
      throw new Error(stats[0].error);
    }
    return stats
      .map((e: any) => e.profits_in_usd.today_usd_profit)
      .reduce((prev, curr) => {
        return prev + curr;
      }, 0);
  }
}


export default async (req, res) => {
  // check if there is a payload
  if (!req.query) return res.status(400).send('provide a query string params');
  try {
    const data = await getProfit(req.query)
    //@ts-ignore
    return res.status(200).send({ profit: data });
  } catch (e) {
    if (e === 'unauthorized') return res.status(403);
    console.log(e);
    return res.status(400).send(e.message);
  }
}
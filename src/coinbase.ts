import {AuthenticatedClient} from 'coinbase-pro';
import {readFileSync} from 'fs';
import {join} from 'path';

import {Fund} from './types';

const COINBASE_DATA = readFileSync(join(__dirname, '../COINBASE_API_FILE'), 'utf-8');

const COINBASE_API = 'https://api.pro.coinbase.com';

const [apiKey, apiSecret, passphrase, btcAccountId] = COINBASE_DATA.split('\n');

const round2dp = (number:number): number => {
  return Math.round((number+Number.EPSILON)*100)/100;
};

const authedClient = new AuthenticatedClient(apiKey, apiSecret, passphrase, COINBASE_API);

export const getCoinbaseHoldings = async (): Promise<Fund>=>{
  const {balance} = await authedClient.getAccount(btcAccountId);
  const {ask} = await authedClient.getProductTicker('BTC-GBP');
  return {
    id: 'BTC',
    name: 'Bitcoin',
    fundType: 'bitcoin',
    value: round2dp(Number(balance) * Number(ask)),
    units: Number(balance),
  };
};



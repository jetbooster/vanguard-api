import {AuthenticatedClient} from 'coinbase-pro';
import {readFileSync} from 'fs';
import {join} from 'path';

import {Fund} from './types';

const COINBASE_DATA = readFileSync(join(__dirname, '../COINBASE_API_FILE'), 'utf-8');

const COINBASE_API = 'https://api.pro.coinbase.com';

const [apiKey, apiSecret, passphrase, btcAccountId] = COINBASE_DATA.split('\n');

const authedClient = new AuthenticatedClient(apiKey, apiSecret, passphrase, COINBASE_API);

export const getCoinbaseHoldings = async (): Promise<Fund>=>{
  const {balance} = await authedClient.getAccount(btcAccountId);
  const {ask} = await authedClient.getProductTicker('BTC-GBP');
  return {
    id: 'BTC',
    name: 'Bitcoin',
    fundType: 'bitcoin',
    value: Number(balance) * Number(ask),
    units: Number(balance),
  };
};



import axios from 'axios';
import axiosRetry from 'axios-retry';

import {Vanguard} from './types';
import winston from 'winston';

const VANGUARD_API_BASE_PATH = 'https://api.vanguard.com/rs/gre/gra/1.7.0/';
const DATASETS_PATH = 'datasets/urd-product-details.jsonp';

const axiosInst = axios.create({
  baseURL: VANGUARD_API_BASE_PATH,
});

axiosRetry(axiosInst, {retries: 5, shouldResetTimeout: true});

export const getFundById =
  async (id:string, logger: winston.Logger): Promise<Vanguard> => {
    logger.debug('Requesting', id, 'from vanguard api');
    let result =(await axiosInst.get(DATASETS_PATH, {
      params: {
        path: `[id=${id}][0]`,
      },
    })).data as string;
    logger.debug('Request succeeded');
    result = result.slice(9); // remove callback(
    result = result.substring(0, result.length-1);
    const resultJson: Vanguard = JSON.parse(result);
    delete resultJson.documents;
    return resultJson;
  };

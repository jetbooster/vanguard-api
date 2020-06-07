import express from 'express';
import MongoClient from './mongo';
import {getFundById} from './vanguard';

import {format, createLogger, transports} from 'winston';
import {getCoinbaseHoldings} from './coinbase';

import {Fund} from './types';

const round2dp = (number:number): number => {
  return Math.round((number+Number.EPSILON)*100)/100;
};

const genShortformData = (totalWorth:number, funds: Fund[])=>{
  const vgWorth = round2dp(funds.filter((fund)=>fund.fundType==='vanguard').reduce((acc, fund)=>acc+fund.value, 0));
  const btcWorth = round2dp(funds.filter((fund)=>fund.fundType==='bitcoin').reduce((acc, fund)=>acc+fund.value, 0));
  return {
    total: totalWorth.toString(),
    vg: vgWorth.toString(),
    btc: btcWorth.toString(),
  };
};

const logger = createLogger({
  level: 'info',
  transports: [
    new transports.Console(),
    new transports.File({filename: 'error.log', level: 'error'}),
    new transports.File({filename: 'combined.log'}),
  ],
  format: format.combine(
      format.timestamp(),
      format.json(),
  ),
});

const app = express();
const mongoClient = new MongoClient(logger);

app.get('/holdings', async (req, res)=>{
  logger.info('GET /holdings');
  const portfolio = await mongoClient.getHoldings();
  res.json(portfolio);
  logger.info('GET /holding resp sent');
});

app.get('/datasheet/:id', async (req, res)=>{
  logger.info('GET /datasheet/', req.params.id);
  const result = await getFundById(req.params.id, logger);
  res.send(result);
  logger.info('GET /datasheet resp sent');
});

app.get('/currentWorth', async (req, res)=>{
  logger.info('GET /currentWorth');
  const holdings = await mongoClient.getHoldings();
  const valueCache = await mongoClient.getValueCache();
  if (!valueCache) {
    logger.info('Cache expired. Getting fund values');
    if (!holdings) {
      throw Error('Holdings failed');
    }
    const fundValues = await Promise.all(holdings.map<Promise<Fund>>(async (fund)=>{
      switch (fund.fundType) {
        case 'vanguard': {
          const datasheet = await getFundById(fund.id, logger);
          const value = round2dp(Number(datasheet.navPrice.mmValue) * fund.units);
          return {
            ...fund,
            fundType: 'vanguard',
            value,
          };
        }
        case 'bitcoin': {
          return getCoinbaseHoldings();
        }
        default: {
          throw Error('unrecognised Holding Type');
        }
      }
    }));
    logger.info('Fund Values returned');
    const totalWorth = round2dp(fundValues
        .reduce((worth, fund)=> worth+fund.value, 0));


    res.json({
      totalWorth,
      funds: fundValues,
      trimmed: genShortformData(totalWorth, fundValues),
    });
    await mongoClient.updateValueCache({totalWorth, funds: fundValues});
    logger.info('GET /currentWorth resp sent, cache updated');
  } else {
    const trimmedValues = genShortformData(valueCache.totalWorth, valueCache.funds);
    res.json({...valueCache, trimmed: trimmedValues});
    logger.info('GET /currentWorth resp sent');
  }
});

app.get('/cache/clear', async (req, res)=>{
  await mongoClient.clearValueCache();
  res.json({result: 'ok'});
});

app.get('/cache', async (req, res)=>{
  const cache = await mongoClient.getValueCache();
  res.json(cache);
});

app.listen(5000);

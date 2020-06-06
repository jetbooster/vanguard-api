import express from 'express';
import Mongo from './mongo';
import {getFundById} from './vanguard';
import axios from 'axios';
import {readFileSync} from 'fs';

const app = express();
const mClient = new Mongo();

const HASS_API_KEY = readFileSync('./HASS_API_KEY', 'utf-8');

const round2dp = (number:number): number => {
  return Math.round((number+Number.EPSILON)*100)/100;
};

app.get('/holdings', async (req, res)=>{
  const portfolio = await mClient.getHoldings();
  res.json(portfolio);
});

app.get('/datasheet/:id', async (req, res)=>{
  const result = await getFundById(req.params.id);
  console.log(result);
  res.send(result);
});

app.get('/currentWorth', async (req, res)=>{
  const holdings = await mClient.getHoldings();
  if (!holdings) {
    throw Error('Holdings failed');
  }
  const fundValues = await Promise.all(holdings.map(async (fund)=>{
    const datasheet = await getFundById(fund.id);
    const value = round2dp(Number(datasheet.navPrice.mmValue) * fund.units);
    return {
      ...fund,
      value,
    };
  }));
  console.log(fundValues);
  const totalWorth = round2dp(fundValues
      .reduce((worth, fund)=> worth+fund.value, 0));
  axios.post('http://192.168.8.113:8123/api/states/sensor.vanguard_api', {
    state: totalWorth,
    attributes: {
      unit_of_measurement: '£',
      friendly_name: 'Vanguard Value',
      fundValues,
    },
  }, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer: ${HASS_API_KEY}`,
    },
  });
  res.json({
    totalWorth,
    breakdown: fundValues,
  });
});

app.listen(5000);

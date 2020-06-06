export interface Vanguard {
  portId: string;
  parentPortId: string;
  name: string;
  id: string;
  displayName: string;
  fundType: string;
  shareClassCode: string;
  shareClassCodeDescription: string;
  closeIndicator: boolean;
  investmentStrategyDescription: string;
  sedol: string;
  isin: string;
  shareclassCode: string;
  shareclassDescription: string;
  distributionStrategyType: string;
  distributionStrategyTypeDescription: string;
  OCF: string;
  purchaseFee: string;
  stampDutyReserveTax: string;
  redemptionFee: string;
  managementType: string;
  benchmarkNameFromECS: string;
  assetClass: string;
  currencyCode: string;
  currencySymbol: string;
  inceptionDate: string;
  issueType: string;
  cutOffTime: string;
  retailDirectAvailability: boolean;
  benchmark: string;
  extendedFundType: string;
  isGlobalBalanced: string;
  validityCode: string;
  siblings: Sibling[];
  documents?: Document[];
  navPrice: NavPrice;
  assetAllocations: AssetAllocation[];
  totalAssets: string;
  totalAssetsCurrency: string;
  totalAssetsAsOfDate: string;
  totalNetAssets: MinInvestmentAmount;
  risk: Risk;
  numberOfBonds: string;
  numberOfStocks: string;
  returns: Returns;
  minInvestmentAmount: MinInvestmentAmount;
  region: null;
  sectorText: string;
  taxStatus: string;
  investmentStructure: string;
  sortName: string;
  peerGroupAvg: string;
  exclusions: Exclusions;
}

export interface AssetAllocation {
  value: string;
  code: string;
  label: string;
}

export interface Document {
  type: string;
  order: string;
  documentId: string;
  language: string;
}

export interface Exclusions {
  element0: boolean;
}

export interface MinInvestmentAmount {
  value: string;
  currency: string;
  currencySymbol: string;
  asOfDate?: string;
}

export interface NavPrice {
  asOfDate: string;
  value: string;
  mmValue: string;
  amountChange: string;
  mmAmountChange: string;
  percentChange: string;
  currency: string;
  currencySymbol: string;
}

export interface Returns {
  monthly: Monthly;
  quarterly: Monthly;
  benchmark: Benchmark;
}

export interface Benchmark {
  monthly: null;
  quarterly: null;
}

export interface Monthly {
  currency: string;
  currencySymbol: string;
  asOfDate: Date;
  ytd: string;
  '1Year': string;
  '3Year': string;
  '5Year': string;
  '10Year': string;
  inception: string;
}

export interface Risk {
  value: string;
  asOfDate: string;
}

export interface Sibling {
  portId: string;
  name: string;
  shareclassCode: string;
  shareclassDesc: string;
  distributionStrategyType: string;
  distributionStrategyDesc: string;
  id: string;
}

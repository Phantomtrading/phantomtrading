import prisma from "../src/common/config/db.js"
async function main() {

  const quoteCurrency = "USDT";

  const defaultTradeOptions = [
    { durationSeconds: 30, profitPercentage: 0.12, minAmountQuote: 50, maxAmountQuote: 90000 },
    { durationSeconds: 60, profitPercentage: 0.15, minAmountQuote: 50, maxAmountQuote: 90000 },
    { durationSeconds: 90, profitPercentage: 0.18, minAmountQuote: 50, maxAmountQuote: 90000 },
    { durationSeconds: 120, profitPercentage: 0.21, minAmountQuote: 50, maxAmountQuote: 90000 },
    { durationSeconds: 180, profitPercentage: 0.24, minAmountQuote: 50, maxAmountQuote: 90000 },
    { durationSeconds: 360, profitPercentage: 0.27, minAmountQuote: 50, maxAmountQuote: 90000 },
  ];

const settingsData = [
  {
    key: 'withdrawal-info',
    value: JSON.stringify({
      min: '200.00',
      max: '50000.00',
      fee: '0.01',
    }),
    description: 'Contains all withdrawal related settings.',
  },
  {
    key: 'deposit-info',
    value: JSON.stringify({
      min: '25.00',
      max: '100000.00',
    }),
    description: 'Contains all deposit related setting',
  },
  {
    key: 'app_info',
    value: JSON.stringify({
      app_name: 'Pbroker',
      email: 'support@pbroker.com',
      phone_number: '+1-800-555-0100',
    }),
    description: 'All official contact information and app details.',
  },
];

  const cryptos = [
    {
      name: "Tether USDT",
      symbol: "USDT",
      tokenStandard: "TRC-20",
      depositAddress: "jhgwdjgjdjhsgdjsgdjhjhdgddgcbmbdjhgdwgfjdf",
      coingeckoId: "tether",
    },
    {
      name: "Bitcoin",
      symbol: "BTC",
      tokenStandard: "Native",
      depositAddress: "dabbfjhAGHJF YTU TERUTR7TRGHQFghfdhgSFDHGSFDHSDGFHSD",
      coingeckoId: "bitcoin",
    },
    {
      name: "Ethereum",
      symbol: "ETH",
      tokenStandard: "ERC-20",
      depositAddress: "0x0000000000000000000000000000000000000000",
      coingeckoId: "ethereum",
    },
    {
      name: "Binance Coin",
      symbol: "BNB",
      tokenStandard: "BEP-20",
      depositAddress: "bnb1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      coingeckoId: "binancecoin",
    },
    {
      name: "Cardano",
      symbol: "ADA",
      tokenStandard: "Native",
      depositAddress: "addr1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      coingeckoId: "cardano",
    },
    {
      name: "Solana",
      symbol: "SOL",
      tokenStandard: "Native",
      depositAddress: "So1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      coingeckoId: "solana",
    },
    {
      name: "Ripple",
      symbol: "XRP",
      tokenStandard: "Native",
      depositAddress: "rXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
      coingeckoId: "ripple",
    },
    {
      name: "Polkadot",
      symbol: "DOT",
      tokenStandard: "Native",
      depositAddress: "1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      coingeckoId: "polkadot",
    },
    {
      name: "Dogecoin",
      symbol: "DOGE",
      tokenStandard: "Native",
      depositAddress: "Dxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      coingeckoId: "dogecoin",
    },
    {
      name: "Litecoin",
      symbol: "LTC",
      tokenStandard: "Native",
      depositAddress: "Lxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      coingeckoId: "litecoin",
    },
    {
      name: "Chainlink",
      symbol: "LINK",
      tokenStandard: "ERC-20",
      depositAddress: "0x0000000000000000000000000000000000000000",
      coingeckoId: "chainlink",
    },
    {
      name: "Avalanche",
      symbol: "AVAX",
      tokenStandard: "Native",
      depositAddress: "X-avax1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      coingeckoId: "avalanche-2",
    },
    {
      name: "Uniswap",
      symbol: "UNI",
      tokenStandard: "ERC-20",
      depositAddress: "0x0000000000000000000000000000000000000000",
      coingeckoId: "uniswap",
    },
    {
      name: "Stellar",
      symbol: "XLM",
      tokenStandard: "Native",
      depositAddress: "Gxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      coingeckoId: "stellar",
    },
    {
      name: "VeChain",
      symbol: "VET",
      tokenStandard: "Native",
      depositAddress: "0x0000000000000000000000000000000000000000",
      coingeckoId: "vechain",
    },
    {
      name: "Terra Luna",
      symbol: "LUNA",
      tokenStandard: "Native",
      depositAddress: "terra1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      coingeckoId: "terra-luna",
    },
  ];

  for (const crypto of cryptos) {
    if (crypto.symbol === quoteCurrency) continue;

    const pairName = `${crypto.symbol}${quoteCurrency}`;

    // 1. Upsert TradingPair
    const tradingPair = await prisma.tradingPair.upsert({
      where: { pairName },
      update: {
        baseCurrency: crypto.symbol,
        quoteCurrency,
        defaultTransactionFeePercentage: 0.001,
        isActive: true,
      },
      create: {
        pairName,
        baseCurrency: crypto.symbol,
        quoteCurrency,
        defaultTransactionFeePercentage: 0.001,
        isActive: true,
      },
    });

    // 2. Clear old trade options (if re-seeding)
    await prisma.tradeOption.deleteMany({
      where: { tradingPairId: tradingPair.id },
    });

    // 3. Insert new trade options
    for (const option of defaultTradeOptions) {
      await prisma.tradeOption.create({
        data: {
          tradingPairId: tradingPair.id,
          durationSeconds: option.durationSeconds,
          profitPercentage: option.profitPercentage,
          minAmountQuote: option.minAmountQuote,
          maxAmountQuote: option.maxAmountQuote,
        },
      });
    }
  }

  console.log("Seeded cryptocurrencies and trading pairs with full info successfully.");
}

main()
  .catch(e => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import axios from "axios";
import { CryptocurrencyRepository } from "../cryptocurrency/crypto.repository.js";

export class MarketService {
  static async getPaginatedMarketData(page = 1, limit = 15) {
    const skip = (page - 1) * limit;

    const [cryptos, total] = await Promise.all([
      CryptocurrencyRepository.findCryptosWithCoingeckoId(skip, limit),
      CryptocurrencyRepository.countCryptosWithCoingeckoId(),
    ]);

    const geckoIdToLocalCrypto = this.mapLocalCryptoByGeckoId(cryptos);
    const geckoIds = Object.keys(geckoIdToLocalCrypto);

    const [coinGeckoMarketData, binancePrices] = await Promise.all([
      this.fetchCoinGeckoMarketData(geckoIds),
      this.fetchBinanceTickerPrices(),
    ]);

    const data = coinGeckoMarketData.map((coin: any) => {
      const local = geckoIdToLocalCrypto[coin.id];
      const binanceSymbol = `${local.symbol.toUpperCase()}USDT`;
      const binancePrice = binancePrices[binanceSymbol];

      return {
        id: local.id,
        name: local.name,
        symbol: local.symbol,
        logoUrl: coin.image,
        price: binancePrice ?? coin.current_price,
        source: binancePrice ? "Binance" : "CoinGecko",
        change24h: coin.price_change_percentage_24h,
      };
    });

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  static async getMarketDataById(id: number) {
    const crypto = await CryptocurrencyRepository.getCryptoCurrencyById(id);
    if (!crypto) throw new Error("Cryptocurrency not found");
    if (!crypto.coingeckoId) throw new Error("CoinGecko ID not found");

    const [geckoData, binancePrice] = await Promise.all([
  this.fetchCoinGeckoDetails(crypto.coingeckoId),
  this.fetchBinancePrice(`${crypto.symbol.toUpperCase()}USDT`),
]);

    return {
      id: crypto.id,
      name: crypto.name,
      symbol: crypto.symbol,
      logoUrl: geckoData.image.large,
      price: binancePrice ?? geckoData.market_data.current_price.usd,
      source: binancePrice ? "Binance" : "CoinGecko",
      change24h: geckoData.market_data.price_change_percentage_24h,
    };
  }
  private static mapLocalCryptoByGeckoId(cryptos: any[]) {
    const map: Record<string, { id: number; name: string; symbol: string }> =
      {};
    for (const crypto of cryptos) {
      if (crypto.coingeckoId) {
        map[crypto.coingeckoId] = {
          id: crypto.id,
          name: crypto.name,
          symbol: crypto.symbol,
        };
      }
    }
    return map;
  }
  private static async fetchCoinGeckoMarketData(ids: string[]) {
    if (ids.length === 0) return [];
    const { data } = await axios.get(
      "https://api.coingecko.com/api/v3/coins/markets",
      {
        params: { vs_currency: "usd", ids: ids.join(",") },
      }
    );
    return data;
  }

  private static async fetchCoinGeckoDetails(id: string) {
    const { data } = await axios.get(
      `https://api.coingecko.com/api/v3/coins/${id}`
    );
    return data;
  }

  private static async fetchBinanceTickerPrices(): Promise<
    Record<string, number>
  > {
    const { data } = await axios.get(
      "https://api.binance.com/api/v3/ticker/price"
    );
    const map: Record<string, number> = {};
    for (const item of data) {
      map[item.symbol.toUpperCase()] = parseFloat(item.price);
    }
    return map;
  }

  private static async fetchBinancePrice(
    symbol: string
  ): Promise<number | null> {
    try {
      const { data } = await axios.get(
        `https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`
      );
      return parseFloat(data.price);
    } catch {
      return null;
    }
  }
}

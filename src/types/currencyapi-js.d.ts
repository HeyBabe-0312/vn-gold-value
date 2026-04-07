declare module "@everapi/currencyapi-js" {
  export default class CurrencyAPI {
    constructor(apiKey?: string);
    latest(
      params?: Record<string, string>,
    ): Promise<Record<string, unknown>>;
  }
}

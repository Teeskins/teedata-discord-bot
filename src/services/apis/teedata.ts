import axios, { AxiosRequestConfig,AxiosResponse } from 'axios';

export type Response = Promise<any>;

class Teedata {
  private static readonly host: string = process.env.TEEDATA_HOST;

  private static async commonRequest(
    route: string,
    param: string,
    func: (url: string, config?: AxiosRequestConfig<any>) => Promise<AxiosResponse<any, any>>
  ): Response {
    try {
      const req = await func(
        this.host + route + param,
        {
          headers: {
            Accept: 'application/json',
          },
        },
      );

      if (req.status !== 200 || req.data.length === 0) {
        return null;
      }

      return req.data;
    } catch (error) {
      return null;
    }
  }

  static async userRole(token: string): Response {
    return await this.commonRequest(
      '/api/discord/',
      token,
      axios.get
    );
  }

  static async assetInfo(assetId: string): Response {
    return await this.commonRequest(
      '/api/asset/',
      assetId,
      axios.get
    );
  }

  static async assetRandom(category: string): Response {
    return await this.commonRequest(
      '/api/random/',
      category,
      axios.get
    );
  }

  static async assetSearch(name: string): Response {
    return await this.commonRequest(
      '/search/',
      name,
      axios.get
    );
  }

  static async assetUpload(): Response {

  }

  static async isAssetDuplicate(hash: string): Promise<boolean> {
    return await this.commonRequest(
      '/checkDuplicate/',
      hash,
      axios.get
    ) !== null;
  }
}

export default Teedata;

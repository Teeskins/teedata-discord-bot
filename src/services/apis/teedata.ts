import axios from 'axios';

export type Response = Promise<any>;

type UploadParams = {
  name: string;
  type: string;
  author: string;
  url: string;
};

type Params =
  | UploadParams
  | string
  | null;

class Teedata {
  private static readonly host: string = process.env.TEEDATA_HOST;

  private static async commonRequest(
    route: string,
    param: string,
    func: any,
    data: Params = null
  ): Response {
    try {
      const req = await func(
        this.host + route + param,
        data,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0'
          },
        }
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

  static async assetUpload(data: UploadParams): Response {
    return await this.commonRequest(
      '/api/storeAsset/discord',
      '',
      axios.post,
      data
    );
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

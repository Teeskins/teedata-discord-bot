import axios, { AxiosRequestConfig, AxiosResponse, ResponseType } from 'axios';

export type Response = Promise<any>;
export type BufferResponse = Promise<Uint8Array | null>

type RenderParams = {
  skin: string;
  eye: string;
};

type RenderColorParams = {
  skin: string;
  eye: string;
  bcolor: string;
  fcolor: string;
  mode: string;
};

type SceneRenderParams = {
  name: string;
  skin: string;
};

type Params = 
  | RenderParams
  | RenderColorParams
  | SceneRenderParams;

class TwUtils {
  private static readonly host: string = process.env.TW_UTILS_HOST + ':' + process.env.TW_UTILS_PORT;

  private static async commonRequest(
    route: string,
    data: Params,
    func: (url: string, config?: AxiosRequestConfig<any>) => Promise<AxiosResponse<any, any>>,
    responseType: ResponseType = 'json'
  ): Response {
    try {
      const req = await func(
        this.host + route,
        {
          responseType,
          headers: {
            Accept: 'application/json'
          },

          data
        },
      );

      if (req.status !== 200) {
        return null;
      }

      return req.data;
    } catch (error) {
      return null;
    }
  }

  static async renderSkin(data: RenderParams): BufferResponse {
    return await this.commonRequest(
      '/render',
      data,
      axios.get,
      'arraybuffer'
    );
  }

  static async renderSkinColor(data: RenderColorParams): BufferResponse {
    return await this.commonRequest(
      '/renderColor',
      data,
      axios.get,
      'arraybuffer'
    );
  }

  static async sceneList(): Response {
    return await this.commonRequest(
      '/sceneList',
      null,
      axios.get,
      'json'
    );
  }

  static async sceneRender(data: SceneRenderParams): BufferResponse {
    return await this.commonRequest(
      '/scene',
      data,
      axios.get,
      'arraybuffer'
    );
  }
}

export default TwUtils;

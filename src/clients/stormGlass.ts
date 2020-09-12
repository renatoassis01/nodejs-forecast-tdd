import { AxiosStatic } from 'axios';
import config, { IConfig } from 'config';
import { InternalError } from '../utils/error/internal-error';
import { IForecastPoint } from './interfaces/IForecastPoint';
import { IStormGlassForecastResponse } from './interfaces/IStormGlassForecastResponse';
import { IStormGlassPointResponse } from './interfaces/IStormGlassPointResponse';

const stormGlassResourceConf: IConfig = config.get('App.resources.StormGlass')

export class ClientRequestError extends InternalError {

  constructor(message: string) {
    const internalMessage = 'Unexpected error when trying to communicate to StormGlass'
    super(`${internalMessage}: ${message}`)
  }
}

export class StormGlassResponderError extends InternalError {

  constructor(message: string) {
    const internalMessage = 'Unexpected error when trying to communicate to StormGlass'
    super(`${internalMessage}: ${message}`)
  }
}



export class StormGlass {
  readonly stormGlassAPIParams =
    'swellDirection,swellHeight,swellPeriod,waveDirection,waveHeight,windDirection';

  readonly stormGlassAPISource = 'noaa';

  constructor(protected request: AxiosStatic) { }

  public async fetchPoints(lat: number, lng: number): Promise<{}> {
    try {
      console.log(stormGlassResourceConf)
      const response = await this.request.get<IStormGlassForecastResponse>(`${stormGlassResourceConf.get('apiUrl')}/weather/point?params=${this.stormGlassAPIParams}&source=${this.stormGlassAPISource}&end=1592113802&lat=${lat}&lng=${lng}`,
        {
          headers: {
            'Authorization': stormGlassResourceConf.get('apiToken')
          }
        });
      return this.normalizeResponse(response.data)
    } catch (error) {
      if (!!error.response && !!error.response.status) {

        throw new StormGlassResponderError(`Error ${JSON.stringify(error.data)} Code: ${error.response.status}`)
      }
      throw new ClientRequestError(error.message)
    }
  }
  private normalizeResponse(
    points: IStormGlassForecastResponse
  ): IForecastPoint[] {
    return points.hours.filter(this.isValidPoint.bind(this)).map((point) => ({
      swellDirection: point.swellDirection[this.stormGlassAPISource],
      swellHeight: point.swellHeight[this.stormGlassAPISource],
      swellPeriod: point.swellPeriod[this.stormGlassAPISource],
      time: point.time,
      waveDirection: point.waveDirection[this.stormGlassAPISource],
      waveHeight: point.waveHeight[this.stormGlassAPISource],
      windDirection: point.windDirection[this.stormGlassAPISource],
      windSpeed: point.windSpeed[this.stormGlassAPISource],
    }));
  }
  private isValidPoint(point: Partial<IStormGlassPointResponse>): boolean {
    return !!(

      point.time &&
      point.swellDirection?.[this.stormGlassAPISource] &&
      point.swellHeight?.[this.stormGlassAPISource] &&
      point.swellPeriod?.[this.stormGlassAPISource] &&
      point.waveDirection?.[this.stormGlassAPISource] &&
      point.swellHeight?.[this.stormGlassAPISource] &&
      point.waveDirection?.[this.stormGlassAPISource] &&
      point.windSpeed?.[this.stormGlassAPISource])
  }
}

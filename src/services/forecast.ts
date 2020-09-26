import { StormGlass } from '@src/clients/stormGlass';
import { IForecastPoint } from '../clients/interfaces/IForecastPoint';

export enum BeachPosition {
    S = 'S',
    E = 'E',
    W = 'W',
    N = 'N'
}
export interface Beach {
    name: string,
    position: BeachPosition,
    lat: number,
    lng: number,
    user: string
}

export interface TimeForecast {
    time: string
    forecast: BeachForcast[]
}

export interface BeachForcast extends Omit<Beach, 'user'>, IForecastPoint { }

export class Forecast {
    constructor(protected stormGlass = new StormGlass()) {

    }

    public async processForecastForBeaches(beaches: Beach[]): Promise<TimeForecast[]> {
        const pointsWithCorrectSources: BeachForcast[] = []
        for (const beach of beaches) {
            const points = await this.stormGlass.fetchPoints(beach.lat, beach.lng)
            const enrichedBeachData = points.map(e => ({
                ...{
                    lat: beach.lat,
                    lng: beach.lng,
                    name: beach.name,
                    position: beach.position,
                    rating: 1
                },
                ...e
            }))
            pointsWithCorrectSources.push(...enrichedBeachData)
        }
        return this.mapForecastByTime(pointsWithCorrectSources)
    }

    private mapForecastByTime(forecast: BeachForcast[]): TimeForecast[] {
        const forecastByTime: TimeForecast[] = []
        for (const point of forecast) {
            const timePoint = forecastByTime.find(f => f.time == point.time)
            if (timePoint)
                timePoint.forecast.push(point)
            else {
                forecastByTime.push({
                    time: point.time,
                    forecast: [point]
                })
            }
        }
        return forecastByTime
    }
}
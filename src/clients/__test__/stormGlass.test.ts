import { StormGlass } from '@src/clients/stormGlass';
import stormGlassWeather3HoursNormalizedFixture from '@test/fixtures/stormglass_normalized_response_3_hours.json';
import stormGlassWeather3HoursFixture from '@test/fixtures/stormglass_weather_3_hours.json';
import axios from 'axios';

jest.mock('axios');

describe('StormGlass client', () => {
    //const mockedAxios = axios as jest.Mocked<typeof axios>
    it('should return the normalized forecast from the stormGlass service', async () => {
        axios.get = jest.fn().mockReturnValue({ data: stormGlassWeather3HoursFixture });
        const lat = -33.792726;
        const lng = 151.289824;
        const stormGlass = new StormGlass(axios);
        const response = await stormGlass.fetchPoints(lat, lng);
        expect(response).toEqual(stormGlassWeather3HoursNormalizedFixture);
    });

    it('should exclude incomplete data points', async () => {
        const lat = -33.792726;
        const lng = 151.289824;
        const incompleteResponse = {
            hours: [
                {
                    windDirection: {
                        noaa: 300,
                    },
                    time: '2020-04-26T00:00:00+00:00',
                },
            ]
        };
        axios.get = jest.fn().mockReturnValue({ data: incompleteResponse })
        const stormGlass = new StormGlass(axios);
        const response = await stormGlass.fetchPoints(lat, lng);
        expect(response).toEqual([]);

    })
    it('should get a generic error from stormGlass service when the request fail before reaching serive', async () => {
        const lat = -33.792726;
        const lng = 151.289824;

        axios.get = jest.fn().mockRejectedValue({ message: 'Network error' })
        const stormGlass = new StormGlass(axios);
        await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow('Unexpected error when trying to communicate to StormGlass: Network error')
    })

    it('should get an StormGlassReponseError when the StormGlass service return api rate limit', async () => {
        const lat = -33.792726;
        const lng = 151.289824;
        axios.get = jest.fn().mockRejectedValue({ response: { status: 429 }, data: { errors: ['Rate Limit reached'] } })
        const stormGlass = new StormGlass(axios);
        await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow('Unexpected error when trying to communicate to StormGlass: Error {\"errors\":[\"Rate Limit reached\"]} Code: 429')
    })
});

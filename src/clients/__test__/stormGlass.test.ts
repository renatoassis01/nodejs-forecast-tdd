import { StormGlass } from '@src/clients/stormGlass';
import * as HTTPUtils from '@src/utils/request';
import stormGlassWeather3HoursNormalizedFixture from '@test/fixtures/stormglass_normalized_response_3_hours.json';
import stormGlassWeather3HoursFixture from '@test/fixtures/stormglass_weather_3_hours.json';

jest.mock('@src/utils/request');
//const request = new HTTPUtils.Request()
describe('StormGlass client', () => {
    const MockedClass = HTTPUtils.Request as jest.Mocked<typeof HTTPUtils.Request>
    const request = new HTTPUtils.Request() as jest.Mocked<HTTPUtils.Request>
    it('should return the normalized forecast from the stormGlass service', async () => {
        request.get = jest.fn().mockReturnValue({ data: stormGlassWeather3HoursFixture });
        const lat = -33.792726;
        const lng = 151.289824;
        const stormGlass = new StormGlass(request);
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
        request.get = jest.fn().mockReturnValue({ data: incompleteResponse })
        const stormGlass = new StormGlass(request);
        const response = await stormGlass.fetchPoints(lat, lng);
        expect(response).toEqual([]);

    })
    it('should get a generic error from stormGlass service when the request fail before reaching serive', async () => {
        const lat = -33.792726;
        const lng = 151.289824;

        request.get = jest.fn().mockRejectedValue({ message: 'Network error' })
        const stormGlass = new StormGlass(request);
        await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow('Unexpected error when trying to communicate to StormGlass: Network error')
    })

    it('should get an StormGlassReponseError when the StormGlass service return api rate limit', async () => {
        const lat = -33.792726;
        const lng = 151.289824;
        request.get = jest.fn().mockRejectedValue({ response: { status: 429 }, data: { errors: ['Rate Limit reached'] } })
        MockedClass.isRequestError.mockReturnValue(true)
        const stormGlass = new StormGlass(request);
        await expect(stormGlass.fetchPoints(lat, lng)).rejects.toThrow('Unexpected error when trying to communicate to StormGlass: Error {\"errors\":[\"Rate Limit reached\"]} Code: 429')
    })
});

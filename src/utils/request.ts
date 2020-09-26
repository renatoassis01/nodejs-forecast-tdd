import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface RequestConfig extends AxiosRequestConfig { }

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Response<T = any> extends AxiosResponse<T> { }

export class Request {
    constructor(private request = axios) {

    }

    public get<T>(url: string, config: AxiosRequestConfig = {}): Promise<Response<T>> {
        return this.request.get<T, Response<T>>(url, config)
    }

    public static isRequestError(error: AxiosError): boolean {
        console.log(error)
        return !!(error.response && error.response.status)
    }
}
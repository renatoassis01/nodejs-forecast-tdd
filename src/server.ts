import { ForecastController } from '@controllers/forecast';
import { Server } from '@overnightjs/core';
import bodyParser from 'body-parser';
import { Application } from 'express';
import './utils/module-alias';

export class SetupServer extends Server {
  constructor(private port: number = 3000) {
    super();
    this.init();
  }

  public init(): void {
    this.setupExpress();
    this.setupControllers();
  }

  public getApp(): Application {
    return this.app;
  }

  private setupExpress(): void {
    this.app.use(bodyParser.json());
  }

  private setupControllers(): void {
    const forecastController = new ForecastController();
    this.addControllers(forecastController);
  }
}
//https://www.youtube.com/watch?v=-KtwIhvj--g
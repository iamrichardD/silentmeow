// src/features/web-server/WebServerModule.ts
import { WebServerService } from './services/WebServerService';
import { Logger } from '../logging/Logger';
import { ConfigurationManager } from '../../config/ConfigurationManagerInterface';

export class WebServerModule {
  private webServerService: WebServerService;

  constructor(
    logger: Logger,
    config: ConfigurationManager
  ) {
    this.webServerService = new WebServerService(logger, config);
  }

  getWebServerService(): WebServerService {
    return this.webServerService;
  }
}

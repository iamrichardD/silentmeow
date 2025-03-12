// src/features/web-server/WebServerModule.ts

import { WebServerService } from './services/WebServerService.js';
import { Logger } from '@logging/Logger.js';
import { ConfigurationManager } from '@config/ConfigurationManagerInterface.js';

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

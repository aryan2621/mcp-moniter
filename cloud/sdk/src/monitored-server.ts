import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ServerOptions } from "@modelcontextprotocol/sdk/server/index.js";
import type {
  Implementation,
  ToolAnnotations,
} from "@modelcontextprotocol/sdk/types.js";
import type { Transport as McpTransport } from "@modelcontextprotocol/sdk/shared/transport.js";
import type {
  AnySchema,
  ZodRawShapeCompat,
} from "@modelcontextprotocol/sdk/server/zod-compat.js";
import { MetricsCollector } from "./metrics-collector.js";
import { EventWrapper } from "./core/event-wrapper.js";
import { HttpSender } from "./transport/http-sender.js";
import { validateMonitorOptions } from "./config/validator.js";
import { ConsoleLogger } from "./logger/console-logger.js";
import { LogLevel } from "./logger/logger.js";
import type { Logger } from "./logger/logger.js";
import type { MonitorOptions } from "./types.js";

export class MonitoredMcpServer {
  private server: McpServer;
  private collector: MetricsCollector;
  private eventWrapper: EventWrapper;
  private logger: Logger;

  constructor(
    serverInfo: Implementation,
    monitorOptions: MonitorOptions,
    options?: ServerOptions
  ) {
    const config = validateMonitorOptions(monitorOptions);

    const logLevelMap: Record<string, LogLevel> = {
      debug: LogLevel.DEBUG,
      info: LogLevel.INFO,
      warn: LogLevel.WARN,
      error: LogLevel.ERROR,
      silent: LogLevel.SILENT,
    };

    this.logger = new ConsoleLogger(
      logLevelMap[config.logLevel],
      "MCP-Monitor"
    );

    this.logger.info("Initializing MonitoredMcpServer", {
      serverName: serverInfo.name,
      serverVersion: serverInfo.version,
      batchSize: config.batchSize,
      hasMetricsUrl: !!config.metricsServerUrl,
    });

    const transport = config.metricsServerUrl
      ? new HttpSender(
        config.metricsServerUrl,
        config.apiKey,
        config.timeout,
        config.retryAttempts,
        this.logger
      )
      : undefined;

    this.server = new McpServer(serverInfo, options);
    this.collector = new MetricsCollector(
      config.batchSize,
      this.logger,
      transport
    );
    this.eventWrapper = new EventWrapper();
  }

  async connect(transport: McpTransport): Promise<void> {
    this.logger.info("Connecting to MCP transport");
    return await this.server.connect(transport);
  }

  async close(): Promise<void> {
    this.logger.info("Closing MonitoredMcpServer");
    await this.collector.flush();
    await this.server.close();
  }

  registerTool<
    OutputArgs extends ZodRawShapeCompat | AnySchema,
    InputArgs extends undefined | ZodRawShapeCompat | AnySchema = undefined,
  >(
    name: string,
    config: {
      title?: string;
      description?: string;
      inputSchema?: InputArgs;
      outputSchema?: OutputArgs;
      annotations?: ToolAnnotations;
      _meta?: Record<string, unknown>;
    },
    cb: ToolCallback<InputArgs>
  ) {
    this.logger.debug("Registering tool", { toolName: name });

    const wrappedCallback = this.eventWrapper.wrapCallback(name, cb, (event) =>
      this.collector.recordEvent(event)
    ) as ToolCallback<InputArgs>;

    return this.server.registerTool(name, config, wrappedCallback);
  }

  get mcpServer(): McpServer {
    return this.server;
  }

  getCollector(): MetricsCollector {
    return this.collector;
  }

  async flushMetrics(): Promise<void> {
    await this.collector.flush();
  }

  getPendingMetrics(): any[] {
    return this.collector.getPendingEvents();
  }
}

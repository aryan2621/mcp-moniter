import { Logger } from "./logger.js";

const logger = new Logger("Shutdown");

export class ShutdownManager {
    private isShuttingDown = false;
    private shutdownHandlers: Array<() => Promise<void>> = [];

    register(handler: () => Promise<void>): void {
        this.shutdownHandlers.push(handler);
    }

    async shutdown(signal: string): Promise<void> {
        if (this.isShuttingDown) {
            logger.warn("Shutdown already in progress", { signal });
            return;
        }

        this.isShuttingDown = true;
        logger.info("Initiating graceful shutdown", { signal });

        try {
            await Promise.all(
                this.shutdownHandlers.map((handler, index) =>
                    handler().catch((error) => {
                        logger.error(
                            `Shutdown handler ${index} failed`,
                            error as Error
                        );
                    })
                )
            );

            logger.info("Graceful shutdown completed");
            process.exit(0);
        } catch (error) {
            logger.error("Error during shutdown", error as Error);
            process.exit(1);
        }
    }

    setupSignalHandlers(): void {
        const signals: NodeJS.Signals[] = ["SIGTERM", "SIGINT"];

        for (const signal of signals) {
            process.once(signal, () => {
                this.shutdown(signal);
            });
        }
    }
}

export const shutdownManager = new ShutdownManager();

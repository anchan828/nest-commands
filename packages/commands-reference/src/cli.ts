#! /usr/bin/env node
import { NestFactory } from "@nestjs/core";
import { resolve } from "path";
import "reflect-metadata";
import { isMainThread, parentPort, Worker } from "worker_threads";
import yargs from "yargs";
import { CommandReferenceModuleOptions } from "./reference.interface";
import { CommandReferenceModule } from "./reference.module";
import { CommandReferenceService } from "./reference.service";

if (isMainThread) {
  function getLocales(locale?: string | string[]): string[] {
    if (!locale) {
      return [];
    }
    if (Array.isArray(locale)) {
      return locale;
    }

    return [locale];
  }

  yargs
    .option("locale", {
      description: "Set output locale if you want to build localized reference.",
      type: "string",
    })
    .option("output", {
      description: "The output directory. default ./docs",
      type: "string",
    })
    .option("index-name", {
      description: "Set index filename. default index.",
      type: "string",
    })
    .command(
      "$0 [--locale, -l] [--output, -o] [--index-name] <module-file>",
      "build cli reference",
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      () => {},
      async (args: { moduleFile: string; locale?: string | string[]; output?: string; indexName?: string }) => {
        for (const locale of getLocales(args.locale)) {
          const worker = new Worker(__filename);
          worker.postMessage({
            indexName: args.indexName,
            locale: locale,
            module: args.moduleFile,
            output: args.output ? resolve(args.output) : undefined,
          });
        }
      },
    );

  yargs.argv;
} else if (parentPort) {
  parentPort.once("message", async (options: CommandReferenceModuleOptions): Promise<void> => {
    const modules = await import(resolve(options.module));
    for (const key of Object.keys(modules)) {
      const metadata = Reflect.getMetadata("imports", modules[key]);

      if (metadata) {
        options.module = modules[key];
        const app = await NestFactory.createApplicationContext(CommandReferenceModule.register(options), {
          logger: false,
        });
        await app.init();
        app.get(CommandReferenceService).exec();

        await app.close();
        break;
      }
    }
  });
}

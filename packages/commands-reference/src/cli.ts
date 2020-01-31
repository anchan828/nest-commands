#! /usr/bin/env node
import { NestFactory } from "@nestjs/core";
import { resolve } from "path";
import "reflect-metadata";
import yargs from "yargs";
import { CommandReferenceModuleOptions } from "./reference.interface";
import { CommandReferenceModule } from "./reference.module";
import { CommandReferenceService } from "./reference.service";

async function build(options: CommandReferenceModuleOptions): Promise<void> {
  const app = await NestFactory.createApplicationContext(CommandReferenceModule.register(options), {
    logger: false,
  });
  app.get(CommandReferenceService).exec();

  await app.close();
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
      const modules = await import(resolve(args.moduleFile));

      for (const key of Object.keys(modules)) {
        const metadata = Reflect.getMetadata("imports", modules[key]);
        if (metadata) {
          if (Array.isArray(args.locale)) {
            const enLocales = args.locale.filter(l => l.startsWith("en"));
            const otherLocales = args.locale.filter(l => !l.startsWith("en"));

            for (const locale of [...enLocales, ...otherLocales]) {
              await build({
                indexName: args.indexName,
                locale: locale,
                module: modules[key],
                output: args.output ? resolve(args.output) : undefined,
              });
            }
          } else {
            await build({
              indexName: args.indexName,
              locale: args.locale,
              module: modules[key],
              output: args.output ? resolve(args.output) : undefined,
            });
          }

          break;
        }
      }
    },
  );

yargs.argv;

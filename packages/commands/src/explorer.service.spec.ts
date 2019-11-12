import { MetadataScanner } from "@nestjs/core/metadata-scanner";
import { Test } from "@nestjs/testing";
import { Command, Commander, CommanderOption, CommandOption, CommandPositional } from "./command.decorator";
import { ExplorerService } from "./explorer.service";

describe("ExplorerService", () => {
  it("should be defined", () => {
    expect(ExplorerService).toBeDefined();
  });

  describe("explore", () => {
    it("should be defined", async () => {
      const app = await Test.createTestingModule({
        providers: [MetadataScanner, ExplorerService],
      }).compile();

      const service = app.get<ExplorerService>(ExplorerService);
      expect(service.explore).toBeDefined();
    });

    describe("should run explore", () => {
      it("no commander", async () => {
        const app = await Test.createTestingModule({
          providers: [MetadataScanner, ExplorerService],
        }).compile();

        const service = app.get<ExplorerService>(ExplorerService);
        expect(service.explore()).toStrictEqual([]);
      });

      it("1 commander", async () => {
        @Commander()
        class TestCommander {
          @Command({ name: "basic" })
          public basic(): void {
            console.log("hello!");
          }
        }
        const app = await Test.createTestingModule({
          providers: [MetadataScanner, ExplorerService, TestCommander],
        }).compile();

        const service = app.get<ExplorerService>(ExplorerService);
        expect(service.explore()).toStrictEqual([
          {
            commands: [
              {
                instance: expect.any(Function),
                name: "basic",
                options: [],
                positionals: [],
              },
            ],
            instance: app.get<TestCommander>(TestCommander),
            options: [],
          },
        ]);
      });

      it("1 commander with 1 command option", async () => {
        @Commander()
        class TestCommander {
          @Command({ name: "basic" })
          public basic(
            @CommandOption({
              alias: "v",
              default: false,
              description: "Run with verbose logging",
              name: "verbose",
              type: "boolean",
            })
            verbose: boolean,
          ): void {
            console.log({ verbose });
          }
        }
        const app = await Test.createTestingModule({
          providers: [MetadataScanner, ExplorerService, TestCommander],
        }).compile();

        const service = app.get<ExplorerService>(ExplorerService);
        expect(service.explore()).toStrictEqual([
          {
            commands: [
              {
                instance: expect.any(Function),
                name: "basic",
                options: [
                  {
                    options: {
                      alias: "v",
                      default: false,
                      description: "Run with verbose logging",
                      name: "verbose",
                      type: "boolean",
                    },
                    parameterIndex: 0,
                  },
                ],
                positionals: [],
              },
            ],
            instance: app.get<TestCommander>(TestCommander),
            options: [],
          },
        ]);
      });

      it("1 commander with 1 positional", async () => {
        @Commander()
        class TestCommander {
          @Command({ name: "basic" })
          public basic(
            @CommandPositional({
              default: 5000,
              describe: "port to bind on",
              name: "port",
            })
            port: number,
          ): void {
            console.log({ port });
          }
        }
        const app = await Test.createTestingModule({
          providers: [MetadataScanner, ExplorerService, TestCommander],
        }).compile();

        const service = app.get<ExplorerService>(ExplorerService);
        expect(service.explore()).toStrictEqual([
          {
            commands: [
              {
                instance: expect.any(Function),
                name: "basic",
                options: [],
                positionals: [
                  {
                    options: {
                      default: 5000,
                      describe: "port to bind on",
                      name: "port",
                    },
                    parameterIndex: 0,
                  },
                ],
              },
            ],
            instance: app.get<TestCommander>(TestCommander),
            options: [],
          },
        ]);
      });

      it("1 commander with 2 options and 2 positionals", async () => {
        @Commander()
        class TestCommander {
          @Command({ name: "basic" })
          public basic(
            @CommandPositional({
              default: 5000,
              describe: "port to bind on",
              name: "port1",
            })
            port1: number,
            @CommandOption({
              alias: "v1",
              default: false,
              description: "Run with verbose logging",
              name: "verbose1",
              type: "boolean",
            })
            verbose1: boolean,
            @CommandPositional({
              default: 5000,
              describe: "port to bind on",
              name: "port2",
            })
            port2: number,

            @CommandOption({
              alias: "v2",
              default: false,
              description: "Run with verbose logging",
              name: "verbose2",
              type: "boolean",
            })
            verbose2: boolean,
          ): void {
            console.log({ port1, port2, verbose1, verbose2 });
          }
        }
        const app = await Test.createTestingModule({
          providers: [MetadataScanner, ExplorerService, TestCommander],
        }).compile();

        const service = app.get<ExplorerService>(ExplorerService);
        expect(service.explore()).toStrictEqual([
          {
            commands: [
              {
                instance: expect.any(Function),
                name: "basic",
                options: [
                  {
                    options: {
                      alias: "v1",
                      default: false,
                      description: "Run with verbose logging",
                      name: "verbose1",
                      type: "boolean",
                    },
                    parameterIndex: 1,
                  },
                  {
                    options: {
                      alias: "v2",
                      default: false,
                      description: "Run with verbose logging",
                      name: "verbose2",
                      type: "boolean",
                    },
                    parameterIndex: 3,
                  },
                ],
                positionals: [
                  {
                    options: {
                      default: 5000,
                      describe: "port to bind on",
                      name: "port1",
                    },
                    parameterIndex: 0,
                  },
                  {
                    options: {
                      default: 5000,
                      describe: "port to bind on",
                      name: "port2",
                    },
                    parameterIndex: 2,
                  },
                ],
              },
            ],
            instance: app.get<TestCommander>(TestCommander),
            options: [],
          },
        ]);
      });

      it("1 commander with 2 commander options", async () => {
        @Commander()
        class TestCommander {
          @Command({ name: "basic" })
          public basic(): void {
            console.log("hello!");
          }

          @CommanderOption({ demandOption: true, name: "token1" })
          public token1!: string;

          @CommanderOption({ demandOption: true, name: "token2" })
          public token2!: string;
        }
        const app = await Test.createTestingModule({
          providers: [MetadataScanner, ExplorerService, TestCommander],
        }).compile();

        const service = app.get<ExplorerService>(ExplorerService);
        expect(service.explore()).toStrictEqual([
          {
            commands: [
              {
                instance: expect.any(Function),
                name: "basic",
                options: [],
                positionals: [],
              },
            ],
            instance: app.get<TestCommander>(TestCommander),
            options: [
              {
                key: "token1",
                options: {
                  demandOption: true,
                  name: "token1",
                },
              },
              {
                key: "token2",
                options: {
                  demandOption: true,
                  name: "token2",
                },
              },
            ],
          },
        ]);
      });

      it("2 commanders", async () => {
        @Commander({ name: "test1" })
        class Test1Commander {
          @Command({ name: "basic" })
          public basic(): void {
            console.log("hello!");
          }
        }

        @Commander({ name: "test2" })
        class Test2Commander {
          @Command({ name: "basic" })
          public basic(): void {
            console.log("hello!");
          }
        }
        const app = await Test.createTestingModule({
          providers: [MetadataScanner, ExplorerService, Test1Commander, Test2Commander],
        }).compile();

        const service = app.get<ExplorerService>(ExplorerService);
        expect(service.explore()).toStrictEqual([
          {
            commands: [
              {
                instance: expect.any(Function),
                name: "basic",
                options: [],
                positionals: [],
              },
            ],
            instance: app.get<Test1Commander>(Test1Commander),
            name: "test1",
            options: [],
          },
          {
            commands: [
              {
                instance: expect.any(Function),
                name: "basic",
                options: [],
                positionals: [],
              },
            ],
            instance: app.get<Test2Commander>(Test2Commander),
            name: "test2",
            options: [],
          },
        ]);
      });

      it("merged 2 commanders", async () => {
        @Commander()
        class Test1Commander {
          @Command({ name: "basic1" })
          public basic(): void {
            console.log("hello!");
          }
        }

        @Commander()
        class Test2Commander {
          @Command({ name: "basic2" })
          public basic(): void {
            console.log("hello!");
          }
        }
        const app = await Test.createTestingModule({
          providers: [MetadataScanner, ExplorerService, Test1Commander, Test2Commander],
        }).compile();

        const service = app.get<ExplorerService>(ExplorerService);
        expect(service.explore()).toStrictEqual([
          {
            commands: [
              {
                instance: expect.any(Function),
                name: "basic1",
                options: [],
                positionals: [],
              },
              {
                instance: expect.any(Function),
                name: "basic2",
                options: [],
                positionals: [],
              },
            ],
            instance: app.get<Test1Commander>(Test1Commander),
            options: [],
          },
        ]);
      });
    });
  });
});

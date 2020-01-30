import { ParseIntPipe, PipeTransform } from "@nestjs/common";
import { DiscoveryService } from "@nestjs/core";
import { Commander as CommanderInterface } from "./command.interface";
import { CommandService } from "./command.service";
import yargs = require("yargs");

describe("CommandService", () => {
  it("should be defined", () => {
    expect(CommandService).toBeDefined();
  });

  describe("isNestedCommand", () => {
    const service = new CommandService({}, {} as DiscoveryService, { localizeDescriptions: () => ({}) } as any);
    it("should be defined", () => {
      expect(service["isNestedCommand"]).toBeDefined();
    });

    it("should return false", () => {
      expect(service["isNestedCommand"]({} as CommanderInterface)).toBeFalsy();
    });

    it("should return true", () => {
      expect(service["isNestedCommand"]({ name: "name" } as CommanderInterface)).toBeTruthy();
    });
  });

  describe("exec", () => {
    it("should be defined", () => {
      expect(
        new CommandService({}, {} as DiscoveryService, { localizeDescriptions: () => ({}) } as any).exec,
      ).toBeDefined();
    });

    it("should return void 0 if not have commanders", () => {
      expect(
        new CommandService({}, {} as DiscoveryService, { localizeDescriptions: () => ({}) } as any).exec(),
      ).resolves.toBeUndefined();
    });

    it("should return undefined", () => {
      const service = new CommandService({}, {} as DiscoveryService, { localizeDescriptions: () => ({}) } as any);
      service.commanders.push({} as any);
      service["parser"] = jest.fn().mockResolvedValue(yargs);
      expect(service.exec()).resolves.toBeUndefined();
    });
  });

  describe("parser", () => {
    async function parse(service: CommandService, args: string[]): Promise<string> {
      return new Promise<string>(async (resolve, rejects) => {
        (await service["parser"]()).parse(args, (err: any, argv: any, output: any) => {
          if (err) {
            return rejects(err);
          }
          resolve(output);
        });
      });
    }

    it("should be defined", () => {
      expect(
        new CommandService({}, {} as DiscoveryService, { localizeDescriptions: () => ({}) } as any)["parser"],
      ).toBeDefined();
    });

    it("should set scriptName", async () => {
      const service = new CommandService(
        { scriptName: "test" },
        {} as DiscoveryService,
        { localizeDescriptions: () => ({}) } as any,
      );
      await expect(parse(service, ["--help"])).resolves.toEqual(expect.any(String));
    });

    it("should set usage", async () => {
      const service = new CommandService(
        { usage: "test" },
        {} as DiscoveryService,
        { localizeDescriptions: () => ({}) } as any,
      );
      await expect(parse(service, ["--help"])).resolves.toEqual(expect.stringMatching(/^test$/gm));
    });

    it("should throw error if commander doesn't have command", async () => {
      const service = new CommandService({}, {} as DiscoveryService, { localizeDescriptions: () => ({}) } as any);
      const commander = { commands: [], instance: {} as any, options: [] } as CommanderInterface;
      service.commanders.push(commander);
      await expect(parse(service, [])).rejects.toThrowError();
    });

    it("should set command", async () => {
      const mock = jest.fn();
      const service = new CommandService({}, {} as DiscoveryService, { localizeDescriptions: () => ({}) } as any);
      const commander = {
        commands: [
          {
            instance: (() => {
              mock();
            }) as any,
            name: "test",
            options: [],
            positionals: [],
          },
        ],
        instance: {} as any,
        options: [],
      } as CommanderInterface;
      service.commanders.push(commander);
      await parse(service, ["test"]);
      await expect(mock).toHaveBeenCalled();
    });

    it("should set command positionals", async () => {
      const mock = jest.fn();
      const service = new CommandService(
        { locale: "en_us" },
        {} as DiscoveryService,
        { localizeDescriptions: () => ({}) } as any,
      );
      const commander = {
        commands: [
          {
            instance: ((pos1: number, pos2: number, files: string[]) => {
              mock({ files, pos1, pos2 });
            }) as any,
            name: "test",
            options: [],
            positionals: [
              {
                options: { demandPositional: true, name: "pos1", type: "number" },
                parameterIndex: 0,
                pipes: [],
              },
              {
                options: { default: 123, name: "pos2", type: "number" },
                parameterIndex: 1,
                pipes: [],
              },

              {
                options: { name: "files.." },
                parameterIndex: 2,
                pipes: [],
              },
            ],
          },
        ],
        instance: {} as any,
        options: [],
      } as CommanderInterface;
      service.commanders.push(commander);
      await parse(service, ["test", "111", "222", "file1", "file2", "file3"]);
      await expect(mock).toHaveBeenCalledWith({ files: ["file1", "file2", "file3"], pos1: 111, pos2: 222 });
    });

    it("should set command options", async () => {
      const mock = jest.fn();
      const service = new CommandService(
        { locale: "en_us" },
        {} as DiscoveryService,
        { localizeDescriptions: () => ({}) } as any,
      );
      const commander = {
        commands: [
          {
            instance: ((option1: number, option2: number) => {
              mock({ option1, option2 });
            }) as any,
            name: "test",
            options: [
              {
                options: { name: "option1", required: true, type: "number" },
                parameterIndex: 0,
                pipes: [],
              },
              {
                options: { default: 123, name: "option2", type: "number" },
                parameterIndex: 1,
                pipes: [],
              },
            ],
            positionals: [],
          },
        ],
        instance: {} as any,
        options: [],
      } as CommanderInterface;
      service.commanders.push(commander);
      await parse(service, ["test", "--option1", "111"]);
      await expect(mock).toHaveBeenCalledWith({ option1: 111, option2: 123 });
    });

    it("should set nested command", async () => {
      const mock = jest.fn();
      const service = new CommandService({}, {} as DiscoveryService, { localizeDescriptions: () => ({}) } as any);
      const commander = {
        commands: [
          {
            instance: (() => {
              mock();
            }) as any,
            name: "test",
            options: [],
            positionals: [],
          },
        ],
        instance: {} as any,
        name: "nested",
        options: [],
      } as CommanderInterface;
      service.commanders.push(commander);
      await parse(service, ["nested", "test"]);
      await expect(mock).toHaveBeenCalled();
    });

    it("should merge commanders", async () => {
      const service = new CommandService(
        { locale: "en_us", scriptName: "test" },
        {} as DiscoveryService,
        { localizeDescriptions: () => ({}) } as any,
      );
      service.commanders.push({
        commands: [
          {
            instance: jest.fn(),
            name: "test",
            options: [],
            positionals: [],
          },
        ],
        instance: jest.fn(),
        options: [],
      } as CommanderInterface);
      service.commanders.push({
        commands: [
          {
            instance: jest.fn(),
            name: "test2",
            options: [],
            positionals: [],
          },
        ],
        instance: jest.fn(),
        options: [],
      } as CommanderInterface);

      /**
       *  test <command>
       *
       *  Commands:
       *    test test
       *    test test2
       *
       *  Options:
       *    --help     Show help                                                 [boolean]
       *    --version  Show version number                                       [boolean]
       */
      const output = await parse(service, ["--help"]);
      expect(output).toEqual(expect.stringContaining("test test"));
      expect(output).toEqual(expect.stringContaining("test test2"));
    });

    it("should set commander option", async () => {
      const commanderMock = {} as any;
      const service = new CommandService(
        { locale: "en_us" },
        {} as DiscoveryService,
        { localizeDescriptions: () => ({}) } as any,
      );
      const commander = {
        commands: [
          {
            instance: jest.fn(),
            name: "test",
            options: [],
            positionals: [],
          },
        ],
        instance: commanderMock,
        options: [{ instance: commanderMock, key: "token", options: { demandOption: true, name: "token" }, pipes: [] }],
      } as CommanderInterface;
      service.commanders.push(commander);
      /**
       * test <command>
       *
       * Commands:
       *   test test
       *
       * Options:
       *   --help     Show help                                                 [boolean]
       *   --version  Show version number                                       [boolean]
       *   --token
       */
      const output = await parse(service, ["--help"]);
      expect(output).toEqual(expect.stringContaining("--token"));

      await parse(service, ["test", "--token", "token"]);
      expect(commanderMock).toStrictEqual({ token: "token" });
    });

    it("should used pipes", async () => {
      const commanderMock = {} as any;

      class TestPipe1 implements PipeTransform<string, string> {
        transform(): string {
          return "TestPipe1";
        }
      }

      class TestPipe2 implements PipeTransform<string, string> {
        transform(): string {
          return "TestPipe2";
        }
      }

      const service = new CommandService(
        { locale: "en_us" },
        {
          getProviders: jest.fn().mockReturnValue([{ instance: new TestPipe2(), metatype: TestPipe2 }]),
        } as any,
        { localizeDescriptions: () => ({}) } as any,
      );

      const commander = {
        commands: [
          {
            instance: jest.fn(),
            name: "test",
            options: [],
            positionals: [],
          },
        ],
        instance: commanderMock,
        options: [
          {
            instance: commanderMock,
            key: "token1",
            options: { demandOption: true, name: "token1" },
            pipes: [new TestPipe1()],
          },
          {
            instance: commanderMock,
            key: "token2",
            options: { name: "token2" },
            pipes: [TestPipe2],
          },
          {
            instance: commanderMock,
            key: "token3",
            options: { demandOption: true, name: "token3", type: "number" },
            // ERROR: Promise not supported.
            pipes: [new ParseIntPipe()],
          },
        ],
      } as CommanderInterface;
      service.commanders.push(commander);
      await parse(service, ["test", "--token1", "token", "--token3", "1"]);
      expect(commanderMock).toStrictEqual({
        token1: "TestPipe1",
        token2: "TestPipe2",
        // ERROR: for now, returns Promise object.
        token3: expect.any(Promise),
      });
    });

    it("should set config", async () => {
      const service = new CommandService({}, {} as DiscoveryService, { localizeDescriptions: () => ({}) } as any);
      const commanderMock = {} as any;
      const commander = {
        commands: [
          {
            instance: jest.fn(),
            name: "test",
            options: [],
            positionals: [],
          },
        ],
        instance: commanderMock,
        options: [
          { instance: commanderMock, key: "text", options: { demandOption: true, name: "text" }, pipes: [] },
          {
            instance: commanderMock,
            key: "test",
            options: { demandOption: true, name: "test-test" },
            pipes: [],
          },
        ],
      } as CommanderInterface;
      service.config = { name: "nest-commands", searchPlaces: ["nest-commands.json"] };
      service.commanders.push(commander);
      await parse(service, ["test"]);
      expect(commanderMock).toStrictEqual({ test: "test", text: "world" });
    });

    it("should set config processor", async () => {
      const service = new CommandService({}, {} as DiscoveryService, { localizeDescriptions: () => ({}) } as any);
      const commanderMock = {} as any;
      const commander = {
        commands: [
          {
            instance: jest.fn(),
            name: "test",
            options: [],
            positionals: [],
          },
        ],
        instance: commanderMock,
        options: [{ instance: commanderMock, key: "text", options: { demandOption: true, name: "text" }, pipes: [] }],
      } as CommanderInterface;
      service.config = {
        name: "nest-commands",
        processor: (config: any): any => {
          config.text = "changed";
          return config;
        },
      };
      service.commanders.push(commander);
      await parse(service, ["test"]);
      expect(commanderMock).toStrictEqual({ text: "changed" });
    });

    it("should localize descriptions", async () => {
      const mock = jest.fn();
      const commanderMock = {} as any;
      const service = new CommandService(
        { locale: "en_us" },
        {} as DiscoveryService,
        { localizeDescriptions: () => ({}) } as any,
      );
      const commander = {
        commands: [
          {
            instance: ((pos1: number, pos2: number, files: string[]) => {
              mock({ files, pos1, pos2 });
            }) as any,
            name: "test",
            options: [
              {
                instance: commanderMock,
                key: "token1",
                options: { defaultDescription: "defaultDescription", name: "token1" },
                pipes: [],
              } as any,
            ],
            positionals: [
              {
                options: { demandPositional: true, desc: "desc", name: "pos1", type: "number" },
                parameterIndex: 0,
                pipes: [],
              },
              {
                options: { default: 123, describe: "describe", name: "pos2", type: "number" },
                parameterIndex: 1,
                pipes: [],
              },

              {
                options: { description: "description", name: "files.." },
                parameterIndex: 2,
                pipes: [],
              },
            ],
          },
        ],
        instance: {} as any,
        options: [],
      } as CommanderInterface;
      service.commanders.push(commander);
      await parse(service, ["test", "111", "222", "file1", "file2", "file3"]);
      await expect(mock).toHaveBeenCalledWith({ files: ["file1", "file2", "file3"], pos1: 111, pos2: 222 });
    });
  });
});

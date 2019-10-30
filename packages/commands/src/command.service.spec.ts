import { Commander as CommanderInterface } from "./command.interface";
import { CommandService } from "./command.service";
import yargs = require("yargs");

describe("CommandService", () => {
  it("should be defined", () => {
    expect(CommandService).toBeDefined();
  });

  describe("isNestedCommand", () => {
    const service = new CommandService({});
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
      expect(new CommandService({}).exec).toBeDefined();
    });

    it("should return void 0 if not have commanders", () => {
      expect(new CommandService({}).exec()).toBeUndefined();
    });

    it("should return undefined", () => {
      const service = new CommandService({});
      service.commanders.push({} as any);
      service["parser"] = jest.fn().mockReturnValue(yargs);
      expect(service.exec()).toBeUndefined();
    });
  });

  describe("parser", () => {
    async function parse(service: CommandService, args: string[]): Promise<string> {
      return new Promise<string>((resolve, rejects) => {
        service["parser"]().parse(args, (err: any, argv: any, output: any) => {
          if (err) {
            return rejects(err);
          }

          resolve(output);
        });
      });
    }

    it("should be defined", () => {
      expect(new CommandService({})["parser"]).toBeDefined();
    });

    it("should set scriptName", async () => {
      const service = new CommandService({ scriptName: "test" });
      await expect(parse(service, ["--help"])).resolves.toEqual(expect.any(String));
    });

    it("should set usage", async () => {
      const service = new CommandService({ usage: "test" });
      await expect(parse(service, ["--help"])).resolves.toEqual(expect.stringMatching(/^test$/gm));
    });

    it("should throw error if commander doesn't have command", async () => {
      const service = new CommandService({});
      const commander = { commands: [], instance: {} as any } as CommanderInterface;
      service.commanders.push(commander);
      await expect(parse(service, [])).rejects.toThrowError();
    });

    it("should set command", async () => {
      const mock = jest.fn();
      const service = new CommandService({});
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
      } as CommanderInterface;
      service.commanders.push(commander);
      await parse(service, ["test"]);
      await expect(mock).toHaveBeenCalled();
    });

    it("should set positionals", async () => {
      const mock = jest.fn();
      const service = new CommandService({ locale: "en_us" });
      const commander = {
        commands: [
          {
            instance: ((pos1: number, pos2: number) => {
              mock({ pos1, pos2 });
            }) as any,
            name: "test",
            options: [],
            positionals: [
              {
                options: { name: "pos1", required: true, type: "number" },
                parameterIndex: 0,
              },
              {
                options: { default: 123, name: "pos2", type: "number" },
                parameterIndex: 1,
              },
            ],
          },
        ],
        instance: {} as any,
      } as CommanderInterface;
      service.commanders.push(commander);
      await parse(service, ["test", "111"]);
      await expect(mock).toHaveBeenCalledWith({ pos1: 111, pos2: 123 });
    });

    it("should set options", async () => {
      const mock = jest.fn();
      const service = new CommandService({ locale: "en_us" });
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
              },
              {
                options: { default: 123, name: "option2", type: "number" },
                parameterIndex: 1,
              },
            ],
            positionals: [],
          },
        ],
        instance: {} as any,
      } as CommanderInterface;
      service.commanders.push(commander);
      await parse(service, ["test", "--option1", "111"]);
      await expect(mock).toHaveBeenCalledWith({ option1: 111, option2: 123 });
    });

    it("should set nested command", async () => {
      const mock = jest.fn();
      const service = new CommandService({});
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
      } as CommanderInterface;
      service.commanders.push(commander);
      await parse(service, ["nested", "test"]);
      await expect(mock).toHaveBeenCalled();
    });
  });
});

import { MetadataScanner } from "@nestjs/core/metadata-scanner";
import { Test } from "@nestjs/testing";
import { CommandModule } from "./command.module";
import { CommandService } from "./command.service";
import { ExplorerService } from "./explorer.service";
describe("CommandModule", () => {
  it("should be defined", () => {
    expect(CommandModule).toBeDefined();
  });

  it("should compile", async () => {
    await expect(Test.createTestingModule({ imports: [CommandModule.register()] }).compile()).resolves.toBeDefined();
  });

  it("should get providers", async () => {
    const module = await Test.createTestingModule({ imports: [CommandModule.register()] }).compile();
    expect(module.get(ExplorerService)).toBeDefined();
    expect(module.get(CommandService)).toBeDefined();
    expect(module.get(MetadataScanner)).toBeDefined();
  });

  it("should run", async () => {
    const module = await Test.createTestingModule({ imports: [CommandModule.register()] }).compile();
    await module.init();
    module.get(CommandService).exec();
    await module.close();
  });
});

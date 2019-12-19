import { Module } from "@nestjs/common";
import { MetadataScanner } from "@nestjs/core/metadata-scanner";
import { Test } from "@nestjs/testing";
import { CommandService } from ".";
import { COMMAND_MODULE_OPTIONS } from "./command.constants";
import { CommandCoreModule } from "./command.core-module";
import { CommandModuleOptions, CommandModuleOptionsFactory } from "./command.interface";
import { CommandModule } from "./command.module";
import { ExplorerService } from "./explorer.service";
describe("CommandCoreModule", () => {
  it("should be defined", () => {
    expect(CommandModule).toBeDefined();
  });

  describe("register", () => {
    it("should compile", async () => {
      await expect(
        Test.createTestingModule({ imports: [CommandCoreModule.register({})] }).compile(),
      ).resolves.toBeDefined();
    });

    it("should get providers", async () => {
      const module = await Test.createTestingModule({ imports: [CommandCoreModule.register({})] }).compile();
      expect(module.get(ExplorerService)).toBeDefined();
      expect(module.get(CommandService)).toBeDefined();
      expect(module.get(MetadataScanner)).toBeDefined();
      expect(module.get(COMMAND_MODULE_OPTIONS)).toBeDefined();
    });
  });

  describe("registerAsync", () => {
    it("should compile", async () => {
      await expect(
        Test.createTestingModule({
          imports: [
            CommandCoreModule.registerAsync({
              useFactory: () => ({}),
            }),
          ],
        }).compile(),
      ).resolves.toBeDefined();
    });

    it("should get providers", async () => {
      const module = await Test.createTestingModule({
        imports: [
          CommandCoreModule.registerAsync({
            useFactory: () => ({}),
          }),
        ],
      }).compile();
      expect(module.get(ExplorerService)).toBeDefined();
      expect(module.get(CommandService)).toBeDefined();
      expect(module.get(MetadataScanner)).toBeDefined();
      expect(module.get(COMMAND_MODULE_OPTIONS)).toBeDefined();
    });

    it("should run if use useFactory", async () => {
      const module = await Test.createTestingModule({
        imports: [
          CommandModule.registerAsync({
            useFactory: () => ({}),
          }),
        ],
      }).compile();
      await module.init();
      module.get(CommandService).exec();
      await module.close();
    });

    it("should run if use useClass", async () => {
      class TestClass implements CommandModuleOptionsFactory {
        createCommandModuleOptions(): CommandModuleOptions {
          return {};
        }
      }
      const module = await Test.createTestingModule({
        imports: [
          CommandModule.registerAsync({
            useClass: TestClass,
          }),
        ],
      }).compile();
      await module.init();
      module.get(CommandService).exec();
      await module.close();
    });

    it("should run if use useExisting", async () => {
      class TestClass implements CommandModuleOptionsFactory {
        createCommandModuleOptions(): CommandModuleOptions {
          return {};
        }
      }

      @Module({
        exports: [TestClass],
        providers: [TestClass],
      })
      class TestModule {}

      const module = await Test.createTestingModule({
        imports: [
          CommandModule.registerAsync({
            imports: [TestModule],
            useExisting: TestClass,
          }),
        ],
      }).compile();
      await module.init();
      module.get(CommandService).exec();
      await module.close();
    });
  });
});

import { Test } from "@nestjs/testing";
import { ExampleModule } from "./app.module";
describe("ExampleModule", () => {
  it("should compile", async () => {
    await expect(Test.createTestingModule({ imports: [ExampleModule] }).compile()).resolves.toBeDefined();
  });
});

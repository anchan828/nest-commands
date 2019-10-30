import { Module } from "@nestjs/common";
import { AuthorCommander } from "./author.commander";

@Module({ providers: [AuthorCommander] })
export class AuthorModule {}

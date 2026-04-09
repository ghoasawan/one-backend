import "reflect-metadata";
import { Container } from "inversify";
import { TYPES } from "../types/index.js";
import { AuthService } from "../services/auth.service.js";
import { AuthController } from "../controller/user.controller.js";
import {UserRepository} from "../repositories/user.repository.js"

const myContainer = new Container();

// Binding: "When someone asks for AuthService, give them this specific class"
myContainer.bind<AuthService>(TYPES.AuthService).to(AuthService).inSingletonScope();
myContainer.bind<AuthController>(TYPES.AuthController).to(AuthController).inSingletonScope();
myContainer.bind<UserRepository>(TYPES.UserRepository).to(UserRepository)

export { myContainer };
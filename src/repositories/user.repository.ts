import {AppDataSource, } from "../config/database"
import {User} from "../entities/user.enitity"
import {Repository} from "typeorm"
import {UserDto} from "../Dtos/index"


export class UserRepository{

    private userRepository:Repository<User>
    constructor(){
        this.userRepository= AppDataSource.getRepository(User);
    }

    createUser=async (user:UserDto)=>{
        const newUser = this.userRepository.create(user);
        await this.userRepository.save(newUser);
        return newUser;
    }

    findUser=async (email:string)=>{
        const user= await this.userRepository.findOne({where:{email}})
        return user;
    }

    findUserById=async (id:string)=>{
        const user= await this.userRepository.findOne({where:{id}})
        return user;
    }

    saveUser=async (user:User)=>{
        return await this.userRepository.save(user);
    }
}
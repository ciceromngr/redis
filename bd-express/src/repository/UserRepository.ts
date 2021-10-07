import { EntityRepository, Repository } from "typeorm";
import { Users } from "../database/entities/Users";

@EntityRepository(Users)
class UsersRepository extends Repository<Users>{

}

export { UsersRepository }
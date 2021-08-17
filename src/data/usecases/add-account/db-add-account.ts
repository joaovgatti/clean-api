import { AccountModel } from "@/domain/models/account";
import { AddAccount, AddAccountModel } from "@/domain/usecases/add-account";
import { AddAccountRepository } from "../protocols/add-account-repository";
import { Encrypter } from "../protocols/encrypter";

export class dbAddAccount implements AddAccount {

    private readonly encrypter: Encrypter;
    private readonly addAccountRepository: AddAccountRepository;
    
    constructor(encrypter: Encrypter, addAccountRepository: AddAccountRepository) {
        this.encrypter = encrypter;
        this.addAccountRepository = addAccountRepository;
    }
    
    async add(account: AddAccountModel): Promise<AccountModel> {

        const hashed_password = await this.encrypter.encrypt(account.password);

        const systemAccount = await this.addAccountRepository.add(Object.assign({},account, {password: hashed_password }));

        return systemAccount;
    }

}
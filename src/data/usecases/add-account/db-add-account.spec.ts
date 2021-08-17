import { AccountModel } from "@/domain/models/account";
import { AddAccountModel } from "@/domain/usecases/add-account";
import { rejects } from "assert";
import { AddAccountRepository } from "../protocols/add-account-repository";
import { Encrypter } from "../protocols/encrypter";
import { dbAddAccount } from "./db-add-account";

interface SutTypes {
    sut: dbAddAccount
    encrypterStub: Encrypter
    addAccountRepositoryStub: AddAccountRepository;
}

const makeAddAccountRepository = (): AddAccountRepository => {
    class AddAccountRepositoryStub implements AddAccountRepository {
        async add(account: AddAccountModel): Promise<AccountModel> {
            const encryptedAccount = {
                name: 'name',
                email:'email',
                password:'hashed_password',
                id: 'valid_id'
            }
            return new Promise(resolve => resolve(encryptedAccount));
        }
    }
    return new AddAccountRepositoryStub();
}

const makeEncrypter =(): Encrypter => {
    class EncrypterStub implements Encrypter {
        async encrypt(value: string): Promise<string> {
            return new Promise(resolve => resolve('hashed_password'));
        }
    }
    return new EncrypterStub();
}


const makeSut =(): SutTypes => {
    const encrypterStub = makeEncrypter();
    const addAccountRepositoryStub = makeAddAccountRepository();
    const sut = new dbAddAccount(encrypterStub, addAccountRepositoryStub);

    return {
        sut,
        encrypterStub,
        addAccountRepositoryStub
    }
    
}

describe('dbAddAccount Usecase', () => {

    test('Should call encrypter with correct password', async () => {

        const {sut, encrypterStub} = makeSut();
        const encryptSpy = jest.spyOn(encrypterStub,'encrypt');
        const accountData = {
            name: 'john',
            email:'john@mail.com',
            password:'123'
        }
        await sut.add(accountData);
        expect(encryptSpy).toHaveBeenCalledWith(accountData.password);
    });

    test('Should throw  if encrypter  throws', async () => {

        const {sut, encrypterStub} = makeSut();
        jest.spyOn(encrypterStub,'encrypt').mockReturnValueOnce(new Promise((resolve, rejects) => rejects(new Error())));
        const accountData = {
            name: 'john',
            email:'john@mail.com',
            password:'123'
        };
        const promise = sut.add(accountData);
        await expect(promise).rejects.toThrow();
    });
    
    test('should call AddAccountRepository with correct values', async () => {

        const {sut, addAccountRepositoryStub} = makeSut();
        const addSpy = jest.spyOn(addAccountRepositoryStub, 'add');

        const accountData = {
            name: 'john',
            email:'john@mail.com',
            password:'123'
        };

        await sut.add(accountData);
        expect(addSpy).toHaveBeenCalledWith({
            name: 'john',
            email:'john@mail.com',
            password:'hashed_password'
        });
    });

    test('Should throw if addAccountRepository throws', async () => {

        const {sut, addAccountRepositoryStub} = makeSut();
        jest.spyOn(addAccountRepositoryStub,'add').mockReturnValueOnce(new Promise((resolve, rejects) => rejects(new Error())));
        const accountData = {
            name: 'john',
            email:'john@mail.com',
            password:'123'
        };
        const promise = sut.add(accountData);
        await expect(promise).rejects.toThrow();
    });

    test('should return encrypt account on success', async () => {
        const {sut} = makeSut();
        const accountData = {
            name: 'name',
            email:'email',
            password:'123'
        }
        const accountDataResponse = {
                name: 'name',
                email:'email',
                password:'hashed_password',
                id: 'valid_id'
        };
        const response = await sut.add(accountData);
        expect(response).toEqual(accountDataResponse);

    });
})
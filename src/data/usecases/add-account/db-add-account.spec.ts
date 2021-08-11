import { rejects } from "assert";
import { Encrypter } from "../protocols/encrypter";
import { dbAddAccount } from "./db-add-account";

interface SutTypes {
    sut: dbAddAccount
    encrypterStub: Encrypter
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
    const sut = new dbAddAccount(encrypterStub);

    return {
        sut,
        encrypterStub
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
        }
        const promise = await sut.add(accountData);
        await expect(promise).rejects.toThrow();
    }); //section5
})
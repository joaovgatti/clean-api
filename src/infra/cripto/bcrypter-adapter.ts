import { Encrypter } from "@/data/usecases/protocols/encrypter";
import bcrypt from 'bcrypt';

export class BcryptAdapter implements Encrypter {

    private readonly salt: number;

    constructor(salt: number){
        this.salt = salt;
    }
    
    async encrypt(value: string): Promise<string> {
     
        const encryptedValue = await bcrypt.hash(value, this.salt);

        return encryptedValue;
    }



}
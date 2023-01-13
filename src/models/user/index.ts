import { doc, DocumentData, DocumentSnapshot, getFirestore, QueryDocumentSnapshot, SnapshotOptions } from "firebase/firestore";
import { BaseDocumentAttributes, DocumentBase } from "../../document_base";
import { DocumentRules } from "../../document_rules";
import { calcAge, Gender, Human, toDateValue } from "../../helpers";

export type UserType = Human & BaseDocumentAttributes &  {
    uid: string
    title?: string  
}

export const userRules = new DocumentRules<UserType>()
userRules.require("firstName required", (u) => u.firstName)
    .minLength("firstName minLength", 3, u => u.firstName)
    .maxLength("firstName maxLength", 50, u => u.firstName)
    .require("lastName requried", (u) => u.lastName)
    .minLength("lastName minLength", 3, u => u.lastName)
    .maxLength("lastName maxLength", 50, u => u.lastName)
    .require("uid required", u => u.uid) 
    .require("gender required", u => u.gender)
    .pattern("email pattern",/^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/gm,  u => u.emails?.primary) 

export class UserDocument extends DocumentBase<UserType> {
    static fromFirestore(snapshot: QueryDocumentSnapshot<DocumentData> | DocumentSnapshot<DocumentData>, options: SnapshotOptions): UserDocument {
        const data = snapshot.data(options) 
        if(!data) throw new Error("No data")
        data.createdOn = toDateValue(data.createdOn) 
        data.updatedOn = toDateValue(data.updatedOn)
        data.birthdate = toDateValue(data.birthdate)
        return new this(data as UserType)
    }
    constructor(attributes:UserType){
        super(attributes) 
        if(!attributes.gender) this.attributes.gender = Gender.UNKNOWN 
    }
    rulesList: DocumentRules<UserType> = userRules
    get displayName(){
        const nameList:string[] = []
        const {firstName, preferredName, lastName} = this.attributes
        if(preferredName) nameList.push(preferredName) 
        else if(firstName) nameList.push(firstName) 

        if(lastName) nameList.push(lastName)
        return nameList.join(" ")
    }
    get birthdate(){
        const b = toDateValue(this.attributes.birthdate)  
        if(b === "now") return new Date() 
        if(typeof b === "number") return new Date(b)
        return b 
    }
    get birthMonth(){
        return this.birthdate?.getMonth()  
    }
    get birthYear(){
        return this.birthdate?.getFullYear() 
    }
    get birthDay(){
        return this.birthdate?.getDay() 
    }
    get age() {
        if(this.birthdate) return calcAge(this.birthdate)
    }

}


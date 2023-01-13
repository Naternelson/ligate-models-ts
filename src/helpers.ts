import { FieldValue, serverTimestamp, Timestamp } from "firebase/firestore"
export type DateObject = Date | "now" | Timestamp | FieldValue
export type DeepPartial<T> = T extends Function 
    ? T 
    : T extends Array<infer am>
    ? DeepPartialArray<am> 
    : T extends object 
    ? DeepPartialObject<T>
    : T | undefined 

interface DeepPartialArray<T> extends Array<DeepPartial<T>> {}
type DeepPartialObject<T> = {
    [Key in keyof T]?: DeepPartial<T[Key]>
}

export function toTimestamp(value?: DateObject){
    if(value === undefined || value === "now") return serverTimestamp() 
    if(value instanceof Date) return Timestamp.fromDate(value) 
    if(value instanceof Timestamp || value instanceof FieldValue) return value 
    return Timestamp.fromDate(new Date(value))
}

export function toDateValue(value?: DateObject){
    if(value === undefined) return undefined 
    if(value instanceof Date) return value.valueOf() 
    if(value instanceof Timestamp) return value.toDate().valueOf() 
    if(value instanceof FieldValue) return "now" 
    return new Date(value).valueOf() 
}

export type HumanName = {
    firstName: string, 
    lastName: string, 
    middleName: string, 
    preferredName: string 
}
export enum Gender {
    MALE = "male",
    FEMALE = 'female',
    TRANSMALE = "trans-male",
    TRANSWOMAN = "trans-woman",
    NONBINARY = 'non-binary',
    UNKNOWN = 'unknown'
}
export interface ImageInformation {
    path: string,
    scale?: number, 
    startX?: number, 
    startY?: number, 
}

export interface Address {
    country?: string, 
    state?: string, 
    street?: string, 
    secondary?: string, 
    city?: string, 
    zipcode?: string,
} 
export type Human = Partial<HumanName> & {
    birthdate?: DateObject
    gender?: Gender,
    emails?: {
        primary: string, 
        [type: string]: string 
    },
    phone?: {
        primary: string, 
        [type: string]: string 
    },
    image?: {
        primary: ImageInformation,
        [type:string]: ImageInformation
    },
    address?: {
        primary: Address 
    }
} 


export function calcAge(dob: Date){
    const currentDate = new Date() 
    const currentYear = currentDate.getFullYear() 
    let age = currentYear - dob.getFullYear() 
    /** If the birthday month has yet to occur, subtract a year from age */
    if(dob.getMonth() > currentDate.getMonth()) age-- 
    else if(dob.getMonth() === currentDate.getMonth()){
         /** If the birthdate day has yet to occur, subtract a year from age */
        if(dob.getDate() > currentDate.getDate()) age--
    }
    /** If birthdate hasn't occurred yet, return undefined */
    if(age > 0) return undefined
    return age 
}
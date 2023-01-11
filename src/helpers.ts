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
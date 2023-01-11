import { BaseDocumentAttributes } from "./document_base";
/** For each function, if the cb returns true or a string, the rule has failed, otherwise return false or void  */
export type DocumentRulesType<A extends BaseDocumentAttributes> =  {
    [name: string]: (attributes: A) => boolean | string | void 
}
export class DocumentRules<A extends BaseDocumentAttributes>{
    constructor(rules?: DocumentRulesType<A>){
        if(rules) this.rules
    }
    rules: DocumentRulesType<A> = {}
    require(name: string, cb: (attributes:A) => unknown, errorMessage?: string){
        const fn = (attributes: A) => {
            const result = cb(attributes) 
            if(result === undefined) return errorMessage ? errorMessage : `${name} is required`
        }
        this.rules[name] = fn 
    }
    min(name: string, min: number, cb: (attributes:A) => unknown, errorMessage?: string){
        const fn = (attributes: A) => {
            const result = cb(attributes) 
            if(result === undefined) return 
            if(typeof result === "number" && result < min) return errorMessage ? errorMessage : `${name} must be at least ${min}`
        }
        this.rules[name] = fn 
    }
    minLength(name: string, minLength: number, cb: (attributes:A) => unknown, errorMessage?: string){
        const fn = (attributes: A) => {
            const result = cb(attributes) 
            if(result === undefined) return 
            if(typeof result === "string" && result.length < minLength) return errorMessage ? errorMessage : `${name} must be at least ${minLength} characters`
        }
        this.rules[name] = fn 
    }
    max(name: string, max: number, cb: (attributes:A) => unknown, errorMessage?: string){
        const fn = (attributes: A) => {
            const result = cb(attributes) 
            if(result === undefined) return 
            if(typeof result === "number" && result > max) return errorMessage ? errorMessage : `${name} must be less than ${max}`
            return `${name} must be a number, received${result}`
        }
        this.rules[name] = fn 
    }
    maxLength(name: string, maxLength: number, cb: (attributes:A) => unknown, errorMessage?: string){
        const fn = (attributes: A) => {
            const result = cb(attributes) 
            if(result === undefined) return 
            if(typeof result === "string" && result.length > maxLength) return errorMessage ? errorMessage : `${name} must be at less than ${maxLength} characters`
            return `${name} must be a number, received${result}`
        }
        this.rules[name] = fn 
    }
    pattern(name: string, pattern: RegExp, cb: (attributes:A) => unknown, errorMessage?: string){
        const fn = (attributes: A) => {
            const result = cb(attributes) 
            if(result === undefined) return 
            if(typeof result === "string" && pattern.test(result)) return errorMessage ? errorMessage : `${name} must conform to pattern`
            return `${name} must be a number, received${result}`
        }
        this.rules[name] = fn 
    }
}
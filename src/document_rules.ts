import { BaseDocumentAttributes } from "./document_base";
/** For each function, if the cb returns true or a string, the rule has failed, otherwise return false or void  */
export type DocumentRulesType<A extends BaseDocumentAttributes> =  {
    [name: string]: (attributes: A) => boolean | string | void 
}
export class DocumentRules<A extends BaseDocumentAttributes>{
    constructor(rules?: DocumentRulesType<A>){
        if(rules) this.rules = rules 
    }
    safeRules(attributes: A, cb:(a:A) => unknown){
        try {
            return cb(attributes)
        } catch {
            return undefined
        }
    }
    safeUnknownRules(attributes:A, cb:(a:A) => boolean | string | void, errorMessage?: string){
        try {
            return  cb(attributes)
        } catch {
            return errorMessage
        }
    }
    rules: DocumentRulesType<A> = {}
    add(name: string, cb: (attributes: A)=> boolean | string | void, errorMessage?: string){
        const fn = (attributes: A) => {
            const result = this.safeUnknownRules(attributes, cb, errorMessage) 
            if(result) return result 
        }
        this.rules[name] = fn 
        return this 
    }
    require(name: string, cb: (attributes:A) => unknown, errorMessage?: string){
        const fn = (attributes: A) => {
            const result = this.safeRules(attributes, cb) 
            if(result === undefined) return errorMessage ? errorMessage : `${name} is required`
        }
        this.rules[name] = fn 
        return this 
    }
    min(name: string, min: number, cb: (attributes:A) => unknown, errorMessage?: string){
        const fn = (attributes: A) => {
            const result = this.safeRules(attributes, cb)  
            if(result === undefined) return 
            if(typeof result === "number" && result < min) return errorMessage ? errorMessage : `${name} must be at least ${min}`
            if(typeof result !== "number") return errorMessage ? errorMessage : `${name} must be at least ${min}` 
        }
        this.rules[name] = fn 
        return this 
    }
    minLength(name: string, minLength: number, cb: (attributes:A) => unknown, errorMessage?: string){
        const fn = (attributes: A) => {
            const result = this.safeRules(attributes, cb) 
            if(result === undefined) return 
            if(typeof result === "string" && result.length < minLength) return errorMessage ? errorMessage : `${name} must be at least ${minLength} characters`
            if(typeof result !== "string") return errorMessage ? errorMessage : `${name} must be at least ${minLength} characters`
        }
        this.rules[name] = fn 
        return this 
    }
    max(name: string, max: number, cb: (attributes:A) => unknown, errorMessage?: string){
        const fn = (attributes: A) => {
            const result = this.safeRules(attributes, cb)  
            if(result === undefined) return 
            if(typeof result === "number" && result > max) return errorMessage ? errorMessage : `${name} must be less than ${max}`
            if(typeof result !== "number") return errorMessage ? errorMessage : `${name} must be less than ${max}`
        }
        this.rules[name] = fn 
        return this 
    }
    maxLength(name: string, maxLength: number, cb: (attributes:A) => unknown, errorMessage?: string){
        const fn = (attributes: A) => {
            const result = this.safeRules(attributes, cb) 
            if(result === undefined) return 
            if(typeof result === "string" && result.length > maxLength) return errorMessage ? errorMessage : `${name} must be at less than ${maxLength} characters`
            if(typeof result !== "string") return errorMessage ? errorMessage : `${name} must be at less than ${maxLength} characters`
        }
        this.rules[name] = fn 
        return this 
    }
    pattern(name: string, pattern: RegExp, cb: (attributes:A) => unknown, errorMessage?: string){
        const fn = (attributes: A) => {
            const result = this.safeRules(attributes, cb)
            if(result === undefined) 
                return 
            if(typeof result === "string" && !result.match(pattern))
                return errorMessage ? errorMessage : `${name} must conform to pattern`
            if(typeof result !== "string") 
                return errorMessage ? errorMessage : `${name} must conform to pattern`
        }
        this.rules[name] = fn 
        return this 
    }
}
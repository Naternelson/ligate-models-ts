import { DocumentData, DocumentSnapshot, QueryDocumentSnapshot, SnapshotOptions} from "firebase/firestore";
import { DocumentRules } from "./document_rules";
import { BaseDocumentError } from "./document_error"
import { DateObject, toDateValue, toTimestamp } from "./helpers";

export interface BaseDocumentAttributes {
    createdOn?: DateObject
    updatedOn?: DateObject,
    id?: string,
}

export class DocumentBase<A extends BaseDocumentAttributes> {
    static create<A extends BaseDocumentAttributes>(attributes?: A){
        return new this({...attributes, createdOn: "now", updatedOn: "now"} )
    }

    constructor(attributes: A, rules?: DocumentRules<A>){
        this.attributes = attributes
        if(rules) this.rulesList = rules 
    }
    
    attributes: A
    rulesList: DocumentRules<A> = new DocumentRules<A>()
    get rules(){
        return this.rulesList.rules
    }
    get id(){
        return this.attributes.id 
    }
    get createdOn(){
        const value = toDateValue(this.attributes.createdOn)
        if(value === "now") return new Date() 
        if(typeof value === "number") return new Date(value) 
        return value 
    }
    get updatedOn(){
        const value = toDateValue(this.attributes.updatedOn)
        if(value === "now") return new Date() 
        if(typeof value === "number") return new Date(value) 
        return value 
    }
    updateTimestamps(){
        this.attributes.createdOn = toTimestamp(this.attributes.createdOn) 
        this.attributes.updatedOn = toTimestamp("now")
    }    
    validate(){
        const keys = Object.keys(this.rules)
        let i = keys.length
        while(i--){
            const key = keys[i] 
            const result = this.rules[key](this.attributes)
            if(result) return {[key]: result} 
        }
    }
    validateAll(message?: string){
        const errors: {[Property in keyof typeof this.rules]: true | string} = {}
        let hasErrors = false 
        const keys = Object.keys(this.rules)
        Object.keys(this.rules).forEach((name) => {
            const result = this.rules[name](this.attributes) 
            if(result) {
                errors[name] = result; 
                hasErrors = true 
            }
        })
        if(hasErrors) return errors 
    }
    render():DocumentData{
        const errors = this.validateAll() 
        if(errors) throw new BaseDocumentError(this.constructor.name, errors)
        this.updateTimestamps()
        return this.attributes as DocumentData
    }
    

}




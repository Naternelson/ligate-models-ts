import { DocumentSnapshot, QueryDocumentSnapshot, SnapshotOptions} from "firebase/firestore";
import { DocumentRules } from "./document_rules";
import { BaseDocumentError } from "./document_error"
import { DateObject, toTimestamp } from "./helpers";

export interface BaseDocumentAttributes {
    createdOn?: DateObject
    updatedOn?: DateObject,
    id?: string,
}

export class Base_Document<A extends BaseDocumentAttributes> {
    static create<A extends BaseDocumentAttributes>(attributes?: A){
        return new this({...attributes, createdOn: "now", updatedOn: "now"} )
    }
    static fromFirestore<A extends BaseDocumentAttributes>(snapshot:QueryDocumentSnapshot | DocumentSnapshot, options: SnapshotOptions){
        const data = snapshot.data(options) as A 
        return new this(data)
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
    updateTimestamps(){
        this.attributes.createdOn = toTimestamp(this.attributes.createdOn) 
        this.attributes.createdOn = toTimestamp("now")
    }    
    validate(){
        const keys = Object.keys(this.rules.rules)
        let i = keys.length
        while(i--){
            const key = keys[i] 
            const result = this.rules[key](this.attributes)
            if(result) return {[key]: result} 
        }
    }
    validateAll(){
        const errors: {[Property in keyof typeof this.rules]: true | string} = {}
        let hasErrors = false 
        Object.keys(this.rules).forEach((name) => {
            const result = this.rules[name](this.attributes) 
            if(result) {errors[name] = result; hasErrors = true }
        })
        if(hasErrors) return errors 
    }
    render(){
        const errors = this.validateAll() 
        if(errors) throw new BaseDocumentError(this.constructor.name, errors)
        this.updateTimestamps()
        return this.attributes
    }
    

}




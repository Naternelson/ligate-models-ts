export class BaseDocumentError extends Error {
    constructor(name: string, fields: {[name:string]: boolean | string}){
        super(`${name} document has Errors`)
        this.fields = fields 
    }
    fields: {[name:string]: boolean | string}
}
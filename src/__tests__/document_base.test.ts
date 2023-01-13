import { FieldValue, serverTimestamp, Timestamp } from "firebase/firestore"
import { BaseDocumentAttributes, DocumentBase } from "../document_base"
import { DocumentRules } from "../document_rules"

interface A extends BaseDocumentAttributes {
    firstName?: string, 
    lastName?: string, 
    message?: string,
    count?: number ,
    nested?: {
        count?: number
    } 
}

describe("DocumentBase", () => {
    const a: A = {
        firstName: "Matt",
        lastName: "Eastman", 
        message: "Hello World"
    }
    const doc = new DocumentBase<A>(a)
    test("Attributes are correct", () => {
        expect(doc.attributes).toBe(a)
    })
    test("Updates are correct", () => {
        doc.updateTimestamps()
        expect(doc.attributes.createdOn).toBeInstanceOf(FieldValue)
        expect(doc.attributes.updatedOn).toBeInstanceOf(FieldValue)
        doc.attributes.createdOn = new Date("01/01/2010") 
        doc.updateTimestamps() 
        expect(doc.attributes.createdOn).toBeInstanceOf(Timestamp)
    })
    
    test("Required Rules Work", () => {
        const keys: (keyof A)[] = ["firstName", "lastName", "message"]
        keys.forEach(el => {
            doc.rulesList.require(el, a => a[el])
        })
        expect(doc.validate()).toBe(undefined)
        keys.forEach((el)=>{
            delete doc.attributes[el] 
            const v = doc.validate()
            expect(v).toHaveProperty(el)
            expect(v && v[el]).toBe(`${el} is required`)
            doc.attributes[el] = a[el] as any
        })
    })
    test("Min Rules Work", () => {
        doc.rulesList = new DocumentRules<A>()
        doc.rulesList
            .min("Min Count", 2, a => a.count)
            .min("Nested Min Count", 2, a => a.nested?.count)
        let v = doc.validate() 
        expect(v).toBe(undefined)
        doc.attributes.count = 0 
        v = doc.validate()
        expect(v).toHaveProperty("Min Count", `${"Min Count"} must be at least ${2}`)
        doc.attributes.nested = {count: 0} 
        v = doc.validateAll() 
        expect(v).toHaveProperty("Nested Min Count")
        expect(v).toHaveProperty("Min Count")
    })
    test("Max Rules Work", () => {
        doc.rulesList = new DocumentRules<A>()
        const names = {count: "Max Count", nested: "Nested Max Count"}
        doc.rulesList
            .max(names.count, 2, a => a.count)
            .max(names.nested, 2, a => a.nested?.count)
        let v = doc.validate() 
        expect(v).toBe(undefined)
        doc.attributes.count = 5 
        v = doc.validate()
        expect(v).toHaveProperty(names.count)
        doc.attributes.nested = {count: 5} 
        v = doc.validateAll() 
        expect(v).toHaveProperty(names.nested)
        expect(v).toHaveProperty(names.count)
    })
    test("Min Length Rules Work", () => {
        doc.rulesList = new DocumentRules<A>() 
        const keys: (keyof A)[] = ["firstName", "lastName"]
        keys.forEach(el => doc.rulesList.minLength(el, 3, a => a[el]))
        keys.forEach(el => {
            const previous = doc.attributes[el]
            expect(doc.validate() ).toBe(undefined)
            doc.attributes = {...doc.attributes, [el]: "1234"}
            expect(doc.validate() ).toBe(undefined)
            doc.attributes = {...doc.attributes, [el]: "12"}
            expect(doc.validate() ).toHaveProperty(el)
            doc.attributes = {...doc.attributes, [el]: previous}
        })
    })
    test("Max Length Rules Work", () => {
        doc.rulesList = new DocumentRules<A>() 
        const keys: (keyof A)[] = ["firstName", "lastName"]
        keys.forEach(el => doc.rulesList.maxLength(el, 5, a => a[el]))
        keys.forEach(el => {
            const previous = doc.attributes[el]
            expect(doc.validate() ).toBe(undefined)
            doc.attributes = {...doc.attributes, [el]: "1234"}
            expect(doc.validate() ).toBe(undefined)
            doc.attributes = {...doc.attributes, [el]: "123456"}
            expect(doc.validate() ).toHaveProperty(el)
            doc.attributes = {...doc.attributes, [el]: previous}
        })
    })
    test("Pattern Rule Works", () => {
        doc.rulesList = new DocumentRules<A>()
        const pattern = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/gm
        doc.rulesList.pattern("email",pattern, a => a.firstName)
        delete doc.attributes.firstName
        expect(doc.validate()).toBe(undefined)
        doc.attributes.firstName = "email@email.com" 
        expect(doc.validate()).toBe(undefined)
        doc.attributes.firstName = "email@email.c"
        expect(doc.validate()).toHaveProperty("email")
        doc.attributes.firstName = "email@email.commmm"
        expect(doc.validate()).toHaveProperty("email")
        doc.attributes.firstName = "emailemail.commmm"
        expect(doc.validate()).toHaveProperty("email")
    })
    test("Custom Rule", () => {
        doc.rulesList = new DocumentRules<A>()
        doc.rulesList.add("custom", (a) => {
            if(a.firstName == undefined) return 
            if(a.firstName === "Nate") return "That's my name"
            if(a.firstName.length > 10) return true 
        })
        delete doc.attributes.firstName
        expect(doc.validate()).toBe(undefined) 
        doc.attributes.firstName = "Ralph" 
        expect(doc.validate()).toBe(undefined)
        doc.attributes.firstName = "Nate" 
        expect(doc.validate()).toHaveProperty("custom", "That's my name")
        doc.attributes.firstName = "Long Name........." 
        expect(doc.validate()).toHaveProperty("custom", true)
    })
    test ("Creation", () => {
        const newA: A = {
            firstName: "Matt",
            lastName: "Eastman", 
            message: "Hello World"
        }
        const doc = DocumentBase.create(newA)
        expect(doc).toBeInstanceOf(DocumentBase) 
        expect(doc.attributes).toHaveProperty("createdOn", "now")
        expect(doc.attributes).toHaveProperty("updatedOn", "now")
        const a = doc.render() 
        expect(a.createdOn).toBeInstanceOf(FieldValue)
        expect(a.updatedOn).toBeInstanceOf(FieldValue) 
    })
})



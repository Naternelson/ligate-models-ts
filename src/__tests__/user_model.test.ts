import { Gender } from "../helpers"
import {UserDocument} from "../models/user"
describe.only("User Model", () => {
    describe("Rules", () => {
        const rules = [
            "firstName required", 
            "firstName minLength",
            "firstName maxLength",
            "lastName requried",
            "lastName minLength",
            "lastName maxLength",
            "uid required",
            "gender required",
            "email pattern"
        ]
        
        let user:UserDocument
        beforeEach(() => user = new UserDocument({
            uid: "1234",
            firstName: "Nathan",
            lastName: "Nelson",
            gender: Gender.MALE,
            emails: {
                primary: "email@email.com"
            }
        }))
        test("Correct user validation", () => {
            expect(user.validateAll()).toBe(undefined)
        })
        test("First Name Rules", () => {
            delete user.attributes.firstName
            expect(user.validate()).toHaveProperty(rules[0])
            user.attributes.firstName = "Me"
            expect(user.validate()).toHaveProperty(rules[1])
            user.attributes.firstName = Array(60).fill("H").join("")
            expect(user.validate()).toHaveProperty(rules[2])
        })
        test("Last Name Rules", () => {
            delete user.attributes.lastName
            expect(user.validate()).toHaveProperty(rules[3])
            user.attributes.lastName = "Me"
            expect(user.validate()).toHaveProperty(rules[4])
            user.attributes.lastName = Array(60).fill("H").join("")
            expect(user.validate()).toHaveProperty(rules[5])
        })
        test("UID Rules", () => {
            user.attributes.uid = undefined as any 
            expect(user.validate()).toHaveProperty(rules[6])  
        })
        test("Gender Rules", () => {
            user.attributes.gender = undefined 
            expect(user.validate()).toHaveProperty(rules[7])   
        })
        test("Email Rules", () => {
            delete user.attributes.emails
            expect(user.validate()).toBe(undefined)
            user.attributes.emails = {
                primary: "email@email.coooomm"
            }
            expect(user.validate()).toHaveProperty(rules[8]) 
            user.attributes.emails.primary = "email@email.c"
            expect(user.validate()).toHaveProperty(rules[8]) 
            user.attributes.emails.primary = "@email.com"
            expect(user.validate()).toHaveProperty(rules[8]) 
            user.attributes.emails.primary = "emailemail.com"
            expect(user.validate()).toHaveProperty(rules[8]) 
        })
    })
})
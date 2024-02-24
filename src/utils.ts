import NodeMailer from 'nodemailer'

export const transporter = NodeMailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    debug: true,
    auth: {
        user: 'kuanyshmaximauth',
        pass: 'fpjvtnansxnxnivi'
    }
})

export function isAllowAccess(role: string, stock: number, validated: boolean){
    if (role === "guest" || !validated) return false;
    else if (role === "student" && stock > 3) return true;
    else return role === "teacher" || role === "staff";

}
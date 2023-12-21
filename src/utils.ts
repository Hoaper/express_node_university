export function isAllowAccess(role: string, stock: number){
    if (role === "guest") return false;
    else if (role === "student" && stock > 3) return true;
    else return role === "teacher" || role === "staff";

}
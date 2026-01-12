export function SigninFormValidate(a,b){
    if(a.trim().length==0||b.trim().length==0){
        return "No input field should be empty!!"
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(a)){
        return "Your email is invalid!!"
    }

    if(b.trim().length<6){
        return "Password must be at least 6 characters."

    }

}
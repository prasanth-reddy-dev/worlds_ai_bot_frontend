export function ProfileUpdateValidate(a,b,c){
    if(!a||!b||!c){
        return "No input field should be empty!!"
    }

    if(a.trim().length==0||b.trim().length==0||c.trim().length==0){
        return "No input field should be empty!!"
    }
    if(a.trim().length>40){
        return "Full name should be less than 40 characters."

    }
    if(b.trim().length>40){
        return "college name should be less than 40 characters"

    }
    
    if (b.length !== 10 || isNaN(b) || b.trim().length !== 10) {
        return "Mobile number should contain 10 digits!!";
    }

   

}
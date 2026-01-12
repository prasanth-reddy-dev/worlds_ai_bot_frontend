export function SignupFormValidate(a, b, c, d, e) {
    if (a.trim().length == 0 || b.trim().length == 0 || c.trim().length == 0 || d.trim().length == 0 || e.trim().length == 0) {
        return "No input field should be empty!!"
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(c)) {
        return "Your email is invalid!!"
    }
    // Allow phone numbers between 6-15 digits (international format)
    if (b.length < 6 || b.length > 15 || isNaN(b)) {
        return "Please enter a valid phone number (6-15 digits)";
    }
    if (d.trim().length < 6) {
        return "Password must be at least 6 characters."

    }
    if (d.trim() != e) {
        return "password is mismatch with confirm password"
    }

}
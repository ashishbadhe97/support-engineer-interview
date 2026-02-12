// ── Email ──
export const emailValidation = {
  required: "Email is required",
  pattern: {
    value: /^\S+@\S+$/i,
    message: "Invalid email address",
  },
};

// ── Password ──
const commonPasswords = ["password", "12345678", "qwerty"];

export const passwordValidation = {
  required: "Password is required",
  minLength: {
    value: 8,
    message: "Password must be at least 8 characters",
  },
  validate: {
    notCommon: (value: string) =>
      !commonPasswords.includes(value.toLowerCase()) || "Password is too common",
    hasUppercase: (value: string) =>
      /[A-Z]/.test(value) || "Password must contain an uppercase letter",
    hasLowercase: (value: string) =>
      /[a-z]/.test(value) || "Password must contain a lowercase letter",
    hasNumber: (value: string) =>
      /\d/.test(value) || "Password must contain a number",
    hasSpecialChar: (value: string) =>
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value) || "Password must contain a special character",
  },
};

export const confirmPasswordValidation = (password: string) => ({
  required: "Please confirm your password",
  validate: (value: string) => value === password || "Passwords do not match",
});

// ── Phone ──
export const phoneValidation = {
  required: "Phone number is required",
  pattern: {
    value: /^\d{10}$/,
    message: "Phone number must be 10 digits",
  },
};

// ── Date of Birth ──
export const dateOfBirthValidation = {
  required: "Date of birth is required",
  validate: (value: string) => {
    const dob = new Date(value);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    if (dob > today) return "Date of birth cannot be in the future";
    if (age < 18) return "You must be at least 18 years old";
    return true;
  },
};

// ── SSN ──
export const ssnValidation = {
  required: "SSN is required",
  pattern: {
    value: /^\d{9}$/,
    message: "SSN must be 9 digits",
  },
};

// ── Address fields ──
export const stateValidation = {
  required: "State is required",
  pattern: {
    value: /^[A-Z]{2}$/,
    message: "Use 2-letter state code",
  },
};

export const zipCodeValidation = {
  required: "ZIP code is required",
  pattern: {
    value: /^\d{5}$/,
    message: "ZIP code must be 5 digits",
  },
};

// ── Helper ──
export const getTodayString = () => new Date().toISOString().split("T")[0];

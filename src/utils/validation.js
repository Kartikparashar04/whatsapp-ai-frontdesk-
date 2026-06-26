// Validation Helper Functions

export const formatPhoneWithDefault91 = (phone) => {
  if (!phone) return '';
  // Strip all characters except digits and the plus symbol
  let clean = phone.replace(/[^\d+]/g, '');
  if (clean.startsWith('+')) {
    return clean;
  }
  // If it starts with 91 and has 12 digits, prepend '+'
  if (clean.startsWith('91') && clean.length === 12) {
    return '+' + clean;
  }
  // If it starts with 0 and is 11 digits, strip the leading 0 and prepend '+91'
  if (clean.startsWith('0') && clean.length === 11) {
    return '+91' + clean.slice(1);
  }
  // Otherwise, prepend '+91'
  return '+91' + clean;
};

export const validatePhoneNumber = (phone) => {
  if (!phone) return false;
  const cleanPhone = formatPhoneWithDefault91(phone);
  const phoneRegex = /^\+[1-9]\d{9,14}$/;
  return phoneRegex.test(cleanPhone);
};

export const validateEmailAddress = (email) => {
  if (!email) return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
};

export const validateFullName = (name) => {
  if (!name) return false;
  const nameRegex = /^[a-zA-Z\s\.\-']{2,50}$/;
  return nameRegex.test(name.trim());
};

export const validateUrl = (url) => {
  if (!url) return false;
  const urlRegex = /^(https?:\/\/)?(www\.)?[a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/;
  return urlRegex.test(url.trim());
};

export const validateNumericId = (id) => {
  if (!id) return false;
  return /^\d{10,20}$/.test(id.trim());
};

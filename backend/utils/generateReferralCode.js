import crypto from 'crypto';
import User from '../models/User.js';


const generateReferralCode = async () => {
  let code;
  let exists = true;

  while (exists) {
    const random = crypto.randomBytes(4).toString('hex').toUpperCase();
    code = `NXC-${random}`;
  
    exists = await User.exists({ referralCode: code });
  }

  return code;
};

export default generateReferralCode;

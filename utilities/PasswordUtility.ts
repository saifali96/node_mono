import bcrypt from "bcrypt";

const GenerateSalt = async () => {
	
	return await bcrypt.genSalt();
}

export const GeneratePassword = async (password: string) => {
	
	return await bcrypt.hash(password, await GenerateSalt());
}

export const validatePassword = async (givenPassword: string, savedPassword: string) => {

	return await bcrypt.compare(givenPassword, savedPassword);
}
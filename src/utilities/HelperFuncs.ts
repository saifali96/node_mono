export function isEmptyArray(array: Array<any>): boolean {
	
	return Array.isArray(array) && (array.length == 0 || array.every(isEmptyArray));
}
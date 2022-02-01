export async function wrap(func: () => Promise<void>) {
	try {
		await func()
	} catch (err) {
		console.error(err)
	}
}

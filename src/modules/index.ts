import { join } from 'path'
import { readdirSync } from 'fs'
import { Module } from '../module'

export async function load() {
	const modules = new Array<Module>()
	const files = readdirSync(__dirname)
	for (let file of files) {
		file = file.endsWith('.ts') ? file.slice(0, -3) : file
		if (file == 'index') continue
		const spec = join(__dirname, file)
		const mod = await import(spec)
		modules.push(mod.default)
	}
	return modules
}

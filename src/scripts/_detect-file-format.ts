import fs from 'node:fs'
import { filetypeinfo, register } from 'magic-bytes.js'

register('macosmetadata', ['0x00', '0x05', '0x16', '0x07'])
const path =
   '/Volumes/ssd4t1/daz-lib/People/Genesis 9/Anatomy/Dicktator/03-Shape Presets/General Shape/._38-Narcissus.duf'
const buffer = fs.readFileSync(path)
const info = filetypeinfo(buffer) // ["png"]
console.log(`[🤠] info:`, info)

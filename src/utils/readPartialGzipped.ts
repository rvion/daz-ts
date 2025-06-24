import * as fsSync from 'node:fs'
import zlib from 'node:zlib'

export async function readPartialGzipped(path: string, targetBytes: number): Promise<string> {
   return new Promise((resolve, reject) => {
      const readStream = fsSync.createReadStream(path)
      const gunzip = zlib.createGunzip()

      let decompressedData = Buffer.alloc(0)
      let hasEnoughData = false

      gunzip.on('data', (chunk: Buffer) => {
         if (hasEnoughData) return

         decompressedData = Buffer.concat([decompressedData, chunk])

         if (decompressedData.length >= targetBytes) {
            hasEnoughData = true
            readStream.destroy()
            resolve(decompressedData.subarray(0, targetBytes).toString('utf-8'))
         }
      })

      gunzip.on('end', () => {
         if (!hasEnoughData) {
            resolve(decompressedData.toString('utf-8'))
         }
      })

      gunzip.on('error', reject)
      readStream.on('error', reject)

      readStream.pipe(gunzip)
   })
}

export async function readPartialGzipped(path: string, targetBytes: number): Promise<string> {
   const { createReadStream } = await import('node:fs')
   const zlib = await import('node:zlib')
   return new Promise((resolve, reject) => {
      const readStream = createReadStream(path)
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

export class Dson {
   constructor(public absPath: string) {}

   private _content: string | undefined = undefined

   get content(): Promise<string> {
      if (this._content !== undefined) return Promise.resolve(this._content)
      return Bun.file(this.absPath)
         .text()
         .then((content) => {
            this._content = content
            return content
         })
   }
}

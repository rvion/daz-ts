import chalk from 'chalk'

export const fmtAbsPath = (file: string): string => chalk.gray.dim(file)
export const fmtRelPath = chalk.blue
export const fmtNumber = chalk.greenBright
export const fmtDazUrl = chalk.cyanBright
export const fmtDazId = chalk.underline

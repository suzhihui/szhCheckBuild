/* eslint-disable no-console */
import { chromium } from 'playwright'

import sirv from 'sirv'
import polka from 'polka'
import c from 'picocolors'

export type WaitUntil = 'load' | 'domcontentloaded' | 'networkidle' | 'commit'
export interface Options {
  servePath: string
  port?: number
  waitUntil?: WaitUntil
}

export interface ErrorLog {
  type: 'error'
  timestamp: number
  error: unknown
}

export interface ErrorConsole {
  type: 'console'
  timestamp: number
  arguments: unknown[]
}

export type RuntimeErrorLog = ErrorLog | ErrorConsole

export async function serveAndCheck(options: Options) {
  const {
    port = 8238,
    servePath,
    waitUntil = 'networkidle',
  } = options
  const URL = `http://localhost:${port}`

  polka()
    .use(sirv(servePath))
    .listen(port, (err: Error) => {
      if (err)
        throw err
      console.log(`> Served on ${URL}`)
    })

  const browser = await chromium.launch()
  console.log('> Browser initialed')
  const page = await browser.newPage()
  console.log('> New page created')

  const errorLogs: RuntimeErrorLog[] = []
  page.on('console', async (message: any) => {
    if (message.type() === 'error') {
      errorLogs.push({
        type: 'console',
        timestamp: Date.now(),
        arguments: await Promise.all(message.args().map(i => i.jsonValue())),
      })
    }
  })

  page.on('pageerror', (err: Error) => {
    errorLogs.push({
      type: 'error',
      timestamp: Date.now(),
      error: err,
    })
  })

  await page.goto(URL, { waitUntil })
  console.log('> Navigate')

  // if (hasError)
  //   process.exit(1)

  // else
  //   process.exit(0)

  Promise.all([
    page.close(),
    browser.close(),
  ]).catch()

  return errorLogs
}
// console.log(await page.innerHTML('body'))
//
export function printErrorLogs(logs: RuntimeErrorLog[]) {
  console.error(c.inverse(c.red(' DEPLOY CHECK')) + c.red(` ${logs.length} Runtime errors found`))
  logs.forEach((log, idx) => {
    console.log(c.yellow(`====== ${c.gray(new Date(log.timestamp).toLocaleTimeString())} ======= ` + `Error ${idx + 1}`))
    if (log.type === 'error')
      console.error(log.error)

    else
      console.error(...log.arguments)
  })
}

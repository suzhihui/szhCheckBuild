/* eslint-disable no-console */
import { chromium } from 'playwright'

import sirv from 'sirv'
import polka from 'polka'

export interface Options {
  servePath: string
  port?: number
}

export interface logError {
  type: 'error'
  error: unknown
}

export interface logConsole {
  type: 'console'
  arguments: unknown[]
}

export type RuntimeLog = logError | logConsole

export async function deployCheck(options: Options) {
  const {
    port = 8238,
    servePath,
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
  const errorLogs: RuntimeLog[] = []
  page.on('console', (message: any) => {
    if (message.type() === 'error') {
      errorLogs.push({
        type: 'console',
        arguments: message.args(),
      })
    }
  })

  page.on('pageerror', (err: Error) => {
    errorLogs.push({
      type: 'error',
      error: err,
    })
  })

  await page.goto(URL)
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

/* eslint-disable no-console */
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

import sirv from 'sirv'
import polka from 'polka'

// 获取当前文件地址
// const root = dirname(fileURLToPath(import.meta.url))
const root = resolve(fileURLToPath(import.meta.url), '../..')
const PORT = 8238
const URL = `http://localhost:${PORT}`

// 找到playground/dist打包生产文件
const staticPath = resolve(root, 'playground/dist')
polka()
  .use(sirv(staticPath))
  .listen(PORT, (err: Error) => {
    if (err)
      throw err
    console.log(`> Served on ${URL}`)
  })

const browser = await chromium.launch()
console.log('> Browser initialed')
const page = await browser.newPage()
console.log('> New page created')
const pageErrors: Error[] = []
const consoleLogs: { type: string, text: string }[] = []
page.on('console', (message: any) => {
  consoleLogs.push({
    type: message.type(),
    text: message.text(),
  })
})

page.on('pageerror', (err: Error) => {
  pageErrors.push(err)
})

await page.goto(URL)
console.log('> Navigate')

pageErrors.forEach((err: Error) => {
  console.error(err)
})

consoleLogs.forEach((log: any) => {
  // @ts-expect-error hii
  console[log.type](log.text)
})
// console.log(await page.innerHTML('body'))

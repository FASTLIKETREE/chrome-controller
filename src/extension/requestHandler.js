import ChromePromise from 'chrome-promise'

const pChrome = new ChromePromise()

async function handleRequest(data) {
  console.log(data)
  const { uuid, body } = data
  let { fn, args } = body
  console.log(fn)
  console.log(body)

  const promiseFn = fn.replace('chrome', 'pChrome')

  console.log(`${promiseFn}.apply(null, ${JSON.stringify(args)})`)
  let returnData = await eval(`${promiseFn}.apply(null, ${JSON.stringify(args)})`)

  console.log(returnData)
  console.log('about to return out of handleRequest!')
  return { uuid, data: returnData }
}

export { handleRequest }

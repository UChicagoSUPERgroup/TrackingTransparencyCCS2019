import { setUserstudyCondition } from './userstudy'

async function setOptions (newOptions) {
  browser.storage.local.set({ options: newOptions })
}

async function getOptions () {
  const store = await browser.storage.local.get('options')
  const options = store.options
  return options
}

// export default async function setDefaultOptions () {
//   const options = await setUserstudyCondition('everything')
//   console.log(options)
//   return options
// }

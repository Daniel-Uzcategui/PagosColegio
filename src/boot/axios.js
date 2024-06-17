import { boot } from 'quasar/wrappers'
import axios from 'axios'
import { Notify } from 'quasar'
const baseURL = window.location.protocol + '//' + window.location.hostname + ":3000/" || process.env.BASE_URL.toString()
console.log({baseURL})
const api = axios.create({ baseURL})
console.log('process.env.BASE_URL', baseURL)
export default boot(({ app, router }) => {
  api.interceptors.request.use(function (config) {
    if (!config.headers.common.Authorization) {
      router.push('/login')
    }
    return config
  }, function (error) {
    return Promise.reject(error)
  })

  api.interceptors.response.use(undefined, function (error) {

    if (error.response?.status === 401) {
      Notify.create({
        message: 'Unauthorized: Please check your credentials',
        color: 'negative'
      })
    }
    if (typeof error.response?.data   === 'string') {
      Notify.create({
        message: error.response.data,
        color: 'negative'
      })
    }
    if (error.response?.status === 420) {
        // this error means the license is invalid so please redirect to the license page
        router.push('/license')
    }
    return Promise.reject(error)
  })

  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
})

export { api }

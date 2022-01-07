import axios from 'axios'
import { API_ROOT } from '../config'
axios.defaults.baseURL = API_ROOT
axios.defaults.withCredentials = true

axios.interceptors.response.use(
  response => {
    return response
  },
  error => {
    return Promise.reject(error.response)
  })

export default axios

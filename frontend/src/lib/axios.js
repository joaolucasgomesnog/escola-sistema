import axios from 'axios'

//colocar seu ip
export const api = axios.create({
    baseURL: process.env.EXPO_PUBLIC_AXIOS_BASE_URL
})
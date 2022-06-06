import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import { authGuard } from './authGuard'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
    {
        path: '/',
        name: 'home',
        component: Home
    },
    {
        path: '/profile',
        name: 'profile',
        component: () => import('../views/Profile.vue'),
        beforeEnter: authGuard
    },
    {
        path: '/rooms',
        name: 'rooms',
        component: () => import('../views/Rooms.vue')
    },
    {
        path: '/room/:id',
        name: 'room',
        component: () => import('../views/Room.vue')
    }
]

export const router = new VueRouter({
    routes,
    mode: 'history'
})

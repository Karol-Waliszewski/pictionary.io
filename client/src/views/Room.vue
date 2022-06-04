<template>
    <div class="section-xs container">
        <div class="columns is-multiline">
            <div class="column is-full">
                <h1 class="title is-2 has-text-centered" v-if="room">
                    {{ room.name.toUpperCase() }}
                </h1>
                <p v-if="room" class="subtitle is-4 has-text-centered">
                    {{ convertTime(time) }}
                </p>
            </div>

            <div class="column is-3">
                <div class="card">
                    <header class="card-header">
                        <p class="card-header-title">Players: {{ users.length }}</p>
                    </header>
                    <div class="card-content">
                        <ul class="content playerlist" v-if="showUsers">
                            <li v-for="user in sortedUsers" :key="user.id">
                                <b v-if="painter == user.id">{{ user.name }} ✏️</b>
                                <fragment v-else>{{ user.name }}</fragment> :
                                <span class="has-text-weight-bold">{{ user.points }}</span>
                            </li>
                        </ul>
                    </div>
                    <footer class="card-footer">
                        <router-link to="/rooms" class="card-footer-item has-text-danger is-hoverable">Leave Room</router-link>
                    </footer>
                </div>

                <div class="card card--painter" v-if="iDraw && !roundStarted && words.length > 0">
                    <header class="card-header">
                        <div class="card-header-title">
                            <p>Choose next word</p>
                            <span>{{ wordTime }}s</span>
                        </div>
                    </header>
                    <div class="card-content">
                        <ul class="content">
                            <li v-for="word in words" :key="word">
                                <button
                                    class="button is-fullwidth is-word"
                                    @click="
                                        () => {
                                            chooseWord(word)
                                        }
                                    "
                                >
                                    {{ word }}
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>

                <div class="card card--painter" v-if="iDraw && roundStarted">
                    <header class="card-header">
                        <div class="card-header-title">
                            <p>Your secret word</p>
                        </div>
                    </header>
                    <div class="card-content">
                        <p class="content">{{ password }}</p>
                    </div>
                </div>
            </div>

            <whiteboard :iDraw="iDraw" :started="roundStarted" />

            <div class="column is-3" id="chat">
                <chat />
            </div>
        </div>
    </div>
</template>

<script>
import Whiteboard from '../components/WhiteBoard'
import Chat from '../components/Chat'
import { convertTime } from '../utils/time'

export default {
    name: 'About',
    data() {
        return {
            users: [],
            showUsers: false,
            room: null,
            painter: null,
            words: [],
            password: null,
            roundStarted: false,
            time: 0,
            wordTime: 0
        }
    },
    components: { Whiteboard, Chat },
    methods: {
        convertTime,
        async joinRoom() {
            // Getting Password
            let password = ''

            if (!this.room.users.includes(this.$socket.id) && this.room.isPrivate) {
                password = await this.getPassword()
            }

            // Getting Name
            let name = await this.getName()
            this.$socket.emit('setName', name)
            this.$socket.name = name
            this.showUsers = true

            // Joining
            this.$socket.emit('join_room', {
                id: this.$route.params.id,
                password
            })
        },
        getUsers() {
            this.$socket.emit('get_users')
        },
        getRoomInfo() {
            this.$socket.emit('get_room', this.$route.params.id)
        },
        async getName() {
            const { value: name } = await this.$swal({
                title: 'Enter your name',
                input: 'text',
                showCancelButton: false,
                allowOutsideClick: false,
                allowEscapeKey: false,
                inputPlaceholder: 'Your name is...',
                inputAttributes: {
                    autocapitalize: 'off',
                    autocorrect: 'off'
                },
                inputValidator: value => {
                    return new Promise(resolve => {
                        if (value !== '') {
                            resolve()
                        } else {
                            resolve('You need to enter the name')
                        }
                    })
                }
            })

            return name
        },
        async getPassword() {
            const { value: password } = await this.$swal({
                title: 'Enter your password',
                input: 'password',
                showCancelButton: true,
                inputPlaceholder: 'Enter your password',
                inputAttributes: {
                    autocapitalize: 'off',
                    autocorrect: 'off'
                }
            })

            return password
        },
        chooseWord(word) {
            this.$socket.emit('word_chosen', word)
        },
        setPainter(painter) {
            this.painter = painter
        }
    },
    sockets: {
        receive_users(users) {
            this.users = users
        },
        receive_users_error(msg) {
            this.$swal({ title: msg, type: 'error' })
        },
        join_room_error(msg) {
            this.$swal({ title: msg, type: 'error' })
            this.$router.push('/rooms')
        },
        receive_room(room) {
            if (room) {
                this.room = room
                this.setPainter(room.painter)
                this.getUsers()
                this.joinRoom()
            } else {
                this.$swal({ title: 'This room does not exist', type: 'error' })
                this.$router.push('/rooms')
            }
        },
        receive_password(password) {
            this.password = password
        },
        round_initialized(words) {
            this.words = words
        },
        round_started() {
            this.roundStarted = true
            this.words = []
        },
        round_stopped() {
            this.roundStarted = false
        },
        painter_changed(painter) {
            this.setPainter(painter)
        },
        countdown(time) {
            this.time = time
        },
        countdown_painter(time) {
            this.wordTime = time
        }
    },
    computed: {
        sortedUsers() {
            // eslint-disable-next-line vue/no-side-effects-in-computed-properties
            return this.users.sort((a, b) => b.points - a.points)
        },
        iDraw() {
            return this.painter == this.$socket.id
        }
    },
    mounted() {
        this.getRoomInfo()
    },
    watch: {
        '$route.params.id': function () {
            this.getRoomInfo()
        }
    }
}
</script>

<style lang="scss" scoped>
.playerlist {
    text-align: left;
}

.card--painter {
    margin-top: 2rem;
    .card-header-title {
        justify-content: space-between;
    }
}

.is-word {
    white-space: normal;
    height: auto;
}
</style>

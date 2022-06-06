<template>
    <div class="card chat">
        <header class="card-header">
            <p class="card-header-title">Chat</p>
        </header>
        <div class="chat-body" ref="chat">
            <ul class="chat-messages">
                <li v-for="message in messages" :key="message.id" class="chat-message">
                    <span class="has-text-weight-bold" v-if="message.sender != 'server'">{{ message.sender }}:</span>
                    <span v-if="message.sender == 'server'">
                        <strong>{{ message.msg }}</strong>
                    </span>
                    <span v-else>{{ ' ' + message.msg }}</span>
                </li>
            </ul>
        </div>
        <footer class="card-footer">
            <form class="field has-addons chat-input" @submit="sendMessage">
                <div class="control">
                    <input v-model="message" class="input is-borderless" type="text" placeholder="Send a message..." />
                </div>
                <div class="control">
                    <input type="submit" class="button is-primary is-borderless" value="Send" />
                </div>
            </form>
        </footer>
    </div>
</template>

<script>
export default {
    name: 'Chat',
    data() {
        return { messages: [], message: '' }
    },
    methods: {
        sendMessage(e) {
            e.preventDefault()
            if (this.message.length) {
                this.$socket.emit('sendMessage', this.message)
                this.resetMessage()
            }
        },
        resetMessage() {
            this.message = ''
        },
        clearMessages() {
            this.messages = []
        },
        scrollChat() {
            this.$nextTick(() => this.$refs.chat.scrollTo(0, this.$refs.chat.scrollHeight))
        }
    },
    sockets: {
        receiveMessage(msgObj) {
            if (msgObj && msgObj.msg && msgObj.msg.length) {
                this.messages.push(msgObj)
                this.scrollChat()
            }
        },
        receiveServerMessage(msg) {
            if (msg && msg.length) {
                this.messages.push({ sender: 'server', msg })
                this.scrollChat()
            }
        },
        receiveCallback(msg) {
            if (msg && msg.length) {
                this.messages.push({ sender: 'server', msg })
                this.scrollChat()
            }
        }
    },
    watch: {
        '$route.params.id': function () {
            this.clearMessages()
        }
    }
}
</script>

<style lang="scss" scoped>
.is-borderless {
    border-radius: 0;
    border: 0;
    box-shadow: 0;
}
.chat-body {
    height: 500px;
    overflow-y: auto;
    overflow-x: hidden;
    @media screen and (max-width: 670px) {
        height: 200px;
    }
}

.chat-messages {
    list-style-type: none;
}

.chat-message {
    text-align: left;
    padding: 0.5rem 1rem;
    box-shadow: 0 1px 2px rgba(10, 10, 10, 0.1);
    word-break: break-all;
}

.chat-input {
    display: flex;
    justify-content: stretch;
    width: 100%;
    .control:first-child {
        flex: 1;
    }
}
</style>
